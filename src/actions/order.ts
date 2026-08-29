"use server";

import { db } from "@/db";
import {
  ordersTable,
  paymentsTable,
  commoditiesTable,
  usersTable,
  notificationsTable,
  ImageUpload,
} from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getAuthUser } from "@/lib/auth/auth.service";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/types/auth";

const buyerUser = alias(usersTable, "buyer_user");
const farmerUser = alias(usersTable, "farmer_user");

function generateOrderCode(): string {
  const now = new Date();
  const ymd =
    now.getFullYear().toString().slice(2) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `KD-${ymd}-${rand}`;
}

export async function createOrder(
  buyerId: number,
  data: FormData,
): Promise<ActionState & { orderId?: number; redirect?: string }> {
  const buyer = await getAuthUser(buyerId);
  if (!buyer || buyer.role !== "pembeli") {
    return { success: false, message: "Unauthorized" };
  }

  const commodityId = Number(data.get("commodityId"));
  const quantity = Number(data.get("quantity"));
  const deliveryMethod = (data.get("deliveryMethod") as string) || "pickup";
  const deliveryAddress = (data.get("deliveryAddress") as string)?.trim() || "";
  const paymentMethod =
    (data.get("paymentMethod") as string) || "bank_transfer";
  const notes = (data.get("notes") as string)?.trim() || "";

  if (!commodityId || !quantity || quantity <= 0) {
    return { success: false, message: "Jumlah pesanan tidak valid" };
  }
  if (!["pickup", "expedition"].includes(deliveryMethod)) {
    return { success: false, message: "Metode penerimaan tidak valid" };
  }
  if (deliveryMethod === "expedition" && !deliveryAddress) {
    return { success: false, message: "Alamat pengiriman wajib diisi" };
  }

  const [commodity] = await db
    .select()
    .from(commoditiesTable)
    .where(eq(commoditiesTable.id, commodityId));

  if (!commodity) {
    return { success: false, message: "Komoditas tidak ditemukan" };
  }
  if (Number(commodity.stock) < quantity) {
    return {
      success: false,
      message: `Stok tidak mencukupi (tersedia ${commodity.stock} ${commodity.unit})`,
    };
  }

  const unitPrice = Number(commodity.price);
  const subtotal = unitPrice * quantity;
  const deliveryFee = deliveryMethod === "expedition" ? 25000 : 0;
  const serviceFee = Math.round(subtotal * 0.025 * 100) / 100;
  const totalPrice = subtotal + serviceFee + deliveryFee;

  try {
    const orderCode = generateOrderCode();
    const [order] = await db
      .insert(ordersTable)
      .values({
        orderCode,
        buyerId,
        farmerId: commodity.farmerId,
        commodityId,
        quantity: String(quantity),
        unitPrice: String(unitPrice),
        subtotal: String(subtotal),
        serviceFee: String(serviceFee),
        deliveryFee: String(deliveryFee),
        totalPrice: String(totalPrice),
        deliveryMethod: deliveryMethod as "pickup" | "expedition",
        deliveryAddress,
        status: "pending",
        notes,
      })
      .returning({ id: ordersTable.id });

    await db
      .update(commoditiesTable)
      .set({
        stock: String(Number(commodity.stock) - quantity),
        status:
          Number(commodity.stock) - quantity <= 0
            ? "sold_out"
            : commodity.status,
      })
      .where(eq(commoditiesTable.id, commodityId));

    await db.insert(paymentsTable).values({
      orderId: order.id,
      buyerId,
      method: paymentMethod as never,
      amount: String(totalPrice),
      fee: String(serviceFee),
      status: "pending",
      referenceCode: `PY-${orderCode.slice(3)}`,
    });

    await db.insert(notificationsTable).values({
      userId: commodity.farmerId,
      title: "Pesanan Baru",
      message: `Ada pesanan baru ${orderCode} sebesar Rp ${totalPrice.toLocaleString("id-ID")}.`,
      type: "order",
    });

    await db.insert(notificationsTable).values({
      userId: buyerId,
      title: "Pesanan Dibuat",
      message: `Pesanan ${orderCode} berhasil dibuat. Silakan selesaikan pembayaran.`,
      type: "order",
    });

    revalidatePath("/user/home");
    revalidatePath("/user/orders");
    revalidatePath("/petani/dashboard");

    return {
      success: true,
      message: "Pesanan berhasil dibuat",
      orderId: order.id,
      redirect: `/user/checkout/${order.id}`,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal membuat pesanan" };
  }
}

type OrderItem = {
  commodityId: number;
  quantity: number;
  negotiatedPrice?: number;
};

export async function createOrders(
  buyerId: number,
  items: OrderItem[],
  deliveryMethod: string,
  deliveryAddress: string,
  paymentMethod: string,
  notes: string,
): Promise<ActionState & { orderIds?: number[]; redirect?: string }> {
  const buyer = await getAuthUser(buyerId);
  if (!buyer || buyer.role !== "pembeli") {
    return { success: false, message: "Unauthorized" };
  }

  if (!items.length) {
    return { success: false, message: "Tidak ada item yang dipesan" };
  }
  if (!["pickup", "expedition"].includes(deliveryMethod)) {
    return { success: false, message: "Metode penerimaan tidak valid" };
  }
  if (deliveryMethod === "expedition" && !deliveryAddress) {
    return { success: false, message: "Alamat pengiriman wajib diisi" };
  }

  const commodityIds = items.map((i) => i.commodityId);
  const commodities = await db
    .select()
    .from(commoditiesTable)
    .where(inArray(commoditiesTable.id, commodityIds));

  const commodityMap = new Map(commodities.map((c) => [c.id, c]));

  for (const item of items) {
    const commodity = commodityMap.get(item.commodityId);
    if (!commodity) {
      return {
        success: false,
        message: `Komoditas dengan ID ${item.commodityId} tidak ditemukan`,
      };
    }
    if (Number(commodity.stock) < item.quantity) {
      return {
        success: false,
        message: `Stok "${commodity.name}" tidak mencukupi (tersedia ${commodity.stock} ${commodity.unit})`,
      };
    }
  }

  try {
    const orderIds: number[] = [];
    let firstOrderId: number | null = null;

    for (const item of items) {
      const commodity = commodityMap.get(item.commodityId)!;
      const unitPrice = item.negotiatedPrice ?? Number(commodity.price);
      const subtotal = unitPrice * item.quantity;
      const deliveryFee = deliveryMethod === "expedition" ? 25000 : 0;
      const serviceFee = Math.round(subtotal * 0.025 * 100) / 100;
      const totalPrice = subtotal + serviceFee + deliveryFee;
      const orderCode = generateOrderCode();

      const [order] = await db
        .insert(ordersTable)
        .values({
          orderCode,
          buyerId,
          farmerId: commodity.farmerId,
          commodityId: item.commodityId,
          quantity: String(item.quantity),
          unitPrice: String(unitPrice),
          subtotal: String(subtotal),
          serviceFee: String(serviceFee),
          deliveryFee: String(deliveryFee),
          totalPrice: String(totalPrice),
          deliveryMethod: deliveryMethod as "pickup" | "expedition",
          deliveryAddress,
          status: "pending",
          notes,
        })
        .returning({ id: ordersTable.id });

      orderIds.push(order.id);
      if (!firstOrderId) firstOrderId = order.id;

      await db
        .update(commoditiesTable)
        .set({
          stock: String(Number(commodity.stock) - item.quantity),
          status:
            Number(commodity.stock) - item.quantity <= 0
              ? "sold_out"
              : commodity.status,
        })
        .where(eq(commoditiesTable.id, item.commodityId));

      await db.insert(paymentsTable).values({
        orderId: order.id,
        buyerId,
        method: paymentMethod as never,
        amount: String(totalPrice),
        fee: String(serviceFee),
        status: "pending",
        referenceCode: `PY-${orderCode.slice(3)}`,
      });

      await db.insert(notificationsTable).values({
        userId: commodity.farmerId,
        title: "Pesanan Baru",
        message: `Ada pesanan baru ${orderCode} sebesar Rp ${totalPrice.toLocaleString("id-ID")}.`,
        type: "order",
      });
    }

    await db.insert(notificationsTable).values({
      userId: buyerId,
      title: "Pesanan Dibuat",
      message: `${orderIds.length} pesanan berhasil dibuat. Silakan selesaikan pembayaran.`,
      type: "order",
    });

    revalidatePath("/user/home");
    revalidatePath("/user/orders");
    revalidatePath("/petani/dashboard");

    return {
      success: true,
      message: `${orderIds.length} pesanan berhasil dibuat`,
      orderIds,
      redirect: `/user/checkout/${firstOrderId}`,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal membuat pesanan" };
  }
}

export async function getUserOrders(buyerId: number) {
  return db
    .select({
      id: ordersTable.id,
      orderCode: ordersTable.orderCode,
      quantity: ordersTable.quantity,
      unitPrice: ordersTable.unitPrice,
      subtotal: ordersTable.subtotal,
      serviceFee: ordersTable.serviceFee,
      deliveryFee: ordersTable.deliveryFee,
      totalPrice: ordersTable.totalPrice,
      deliveryMethod: ordersTable.deliveryMethod,
      deliveryAddress: ordersTable.deliveryAddress,
      status: ordersTable.status,
      notes: ordersTable.notes,
      createdAt: ordersTable.createdAt,
      commodityName: commoditiesTable.name,
      commodityImage: ImageUpload.secureUrl,
      commodityImages: commoditiesTable.images,
      farmerName: usersTable.fullName,
      farmerId: usersTable.id,
      paymentStatus: paymentsTable.status,
      paymentMethod: paymentsTable.method,
    })
    .from(ordersTable)
    .innerJoin(
      commoditiesTable,
      eq(commoditiesTable.id, ordersTable.commodityId),
    )
    .leftJoin(ImageUpload, eq(ImageUpload.id, commoditiesTable.image))
    .innerJoin(usersTable, eq(usersTable.id, ordersTable.farmerId))
    .leftJoin(paymentsTable, eq(paymentsTable.orderId, ordersTable.id))
    .where(eq(ordersTable.buyerId, buyerId))
    .orderBy(desc(ordersTable.createdAt));
}

export async function getFarmerOrders(farmerId: number) {
  return db
    .select({
      id: ordersTable.id,
      orderCode: ordersTable.orderCode,
      quantity: ordersTable.quantity,
      unitPrice: ordersTable.unitPrice,
      subtotal: ordersTable.subtotal,
      serviceFee: ordersTable.serviceFee,
      deliveryFee: ordersTable.deliveryFee,
      totalPrice: ordersTable.totalPrice,
      deliveryMethod: ordersTable.deliveryMethod,
      deliveryAddress: ordersTable.deliveryAddress,
      status: ordersTable.status,
      notes: ordersTable.notes,
      createdAt: ordersTable.createdAt,
      commodityName: commoditiesTable.name,
      commodityImage: ImageUpload.secureUrl,
      commodityImages: commoditiesTable.images,
      buyerName: usersTable.fullName,
      buyerId: usersTable.id,
      buyerNoTelp: usersTable.noTelp,
      paymentStatus: paymentsTable.status,
      paymentMethod: paymentsTable.method,
    })
    .from(ordersTable)
    .innerJoin(
      commoditiesTable,
      eq(commoditiesTable.id, ordersTable.commodityId),
    )
    .leftJoin(ImageUpload, eq(ImageUpload.id, commoditiesTable.image))
    .innerJoin(usersTable, eq(usersTable.id, ordersTable.buyerId))
    .leftJoin(paymentsTable, eq(paymentsTable.orderId, ordersTable.id))
    .where(eq(ordersTable.farmerId, farmerId))
    .orderBy(desc(ordersTable.createdAt));
}

export async function getOrderById(orderId: number) {
  const [row] = await db
    .select({
      id: ordersTable.id,
      orderCode: ordersTable.orderCode,
      quantity: ordersTable.quantity,
      unitPrice: ordersTable.unitPrice,
      subtotal: ordersTable.subtotal,
      serviceFee: ordersTable.serviceFee,
      deliveryFee: ordersTable.deliveryFee,
      totalPrice: ordersTable.totalPrice,
      deliveryMethod: ordersTable.deliveryMethod,
      deliveryAddress: ordersTable.deliveryAddress,
      status: ordersTable.status,
      notes: ordersTable.notes,
      createdAt: ordersTable.createdAt,
      buyerId: ordersTable.buyerId,
      farmerId: ordersTable.farmerId,
      commodityId: ordersTable.commodityId,
      commodityName: commoditiesTable.name,
      commodityImage: ImageUpload.secureUrl,
      commodityImages: commoditiesTable.images,
      commodityUnit: commoditiesTable.unit,
      buyerName: buyerUser.fullName,
      farmerName: farmerUser.fullName,
      paymentId: paymentsTable.id,
      paymentMethod: paymentsTable.method,
      paymentStatus: paymentsTable.status,
      paymentReference: paymentsTable.referenceCode,
      paymentPaidAt: paymentsTable.paidAt,
    })
    .from(ordersTable)
    .innerJoin(
      commoditiesTable,
      eq(commoditiesTable.id, ordersTable.commodityId),
    )
    .leftJoin(ImageUpload, eq(ImageUpload.id, commoditiesTable.image))
    .innerJoin(buyerUser, eq(buyerUser.id, ordersTable.buyerId))
    .innerJoin(farmerUser, eq(farmerUser.id, ordersTable.farmerId))
    .leftJoin(paymentsTable, eq(paymentsTable.orderId, ordersTable.id))
    .where(eq(ordersTable.id, orderId));

  return row ?? null;
}

export async function updateOrderStatus(
  orderId: number,
  status: string,
  actorId: number,
): Promise<ActionState> {
  const actor = await getAuthUser(actorId);
  if (!actor || (actor.role !== "admin" && actor.role !== "petani")) {
    return { success: false, message: "Unauthorized" };
  }

  const validStatuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "completed",
    "cancelled",
  ];
  if (!validStatuses.includes(status)) {
    return { success: false, message: "Status tidak valid" };
  }

  try {
    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId));
    if (!order) return { success: false, message: "Pesanan tidak ditemukan" };

    if (actor.role === "petani" && order.farmerId !== actorId) {
      return { success: false, message: "Unauthorized" };
    }

    await db
      .update(ordersTable)
      .set({ status: status as never, updatedAt: new Date() })
      .where(eq(ordersTable.id, orderId));

    const statusMessage: Record<string, string> = {
      confirmed: "Pesanan Anda telah dikonfirmasi oleh petani.",
      processing: "Pesanan Anda sedang diproses.",
      shipped: "Pesanan Anda sedang dikirim.",
      completed: "Pesanan Anda telah selesai. Jangan lupa beri ulasan!",
      cancelled: "Pesanan Anda telah dibatalkan.",
    };

    await db.insert(notificationsTable).values({
      userId: order.buyerId,
      title: `Status Pesanan ${order.orderCode}`,
      message:
        statusMessage[status] || `Status pesanan berubah menjadi ${status}.`,
      type: "order",
    });

    if (status === "cancelled") {
      const [commodity] = await db
        .select()
        .from(commoditiesTable)
        .where(eq(commoditiesTable.id, order.commodityId));
      if (commodity) {
        await db
          .update(commoditiesTable)
          .set({
            stock: String(Number(commodity.stock) + Number(order.quantity)),
            status: "available",
          })
          .where(eq(commoditiesTable.id, order.commodityId));
      }
    }

    if (status === "completed") {
      await db
        .update(paymentsTable)
        .set({ status: "paid", paidAt: new Date() })
        .where(eq(paymentsTable.orderId, orderId));
    }

    revalidatePath("/user/orders");
    revalidatePath("/user/checkout");
    revalidatePath("/petani/dashboard");
    revalidatePath("/admin/orders");
    return { success: true, message: "Status pesanan diperbarui" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal memperbarui status pesanan" };
  }
}

