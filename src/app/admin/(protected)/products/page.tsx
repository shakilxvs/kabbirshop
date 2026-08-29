import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import { Product } from "@/types";
import { formatBDT } from "@/lib/pricing";
import { Plus } from "lucide-react";
import { AdminProductRowActions } from "@/components/admin/product-row-actions";

export default async function AdminProductsPage({ searchParams }: { searchParams: { q?: string } }) {
  const snap = await adminDb.collection("products").orderBy("audit.updatedAt", "desc").get();
  let products = snap.docs.map((d) => d.data() as Product);

  if (searchParams.q) {
    const q = searchParams.q.toLowerCase();
    products = products.filter((p) => `${p.name} ${p.sku} ${p.brand}`.toLowerCase().includes(q));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-semibold">Products</h1>
        <div className="flex items-center gap-2">
          <a href="/api/admin/export/products" className="text-sm text-white/60 hover:text-white px-3 py-2 rounded-lg border border-white/10">
            Export CSV
          </a>
          <Link href="/admin/products/new" className="flex items-center gap-2 bg-white text-brand-secondary font-medium text-sm px-4 py-2 rounded-lg hover:bg-white/90">
            <Plus size={16} /> Add Product
          </Link>
        </div>
      </div>

      <form className="mb-4">
        <input
          name="q"
          defaultValue={searchParams.q}
          placeholder="Search by name, SKU, brand…"
          className="w-full max-w-sm bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
        />
      </form>

      <div className="rounded-xl2 border border-white/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-white/5 text-white/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-white/40">No products yet.</td></tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="border-t border-white/10">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.mainImageUrl} alt="" className="w-9 h-9 rounded-lg object-cover bg-white/5" />
                    <span className="line-clamp-1 max-w-[220px]">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-white/60">{p.sku}</td>
                <td className="px-4 py-3">{formatBDT(p.salePrice || p.regularPrice)}</td>
                <td className="px-4 py-3">{p.trackInventory ? p.stockQuantity : "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${p.status === "published" ? "bg-green-500/15 text-green-400" : "bg-white/10 text-white/50"}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <AdminProductRowActions product={p} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
