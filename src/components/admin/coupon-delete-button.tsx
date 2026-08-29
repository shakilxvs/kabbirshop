"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteCoupon } from "@/lib/actions/cms";

export function CouponDeleteButton({ id, code }: { id: string; code: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      disabled={isPending}
      onClick={() => confirm(`Delete coupon "${code}"?`) && startTransition(() => deleteCoupon(id))}
      className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400"
      aria-label="Delete"
    >
      <Trash2 size={14} />
    </button>
  );
}
