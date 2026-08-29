import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { Coupon } from "@/types";
import { CouponForm } from "@/components/admin/coupon-form";

export default async function EditCouponPage({ params }: { params: { id: string } }) {
  const snap = await adminDb.collection("coupons").doc(params.id).get();
  if (!snap.exists) notFound();
  return (
    <div>
      <h1 className="text-2xl font-display font-semibold mb-6">Edit Coupon</h1>
      <CouponForm coupon={snap.data() as Coupon} />
    </div>
  );
}
