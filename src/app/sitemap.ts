import type { MetadataRoute } from "next";
import { adminDb } from "@/lib/firebase/admin";
import { Product, Category } from "@/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  const [productsSnap, categoriesSnap] = await Promise.all([
    adminDb.collection("products").where("status", "==", "published").get(),
    adminDb.collection("categories").where("visible", "==", true).get(),
  ]);

  const products = productsSnap.docs.map((d) => d.data() as Product);
  const categories = categoriesSnap.docs.map((d) => d.data() as Category);

  const staticPaths = [
    "", "products", "about", "contact", "faq",
    "shipping-policy", "return-policy", "privacy-policy", "terms", "legal", "track-order",
  ];

  return [
    ...staticPaths.map((p) => ({ url: `${base}/${p}`, lastModified: new Date() })),
    ...categories.map((c) => ({ url: `${base}/category/${c.slug}`, lastModified: new Date(c.audit.updatedAt) })),
    ...products.map((p) => ({ url: `${base}/products/${p.slug}`, lastModified: new Date(p.audit.updatedAt) })),
  ];
}
