import { Product } from "@/types";

export function formatBDT(amount: number): string {
  return `৳${Math.round(amount).toLocaleString("en-BD")}`;
}

/** Effective price for a product, respecting a valid sale price only. */
export function getEffectivePrice(product: Pick<Product, "regularPrice" | "salePrice">): number {
  if (product.salePrice != null && product.salePrice > 0 && product.salePrice < product.regularPrice) {
    return product.salePrice;
  }
  return product.regularPrice;
}

/** Never returns a negative or nonsensical discount (spec #27). */
export function getDiscountPercent(product: Pick<Product, "regularPrice" | "salePrice">): number {
  const { regularPrice, salePrice } = product;
  if (!salePrice || salePrice <= 0 || salePrice >= regularPrice || regularPrice <= 0) return 0;
  return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
}
