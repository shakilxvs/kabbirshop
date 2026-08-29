import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts, getApprovedReviews, getStoreSettings } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { ProductDetailClient } from "@/components/product-detail-client";
import { ReviewForm } from "@/components/review-form";
import { Star } from "lucide-react";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};
  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.shortDescription,
    openGraph: { images: product.ogImageUrl ? [product.ogImageUrl] : [product.mainImageUrl] },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const [related, reviews, settings] = await Promise.all([
    getRelatedProducts(product),
    getApprovedReviews(product.id),
    getStoreSettings(),
  ]);

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [product.mainImageUrl, ...product.galleryImageUrls],
    description: product.shortDescription,
    sku: product.sku,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "BDT",
      price: product.salePrice && product.salePrice < product.regularPrice ? product.salePrice : product.regularPrice,
      availability: product.trackInventory && product.stockQuantity <= 0
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
    aggregateRating: reviews.length
      ? { "@type": "AggregateRating", ratingValue: avgRating.toFixed(1), reviewCount: reviews.length }
      : undefined,
  };

  return (
    <main className="mx-auto max-w-7xl px-4 md:px-6 py-8">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <ProductDetailClient product={product} avgRating={avgRating} reviewCount={reviews.length} />

      <section className="mt-14">
        <h2 className="font-display text-lg font-semibold mb-4">
          Reviews {reviews.length > 0 && `(${reviews.length})`}
        </h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-brand-text/50">No reviews yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-xl2 border border-black/5 p-4">
                <div className="flex items-center gap-1 mb-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className={i < r.rating ? "fill-brand-accent text-brand-accent" : "text-black/15"} />
                  ))}
                </div>
                <p className="text-sm text-brand-text/80 mb-2">{r.text}</p>
                <p className="text-xs text-brand-text/40">{r.customerName}</p>
              </div>
            ))}
          </div>
        )}
        <ReviewForm productId={product.id} />
      </section>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-lg font-semibold mb-4">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
