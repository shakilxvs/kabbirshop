"use client";

import { useRef, useTransition } from "react";
import { addOrderNote } from "@/lib/actions/orders";

export function OrderNotesForm({ orderId }: { orderId: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const text = ref.current?.value ?? "";
        if (!text.trim()) return;
        startTransition(async () => {
          await addOrderNote(orderId, text);
          if (ref.current) ref.current.value = "";
        });
      }}
      className="flex gap-2"
    >
      <textarea ref={ref} rows={2} placeholder="Add an internal note…" className="input flex-1" />
      <button disabled={isPending} type="submit" className="bg-white/10 hover:bg-white/20 text-sm px-4 rounded-lg self-start py-2">
        Add
      </button>
    </form>
  );
}
