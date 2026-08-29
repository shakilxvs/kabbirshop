"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteCategory } from "@/lib/actions/categories";

export function CategoryDeleteButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => {
        if (!confirm(`Delete "${name}"?`)) return;
        startTransition(async () => {
          try {
            await deleteCategory(id);
          } catch (err) {
            alert(err instanceof Error ? err.message : "Unable to delete this category.");
          }
        });
      }}
      className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400"
      aria-label="Delete"
    >
      <Trash2 size={14} />
    </button>
  );
}
