import { db } from "@/db";
import {
  chatRoomsTable,
  chatMessagesTable,
  usersTable,
} from "@/db/schema";
import { eq, and, gt, inArray, or } from "drizzle-orm";
import { verifyAuth } from "@/lib/auth/auth.service";

const POLL_INTERVAL_MS = 1500;
const HEARTBEAT_INTERVAL_MS = 15000;

export async function GET(request: Request) {
  const auth = await verifyAuth();
  if (!auth) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const roomId = Number(searchParams.get("roomId"));
  const lastId = Number(searchParams.get("lastId")) || 0;
  const userId = auth.userId;

  if (!roomId) {
    return new Response("Missing roomId", { status: 400 });
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
  const seenEditDeleteIds = new Set<number>();

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
              isEdited: chatMessagesTable.isEdited,
              isDeleted: chatMessagesTable.isDeleted,
              replyToId: chatMessagesTable.replyToId,
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
            for (const msg of newMsgs) {
              if (msg.senderId === userId) {
                mySentMessageIds.add(msg.id);
              }
            }
            send("messages", newMsgs);
            const maxId = newMsgs.reduce((max, m) => Math.max(max, m.id), currentLastId);
            currentLastId = maxId;
          }

          // Poll edit/delete status for messages visible in this room
          if (currentLastId > 0) {
            const editDeleteMsgs = await db
              .select({
                id: chatMessagesTable.id,
                content: chatMessagesTable.content,
                isEdited: chatMessagesTable.isEdited,
                isDeleted: chatMessagesTable.isDeleted,
              })
              .from(chatMessagesTable)
              .where(
                and(
                  eq(chatMessagesTable.roomId, roomId),
                  or(
                    eq(chatMessagesTable.isEdited, true),
                    eq(chatMessagesTable.isDeleted, true),
                  ),
                ),
              );

            if (editDeleteMsgs.length > 0) {
              const changes = editDeleteMsgs.filter((m) => !seenEditDeleteIds.has(m.id));
              if (changes.length > 0) {
                send("edit_delete", changes);
                for (const m of changes) {
                  seenEditDeleteIds.add(m.id);
                }
              }
            }
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
