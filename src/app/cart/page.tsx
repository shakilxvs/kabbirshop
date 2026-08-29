"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { CartLine, getCart, updateQuantity, removeFromCart } from "@/lib/cart";
import { formatBDT } from "@/lib/pricing";

export default function CartPage() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCart(getCart());
    setLoaded(true);
    const onUpdate = () => setCart(getCart());
    window.addEventListener("cart:updated", onUpdate);
    return () => window.removeEventListener("cart:updated", onUpdate);
  }, []);

  const subtotal = cart.reduce((sum, l) => sum + l.displayUnitPrice * l.quantity, 0);

  if (!loaded) return null;

  if (cart.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <ShoppingBag size={40} className="mx-auto mb-4 text-brand-text/20" />
        <h1 className="font-display text-xl font-semibold mb-1">Your cart is empty</h1>
        <p className="text-sm text-brand-text/50 mb-6">Looks like you haven&apos;t added anything yet.</p>
        <Link href="/products" className="inline-block bg-brand-primary text-white font-medium px-5 py-3 rounded-lg hover:opacity-90 transition">
          Start Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 md:px-6 py-8">
      <h1 className="font-display text-2xl font-semibold mb-6">Your Cart</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {cart.map((line) => (
            <div key={line.productId + (line.variantKey ?? "")} className="flex gap-4 rounded-xl2 border border-black/5 p-4">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-black/[0.03] shrink-0">
                <Image src={line.imageUrl} alt={line.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${line.slug}`} className="font-medium text-sm hover:text-brand-primary transition line-clamp-1">
                  {line.name}
                </Link>
                {line.variantLabel && <p className="text-xs text-brand-text/50 mt-0.5">{line.variantLabel}</p>}
                <p className="text-sm font-medium mt-1">{formatBDT(line.displayUnitPrice)}</p>

                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-2 border border-black/10 rounded-lg">
                    <button
                      onClick={() => updateQuantity(line.productId, line.variantKey, line.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-black/5"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm w-4 text-center">{line.quantity}</span>
                    <button
                      onClick={() => updateQuantity(line.productId, line.variantKey, line.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-black/5"
                      aria-label="Increase quantity"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(line.productId, line.variantKey)}
                    className="text-red-500 hover:text-red-600 transition"
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="text-sm font-semibold shrink-0">{formatBDT(line.displayUnitPrice * line.quantity)}</div>
            </div>
          ))}
        </div>

        <div className="rounded-xl2 border border-black/5 p-5 h-fit sticky top-24">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-brand-text/60">Subtotal</span>
            <span className="font-medium">{formatBDT(subtotal)}</span>
          </div>
          <p className="text-xs text-brand-text/40 mb-4">Delivery charge calculated at checkout.</p>
          <Link
            href="/checkout"
            className="block text-center bg-brand-primary text-white font-medium py-3 rounded-lg hover:opacity-90 transition"
          >
            Proceed to Checkout
          </Link>
          <Link href="/products" className="block text-center text-sm text-brand-text/60 mt-3 hover:text-brand-text transition">
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
