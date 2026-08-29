"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Zap, Star, Truck, ShieldCheck, PackageCheck } from "lucide-react";
import { Product } from "@/types";
import { formatBDT, getDiscountPercent, getEffectivePrice } from "@/lib/pricing";
import { addToCart } from "@/lib/cart";
import { useToast } from "@/components/toast";

const TABS = ["Description", "Specifications", "Features", "What's Included", "Warranty & Delivery"] as const;

export function ProductDetailClient({
  product,
  avgRating,
  reviewCount,
}: {
  product: Product;
  avgRating: number;
  reviewCount: number;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const images = [product.mainImageUrl, ...product.galleryImageUrls].filter(Boolean);
  const [activeImage, setActiveImage] = useState(0);
  const [selected, setSelected] = useState<Record<string, string>>({}); // groupId -> optionId
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Description");

  const variantKey = useMemo(() => {
    const parts = product.variantGroups.map((g) => selected[g.id]).filter(Boolean);
    if (parts.length !== product.variantGroups.length) return undefined;
    return product.variantGroups.map((g) => `${g.id}:${selected[g.id]}`).join("|");
  }, [selected, product.variantGroups]);

  const activeOption = useMemo(() => {
    if (!product.variantGroups.length) return null;
    for (const g of product.variantGroups) {
      const optId = selected[g.id];
      const opt = g.options.find((o) => o.id === optId);
      if (opt?.imageUrl) return opt;
    }
    return null;
  }, [selected, product.variantGroups]);

  const price = getEffectivePrice(product);
  const discount = getDiscountPercent(product);
  const outOfStock = product.trackInventory && product.stockQuantity <= 0;
  const needsVariantSelection = product.variantGroups.length > 0 && !variantKey;

  function buildVariantLabel() {
    return product.variantGroups
      .map((g) => {
        const opt = g.options.find((o) => o.id === selected[g.id]);
        return opt ? `${g.name}: ${opt.name}` : null;
      })
      .filter(Boolean)
      .join(", ");
  }

  function handleAddToCart(goToCheckout = false) {
    if (needsVariantSelection) {
      showToast("Please select an option first");
      return;
    }
    addToCart({
      productId: product.id,
      variantKey,
      variantLabel: buildVariantLabel() || undefined,
      name: product.name,
      slug: product.slug,
      imageUrl: activeOption?.imageUrl || product.mainImageUrl,
      sku: product.sku,
      quantity,
      displayUnitPrice: price,
    });
    if (goToCheckout) {
      router.push("/checkout");
    } else {
      showToast("Added to cart");
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {/* Gallery */}
      <div>
        <div className="relative aspect-square rounded-xl2 overflow-hidden bg-black/[0.03] mb-3">
          <Image src={images[activeImage] ?? product.mainImageUrl} alt={product.name} fill className="object-cover" priority />
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-brand-accent text-white text-xs font-semibold px-2.5 py-1 rounded-md">
              {discount}% OFF
            </span>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={img + i}
                onClick={() => setActiveImage(i)}
                className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 ${
                  activeImage === i ? "border-brand-primary" : "border-transparent"
                }`}
              >
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        {product.brand && <div className="text-sm text-brand-text/50 mb-1">{product.brand}</div>}
        <h1 className="font-display text-2xl md:text-3xl font-semibold mb-2">{product.name}</h1>

        <div className="flex items-center gap-3 text-sm text-brand-text/60 mb-4">
          {reviewCount > 0 && (
            <span className="flex items-center gap-1">
              <Star size={14} className="fill-brand-accent text-brand-accent" />
              {avgRating.toFixed(1)} ({reviewCount})
            </span>
          )}
          <span>SKU: {product.sku}</span>
          <span className={outOfStock ? "text-red-500" : "text-green-600"}>
            {outOfStock ? "Out of Stock" : "In Stock"}
          </span>
        </div>

        <div className="flex items-baseline gap-3 mb-6">
          <span className="font-display text-3xl font-bold text-brand-text">{formatBDT(price)}</span>
          {discount > 0 && (
            <span className="text-brand-text/40 line-through text-lg">{formatBDT(product.regularPrice)}</span>
          )}
        </div>

        {product.variantGroups.map((group) => (
          <div key={group.id} className="mb-5">
            <div className="text-sm font-medium mb-2">{group.name}</div>
            <div className="flex flex-wrap gap-2">
              {group.options.map((opt) => {
                const isSelected = selected[group.id] === opt.id;
                const optOutOfStock = opt.stock != null && opt.stock <= 0;
                return (
                  <button
                    key={opt.id}
                    disabled={optOutOfStock}
                    onClick={() => setSelected((s) => ({ ...s, [group.id]: opt.id }))}
                    className={`px-4 py-2 rounded-lg text-sm border transition ${
                      isSelected
                        ? "border-brand-primary bg-brand-primary/10 text-brand-primary font-medium"
                        : "border-black/10 text-brand-text/70 hover:border-black/30"
                    } ${optOutOfStock ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    {opt.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mb-6">
          <div className="text-sm font-medium mb-2">Quantity</div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-9 h-9 rounded-lg border border-black/10 flex items-center justify-center hover:bg-black/5"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-9 h-9 rounded-lg border border-black/10 flex items-center justify-center hover:bg-black/5"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="flex gap-3 mb-8">
          <button
            disabled={outOfStock}
            onClick={() => handleAddToCart(false)}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-brand-primary text-brand-primary font-medium py-3 rounded-lg hover:bg-brand-primary/5 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={18} /> Add to Cart
          </button>
          <button
            disabled={outOfStock}
            onClick={() => handleAddToCart(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-brand-primary text-white font-medium py-3 rounded-lg hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Zap size={18} /> Buy Now
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8 text-xs text-brand-text/60">
          <div className="flex flex-col items-center text-center gap-1 rounded-xl2 border border-black/5 p-3">
            <Truck size={18} className="text-brand-primary" /> Cash on Delivery
          </div>
          <div className="flex flex-col items-center text-center gap-1 rounded-xl2 border border-black/5 p-3">
            <PackageCheck size={18} className="text-brand-primary" /> Delivery Across BD
          </div>
          <div className="flex flex-col items-center text-center gap-1 rounded-xl2 border border-black/5 p-3">
            <ShieldCheck size={18} className="text-brand-primary" /> Secure Packaging
          </div>
        </div>

        <div>
          <div className="flex gap-4 border-b border-black/10 mb-4 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-2 text-sm whitespace-nowrap ${
                  tab === t ? "border-b-2 border-brand-primary text-brand-text font-medium" : "text-brand-text/50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "Description" && (
            <p className="text-sm text-brand-text/70 leading-relaxed whitespace-pre-line">
              {product.description || product.shortDescription || "No description available."}
            </p>
          )}
          {tab === "Specifications" && (
            <dl className="text-sm divide-y divide-black/5">
              {(product.specifications ?? []).length === 0 && <p className="text-brand-text/50">No specifications listed.</p>}
              {product.specifications?.map((s) => (
                <div key={s.label} className="flex justify-between py-2">
                  <dt className="text-brand-text/50">{s.label}</dt>
                  <dd className="font-medium">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {tab === "Features" && (
            <ul className="text-sm text-brand-text/70 list-disc pl-5 space-y-1">
              {(product.features ?? []).length === 0 && <p className="text-brand-text/50 list-none -ml-5">No features listed.</p>}
              {product.features?.map((f) => <li key={f}>{f}</li>)}
            </ul>
          )}
          {tab === "What's Included" && (
            <ul className="text-sm text-brand-text/70 list-disc pl-5 space-y-1">
              {(product.whatsIncluded ?? []).length === 0 && <p className="text-brand-text/50 list-none -ml-5">Not specified.</p>}
              {product.whatsIncluded?.map((f) => <li key={f}>{f}</li>)}
            </ul>
          )}
          {tab === "Warranty & Delivery" && (
            <div className="text-sm text-brand-text/70 space-y-2">
              <p><span className="font-medium text-brand-text">Warranty: </span>{product.warranty || "Not specified"}</p>
              <p><span className="font-medium text-brand-text">Cash on Delivery available nationwide.</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
