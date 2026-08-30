import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { ordersTable, paymentsTable, notificationsTable } from "@/db/schema";
import { core } from "@/lib/midtrans";

type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

function mapMidtransStatus(
  status: string | undefined,
  fraudStatus: string | undefined,
): PaymentStatus {
  const s = (status ?? "").toLowerCase();
  if (s === "capture") return fraudStatus === "challenge" ? "pending" : "paid";
  if (s === "settlement") return "paid";
  if (s === "deny" || s === "cancel" || s === "expire") return "failed";
  if (
    s === "refund" ||
    s === "chargeback" ||
    s === "partial_refund" ||
    s === "partial_chargeback"
  ) {
    return "refunded";
  }
  return "pending";
}

const PAYMENT_TYPE_METHOD: Record<string, "bank_transfer" | "virtual_account" | "ewallet" | "qris" | "cod"> = {
  bank_transfer: "bank_transfer",
  echannel: "virtual_account",
  permata: "virtual_account",
  cstore: "virtual_account",
  briva: "virtual_account",
  qris: "qris",
  gopay: "ewallet",
  ovo: "ewallet",
  dana: "ewallet",
  shopeepay: "ewallet",
  akulaku: "ewallet",
  credit_card: "bank_transfer",
  bca_klikpay: "bank_transfer",
  bca_klikbca: "bank_transfer",
  bri_epay: "bank_transfer",
  cimb_clicks: "bank_transfer",
  danamon_online: "bank_transfer",
};

export async function POST(request: Request) {
  try {
    const notification = await core.transaction.notification(await request.json());

    const orderCode = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const grossAmount = Number(notification.gross_amount ?? 0);

    if (!orderCode || !transactionStatus) {
      return Response.json(
        { ok: false, error: "Notifikasi tidak lengkap" },
        { status: 400 },
      );
    }

    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.orderCode, orderCode));

    if (!order) {
      return Response.json(
        { ok: false, error: "Pesanan tidak ditemukan" },
        { status: 404 },
      );
    }

    const [payment] = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.orderId, order.id));

    if (!payment) {
      return Response.json(
        { ok: false, error: "Pembayaran tidak ditemukan" },
        { status: 404 },
      );
    }

    if (Math.abs(Number(payment.amount) - grossAmount) > 1) {
      return Response.json(
        { ok: false, error: "Nominal pembayaran tidak cocok" },
        { status: 400 },
      );
    }

    const mappedStatus = mapMidtransStatus(
      transactionStatus,
      notification.fraud_status,
    );

    if (payment.status === mappedStatus) {
      return Response.json({ ok: true, already: true });
    }

    await db
      .update(paymentsTable)
      .set({
        status: mappedStatus,
        method:
          PAYMENT_TYPE_METHOD[notification.payment_type ?? ""] ??
          payment.method,
        referenceCode: notification.transaction_id
          ? `MT-${notification.transaction_id}`
          : payment.referenceCode,
        paidAt: mappedStatus === "paid" ? new Date() : null,
      })
      .where(eq(paymentsTable.id, payment.id));

    if (mappedStatus === "paid") {
      await db.insert(notificationsTable).values([
        {
          userId: order.farmerId,
          title: "Pembayaran Diterima",
          message: `Pembayaran untuk pesanan ${order.orderCode} telah diterima sebesar Rp ${Number(
            payment.amount,
          ).toLocaleString("id-ID")}.`,
          type: "payment",
        },
        {
          userId: order.buyerId,
          title: "Pembayaran Berhasil",
          message: `Pembayaran pesanan ${order.orderCode} berhasil. Petani akan segera memproses pesanan Anda.`,
          type: "payment",
        },
      ]);
    }

    revalidatePath("/user/orders");
    revalidatePath("/user/checkout");
    revalidatePath("/user/transactions");
    revalidatePath("/petani/dashboard");
    revalidatePath("/admin/orders");

    return Response.json({ ok: true });
  } catch (error) {
    console.error("MIDTRANS NOTIFICATION ERROR:", error);
    return Response.json(
      { ok: false, error: "Gagal memproses notifikasi" },
      { status: 500 },
    );
  }
}