"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { submitReview } from "@/lib/actions/public-reviews";
import { useToast } from "@/components/toast";

export function ReviewForm({ productId }: { productId: string }) {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return <p className="text-sm text-green-600 mt-4">Thanks! Your review will appear after it&apos;s approved.</p>;
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
          await submitReview({ productId, customerName: name, rating, text });
          setSubmitted(true);
        } catch {
          showToast("Please fill out all fields");
        } finally {
          setSubmitting(false);
        }
      }}
      className="mt-4 rounded-xl2 border border-black/5 p-4 max-w-md"
    >
      <p className="text-sm font-medium mb-2">Write a review</p>
      <div className="flex items-center gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)}>
            <Star size={18} className={n <= rating ? "fill-brand-accent text-brand-accent" : "text-black/15"} />
          </button>
        ))}
      </div>
      <input required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm mb-2" />
      <textarea required placeholder="Share your experience…" value={text} onChange={(e) => setText(e.target.value)} rows={3} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm mb-3" />
      <button disabled={submitting} type="submit" className="bg-brand-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50">
        {submitting ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}
