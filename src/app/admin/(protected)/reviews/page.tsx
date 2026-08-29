import { adminDb } from "@/lib/firebase/admin";
import { Review } from "@/types";
import { ReviewRowActions } from "@/components/admin/review-row-actions";
import Link from "next/link";

export default async function AdminReviewsPage({ searchParams }: { searchParams: { status?: string } }) {
  const status = searchParams.status ?? "pending";
  const snap = await adminDb.collection("reviews").where("status", "==", status).get();
  const reviews = snap.docs
    .map((d) => d.data() as Review)
    .sort((a, b) => b.audit.createdAt - a.audit.createdAt);

  return (
    <div>
      <h1 className="text-2xl font-display font-semibold mb-6">Reviews</h1>

      <div className="flex gap-2 mb-5">
        {["pending", "approved", "rejected"].map((s) => (
          <Link
            key={s}
            href={`/admin/reviews?status=${s}`}
            className={`text-sm px-3 py-1.5 rounded-full capitalize ${status === s ? "bg-white text-brand-secondary font-medium" : "bg-white/10 text-white/60"}`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {reviews.length === 0 && <p className="text-sm text-white/40">No {status} reviews.</p>}
        {reviews.map((r) => (
          <div key={r.id} className="rounded-xl2 border border-white/10 p-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium">{r.customerName} · {r.rating}★</p>
              <p className="text-sm text-white/60 mt-1">{r.text}</p>
              <p className="text-xs text-white/30 mt-1">Product: {r.productId}</p>
            </div>
            <ReviewRowActions review={r} />
          </div>
        ))}
      </div>
    </div>
  );
}
