"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Pencil, Copy, Trash2 } from "lucide-react";
import { Product } from "@/types";
import { duplicateProduct, deleteProduct, toggleProductStatus } from "@/lib/actions/products";

export function AdminProductRowActions({ product }: { product: Product }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Link href={`/admin/products/${product.id}`} className="p-1.5 rounded-lg hover:bg-white/10" aria-label="Edit">
        <Pencil size={14} />
      </Link>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => duplicateProduct(product.id))}
        className="p-1.5 rounded-lg hover:bg-white/10"
        aria-label="Duplicate"
      >
        <Copy size={14} />
      </button>
      <button
        disabled={isPending}
        onClick={() => {
          if (confirm(`Delete "${product.name}"? This cannot be undone.`)) {
            startTransition(() => deleteProduct(product.id));
          }
        }}
        className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400"
        aria-label="Delete"
      >
        <Trash2 size={14} />
      </button>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => toggleProductStatus(product.id, product.status === "published" ? "draft" : "published"))}
        className="text-xs px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20"
      >
        {product.status === "published" ? "Unpublish" : "Publish"}
      </button>
    </div>
  );
}
