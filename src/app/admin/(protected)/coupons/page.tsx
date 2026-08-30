import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import { Coupon } from "@/types";
import { Plus, Pencil } from "lucide-react";
import { CouponDeleteButton } from "@/components/admin/coupon-delete-button";

export default async function AdminCouponsPage() {
  const snap = await adminDb.collection("coupons").orderBy("audit.createdAt", "desc").get();
  const coupons = snap.docs.map((d) => d.data() as Coupon);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-semibold">Coupons</h1>
        <Link href="/admin/coupons/new" className="flex items-center gap-2 bg-white text-brand-secondary font-medium text-sm px-4 py-2 rounded-lg hover:bg-white/90">
          <Plus size={16} /> Add Coupon
        </Link>
      </div>

      <div className="rounded-xl2 border border-white/10 divide-y divide-white/10">
        {coupons.length === 0 && <p className="px-4 py-8 text-center text-white/40 text-sm">No coupons yet.</p>}
        {coupons.map((c) => (
          <div key={c.id} className="flex items-center gap-4 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{c.code}</p>
              <p className="text-xs text-white/40">
                {c.type === "percentage" ? `${c.value}% off` : `৳${c.value} off`}
                {c.minOrderAmount ? ` · min ৳${c.minOrderAmount}` : ""} · used {c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ""}
              </p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${c.active ? "bg-green-500/15 text-green-400" : "bg-white/10 text-white/50"}`}>
              {c.active ? "Active" : "Inactive"}
            </span>
            <Link href={`/admin/coupons/${c.id}`} className="p-1.5 rounded-lg hover:bg-white/10"><Pencil size={14} /></Link>
            <CouponDeleteButton id={c.id} code={c.code} />
          </div>
        ))}
      </div>
    </div>
  );
}
