import { db } from "@/db";
import {
  chatRoomsTable,
  chatMessagesTable,
  usersTable,
} from "@/db/schema";
import { eq, and, gt, inArray } from "drizzle-orm";

const POLL_INTERVAL_MS = 1500;
const HEARTBEAT_INTERVAL_MS = 15000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = Number(searchParams.get("roomId"));
  const userId = Number(searchParams.get("userId"));
  const lastId = Number(searchParams.get("lastId")) || 0;

  if (!roomId || !userId) {
    return new Response("Missing roomId or userId", { status: 400 });
  }

  const room = await db
    .select({ id: chatRoomsTable.id, buyerId: chatRoomsTable.buyerId, farmerId: chatRoomsTable.farmerId })
    .from(chatRoomsTable)
    .where(eq(chatRoomsTable.id, roomId))
    .limit(1);

  if (room.length === 0) {
    return new Response("Room not found", { status: 404 });
  }

  const r = room[0];
  if (r.buyerId !== userId && r.farmerId !== userId) {
    return new Response("Unauthorized", { status: 403 });
  }

  const encoder = new TextEncoder();
  let currentLastId = lastId;
  let closed = false;
  const mySentMessageIds = new Set<number>();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      };

      send("connected", { roomId, lastId: currentLastId });

      const heartbeat = setInterval(() => send("heartbeat", { ts: Date.now() }), HEARTBEAT_INTERVAL_MS);

      const poll = async () => {
        if (closed) return;
        try {
          // Poll new messages
          const newMsgs = await db
            .select({
              id: chatMessagesTable.id,
              senderId: chatMessagesTable.senderId,
              type: chatMessagesTable.type,
              content: chatMessagesTable.content,
              offerPrice: chatMessagesTable.offerPrice,
              offerQuantity: chatMessagesTable.offerQuantity,
              isRead: chatMessagesTable.isRead,
              createdAt: chatMessagesTable.createdAt,
              senderName: usersTable.fullName,
            })
            .from(chatMessagesTable)
            .innerJoin(usersTable, eq(usersTable.id, chatMessagesTable.senderId))
            .where(
              and(
                eq(chatMessagesTable.roomId, roomId),
                gt(chatMessagesTable.id, currentLastId),
              ),
            )
            .orderBy(chatMessagesTable.createdAt);

          if (newMsgs.length > 0) {
            // Track my sent messages for read receipts
            for (const msg of newMsgs) {
              if (msg.senderId === userId) {
                mySentMessageIds.add(msg.id);
              }
            }
            send("messages", newMsgs);
            const maxId = newMsgs.reduce((max, m) => Math.max(max, m.id), currentLastId);
            currentLastId = maxId;
          }

          // Poll read status for my sent messages
          if (mySentMessageIds.size > 0) {
            const idsArray = Array.from(mySentMessageIds);
            const readStatuses = await db
              .select({
                id: chatMessagesTable.id,
                isRead: chatMessagesTable.isRead,
              })
              .from(chatMessagesTable)
              .where(
                and(
                  eq(chatMessagesTable.roomId, roomId),
                  inArray(chatMessagesTable.id, idsArray),
                  eq(chatMessagesTable.isRead, true),
                ),
              );

            if (readStatuses.length > 0) {
              const readIds = readStatuses.map((r) => r.id);
              send("read", { messageIds: readIds });
              // Remove from tracking set
              for (const id of readIds) {
                mySentMessageIds.delete(id);
              }
            }
          }
        } catch (e) {
          console.error("SSE poll error:", e);
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
