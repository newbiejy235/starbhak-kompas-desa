"use server";

import { db } from "@/db";
import {
  chatRoomsTable,
  chatMessagesTable,
  negotiationOffersTable,
  commoditiesTable,
  usersTable,
  ImageUpload,
} from "@/db/schema";
import { eq, and, desc, sql, or } from "drizzle-orm";

export async function getOrCreateChatRoom(
  buyerId: number,
  farmerId: number,
  commodityId: number,
) {
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
  try {
    const condition =
      role === "pembeli"
        ? eq(chatRoomsTable.buyerId, userId)
        : eq(chatRoomsTable.farmerId, userId);

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
        buyerName: usersTable.fullName,
        farmerName: usersTable.fullName,
        commodityName: commoditiesTable.name,
        commodityPrice: commoditiesTable.price,
        commodityImage: ImageUpload.secureUrl,
        commodityUnit: commoditiesTable.unit,
      })
      .from(chatRoomsTable)
      .innerJoin(usersTable, eq(usersTable.id, role === "pembeli" ? chatRoomsTable.farmerId : chatRoomsTable.buyerId))
      .innerJoin(commoditiesTable, eq(commoditiesTable.id, chatRoomsTable.commodityId))
      .leftJoin(ImageUpload, eq(ImageUpload.id, commoditiesTable.image))
      .where(condition)
      .orderBy(desc(chatRoomsTable.lastMessageAt));

    return rooms;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getChatRoomDetail(roomId: number) {
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
        commodityDescription: commoditiesTable.description,
        commodityStatus: commoditiesTable.status,
      })
      .from(chatRoomsTable)
      .innerJoin(commoditiesTable, eq(commoditiesTable.id, chatRoomsTable.commodityId))
      .leftJoin(ImageUpload, eq(ImageUpload.id, commoditiesTable.image))
      .where(eq(chatRoomsTable.id, roomId));

    if (!room) return null;

    const buyer = await db
      .select({ id: usersTable.id, fullName: usersTable.fullName, fotoProfile: usersTable.fotoProfile })
      .from(usersTable)
      .where(eq(usersTable.id, room.buyerId))
      .limit(1);

    const farmer = await db
      .select({ id: usersTable.id, fullName: usersTable.fullName, fotoProfile: usersTable.fotoProfile, address: usersTable.address })
      .from(usersTable)
      .where(eq(usersTable.id, room.farmerId))
      .limit(1);

    return {
      ...room,
      buyerName: buyer[0]?.fullName || "",
      buyerFoto: buyer[0]?.fotoProfile || null,
      farmerName: farmer[0]?.fullName || "",
      farmerFoto: farmer[0]?.fotoProfile || null,
      farmerAddress: farmer[0]?.address || null,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getChatMessages(roomId: number) {
  try {
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
) {
  try {
    const [msg] = await db
      .insert(chatMessagesTable)
      .values({
        roomId,
        senderId,
        type,
        content,
        offerPrice: offerPrice?.toString(),
        offerQuantity: offerQuantity?.toString(),
      })
      .returning({ id: chatMessagesTable.id });

    await db
      .update(chatRoomsTable)
      .set({
        lastMessage: content,
        lastMessageAt: new Date(),
      })
      .where(eq(chatRoomsTable.id, roomId));

    return { id: msg.id };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function markMessagesAsRead(roomId: number, userId: number) {
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
  try {
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
  try {
    await db
      .update(negotiationOffersTable)
      .set({
        status: response,
        acceptedAt: response === "accepted" ? new Date() : undefined,
      })
      .where(eq(negotiationOffersTable.id, offerId));

    const [offer] = await db
      .select()
      .from(negotiationOffersTable)
      .where(eq(negotiationOffersTable.id, offerId));

    if (response === "accepted" && offer) {
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
