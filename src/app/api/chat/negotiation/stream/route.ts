import { db } from "@/db";
import {
  chatRoomsTable,
  negotiationOffersTable,
  commoditiesTable,
} from "@/db/schema";
import { eq, and, gt, sql } from "drizzle-orm";
import { verifyAuth } from "@/lib/auth/auth.service";

const POLL_INTERVAL_MS = 2000;
const HEARTBEAT_INTERVAL_MS = 15000;

export async function GET(request: Request) {
  const auth = await verifyAuth();
  if (!auth) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = auth.userId;
  const { searchParams } = new URL(request.url);
  const lastSeenId = Number(searchParams.get("lastSeenId")) || 0;

  const encoder = new TextEncoder();
  let currentLastSeenId = lastSeenId;
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
          );
        } catch {
          closed = true;
        }
      };

      send("connected", { lastSeenId: currentLastSeenId });

      const heartbeat = setInterval(
        () => send("heartbeat", { ts: Date.now() }),
        HEARTBEAT_INTERVAL_MS,
      );

      const poll = async () => {
        if (closed) return;
        try {
          const acceptedOffers = await db
            .select({
              id: negotiationOffersTable.id,
              roomId: negotiationOffersTable.roomId,
              price: negotiationOffersTable.price,
              quantity: negotiationOffersTable.quantity,
              unit: negotiationOffersTable.unit,
              commodityName: commoditiesTable.name,
              buyerId: chatRoomsTable.buyerId,
              farmerId: chatRoomsTable.farmerId,
              acceptedAt: negotiationOffersTable.acceptedAt,
            })
            .from(negotiationOffersTable)
            .innerJoin(
              chatRoomsTable,
              eq(chatRoomsTable.id, negotiationOffersTable.roomId),
            )
            .innerJoin(
              commoditiesTable,
              eq(commoditiesTable.id, negotiationOffersTable.commodityId),
            )
            .where(
              and(
                eq(negotiationOffersTable.status, "accepted"),
                sql`(${chatRoomsTable.buyerId} = ${userId} OR ${chatRoomsTable.farmerId} = ${userId})`,
                gt(negotiationOffersTable.id, currentLastSeenId),
              ),
            )
            .orderBy(negotiationOffersTable.id);

          if (acceptedOffers.length > 0) {
            for (const offer of acceptedOffers) {
              const otherPartyName =
                offer.buyerId === userId
                  ? "Petani"
                  : "Pembeli";

              send("negotiation_accepted", {
                id: offer.id,
                roomId: offer.roomId,
                commodityName: offer.commodityName,
                price: offer.price,
                quantity: offer.quantity,
                unit: offer.unit,
                otherPartyName,
              });
            }
            currentLastSeenId = Math.max(
              ...acceptedOffers.map((o) => o.id),
              currentLastSeenId,
            );
          }
        } catch (e) {
          console.error("Negotiation SSE poll error:", e);
          send("error", { message: "Poll failed" });
        }
      };

      while (!closed) {
        await poll();
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }

      clearInterval(heartbeat);
    },

    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
