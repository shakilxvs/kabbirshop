import Link from "next/link";
import { queryProducts, getAllCategories } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { SortOption } from "@/lib/data";

export const metadata = { title: "Shop All Products" };

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "discount", label: "Biggest Discount" },
];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { sort?: string; category?: string; tag?: string; page?: string };
}) {
  const categories = await getAllCategories().catch(() => []);
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const sort = (searchParams.sort as SortOption) ?? "featured";
  const category = categories.find((c) => c.slug === searchParams.category);

  const { products, total } = await queryProducts({
    categoryId: category?.id,
    sort,
    page,
    tag: searchParams.tag,
    pageSize: 24,
  });

  const totalPages = Math.max(1, Math.ceil(total / 24));

  function buildHref(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { sort: searchParams.sort, category: searchParams.category, tag: searchParams.tag, page: searchParams.page, ...overrides };
    Object.entries(merged).forEach(([k, v]) => v && params.set(k, v));
    return `/products?${params.toString()}`;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 md:px-6 py-8">
      <h1 className="font-display text-2xl font-semibold mb-1">Shop All Products</h1>
      <p className="text-sm text-brand-text/50 mb-6">{total} products</p>

      <div className="flex gap-8">
        <aside className="w-48 shrink-0 hidden md:block">
          <div className="font-medium text-sm mb-3">Category</div>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href={buildHref({ category: undefined, page: undefined })} className={!category ? "text-brand-primary font-medium" : "text-brand-text/70"}>
                All
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={buildHref({ category: c.slug, page: undefined })}
                  className={category?.id === c.id ? "text-brand-primary font-medium" : "text-brand-text/70"}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5">
            <div className="flex gap-2 overflow-x-auto md:hidden text-sm">
              <Link href={buildHref({ category: undefined, page: undefined })} className="px-3 py-1.5 rounded-full bg-black/5 whitespace-nowrap">
                All
              </Link>
              {categories.map((c) => (
                <Link key={c.id} href={buildHref({ category: c.slug, page: undefined })} className="px-3 py-1.5 rounded-full bg-black/5 whitespace-nowrap">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          <form action="/products" method="get" className="mb-5 md:hidden">
            {category && <input type="hidden" name="category" value={category.slug} />}
            <select name="sort" defaultValue={sort} className="text-sm border border-black/10 rounded-lg px-3 py-2 bg-white w-full">
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </form>

          <div className="hidden md:flex justify-end mb-4">
            <form action="/products" method="get" className="flex items-center gap-2">
              {category && <input type="hidden" name="category" value={category.slug} />}
              {searchParams.tag && <input type="hidden" name="tag" value={searchParams.tag} />}
              <label className="text-sm text-brand-text/50">Sort by</label>
              <select name="sort" defaultValue={sort} className="text-sm border border-black/10 rounded-lg px-3 py-2 bg-white">
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </form>
          </div>

          {products.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-medium mb-1">No products found</p>
              <p className="text-sm text-brand-text/50">Try another category or check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={buildHref({ page: String(p) })}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm ${
                    p === page ? "bg-brand-primary text-white" : "bg-black/5 text-brand-text"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
