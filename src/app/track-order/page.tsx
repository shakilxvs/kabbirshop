"use client";

import { useState } from "react";
import { Check, Circle, Search } from "lucide-react";
import { Order, OrderStatus } from "@/types";
import { formatBDT } from "@/lib/pricing";

const STATUS_FLOW: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered"];
const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
  refunded: "Refunded",
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Omit<Order, "internalNotes"> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "We couldn't find that order.");
      } else {
        setOrder(data.order);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const currentIndex = order ? STATUS_FLOW.indexOf(order.status) : -1;
  const isTerminalIssue = order && ["cancelled", "returned", "refunded"].includes(order.status);

  return (
    <main className="mx-auto max-w-xl px-4 md:px-6 py-12">
      <h1 className="font-display text-2xl font-semibold mb-1">Track Your Order</h1>
      <p className="text-sm text-brand-text/50 mb-6">Enter your order number and phone number to see its status.</p>

      <form onSubmit={handleSubmit} className="space-y-3 mb-8">
        <input
          required
          placeholder="Order Number (e.g. RJ10001)"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          className="w-full border border-black/10 rounded-lg px-3 py-3 text-sm"
        />
        <input
          required
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border border-black/10 rounded-lg px-3 py-3 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-medium py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          <Search size={16} /> {loading ? "Searching…" : "Track Order"}
        </button>
      </form>

      {error && <p className="text-sm text-red-500 mb-6">{error}</p>}

      {order && (
        <div className="rounded-xl2 border border-black/5 p-5">
          <div className="flex justify-between text-sm mb-4">
            <span className="font-medium">Order #{order.orderNumber}</span>
            <span className="font-semibold">{formatBDT(order.total)}</span>
          </div>

          {isTerminalIssue ? (
            <p className="text-sm font-medium text-red-500">{STATUS_LABEL[order.status]}</p>
          ) : (
            <ul className="space-y-3">
              {STATUS_FLOW.map((s, i) => (
                <li key={s} className="flex items-center gap-3 text-sm">
                  {i <= currentIndex ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <Circle size={16} className="text-black/20" />
                  )}
                  <span className={i <= currentIndex ? "text-brand-text font-medium" : "text-brand-text/40"}>
                    {STATUS_LABEL[s]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </main>
  );
}
