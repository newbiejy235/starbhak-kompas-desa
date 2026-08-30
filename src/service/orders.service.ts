"use server";

import { db } from "@/db";
import { commoditiesTable, orderUser, ordersComodity } from "@/db/schema";
import { eq } from "drizzle-orm";


// testing buat liat id komoditas
export async function OrdersAction() {
  const result = await db
    .select()
    .from(commoditiesTable)
    .where(eq(commoditiesTable.id, 6));
  console.log({ data: result });
  return;
}

export async function addToOrders(
  orderUserId: number,
  commodityId: number,
  quantity: number,
  negotiatedPrice?: number,
) {
  try {
    const ordersCommodities = await db.insert(ordersComodity).values({
      orderUserId: orderUserId,
      commodityId: commodityId,
      quantity: quantity,
      negotiatedPrice:
        negotiatedPrice !== undefined ? String(negotiatedPrice) : null,
    });

    return {
      success: true,
      message: "berhasil ditambahkan ke orders",
    };
  } catch (error) {
    return {
      success: false,
      message: `internal server error : ${error}`,
    };
  }
}

export async function addToUserOrder(userId: number) {
  try {
    const result = await db
      .insert(orderUser)
      .values({
        userId,
      })
      .returning({
        id: orderUser.id,
      });

    return {
      success: true,
      message: "Data berhasil dibuat",
      data: result[0],
    };
  } catch (error) {
    console.error("addToUserOrder error:", error);

    return {
      success: false,
      message: "Internal server error",
    };
  }
}

export async function getAllOrders() {
  try {
    const result = await db
      .select({
        orderId: orderUser.id,
        userId: orderUser.userId,
        orderCreatedAt: orderUser.createdAt,

        commodityId: ordersComodity.commodityId,
        quantity: ordersComodity.quantity,
        negotiatedPrice: ordersComodity.negotiatedPrice,

        commodityName: commoditiesTable.name,
      })
      .from(orderUser)
      .innerJoin(ordersComodity, eq(orderUser.id, ordersComodity.orderUserId))
      .innerJoin(
        commoditiesTable,
        eq(ordersComodity.commodityId, commoditiesTable.id),
      );

    return {
      success: true,
      message:
        result.length === 0 ? "Tidak ada data" : "Data berhasil ditampilkan",
      data: result,
    };
  } catch (error) {
    console.error("getAllOrders error:", error);

    return {
      success: false,
      message: "Internal server error",
      data: [],
    };
  }
}

