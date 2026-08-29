"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteDeliveryZone } from "@/lib/actions/cms";

export function DeliveryZoneDeleteButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      disabled={isPending}
      onClick={() => confirm(`Delete zone "${name}"?`) && startTransition(() => deleteDeliveryZone(id))}
      className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400"
      aria-label="Delete"
    >
      <Trash2 size={14} />
    </button>
  );
}
