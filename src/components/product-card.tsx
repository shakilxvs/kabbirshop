import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { formatBDT, getDiscountPercent, getEffectivePrice } from "@/lib/pricing";

export function ProductCard({ product }: { product: Product }) {
  const price = getEffectivePrice(product);
  const discount = getDiscountPercent(product);
  const outOfStock = product.trackInventory && product.stockQuantity <= 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block rounded-xl2 border border-black/5 bg-white hover:shadow-lg hover:-translate-y-0.5 transition overflow-hidden"
    >
      <div className="relative aspect-square bg-black/[0.03] overflow-hidden">
        <Image
          src={product.mainImageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition duration-300"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-brand-accent text-white text-xs font-semibold px-2 py-1 rounded-md">
            {discount}% OFF
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-0 bg-white/70 flex items-center justify-center text-sm font-medium text-brand-text">
            Out of Stock
          </span>
        )}
      </div>
      <div className="p-3">
        {product.brand && <div className="text-[11px] text-brand-text/50 mb-0.5">{product.brand}</div>}
        <div className="text-sm font-medium text-brand-text line-clamp-2 leading-snug">{product.name}</div>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="font-display font-semibold text-brand-text">{formatBDT(price)}</span>
          {discount > 0 && (
            <span className="text-xs text-brand-text/40 line-through">{formatBDT(product.regularPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
