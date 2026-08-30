"use client";

import { useTransition } from "react";
import { Check, X, Trash2, Star } from "lucide-react";
import { Review } from "@/types";
import { setReviewStatus, toggleReviewFeatured, deleteReview } from "@/lib/actions/cms";

export function ReviewRowActions({ review }: { review: Review }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2 shrink-0">
      {review.status !== "approved" && (
        <button disabled={isPending} onClick={() => startTransition(() => setReviewStatus(review.id, "approved"))} className="p-1.5 rounded-lg hover:bg-green-500/20 text-green-400" aria-label="Approve">
          <Check size={14} />
        </button>
      )}
      {review.status !== "rejected" && (
        <button disabled={isPending} onClick={() => startTransition(() => setReviewStatus(review.id, "rejected"))} className="p-1.5 rounded-lg hover:bg-yellow-500/20 text-yellow-400" aria-label="Reject">
          <X size={14} />
        </button>
      )}
      <button
        disabled={isPending}
        onClick={() => startTransition(() => toggleReviewFeatured(review.id, !review.featured))}
        className={`p-1.5 rounded-lg hover:bg-white/10 ${review.featured ? "text-brand-accent" : "text-white/40"}`}
        aria-label="Feature"
      >
        <Star size={14} className={review.featured ? "fill-brand-accent" : ""} />
      </button>
      <button
        disabled={isPending}
        onClick={() => confirm("Delete this review?") && startTransition(() => deleteReview(review.id))}
        className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400"
        aria-label="Delete"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
