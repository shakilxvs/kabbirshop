import Link from "next/link";
import Image from "next/image";
import { StoreSettings } from "@/types";
import { getVisibleCategories } from "@/lib/data";
import { HeaderActions } from "@/components/header-actions";

export async function SiteHeader({ settings }: { settings: StoreSettings }) {
  const categories = await getVisibleCategories().catch(() => []);

  return (
    <header className="sticky top-0 z-40 bg-brand-bg border-b border-black/5">
      <div className="mx-auto max-w-7xl px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {settings.branding.logoUrl ? (
            <Image
              src={settings.branding.logoUrl}
              alt={settings.business.businessName}
              width={140}
              height={36}
              className="h-8 w-auto object-contain"
              priority
            />
          ) : (
            <span className="font-display font-bold text-lg text-brand-text">
              {settings.business.businessName}
            </span>
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-brand-text/80">
          <Link href="/" className="hover:text-brand-primary transition">Home</Link>
          <Link href="/products" className="hover:text-brand-primary transition">Shop</Link>
          {categories.slice(0, 4).map((c) => (
            <Link key={c.id} href={`/category/${c.slug}`} className="hover:text-brand-primary transition">
              {c.name}
            </Link>
          ))}
          <Link href="/about" className="hover:text-brand-primary transition">About</Link>
          <Link href="/contact" className="hover:text-brand-primary transition">Contact</Link>
        </nav>

        <HeaderActions categories={categories} settings={settings} />
      </div>
    </header>
  );
}
