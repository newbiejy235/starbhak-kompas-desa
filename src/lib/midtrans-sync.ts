import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  ordersTable,
  paymentsTable,
  notificationsTable,
} from "@/db/schema";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export function mapMidtransStatus(
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

const PAYMENT_TYPE_METHOD: Record<
  string,
  "bank_transfer" | "virtual_account" | "ewallet" | "qris" | "cod"
> = {
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

export type MidtransStatusPayload = {
  order_id?: string;
  transaction_status?: string;
  fraud_status?: string;
  payment_type?: string;
  transaction_id?: string;
  gross_amount?: string | number;
};

export type ApplyResult =
  | { ok: true; status: number; already?: boolean }
  | { ok: false; status: number; error: string };

export async function applyMidtransStatus(
  payload: MidtransStatusPayload,
): Promise<ApplyResult> {
  const orderCode = payload.order_id;
  const txnStatus = payload.transaction_status;
  const grossAmount = Number(payload.gross_amount ?? 0);

  if (!orderCode || !txnStatus || !Number.isFinite(grossAmount)) {
    return { ok: false, status: 400, error: "Notifikasi tidak lengkap" };
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.orderCode, orderCode));

  if (!order) {
    return { ok: false, status: 404, error: "Pesanan tidak ditemukan" };
  }

  const [payment] = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.orderId, order.id));

  if (!payment) {
    return { ok: false, status: 404, error: "Pembayaran tidak ditemukan" };
  }

  if (Math.abs(Number(payment.amount) - grossAmount) > 1) {
    return { ok: false, status: 400, error: "Nominal pembayaran tidak cocok" };
  }

  const mappedStatus = mapMidtransStatus(txnStatus, payload.fraud_status);

  const promotedStatus =
    order.status === "pending"
      ? mappedStatus === "paid"
        ? "confirmed"
        : order.status
      : order.status;

  if (payment.status === mappedStatus && order.status === promotedStatus) {
    return { ok: true, status: 200, already: true };
  }

  // Jadikan atomic: pembaruan payment + order + notifikasi kelas PAID
  // dikerjakan dalam SATU transaksi. Jika notifikasi gagal, seluruh
  // pembaruan ditolak (rollback) sehingga tidak ada kondisi
  // "payment = paid tapi petani tak tahu" (§12).
  await db.transaction(async (tx) => {
    await tx
      .update(paymentsTable)
      .set({
        status: mappedStatus,
        method:
          PAYMENT_TYPE_METHOD[payload.payment_type ?? ""] ?? payment.method,
        referenceCode: payload.transaction_id
          ? `MT-${payload.transaction_id}`
          : payment.referenceCode,
        paidAt: mappedStatus === "paid" ? new Date() : payment.paidAt,
      })
      .where(eq(paymentsTable.id, payment.id));

    await tx
      .update(ordersTable)
      .set({ status: promotedStatus, updatedAt: new Date() })
      .where(eq(ordersTable.id, order.id));

    if (mappedStatus === "paid") {
      await tx.insert(notificationsTable).values([
        {
          userId: order.buyerId,
          title: "Pembayaran Berhasil",
          message: `Pembayaran pesanan ${order.orderCode} berhasil. Pesanan Anda telah dikonfirmasi.`,
          type: "payment",
        },
        {
          userId: order.farmerId,
          title: "Pesanan Baru",
          message: `Pesanan ${order.orderCode} telah dibayar oleh pembeli dan menunggu diproses.`,
          type: "order",
        },
      ]);
    }
  });

  return { ok: true, status: 200 };
}
