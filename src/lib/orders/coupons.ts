import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import { Coupon } from "@/types";

export interface CouponCheckResult {
  ok: boolean;
  error?: string;
  coupon?: Coupon;
  discount?: number;
}

/** Validates a coupon against the current subtotal and per-phone usage, without mutating anything. */
export async function checkCoupon(code: string, subtotal: number, phone: string): Promise<CouponCheckResult> {
  const snap = await adminDb.collection("coupons").where("code", "==", code.trim().toUpperCase()).limit(1).get();
  if (snap.empty) return { ok: false, error: "This coupon code is invalid." };

  const coupon = snap.docs[0].data() as Coupon;
  const now = Date.now();

  if (!coupon.active) return { ok: false, error: "This coupon is no longer active." };
  if (coupon.startDate && now < coupon.startDate) return { ok: false, error: "This coupon isn't active yet." };
  if (coupon.expiryDate && now > coupon.expiryDate) return { ok: false, error: "This coupon has expired." };
  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    return { ok: false, error: `This coupon requires a minimum order of ৳${coupon.minOrderAmount}.` };
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { ok: false, error: "This coupon has reached its usage limit." };
  }

  if (coupon.perCustomerLimit) {
    const usageDoc = await adminDb.collection("coupons").doc(coupon.id).collection("usage").doc(phone).get();
    const used = usageDoc.exists ? (usageDoc.data()!.count as number) : 0;
    if (used >= coupon.perCustomerLimit) {
      return { ok: false, error: "You've already used this coupon the maximum number of times." };
    }
  }

  let discount = coupon.type === "percentage" ? (subtotal * coupon.value) / 100 : coupon.value;
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.min(discount, subtotal); // never discount below zero

  return { ok: true, coupon, discount: Math.round(discount) };
}
