"use server";

import { db } from "@/db";
import {
  chatRoomsTable,
  chatMessagesTable,
  negotiationOffersTable,
  commoditiesTable,
  usersTable,
  notificationsTable,
  ImageUpload,
} from "@/db/schema";
import { eq, and, desc, sql, or, gt } from "drizzle-orm";
import { verifyAuth } from "@/lib/auth/auth.service";

export async function getOrCreateChatRoom(
  buyerId: number,
  farmerId: number,
  commodityId: number,
) {
  const auth = await verifyAuth();
  if (!auth || auth.userId !== buyerId) return null;
  try {
    const existing = await db
      .select({ id: chatRoomsTable.id })
      .from(chatRoomsTable)
      .where(
        and(
          eq(chatRoomsTable.buyerId, buyerId),
          eq(chatRoomsTable.farmerId, farmerId),
          eq(chatRoomsTable.commodityId, commodityId),
          eq(chatRoomsTable.status, "active"),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return { roomId: existing[0].id };
    }

    const commodity = await db
      .select({ name: commoditiesTable.name })
      .from(commoditiesTable)
      .where(eq(commoditiesTable.id, commodityId))
      .limit(1);

    const [room] = await db
      .insert(chatRoomsTable)
      .values({
        buyerId,
        farmerId,
        commodityId,
      })
      .returning({ id: chatRoomsTable.id });

    const systemMsg = `Anda membuka chat negosiasi untuk produk ${commodity[0]?.name || "produk"}. Silakan mulai percakapan.`;
    await db.insert(chatMessagesTable).values({
      roomId: room.id,
      senderId: buyerId,
      type: "system",
      content: systemMsg,
    });

    return { roomId: room.id };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getChatRoomsForUser(userId: number, role: "pembeli" | "petani") {
  const auth = await verifyAuth();
  if (!auth || auth.userId !== userId) return [];
  try {
    const condition =
      role === "pembeli"
        ? eq(chatRoomsTable.buyerId, userId)
        : eq(chatRoomsTable.farmerId, userId);

    const pinnedColumn =
      role === "pembeli"
        ? chatRoomsTable.buyerPinned
        : chatRoomsTable.farmerPinned;

    const rooms = await db
      .select({
        id: chatRoomsTable.id,
        buyerId: chatRoomsTable.buyerId,
        farmerId: chatRoomsTable.farmerId,
        commodityId: chatRoomsTable.commodityId,
        status: chatRoomsTable.status,
        lastMessage: chatRoomsTable.lastMessage,
        lastMessageAt: chatRoomsTable.lastMessageAt,
        createdAt: chatRoomsTable.createdAt,
        pinned: pinnedColumn,
        buyerName: usersTable.fullName,
        farmerName: usersTable.fullName,
        buyerFotoProfile: sql<string | null>`coalesce((select u2."fotoProfile" from users_table u2 where u2."id" = chat_rooms_table."buyerId"), null)`,
        farmerFotoProfile: sql<string | null>`coalesce((select u2."fotoProfile" from users_table u2 where u2."id" = chat_rooms_table."farmerId"), null)`,
        commodityName: commoditiesTable.name,
        commodityPrice: commoditiesTable.price,
        commodityImage: ImageUpload.secureUrl,
        commodityImages: commoditiesTable.images,
        commodityUnit: commoditiesTable.unit,
        hasDeal: sql<boolean>`exists(select 1 from chat_messages_table m where m."roomId" = chat_rooms_table.id and m.type = 'accept')`,
        unreadCount: sql<number>`(
          select count(*)::int from chat_messages_table msg
          where msg."roomId" = chat_rooms_table.id
            and msg."senderId" != ${userId}
            and msg."isRead" = false
        )`,
      })
      .from(chatRoomsTable)
      .innerJoin(usersTable, eq(usersTable.id, role === "pembeli" ? chatRoomsTable.farmerId : chatRoomsTable.buyerId))
      .innerJoin(commoditiesTable, eq(commoditiesTable.id, chatRoomsTable.commodityId))
      .leftJoin(ImageUpload, eq(ImageUpload.id, commoditiesTable.image))
      .where(condition)
      .orderBy(desc(pinnedColumn), desc(chatRoomsTable.lastMessageAt));

    return rooms;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getChatRoomDetail(roomId: number) {
  const auth = await verifyAuth();
  if (!auth) return null;
  try {
    const [room] = await db
      .select({
        id: chatRoomsTable.id,
        buyerId: chatRoomsTable.buyerId,
        farmerId: chatRoomsTable.farmerId,
        commodityId: chatRoomsTable.commodityId,
        status: chatRoomsTable.status,
        createdAt: chatRoomsTable.createdAt,
        commodityName: commoditiesTable.name,
        commodityPrice: commoditiesTable.price,
        commodityMinPrice: commoditiesTable.minPrice,
        commodityMaxPrice: commoditiesTable.maxPrice,
        commodityStock: commoditiesTable.stock,
        commodityUnit: commoditiesTable.unit,
        commodityImage: ImageUpload.secureUrl,
        commodityImages: commoditiesTable.images,
        commodityDescription: commoditiesTable.description,
        commodityStatus: commoditiesTable.status,
      })
      .from(chatRoomsTable)
      .innerJoin(commoditiesTable, eq(commoditiesTable.id, chatRoomsTable.commodityId))
      .leftJoin(ImageUpload, eq(ImageUpload.id, commoditiesTable.image))
      .where(eq(chatRoomsTable.id, roomId));

    if (!room) return null;

    if (room.buyerId !== auth.userId && room.farmerId !== auth.userId) {
      return null;
    }

    const [buyerRows, farmerRows, pendingOfferRows] = await Promise.all([
      db
        .select({ id: usersTable.id, fullName: usersTable.fullName, fotoProfile: usersTable.fotoProfile })
        .from(usersTable)
        .where(eq(usersTable.id, room.buyerId))
        .limit(1),
      db
        .select({ id: usersTable.id, fullName: usersTable.fullName, fotoProfile: usersTable.fotoProfile, address: usersTable.address })
        .from(usersTable)
        .where(eq(usersTable.id, room.farmerId))
        .limit(1),
      db
        .select()
        .from(negotiationOffersTable)
        .where(
          and(
            eq(negotiationOffersTable.roomId, roomId),
            eq(negotiationOffersTable.status, "pending"),
          ),
        )
        .orderBy(desc(negotiationOffersTable.createdAt))
        .limit(1),
    ]);

    const pendingOffer = pendingOfferRows[0] ?? null;

    return {
      ...room,
      buyerName: buyerRows[0]?.fullName || "",
      buyerFoto: buyerRows[0]?.fotoProfile || null,
      farmerName: farmerRows[0]?.fullName || "",
      farmerFoto: farmerRows[0]?.fotoProfile || null,
      farmerAddress: farmerRows[0]?.address || null,
      pendingOffer: pendingOffer
        ? {
            id: pendingOffer.id,
            price: pendingOffer.price,
            quantity: pendingOffer.quantity,
            unit: pendingOffer.unit,
            status: pendingOffer.status,
            createdAt: pendingOffer.createdAt,
          }
        : null,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getChatMessages(roomId: number) {
  const auth = await verifyAuth();
  if (!auth) return [];
  try {
    const roomCheck = await db
      .select({ buyerId: chatRoomsTable.buyerId, farmerId: chatRoomsTable.farmerId })
      .from(chatRoomsTable)
      .where(eq(chatRoomsTable.id, roomId))
      .limit(1);
    if (roomCheck.length === 0 || (roomCheck[0].buyerId !== auth.userId && roomCheck[0].farmerId !== auth.userId)) {
      return [];
    }
    const messages = await db
      .select({
        id: chatMessagesTable.id,
        roomId: chatMessagesTable.roomId,
        senderId: chatMessagesTable.senderId,
        type: chatMessagesTable.type,
        content: chatMessagesTable.content,
        offerPrice: chatMessagesTable.offerPrice,
        offerQuantity: chatMessagesTable.offerQuantity,
        isRead: chatMessagesTable.isRead,
        createdAt: chatMessagesTable.createdAt,
        senderName: usersTable.fullName,
        senderFoto: usersTable.fotoProfile,
      })
      .from(chatMessagesTable)
      .innerJoin(usersTable, eq(usersTable.id, chatMessagesTable.senderId))
      .where(eq(chatMessagesTable.roomId, roomId))
      .orderBy(chatMessagesTable.createdAt);

    return messages;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function sendChatMessage(
  roomId: number,
  senderId: number,
  content: string,
  type: "text" | "offer" | "counter_offer" | "accept" | "reject" | "system" = "text",
  offerPrice?: number,
  offerQuantity?: number,
  replyToId?: number,
) {
  const auth = await verifyAuth();
  if (!auth || auth.userId !== senderId) return null;
  try {
    const [room] = await db
      .select({
        buyerId: chatRoomsTable.buyerId,
        farmerId: chatRoomsTable.farmerId,
        commodityId: chatRoomsTable.commodityId,
      })
      .from(chatRoomsTable)
      .where(eq(chatRoomsTable.id, roomId))
      .limit(1);

    if (!room) return null;

    if (type === "offer") {
      if (senderId !== room.buyerId) return null;
      const [existingPending] = await db
        .select({ id: negotiationOffersTable.id })
        .from(negotiationOffersTable)
        .where(
          and(
            eq(negotiationOffersTable.roomId, roomId),
            eq(negotiationOffersTable.status, "pending"),
          ),
        )
        .limit(1);
      if (existingPending) return null;
    }

    if (type === "accept" || type === "reject") {
      if (senderId !== room.farmerId) return null;
      const [pendingOffer] = await db
        .select({ id: negotiationOffersTable.id })
        .from(negotiationOffersTable)
        .where(
          and(
            eq(negotiationOffersTable.roomId, roomId),
            eq(negotiationOffersTable.status, "pending"),
          ),
        )
        .limit(1);
      if (!pendingOffer) return null;
    }

    const [msg] = await db
      .insert(chatMessagesTable)
      .values({
        roomId,
        senderId,
        type,
        content,
        offerPrice: offerPrice?.toString(),
        offerQuantity: offerQuantity?.toString(),
        replyToId: replyToId ?? null,
      })
      .returning({ id: chatMessagesTable.id });

    await db
      .update(chatRoomsTable)
      .set({
        status: "active",
        lastMessage: content,
        lastMessageAt: new Date(),
      })
      .where(eq(chatRoomsTable.id, roomId));

    if (type === "offer" && offerPrice !== undefined && offerQuantity !== undefined) {
      const commodity = await db
        .select({ unit: commoditiesTable.unit })
        .from(commoditiesTable)
        .where(eq(commoditiesTable.id, room.commodityId))
        .limit(1);
      await db.insert(negotiationOffersTable).values({
        roomId,
        commodityId: room.commodityId,
        buyerId: room.buyerId,
        farmerId: room.farmerId,
        price: offerPrice.toString(),
        quantity: offerQuantity.toString(),
        unit: commodity[0]?.unit || "kg",
      });
    }

    if (type === "accept" || type === "reject") {
      const [pendingOffer] = await db
        .select({ id: negotiationOffersTable.id })
        .from(negotiationOffersTable)
        .where(
          and(
            eq(negotiationOffersTable.roomId, roomId),
            eq(negotiationOffersTable.status, "pending"),
          ),
        )
        .limit(1);
      if (pendingOffer) {
        await db
          .update(negotiationOffersTable)
          .set({
            status: type === "accept" ? "accepted" : "rejected",
            acceptedAt: type === "accept" ? new Date() : undefined,
          })
          .where(eq(negotiationOffersTable.id, pendingOffer.id));
        if (type === "accept") {
          await db
            .update(chatRoomsTable)
            .set({ status: "closed" })
            .where(eq(chatRoomsTable.id, roomId));
        }
      }
    }

    const result = { id: msg.id };

    notifyChatMessage(roomId, senderId, content).catch(() => { });

    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function notifyChatMessage(
  roomId: number,
  senderId: number,
  content: string,
) {
  try {
    const room = await db
      .select({
        buyerId: chatRoomsTable.buyerId,
        farmerId: chatRoomsTable.farmerId,
        commodityId: chatRoomsTable.commodityId,
      })
      .from(chatRoomsTable)
      .where(eq(chatRoomsTable.id, roomId))
      .limit(1);

    if (room.length === 0) return;

    const r = room[0];
    const recipientId = r.buyerId === senderId ? r.farmerId : r.buyerId;

    // Dedupe: only notify if recipient has no unread message from this sender yet
    const existing = await db
      .select({ id: chatMessagesTable.id })
      .from(chatMessagesTable)
      .where(
        and(
          eq(chatMessagesTable.roomId, roomId),
          eq(chatMessagesTable.senderId, senderId),
          eq(chatMessagesTable.isRead, false),
        ),
      )
      .limit(1);

    if (existing.length > 0) return;

    const [commodity] = await db
      .select({ name: commoditiesTable.name })
      .from(commoditiesTable)
      .where(eq(commoditiesTable.id, r.commodityId))
      .limit(1);

    const [sender] = await db
      .select({ fullName: usersTable.fullName })
      .from(usersTable)
      .where(eq(usersTable.id, senderId))
      .limit(1);

    const senderName = sender?.fullName ?? "Seseorang";
    const commodityName = commodity?.name ?? "produk";
    const preview = content.length > 60 ? `${content.slice(0, 57)}...` : content;

    await db.insert(notificationsTable).values({
      userId: recipientId,
      title: `Pesan baru dari ${senderName}`,
      message: `${commodityName}: ${preview}`,
      type: "chat",
    });
  } catch (error) {
    console.error("notifyChatMessage error:", error);
  }
}

export async function getNewMessages(roomId: number, afterId: number) {
  const auth = await verifyAuth();
  if (!auth) return [];
  try {
    const roomCheck = await db
      .select({ buyerId: chatRoomsTable.buyerId, farmerId: chatRoomsTable.farmerId })
      .from(chatRoomsTable)
      .where(eq(chatRoomsTable.id, roomId))
      .limit(1);
    if (roomCheck.length === 0 || (roomCheck[0].buyerId !== auth.userId && roomCheck[0].farmerId !== auth.userId)) {
      return [];
    }
    const messages = await db
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
          gt(chatMessagesTable.id, afterId),
        ),
      )
      .orderBy(chatMessagesTable.createdAt);

    return messages;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function markMessagesAsRead(roomId: number, userId: number) {
  const auth = await verifyAuth();
  if (!auth || auth.userId !== userId) return false;
  try {
    await db
      .update(chatMessagesTable)
      .set({ isRead: true })
      .where(
        and(
          eq(chatMessagesTable.roomId, roomId),
          sql`${chatMessagesTable.senderId} != ${userId}`,
        ),
      );
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function createNegotiationOffer(
  roomId: number,
  commodityId: number,
  buyerId: number,
  farmerId: number,
  price: number,
  quantity: number,
  unit: string,
) {
  const auth = await verifyAuth();
  if (!auth || auth.userId !== buyerId) return null;
  try {
    const [room] = await db
      .select({ buyerId: chatRoomsTable.buyerId, farmerId: chatRoomsTable.farmerId })
      .from(chatRoomsTable)
      .where(eq(chatRoomsTable.id, roomId))
      .limit(1);
    if (!room || room.buyerId !== buyerId || room.farmerId !== farmerId) return null;

    const [existingPending] = await db
      .select({ id: negotiationOffersTable.id })
      .from(negotiationOffersTable)
      .where(
        and(
          eq(negotiationOffersTable.roomId, roomId),
          eq(negotiationOffersTable.status, "pending"),
        ),
      )
      .limit(1);
    if (existingPending) return null;

    const [offer] = await db
      .insert(negotiationOffersTable)
      .values({
        roomId,
        commodityId,
        buyerId,
        farmerId,
        price: price.toString(),
        quantity: quantity.toString(),
        unit,
      })
      .returning({ id: negotiationOffersTable.id });

    return { offerId: offer.id };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function respondToOffer(
  offerId: number,
  response: "accepted" | "rejected",
) {
  const auth = await verifyAuth();
  if (!auth) return { success: false };
  try {
    const [offer] = await db
      .select()
      .from(negotiationOffersTable)
      .where(eq(negotiationOffersTable.id, offerId))
      .limit(1);

    if (!offer) return { success: false };
    if (offer.farmerId !== auth.userId) return { success: false };
    if (offer.status !== "pending") return { success: false };

    await db
      .update(negotiationOffersTable)
      .set({
        status: response,
        acceptedAt: response === "accepted" ? new Date() : undefined,
      })
      .where(eq(negotiationOffersTable.id, offerId));

    if (response === "accepted") {
      await db
        .update(chatRoomsTable)
        .set({ status: "closed" })
        .where(eq(chatRoomsTable.id, offer.roomId));
    }

    return { success: true, offer };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

export async function getUnreadCount(userId: number) {
  try {
    const userRooms = await db
      .select({ id: chatRoomsTable.id })
      .from(chatRoomsTable)
      .where(
        or(
          eq(chatRoomsTable.buyerId, userId),
          eq(chatRoomsTable.farmerId, userId),
        ),
      );

    if (userRooms.length === 0) return 0;

    const roomIds = userRooms.map((r) => r.id);

    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(chatMessagesTable)
      .where(
        and(
          sql`${chatMessagesTable.roomId} IN ${roomIds}`,
          sql`${chatMessagesTable.senderId} != ${userId}`,
          eq(chatMessagesTable.isRead, false),
        ),
      );

    return result?.count || 0;
  } catch (error) {
    console.error(error);
    return 0;
  }
}

export async function toggleChatRoomPin(roomId: number, userId: number) {
  const auth = await verifyAuth();
  if (!auth || auth.userId !== userId) return { success: false };
  try {
    const [room] = await db
      .select({ buyerId: chatRoomsTable.buyerId, farmerId: chatRoomsTable.farmerId })
      .from(chatRoomsTable)
      .where(eq(chatRoomsTable.id, roomId))
      .limit(1);

    if (!room) return { success: false };
    if (room.buyerId !== userId && room.farmerId !== userId) return { success: false };

    const pinColumn =
      room.buyerId === userId
        ? chatRoomsTable.buyerPinned
        : chatRoomsTable.farmerPinned;

    const [current] = await db
      .select({ pinned: pinColumn })
      .from(chatRoomsTable)
      .where(eq(chatRoomsTable.id, roomId))
      .limit(1);

    const newValue = !current?.pinned;

    await db
      .update(chatRoomsTable)
      .set({ [room.buyerId === userId ? "buyerPinned" : "farmerPinned"]: newValue })
      .where(eq(chatRoomsTable.id, roomId));

    return { success: true, pinned: newValue };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

export async function editMessage(messageId: number, userId: number, newContent: string) {
  const auth = await verifyAuth();
  if (!auth || auth.userId !== userId) return { success: false, error: "Unauthorized" };
  try {
    const [msg] = await db
      .select()
      .from(chatMessagesTable)
      .where(
        and(
          eq(chatMessagesTable.id, messageId),
          eq(chatMessagesTable.senderId, userId),
        ),
      )
      .limit(1);

    if (!msg) return { success: false, error: "Message not found or not yours" };
    if (msg.type !== "text") return { success: false, error: "Only text messages can be edited" };

    await db
      .update(chatMessagesTable)
      .set({ content: newContent, isEdited: true })
      .where(eq(chatMessagesTable.id, messageId));

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to edit message" };
  }
}

export async function deleteMessage(messageId: number, userId: number) {
  const auth = await verifyAuth();
  if (!auth || auth.userId !== userId) return { success: false, error: "Unauthorized" };
  try {
    const [msg] = await db
      .select()
      .from(chatMessagesTable)
      .where(
        and(
          eq(chatMessagesTable.id, messageId),
          eq(chatMessagesTable.senderId, userId),
        ),
      )
      .limit(1);

    if (!msg) return { success: false, error: "Message not found or not yours" };

    await db
      .update(chatMessagesTable)
      .set({ isDeleted: true, content: "Pesan telah dihapus" })
      .where(eq(chatMessagesTable.id, messageId));

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete message" };
  }
}

export async function getEditedDeletedMessages(roomId: number, lastId: number) {
  const auth = await verifyAuth();
  if (!auth) return [];
  try {
    const msgs = await db
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
          gt(chatMessagesTable.id, lastId),
        ),
      );

    return msgs.filter((m) => m.isEdited || m.isDeleted);
  } catch (error) {
    console.error(error);
    return [];
  }
}
