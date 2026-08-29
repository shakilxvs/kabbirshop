import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Truck, ShieldCheck, PackageCheck, Headphones } from "lucide-react";
import {
  getStoreSettings,
  getVisibleCategories,
  getFeaturedProducts,
  getNewArrivals,
  getBestsellers,
} from "@/lib/data";
import { ProductCard } from "@/components/product-card";

const TRUST_ITEMS = [
  { icon: Truck, title: "Cash on Delivery", body: "Pay when your order arrives, anywhere in Bangladesh." },
  { icon: PackageCheck, title: "Delivery Across Bangladesh", body: "We ship nationwide, inside and outside Dhaka." },
  { icon: ShieldCheck, title: "Secure Packaging", body: "Every order is carefully packed before it leaves." },
  { icon: Headphones, title: "Customer Support", body: "Reach us by phone or WhatsApp — we're here to help." },
];

export default async function HomePage() {
  const [settings, categories, featured, newArrivals, bestsellers] = await Promise.all([
    getStoreSettings(),
    getVisibleCategories().catch(() => []),
    getFeaturedProducts().catch(() => []),
    getNewArrivals().catch(() => []),
    getBestsellers().catch(() => []),
  ]);

  return (
    <main>
      {/* Hero */}
      <section className="bg-brand-secondary text-white">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-brand-primary text-sm font-semibold tracking-wide uppercase mb-3">
              {settings.business.tagline}
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4">
              Gadgets that keep up<br className="hidden md:block" /> with your day.
            </h1>
            <p className="text-white/60 max-w-md mb-8">{settings.business.description}</p>
            <div className="flex items-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-brand-primary text-white font-medium px-5 py-3 rounded-lg hover:opacity-90 transition"
              >
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link
                href="/track-order"
                className="inline-flex items-center gap-2 border border-white/20 text-white font-medium px-5 py-3 rounded-lg hover:bg-white/5 transition"
              >
                Track Order
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-xl2 overflow-hidden bg-white/5">
            {settings.branding.ogImageUrl ? (
              <Image src={settings.branding.ogImageUrl} alt="" fill className="object-cover" priority />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/20 font-display text-lg">
                Hero image not configured
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 md:px-6 py-14">
          <h2 className="font-display text-xl font-semibold mb-5">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="group rounded-xl2 border border-black/5 bg-white p-4 flex flex-col items-center text-center gap-2 hover:shadow-md transition"
              >
                <div className="relative w-14 h-14 rounded-full bg-black/[0.03] overflow-hidden">
                  {c.imageUrl && <Image src={c.imageUrl} alt={c.name} fill className="object-cover" />}
                </div>
                <span className="text-xs font-medium text-brand-text/80 group-hover:text-brand-primary">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <ProductSection title="Featured Products" products={featured} viewAllHref="/products?featured=1" />
      <ProductSection title="New Arrivals" products={newArrivals} viewAllHref="/products?tag=new" />
      <ProductSection title="Bestsellers" products={bestsellers} viewAllHref="/products?tag=bestseller" />

      {/* Why shop with us */}
      <section className="bg-black/[0.02] py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <h2 className="font-display text-xl font-semibold mb-6">Why Shop With Us</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TRUST_ITEMS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex flex-col gap-2">
                <Icon size={22} className="text-brand-primary" />
                <div className="font-medium text-sm">{title}</div>
                <div className="text-xs text-brand-text/50">{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function ProductSection({
  title,
  products,
  viewAllHref,
}: {
  title: string;
  products: Awaited<ReturnType<typeof getFeaturedProducts>>;
  viewAllHref: string;
}) {
  if (products.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <Link href={viewAllHref} className="text-sm text-brand-primary font-medium flex items-center gap-1">
          View all <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
