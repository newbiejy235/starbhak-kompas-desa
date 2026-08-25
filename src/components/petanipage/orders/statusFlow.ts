const FLOW: Record<string, string> = {
  pending: "confirmed",
  confirmed: "processing",
  processing: "shipped",
  shipped: "completed",
};

export function nextOrderStatus(status: string): string | null {
  return FLOW[status] ?? null;
}

const ACTION_LABELS: Record<string, string> = {
  pending: "Konfirmasi Pesanan",
  confirmed: "Mulai Proses",
  processing: "Tandai Dikirim",
  shipped: "Tandai Selesai",
};

export function nextActionLabel(status: string): string | null {
  return ACTION_LABELS[status] ?? null;
}
