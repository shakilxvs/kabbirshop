"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteFaq } from "@/lib/actions/cms";

export function FaqDeleteButton({ id, question }: { id: string; question: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      disabled={isPending}
      onClick={() => confirm(`Delete "${question}"?`) && startTransition(() => deleteFaq(id))}
      className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 shrink-0"
      aria-label="Delete"
    >
      <Trash2 size={14} />
    </button>
  );
}
