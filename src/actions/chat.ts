"use server";

import { db } from "@/db";
import {
  chatRoomsTable,
  chatMessagesTable,
  negotiationOffersTable,
  commoditiesTable,
  usersTable,
  notificationsTable,
  paymentsTable,
  ImageUpload,
} from "@/db/schema";
import { eq, and, desc, sql, or, gt } from "drizzle-orm";
import { formatRupiah } from "@/lib/format";
import { getAuthUser } from "@/lib/auth/auth.service";
import {
  createOrderFromNegotiation,
  createOrderFromAcceptedOffer,
} from "@/actions/order";
import { NegotiationValidationError } from "@/lib/chat-shared";

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
        hasDeal: sql<boolean>`exists(select 1 from chat_messages_table m where m."roomId" = chat_rooms_table.id and m.type = 'accept')`,
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
  replyToId?: number,
) {
  try {
    const [room] = await db
      .select({
        id: chatRoomsTable.id,
        buyerId: chatRoomsTable.buyerId,
        farmerId: chatRoomsTable.farmerId,
        commodityId: chatRoomsTable.commodityId,
      })
      .from(chatRoomsTable)
      .where(eq(chatRoomsTable.id, roomId))
      .limit(1);

    if (!room) {
      return { success: false, error: "Chat tidak ditemukan" };
    }

    const isNegotiation =
      type === "offer" ||
      type === "counter_offer" ||
      type === "accept" ||
      type === "reject";

    if (isNegotiation) {
      const sender = await getAuthUser(senderId);
      if (!sender || (sender.role !== "pembeli" && sender.role !== "petani")) {
        return { success: false, error: "Unauthorized" };
      }
      if (room.buyerId !== senderId && room.farmerId !== senderId) {
        return { success: false, error: "Anda bukan anggota chat ini" };
      }

      const [commodity] = await db
        .select()
        .from(commoditiesTable)
        .where(eq(commoditiesTable.id, room.commodityId))
        .limit(1);

      if (!commodity) {
        return { success: false, error: "Produk tidak ditemukan" };
      }

      let resultOrderId: number | undefined;
      let resultOrderCode: string | undefined;
      let resultOfferId: number | undefined;

      const msg = await db.transaction(async (tx) => {
        if (type === "offer" || type === "counter_offer") {
          if (!offerPrice || offerPrice <= 0 || !offerQuantity || offerQuantity <= 0) {
            throw new NegotiationValidationError("Harga dan jumlah tidak valid");
          }
          if (commodity.minPrice && offerPrice < Number(commodity.minPrice)) {
            throw new NegotiationValidationError(`Harga di bawah minimum ${formatRupiah(Number(commodity.minPrice))}`);
          }
          if (commodity.maxPrice && offerPrice > Number(commodity.maxPrice)) {
            throw new NegotiationValidationError(`Harga di atas maksimum ${formatRupiah(Number(commodity.maxPrice))}`);
          }
          if (Number(commodity.stock) < offerQuantity) {
            throw new NegotiationValidationError(`Stok ${commodity.name} tidak mencukupi`);
          }

          await tx
            .update(negotiationOffersTable)
            .set({ status: "cancelled" })
            .where(
              and(
                eq(negotiationOffersTable.roomId, roomId),
                eq(negotiationOffersTable.status, "pending"),
              ),
            );

          const [offer] = await tx
            .insert(negotiationOffersTable)
            .values({
              roomId,
              commodityId: room.commodityId,
              buyerId: room.buyerId,
              farmerId: room.farmerId,
              price: offerPrice.toString(),
              quantity: offerQuantity.toString(),
              unit: commodity.unit,
            })
            .returning({ id: negotiationOffersTable.id });
          resultOfferId = offer.id;
        } else {
          const [pending] = await tx
            .select()
            .from(negotiationOffersTable)
            .where(
              and(
                eq(negotiationOffersTable.roomId, roomId),
                eq(negotiationOffersTable.status, "pending"),
              ),
            )
            .orderBy(desc(negotiationOffersTable.id))
            .limit(1);

          if (!pending) {
            throw new NegotiationValidationError("Tidak ada penawaran yang menunggu");
          }

          if (type === "accept") {
            await tx
              .update(negotiationOffersTable)
              .set({ status: "accepted", acceptedAt: new Date() })
              .where(eq(negotiationOffersTable.id, pending.id));

            const order = await createOrderFromAcceptedOffer(tx, {
              offerId: pending.id,
              buyerId: room.buyerId,
              farmerId: room.farmerId,
              commodityId: room.commodityId,
              quantity: Number(pending.quantity),
              unitPrice: Number(pending.price),
            });
            resultOrderId = order.id;
            resultOrderCode = order.orderCode;

            await tx
              .update(notificationsTable)
              .set({ isRead: true })
              .where(
                and(
                  eq(notificationsTable.userId, senderId),
                  eq(notificationsTable.relatedRoomId, roomId),
                  sql`${notificationsTable.relatedOfferId} IS NOT NULL`,
                ),
              );
          } else {
            await tx
              .update(negotiationOffersTable)
              .set({ status: "rejected" })
              .where(eq(negotiationOffersTable.id, pending.id));
          }
        }

        const [msg] = await tx
          .insert(chatMessagesTable)
          .values({
            roomId,
            senderId,
            type,
            content,
            offerPrice: offerPrice !== undefined ? String(offerPrice) : undefined,
            offerQuantity: offerQuantity !== undefined ? String(offerQuantity) : undefined,
            replyToId: replyToId ?? null,
          })
          .returning({ id: chatMessagesTable.id });

        await tx
          .update(chatRoomsTable)
          .set({
            status: type === "accept" ? "closed" : "active",
            lastMessage: content,
            lastMessageAt: new Date(),
          })
          .where(eq(chatRoomsTable.id, roomId));

        return { id: msg.id, offerId: resultOfferId };
      });

      notifyChatMessage(roomId, senderId, content, type, resultOfferId).catch(() => {});

      return {
        success: true,
        id: msg.id,
        orderId: resultOrderId,
        orderCode: resultOrderCode,
      };
    }

    const [msg] = await db
      .insert(chatMessagesTable)
      .values({
        roomId,
        senderId,
        type,
        content,
        offerPrice: offerPrice !== undefined ? String(offerPrice) : undefined,
        offerQuantity: offerQuantity !== undefined ? String(offerQuantity) : undefined,
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

    const result = { id: msg.id };

    // Notify recipient (best-effort, non-blocking)
    notifyChatMessage(roomId, senderId, content).catch(() => {});

    return { success: true, ...result };
  } catch (error) {
    if (error instanceof NegotiationValidationError) {
      return { success: false, error: error.message };
    }
    console.error(error);
    return { success: false, error: "Terjadi kesalahan, coba lagi." };
  }
}

export async function notifyChatMessage(
  roomId: number,
  senderId: number,
  content: string,
  type: string = "text",
  offerId?: number,
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

    const isOfferType = type === "offer" || type === "counter_offer";

    await db.insert(notificationsTable).values({
      userId: recipientId,
      title: `Pesan baru dari ${senderName}`,
      message: `${commodityName}: ${preview}`,
      type: "chat",
      relatedRoomId: isOfferType ? roomId : null,
      relatedOfferId: isOfferType ? (offerId ?? null) : null,
    });
  } catch (error) {
    console.error("notifyChatMessage error:", error);
  }
}

export async function getNewMessages(roomId: number, afterId: number) {
  try {
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

// @deprecated - jalur lama, dipertahankan sementara, cek lagi sebelum dihapus permanen
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
    const [commodity] = await db
      .select()
      .from(commoditiesTable)
      .where(eq(commoditiesTable.id, commodityId));

    if (!commodity) return null;

    if (commodity.minPrice && price < Number(commodity.minPrice)) {
      return { error: `Harga di bawah minimum ${formatRupiah(Number(commodity.minPrice))}` };
    }
    if (commodity.maxPrice && price > Number(commodity.maxPrice)) {
      return { error: `Harga di atas maksimum ${formatRupiah(Number(commodity.maxPrice))}` };
    }

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

// @deprecated - jalur lama, dipertahankan sementara, cek lagi sebelum dihapus permanen
export async function respondToOffer(
  offerId: number,
  response: "accepted" | "rejected",
) {
  try {
    const [offer] = await db
      .select()
      .from(negotiationOffersTable)
      .where(eq(negotiationOffersTable.id, offerId));

    if (!offer) return { success: false };

    if (response === "accepted") {
      const [commodity] = await db
        .select()
        .from(commoditiesTable)
        .where(eq(commoditiesTable.id, offer.commodityId));

      if (commodity) {
        const price = Number(offer.price);
        if (commodity.minPrice && price < Number(commodity.minPrice)) {
          return { success: false, error: "Harga di bawah minimum" };
        }
        if (commodity.maxPrice && price > Number(commodity.maxPrice)) {
          return { success: false, error: "Harga di atas maksimum" };
        }
      }
    }

    await db.transaction(async (tx) => {
      await tx
        .update(negotiationOffersTable)
        .set({
          status: response,
          acceptedAt: response === "accepted" ? new Date() : undefined,
        })
        .where(eq(negotiationOffersTable.id, offerId));

      if (response === "accepted") {
        await tx
          .update(chatRoomsTable)
          .set({ status: "closed" })
          .where(eq(chatRoomsTable.id, offer.roomId));
      }
    });

    if (response === "accepted") {
      const orderResult = await createOrderFromNegotiation(offerId, offer.buyerId);
      return { success: true, offer, order: orderResult };
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

export async function editMessage(messageId: number, userId: number, newContent: string) {
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
