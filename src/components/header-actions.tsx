"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, Menu, X } from "lucide-react";
import { Category, StoreSettings } from "@/types";
import { getCartCount } from "@/lib/cart";

export function HeaderActions({ categories, settings }: { categories: Category[]; settings: StoreSettings }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(getCartCount());
    const onUpdate = () => setCartCount(getCartCount());
    window.addEventListener("cart:updated", onUpdate);
    return () => window.removeEventListener("cart:updated", onUpdate);
  }, []);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
  }

  return (
    <div className="flex items-center gap-1">
      <button
        aria-label="Search"
        onClick={() => setSearchOpen((v) => !v)}
        className="p-2 rounded-lg hover:bg-black/5 transition text-brand-text"
      >
        <Search size={20} />
      </button>

      <Link
        href="/cart"
        aria-label="Cart"
        className="relative p-2 rounded-lg hover:bg-black/5 transition text-brand-text"
      >
        <ShoppingCart size={20} />
        {cartCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-brand-primary text-white text-[10px] leading-none rounded-full h-4 min-w-4 px-1 flex items-center justify-center font-semibold">
            {cartCount}
          </span>
        )}
      </Link>

      <button
        aria-label="Menu"
        onClick={() => setMenuOpen((v) => !v)}
        className="p-2 rounded-lg hover:bg-black/5 transition text-brand-text md:hidden"
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {searchOpen && (
        <form
          onSubmit={submitSearch}
          className="absolute top-16 left-0 right-0 bg-brand-bg border-b border-black/5 px-4 py-3 shadow-sm"
        >
          <div className="mx-auto max-w-7xl flex items-center gap-2 bg-black/5 rounded-lg px-3 py-2">
            <Search size={16} className="text-brand-text/50" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, brands, categories…"
              className="bg-transparent outline-none text-sm w-full text-brand-text"
            />
          </div>
        </form>
      )}

      {menuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-brand-bg border-b border-black/5 px-4 py-4 shadow-sm md:hidden">
          <nav className="flex flex-col gap-3 text-sm font-medium text-brand-text">
            <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="/products" onClick={() => setMenuOpen(false)}>Shop</Link>
            {categories.map((c) => (
              <Link key={c.id} href={`/category/${c.slug}`} onClick={() => setMenuOpen(false)}>
                {c.name}
              </Link>
            ))}
            <Link href="/about" onClick={() => setMenuOpen(false)}>About</Link>
            <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
            <Link href="/track-order" onClick={() => setMenuOpen(false)}>Track Order</Link>
          </nav>
        </div>
      )}
    </div>
  );
}
