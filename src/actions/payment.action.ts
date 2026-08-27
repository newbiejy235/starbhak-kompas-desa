// "use server";

// import { db } from "@/db";
// import { ordersTable } from "@/db/schema";
// import { eq } from "drizzle-orm";
// // import { requireAuth } from "@/lib/auth-server";
// // import type { ApiResponse } from "@/types";

// const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY!;
// const XENDIT_API_URL = "https://api.xendit.co";

// export interface XenditPaymentLink {
//   id: string;
//   invoiceUrl: string;
//   externalId: string;
//   status: string;
//   amount: number;
//   expiryDate: string;
// }

// // ─── Create Xendit Invoice / Payment Link ─────────────────────────────────────
// export async function createXenditPaymentLink(
 
// ) {

//   try {
//     const invoice = await db.query.invoices.findFirst({
//       where: eq(invoices.id, invoiceId),
//       with: { customer: true, vehicle: true, items: true },
//     });

//     if (!invoice) return { success: false, error: "Invoice tidak ditemukan" };
//     if (invoice.paymentStatus === "paid") {
//       return { success: false, error: "Invoice ini sudah lunas" };
//     }

//     const amountDue = parseFloat(invoice.remainingAmount);
//     if (amountDue <= 0)
//       return { success: false, error: "Tidak ada sisa tagihan" };

//     const externalId = ${invoice.invoiceNumber}-${Date.now()};
   

//     const body = {
//       external_id: externalId,
//       amount: Math.round(amountDue),
//       description,
//       invoice_duration: 86400 * 3, // 3 days
//       customer: {
//         given_names: (invoice as any).customer?.fullName ?? "Pelanggan",
//         email: (invoice as any).customer?.email ?? undefined,
//         mobile_number: normalizePhone(
//           (invoice as any).customer?.phoneNumber ?? "",
//         ),
//       },
//       customer_notification_preference: {
//         invoice_created: ["whatsapp", "sms"],
//         invoice_reminder: ["whatsapp", "sms"],
//         invoice_paid: ["whatsapp", "sms"],
//       },
//       success_redirect_url: ${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoiceId}?paid=1,
//       failure_redirect_url: ${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoiceId}?failed=1,
//       currency: "IDR",
//       items: (invoice.items ?? []).map((item) => ({
//         name: item.itemName,
//         quantity: item.quantity,
//         price: Math.round(parseFloat(item.price)),
//         category: item.itemType === "product" ? "Produk" : "Jasa",
//       })),
//       fees: [],
//     };

//     const response = await fetch(${XENDIT_API_URL}/v2/invoices, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: Basic ${Buffer.from(XENDIT_SECRET_KEY + ":").toString("base64")},
//       },
//       body: JSON.stringify(body),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       console.error("Xendit error:", data);
//       return {
//         success: false,
//         error:
//           data.message ?? data.error_code ?? "Gagal membuat link pembayaran",
//       };
//     }

//     // Store the payment link URL on the invoice for reference
//     await db
//       .update(invoices)
//       .set({
//         notes: invoice.notes
//           ? ${invoice.notes}\nXendit: ${data.invoice_url}
//           : Xendit: ${data.invoice_url},
//         updatedAt: new Date(),
//       })
//       .where(eq(invoices.id, invoiceId));

//     return {
//       success: true,
//       message: "Link pembayaran berhasil dibuat",
//       data: {
//         id: data.id,
//         invoiceUrl: data.invoice_url,
//         externalId: data.external_id,
//         status: data.status,
//         amount: data.amount,
//         expiryDate: data.expiry_date,
//       },
//     };
//   } catch (error) {
//     console.error("Xendit createPaymentLink error:", error);
//     return {
//       success: false,
//       error: "Terjadi kesalahan saat membuat link pembayaran",
//     };
//   }
// }