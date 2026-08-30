"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { nanoid } from "nanoid";
import { Truck, Tag } from "lucide-react";
import { StoreSettings } from "@/types";
import { CartLine, clearCart, getCart } from "@/lib/cart";
import { formatBDT } from "@/lib/pricing";

const DIVISIONS = ["Dhaka", "Chattogram", "Rajshahi", "Khulna", "Barishal", "Sylhet", "Rangpur", "Mymensingh"];

export function CheckoutClient({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);

  const activeZones = settings.delivery.filter((z) => z.active).sort((a, b) => a.order - b.order);
  const [zoneId, setZoneId] = useState(activeZones[0]?.id ?? "");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [division, setDivision] = useState(DIVISIONS[0]);
  const [district, setDistrict] = useState("");
  const [area, setArea] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [instructions, setInstructions] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponChecking, setCouponChecking] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [idempotencyKey] = useState(() => nanoid());

  useEffect(() => {
    setCart(getCart());
    setLoaded(true);
  }, []);

  const subtotal = cart.reduce((sum, l) => sum + l.displayUnitPrice * l.quantity, 0);
  const selectedZone = activeZones.find((z) => z.id === zoneId);
  const deliveryCharge = selectedZone?.charge ?? 0;
  const discount = couponApplied?.discount ?? 0;
  const total = Math.max(0, subtotal + deliveryCharge - discount);

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setCouponChecking(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), subtotal, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error ?? "Invalid coupon.");
        setCouponApplied(null);
      } else {
        setCouponApplied({ code: data.code, discount: data.discount });
      }
    } catch {
      setCouponError("Unable to validate coupon right now.");
    } finally {
      setCouponChecking(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!selectedZone) {
      setFormError("Please select a delivery zone.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey,
          items: cart.map((l) => ({ productId: l.productId, variantKey: l.variantKey, quantity: l.quantity })),
          customer: { fullName, phone, email: email || undefined },
          delivery: { division, district, area, fullAddress, instructions: instructions || undefined },
          deliveryZoneId: zoneId,
          couponCode: couponApplied?.code,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Unable to place your order. Please check your information and try again.");
        setSubmitting(false);
        return;
      }
      clearCart();
      router.push(`/order-success/${data.orderNumber}`);
    } catch {
      setFormError("Unable to place your order. Please check your information and try again.");
      setSubmitting(false);
    }
  }

  if (!loaded) return null;

  if (cart.length === 0) {
    return (
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-xl font-semibold mb-2">Your cart is empty</h1>
        <p className="text-sm text-brand-text/50">Add something to your cart before checking out.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 md:px-6 py-8">
      <h1 className="font-display text-2xl font-semibold mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <section>
            <h2 className="font-medium mb-3">Contact</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input required placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="border border-black/10 rounded-lg px-3 py-3 text-sm" />
              <input required placeholder="Phone Number (01XXXXXXXXX)" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="border border-black/10 rounded-lg px-3 py-3 text-sm" />
              <input type="email" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)}
                className="border border-black/10 rounded-lg px-3 py-3 text-sm sm:col-span-2" />
            </div>
          </section>

          <section>
            <h2 className="font-medium mb-3">Delivery Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select value={division} onChange={(e) => setDivision(e.target.value)} className="border border-black/10 rounded-lg px-3 py-3 text-sm bg-white">
                {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <input required placeholder="District" value={district} onChange={(e) => setDistrict(e.target.value)}
                className="border border-black/10 rounded-lg px-3 py-3 text-sm" />
              <input required placeholder="Area / Upazila" value={area} onChange={(e) => setArea(e.target.value)}
                className="border border-black/10 rounded-lg px-3 py-3 text-sm sm:col-span-2" />
              <textarea required placeholder="Full Address" value={fullAddress} onChange={(e) => setFullAddress(e.target.value)}
                rows={3} className="border border-black/10 rounded-lg px-3 py-3 text-sm sm:col-span-2" />
              <input placeholder="Delivery Instructions (optional) — e.g. Call before arriving"
                value={instructions} onChange={(e) => setInstructions(e.target.value)}
                className="border border-black/10 rounded-lg px-3 py-3 text-sm sm:col-span-2" />
            </div>
          </section>

          <section>
            <h2 className="font-medium mb-3">Delivery Zone</h2>
            <div className="space-y-2">
              {activeZones.map((z) => (
                <label key={z.id} className={`flex items-center justify-between border rounded-lg px-4 py-3 cursor-pointer ${
                  zoneId === z.id ? "border-brand-primary bg-brand-primary/5" : "border-black/10"
                }`}>
                  <span className="flex items-center gap-2 text-sm">
                    <Truck size={16} className="text-brand-text/50" />
                    <span>
                      <span className="font-medium">{z.name}</span>
                      <span className="text-brand-text/50"> · {z.estimatedDays}</span>
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-medium">{formatBDT(z.charge)}</span>
                    <input type="radio" name="zone" checked={zoneId === z.id} onChange={() => setZoneId(z.id)} />
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-medium mb-3">Payment Method</h2>
            <div className="border border-brand-primary bg-brand-primary/5 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-brand-text">
                <span className="w-3 h-3 rounded-full bg-brand-primary inline-block" /> Cash on Delivery
              </div>
              <p className="text-xs text-brand-text/50 mt-1">Pay when your order arrives.</p>
            </div>
          </section>
        </div>

        <div className="rounded-xl2 border border-black/5 p-5 h-fit sticky top-24">
          <h2 className="font-medium mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
            {cart.map((l) => (
              <div key={l.productId + (l.variantKey ?? "")} className="flex gap-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-black/[0.03] shrink-0">
                  <Image src={l.imageUrl} alt={l.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-medium line-clamp-1">{l.name}</p>
                  {l.variantLabel && <p className="text-brand-text/50">{l.variantLabel}</p>}
                  <p className="text-brand-text/50">Qty {l.quantity}</p>
                </div>
                <div className="text-xs font-medium shrink-0">{formatBDT(l.displayUnitPrice * l.quantity)}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mb-4">
            <div className="flex items-center gap-2 border border-black/10 rounded-lg px-3 py-2 flex-1">
              <Tag size={14} className="text-brand-text/40" />
              <input
                placeholder="Coupon code"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="text-sm outline-none w-full"
              />
            </div>
            <button type="button" onClick={applyCoupon} disabled={couponChecking}
              className="text-sm font-medium text-brand-primary px-3 rounded-lg border border-brand-primary hover:bg-brand-primary/5 disabled:opacity-50">
              {couponChecking ? "…" : "Apply"}
            </button>
          </div>
          {couponError && <p className="text-xs text-red-500 mb-3">{couponError}</p>}
          {couponApplied && <p className="text-xs text-green-600 mb-3">Coupon &ldquo;{couponApplied.code}&rdquo; applied.</p>}

          <div className="space-y-1.5 text-sm border-t border-black/5 pt-3">
            <div className="flex justify-between"><span className="text-brand-text/60">Subtotal</span><span>{formatBDT(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-brand-text/60">Delivery</span><span>{formatBDT(deliveryCharge)}</span></div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatBDT(discount)}</span></div>
            )}
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-black/5 mt-2">
              <span>Total Payable</span><span>{formatBDT(total)}</span>
            </div>
          </div>

          {formError && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">{formError}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-4 bg-brand-primary text-white font-medium py-3.5 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {submitting ? "Placing order…" : "Place Order"}
          </button>
        </div>
      </form>
    </main>
  );
}
