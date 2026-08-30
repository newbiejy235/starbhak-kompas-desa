import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  ordersTable,
  paymentsTable,
  commoditiesTable,
  usersTable,
} from "@/db/schema";
import { verifyAuth } from "@/lib/auth/auth.service";
import { snap, SNAP_SCRIPT_URL } from "@/lib/midtrans";

export async function POST(request: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await request.json();

    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, Number(orderId)));

    if (!order || order.buyerId !== auth.userId) {
      return Response.json(
        { error: "Pesanan tidak ditemukan" },
        { status: 404 },
      );
    }

    const [payment] = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.orderId, order.id));

    if (!payment) {
      return Response.json(
        { error: "Pembayaran tidak ditemukan" },
        { status: 404 },
      );
    }

    if (payment.status === "paid" || payment.status === "refunded") {
      return Response.json(
        { error: "Pembayaran pesanan ini sudah selesai" },
        { status: 400 },
      );
    }

    const [commodity] = await db
      .select()
      .from(commoditiesTable)
      .where(eq(commoditiesTable.id, order.commodityId));

    const [buyer] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, order.buyerId));

    const grossAmount =
      Math.round(Number(order.subtotal)) +
      Math.round(Number(order.serviceFee)) +
      Math.round(Number(order.deliveryFee));

    const parameter = {
      transaction_details: {
        order_id: order.orderCode,
        gross_amount: grossAmount,
      },
      item_details: [
        {
          id: `commodity-${order.commodityId}`,
          name: commodity?.name ?? "Komoditas",
          price: Math.round(Number(order.subtotal)),
          quantity: 1,
        },
        {
          id: "service-fee",
          name: "Biaya Layanan",
          price: Math.round(Number(order.serviceFee)),
          quantity: 1,
        },
        {
          id: "delivery-fee",
          name: "Ongkos Kirim",
          price: Math.round(Number(order.deliveryFee)),
          quantity: 1,
        },
      ],
      customer_details: {
        first_name: buyer?.fullName,
        email: buyer?.email,
        phone: buyer?.noTelp,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    return Response.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      snapUrl: SNAP_SCRIPT_URL,
      orderCode: order.orderCode,
      grossAmount,
    });
  } catch (error) {
    console.error("MIDTRANS TOKEN ERROR:", error);
    return Response.json(
      { error: "Gagal membuat transaksi pembayaran" },
      { status: 500 },
    );
  }
}