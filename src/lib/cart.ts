export type CartEntry = {
  commodityId: number;
  quantity: number;
  negotiatedPrice?: number;
};

export type CheckoutSnapshotItem = {
  commodityId: number;
  quantity: number;
  negotiatedPrice?: number;
};

const CART_KEY = "kd_cart";
const CHECKOUT_SNAPSHOT_KEY = "kd_checkout_snapshot";

export function getCart(): CartEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(commodityId: number, quantity = 1, negotiatedPrice?: number) {
  const items = getCart();
  const existing = items.find((i) => i.commodityId === commodityId);
  if (existing) {
    existing.quantity += quantity;
    if (negotiatedPrice !== undefined) {
      existing.negotiatedPrice = negotiatedPrice;
    }
  } else {
    items.push({ commodityId, quantity, negotiatedPrice });
  }
  saveCart(items);
}

export function updateCartQuantity(commodityId: number, quantity: number) {
  const items = getCart().map((i) =>
    i.commodityId === commodityId ? { ...i, quantity } : i,
  );
  saveCart(items);
}

export function removeFromCart(commodityId: number) {
  saveCart(getCart().filter((i) => i.commodityId !== commodityId));
}

export function clearCart() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_KEY);
}

export function cartCount(): number {
  return getCart().reduce((sum, i) => sum + i.quantity, 0);
}

export function saveCheckoutSnapshot(items: CheckoutSnapshotItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHECKOUT_SNAPSHOT_KEY, JSON.stringify(items));
}

export function getCheckoutSnapshot(): CheckoutSnapshotItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHECKOUT_SNAPSHOT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CheckoutSnapshotItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearCheckoutSnapshot() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CHECKOUT_SNAPSHOT_KEY);
}
