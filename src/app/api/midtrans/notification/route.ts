import { revalidatePath } from "next/cache";
import { core } from "@/lib/midtrans";
import { applyMidtransStatus } from "@/lib/midtrans-sync";

export async function POST(request: Request) {
  try {
    let rawBody: string;
    try {
      rawBody = await request.text();
    } catch {
      return Response.json(
        { ok: false, error: "Request tidak valid" },
        { status: 400 },
      );
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody || "{}");
    } catch {
      return Response.json(
        { ok: false, error: "Format JSON tidak valid" },
        { status: 400 },
      );
    }

    const orderId = body.order_id as string | undefined;
    const transactionId = body.transaction_id as string | undefined;

    if (!orderId || !transactionId) {
      console.warn("[Midtrans] Notification received without order_id/transaction_id");
      return Response.json(
        { ok: false, error: "Notifikasi tidak lengkap" },
        { status: 400 },
      );
    }

    // Server-side verification: fetch authoritative status from Midtrans using
    // the Server Key. The POST body status is NOT trusted. Signature is not
    // verified here because this project's SDK resolves status via the
    // Core API (transaction.status) authenticating with the Server Key.
    const status = await core.transaction.notification(body);
    console.log(
      `[Midtrans] Notification received for ${status.order_id} (${status.transaction_status})`,
    );

    const result = await applyMidtransStatus({
      order_id: status.order_id as string | undefined,
      transaction_status: status.transaction_status as string | undefined,
      fraud_status: status.fraud_status as string | undefined,
      payment_type: status.payment_type as string | undefined,
      transaction_id: status.transaction_id as string | undefined,
      gross_amount: status.gross_amount as string | number | undefined,
    });

    if (!result.ok) {
      console.warn(`[Midtrans] Order verification failed: ${result.error}`);
      return Response.json(
        { ok: false, error: result.error },
        { status: result.status },
      );
    }

    if (result.already) {
      return Response.json({ ok: true, already: true });
    }

    console.log(
      `[Midtrans] Payment status updated for ${status.order_id} (${status.transaction_status})`,
    );

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