export async function markOrderPaid(
  orderId: number,
  buyerId: number,
): Promise<ActionState> {
  const buyer = await getAuthUser(buyerId);
  if (!buyer || buyer.role !== "pembeli") {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId));
    if (!order || order.buyerId !== buyerId) {
      return { success: false, message: "Pesanan tidak ditemukan" };
    }

    await db
      .update(paymentsTable)
      .set({ status: "paid", paidAt: new Date() })
      .where(eq(paymentsTable.orderId, orderId));

    await db.insert(notificationsTable).values({
      userId: order.farmerId,
      title: "Pembayaran Diterima",
      message: `Pembayaran untuk pesanan ${order.orderCode} telah diterima.`,
      type: "payment",
    });

    revalidatePath("/user/checkout");
    revalidatePath("/user/orders");
    revalidatePath("/petani/dashboard");
    return { success: true, message: "Pembayaran berhasil dikonfirmasi" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal mengonfirmasi pembayaran" };
  }
}

export async function getAllOrders() {
 const result = await db
    .select({
      id: ordersTable.id,
      orderCode: ordersTable.orderCode,
      quantity: ordersTable.quantity,
      totalPrice: ordersTable.totalPrice,
      serviceFee: ordersTable.serviceFee,
      deliveryMethod: ordersTable.deliveryMethod,
      status: ordersTable.status,
      createdAt: ordersTable.createdAt,
      commodityName: commoditiesTable.name,
      buyerName: buyerUser.fullName,
      farmerName: farmerUser.fullName,
      paymentStatus: paymentsTable.status,
      paymentMethod: paymentsTable.method,
    })
    .from(ordersTable)
    .innerJoin(
      commoditiesTable,
      eq(commoditiesTable.id, ordersTable.commodityId),
    )
    .innerJoin(buyerUser, eq(buyerUser.id, ordersTable.buyerId))
    .innerJoin(farmerUser, eq(farmerUser.id, ordersTable.farmerId))
    .leftJoin(paymentsTable, eq(paymentsTable.orderId, ordersTable.id))
    .orderBy(desc(ordersTable.createdAt));

    return({
      success : true,
      message : "berhasil ambil item",
      data : result
    })
}
