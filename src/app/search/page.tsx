import { searchProducts } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { SearchBar } from "@/components/search-bar";

export const metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim() ?? "";
  const results = q ? await searchProducts(q) : [];

  return (
    <main className="mx-auto max-w-7xl px-4 md:px-6 py-8">
      <SearchBar initialQuery={q} />

      {q && (
        <p className="text-sm text-brand-text/50 mb-6">
          {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{q}&rdquo;
        </p>
      )}

      {q && results.length === 0 && (
        <div className="py-20 text-center">
          <p className="font-medium mb-1">No products found</p>
          <p className="text-sm text-brand-text/50">Try another search or explore our categories.</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}
