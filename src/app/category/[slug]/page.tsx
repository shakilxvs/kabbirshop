import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { getCategoryBySlug, queryProducts, SortOption } from "@/lib/data";
import { ProductCard } from "@/components/product-card";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return {};
  return { title: category.seoTitle || category.name, description: category.seoDescription || category.description };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { sort?: string; page?: string };
}) {
  const category = await getCategoryBySlug(params.slug);
  if (!category || !category.visible) notFound();

  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const { products, total } = await queryProducts({
    categoryId: category.id,
    sort: (searchParams.sort as SortOption) ?? "featured",
    page,
  });

  return (
    <main className="mx-auto max-w-7xl px-4 md:px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        {category.imageUrl && (
          <div className="relative w-16 h-16 rounded-xl2 overflow-hidden bg-black/[0.03] shrink-0">
            <Image src={category.imageUrl} alt={category.name} fill className="object-cover" />
          </div>
        )}
        <div>
          <h1 className="font-display text-2xl font-semibold">{category.name}</h1>
          <p className="text-sm text-brand-text/50">{total} products{category.description ? ` · ${category.description}` : ""}</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-medium mb-1">No products in this category yet</p>
          <p className="text-sm text-brand-text/50">Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}
