"use client";
import { OrdersAction } from "@/service/orders.service";
import { CartEntry } from "@/lib/cart";
import { addToUserOrder } from "@/service/orders.service";
import { addToOrders } from "@/service/orders.service";
import { getAllOrders } from "@/service/orders.service";

export function orders(data: CartEntry[]) {
  console.log(data);
}

export async function TestOrders() {
  return await OrdersAction();
}

export async function addOrders(
  orderUserId: number,
  commodityId: number,
  quantity: number,
  negotiatedPrice?: number,
) {
  return await addToOrders(orderUserId, commodityId, quantity, negotiatedPrice);
}

export async function getUsersOrder(id: number) {
  return await addToUserOrder(id);
}

export async function getDataOrders() {
  return await getAllOrders();
}

