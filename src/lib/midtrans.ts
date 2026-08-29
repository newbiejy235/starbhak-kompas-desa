import Midtrans from "midtrans-client";

export const midtransConfig = {
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.SECRET ?? "",
  clientKey: process.env.NEXT_PUBLIC_CLIENT ?? "",
};

if (!midtransConfig.serverKey) {
  throw new Error("SECRET (Midtrans Server Key) belum diset");
}

export const snap = new Midtrans.Snap(midtransConfig);

export type MidtransTransactionStatus = {
  transaction_id?: string;
  order_id?: string;
  transaction_status?: string;
  fraud_status?: string;
  payment_type?: string;
  gross_amount?: string | number;
  status_code?: string;
  status_message?: string;
  [key: string]: unknown;
};

type CoreApiWithTransaction = Midtrans.CoreApi & {
  transaction: {
    notification(payload: unknown): Promise<MidtransTransactionStatus>;
    status(orderId: string): Promise<MidtransTransactionStatus>;
  };
};

export const core = new Midtrans.CoreApi(midtransConfig) as CoreApiWithTransaction;

export const SNAP_SCRIPT_URL = midtransConfig.isProduction
  ? "https://app.midtrans.com/snap/snap.js"
  : "https://app.sandbox.midtrans.com/snap/snap.js";