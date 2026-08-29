import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import { Category } from "@/types";
import { Plus, ArrowUp, ArrowDown, Pencil } from "lucide-react";
import { CategoryDeleteButton } from "@/components/admin/category-delete-button";
import { reorderCategory } from "@/lib/actions/categories";

export default async function AdminCategoriesPage() {
  const snap = await adminDb.collection("categories").orderBy("order", "asc").get();
  const categories = snap.docs.map((d) => d.data() as Category);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-semibold">Categories</h1>
        <Link href="/admin/categories/new" className="flex items-center gap-2 bg-white text-brand-secondary font-medium text-sm px-4 py-2 rounded-lg hover:bg-white/90">
          <Plus size={16} /> Add Category
        </Link>
      </div>

      <div className="rounded-xl2 border border-white/10 divide-y divide-white/10">
        {categories.length === 0 && <p className="px-4 py-8 text-center text-white/40 text-sm">No categories yet.</p>}
        {categories.map((c, i) => (
          <div key={c.id} className="flex items-center gap-4 px-4 py-3">
            {c.imageUrl && <img src={c.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover bg-white/5" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{c.name}</p>
              <p className="text-xs text-white/40">/{c.slug}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${c.visible ? "bg-green-500/15 text-green-400" : "bg-white/10 text-white/50"}`}>
              {c.visible ? "Visible" : "Hidden"}
            </span>
            <form action={reorderCategory.bind(null, c.id, "up")}>
              <button disabled={i === 0} className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-20"><ArrowUp size={14} /></button>
            </form>
            <form action={reorderCategory.bind(null, c.id, "down")}>
              <button disabled={i === categories.length - 1} className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-20"><ArrowDown size={14} /></button>
            </form>
            <Link href={`/admin/categories/${c.id}`} className="p-1.5 rounded-lg hover:bg-white/10"><Pencil size={14} /></Link>
            <CategoryDeleteButton id={c.id} name={c.name} />
          </div>
        ))}
      </div>
    </div>
  );
}
