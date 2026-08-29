"use client";
import { getUnpaidOrders, OrdersAction } from "@/service/orders.service";
import { CartEntry } from "@/lib/cart";
import { addToUserOrder } from "@/service/orders.service";
import { addToOrders } from "@/service/orders.service";
import { updateOrderStatus } from "@/service/orders.service";
// import { getAllOrders } from "@/service/orders.service";
// import { getOrderByUsers } from "@/service/orders.service";

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

export async function getUnpaid(id: number) {
  return await getUnpaidOrders(id);
}

export async function updatePaid(id: number) {
  return await updateOrderStatus(id);
}


// export async function getDataOrders() {
//   return await getAllOrders();
// }

// export async function getOrderUsersById(id : number) {
//   return await getOrderByUsers(id)
// }



