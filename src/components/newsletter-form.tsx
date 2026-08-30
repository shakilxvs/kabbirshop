"use client";

import { useState } from "react";
import { useToast } from "@/components/toast";

export function NewsletterForm() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        showToast("Subscribed!");
        setEmail("");
      } else {
        showToast("Please enter a valid email");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
      <input
        required
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 border border-black/10 rounded-lg px-3 py-2.5 text-sm bg-white"
      />
      <button
        type="submit"
        disabled={submitting}
        className="bg-brand-primary text-white text-sm font-medium px-4 rounded-lg hover:opacity-90 transition disabled:opacity-50"
      >
        Subscribe
      </button>
    </form>
  );
}
