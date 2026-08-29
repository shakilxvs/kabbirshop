"use client";

export interface CartLine {
  productId: string;
  variantKey?: string; // e.g. "Color:Black|Storage:128GB" — identifies the exact variant
  variantLabel?: string;
  name: string;
  slug: string;
  imageUrl: string;
  sku: string;
  quantity: number;
  // Price is NOT trusted at checkout — it's only for display in the cart.
  // The server re-resolves the true price from Firestore before creating the order (spec #29).
  displayUnitPrice: number;
}

const CART_KEY = "gadgetshop_cart_v1";

function readCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

function writeCart(lines: CartLine[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event("cart:updated"));
}

function lineKey(l: Pick<CartLine, "productId" | "variantKey">) {
  return `${l.productId}::${l.variantKey ?? ""}`;
}

export function getCart(): CartLine[] {
  return readCart();
}

export function getCartCount(): number {
  return readCart().reduce((sum, l) => sum + l.quantity, 0);
}

export function addToCart(line: CartLine) {
  const cart = readCart();
  const idx = cart.findIndex((l) => lineKey(l) === lineKey(line));
  if (idx >= 0) {
    cart[idx].quantity += line.quantity;
  } else {
    cart.push(line);
  }
  writeCart(cart);
}

export function updateQuantity(productId: string, variantKey: string | undefined, quantity: number) {
  const cart = readCart();
  const idx = cart.findIndex((l) => lineKey(l) === lineKey({ productId, variantKey }));
  if (idx < 0) return;
  if (quantity <= 0) {
    cart.splice(idx, 1);
  } else {
    cart[idx].quantity = quantity;
  }
  writeCart(cart);
}

export function removeFromCart(productId: string, variantKey?: string) {
  const cart = readCart().filter((l) => lineKey(l) !== lineKey({ productId, variantKey }));
  writeCart(cart);
}

export function clearCart() {
  writeCart([]);
}
