import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import { DEFAULT_STORE_SETTINGS } from "@/lib/defaults";
import { StoreSettings, Category, Product } from "@/types";

// All public pages call these instead of touching Firestore directly, so the
// "no hardcoded business data" rule (spec #126) is enforced in one place.

export async function getStoreSettings(): Promise<StoreSettings> {
  const snap = await adminDb.collection("settings").doc("store").get();
  if (!snap.exists) return DEFAULT_STORE_SETTINGS;
  return { ...DEFAULT_STORE_SETTINGS, ...(snap.data() as Partial<StoreSettings>) };
}

export async function getVisibleCategories(): Promise<Category[]> {
  // Sorted in-memory rather than with Firestore's .orderBy() — combining a
  // .where() filter with .orderBy() on a different field requires a manually
  // created Firestore composite index, which we avoid needing entirely here.
  const snap = await adminDb.collection("categories").where("visible", "==", true).get();
  return snap.docs.map((d) => d.data() as Category).sort((a, b) => a.order - b.order);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const snap = await adminDb
    .collection("products")
    .where("status", "==", "published")
    .where("isFeatured", "==", true)
    .get();
  return snap.docs
    .map((d) => d.data() as Product)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .slice(0, limit);
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  const snap = await adminDb
    .collection("products")
    .where("status", "==", "published")
    .where("isNewArrival", "==", true)
    .get();
  return snap.docs
    .map((d) => d.data() as Product)
    .sort((a, b) => b.audit.createdAt - a.audit.createdAt)
    .slice(0, limit);
}

export async function getBestsellers(limit = 8): Promise<Product[]> {
  const snap = await adminDb
    .collection("products")
    .where("status", "==", "published")
    .where("isBestseller", "==", true)
    .get();
  return snap.docs
    .map((d) => d.data() as Product)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .slice(0, limit);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const snap = await adminDb
    .collection("products")
    .where("slug", "==", slug)
    .where("status", "==", "published")
    .limit(1)
    .get();
  if (snap.empty) return null;
  return snap.docs[0].data() as Product;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const snap = await adminDb.collection("categories").where("slug", "==", slug).limit(1).get();
  if (snap.empty) return null;
  return snap.docs[0].data() as Category;
}

export type SortOption = "featured" | "newest" | "price_asc" | "price_desc" | "discount";

export interface ProductQueryOptions {
  categoryId?: string;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
  tag?: string; // "new" | "bestseller" | "sale" | "featured"
}

/**
 * Fetches published products with basic Firestore-level filtering, then applies
 * sort/pagination in memory. Firestore composite-index limitations make full
 * multi-field filtering awkward without a search service (spec #54 allows
 * choosing "the best implementation for Firestore" — this keeps the store
 * usable at a small-to-mid catalog size without requiring a paid search add-on).
 */
export async function queryProducts(opts: ProductQueryOptions = {}): Promise<{ products: Product[]; total: number }> {
  let ref = adminDb.collection("products").where("status", "==", "published") as FirebaseFirestore.Query;
  if (opts.categoryId) ref = ref.where("categoryId", "==", opts.categoryId);

  const snap = await ref.get();
  let products = snap.docs.map((d) => d.data() as Product);

  if (opts.tag === "new") products = products.filter((p) => p.isNewArrival);
  if (opts.tag === "bestseller") products = products.filter((p) => p.isBestseller);
  if (opts.tag === "sale") products = products.filter((p) => p.salePrice && p.salePrice < p.regularPrice);
  if (opts.tag === "featured") products = products.filter((p) => p.isFeatured);

  const withPrice = products.map((p) => ({
    p,
    price: p.salePrice && p.salePrice < p.regularPrice ? p.salePrice : p.regularPrice,
    discount:
      p.salePrice && p.salePrice < p.regularPrice
        ? Math.round(((p.regularPrice - p.salePrice) / p.regularPrice) * 100)
        : 0,
  }));

  switch (opts.sort) {
    case "newest":
      withPrice.sort((a, b) => b.p.audit.createdAt - a.p.audit.createdAt);
      break;
    case "price_asc":
      withPrice.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      withPrice.sort((a, b) => b.price - a.price);
      break;
    case "discount":
      withPrice.sort((a, b) => b.discount - a.discount);
      break;
    default:
      withPrice.sort((a, b) => a.p.displayOrder - b.p.displayOrder);
  }

  const total = withPrice.length;
  const pageSize = opts.pageSize ?? 24;
  const page = opts.page ?? 1;
  const start = (page - 1) * pageSize;
  const paged = withPrice.slice(start, start + pageSize).map((x) => x.p);

  return { products: paged, total };
}

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const snap = await adminDb.collection("products").where("status", "==", "published").get();
  return snap.docs
    .map((d) => d.data() as Product)
    .filter((p) => {
      const haystack = [p.name, p.sku, p.brand, p.shortDescription, p.description, ...(p.tags ?? [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const snap = await adminDb
    .collection("products")
    .where("status", "==", "published")
    .where("categoryId", "==", product.categoryId)
    .limit(limit + 1)
    .get();
  return snap.docs.map((d) => d.data() as Product).filter((p) => p.id !== product.id).slice(0, limit);
}

export async function getApprovedReviews(productId: string): Promise<import("@/types").Review[]> {
  const snap = await adminDb
    .collection("reviews")
    .where("productId", "==", productId)
    .where("status", "==", "approved")
    .get();
  return snap.docs.map((d) => d.data() as import("@/types").Review);
}

export async function getAllCategories(): Promise<Category[]> {
  const snap = await adminDb.collection("categories").orderBy("order", "asc").get();
  return snap.docs.map((d) => d.data() as Category);
}

export async function getCmsPage(id: string): Promise<import("@/types").CmsPage | null> {
  const snap = await adminDb.collection("pages").doc(id).get();
  if (!snap.exists) return null;
  const page = snap.data() as import("@/types").CmsPage;
  return page.status === "published" ? page : null;
}

export async function getFaqs(): Promise<import("@/types").FaqEntry[]> {
  const snap = await adminDb.collection("faqs").where("active", "==", true).get();
  return snap.docs
    .map((d) => d.data() as import("@/types").FaqEntry)
    .sort((a, b) => a.order - b.order);
}

export async function getLocations(): Promise<import("@/types").StoreLocation[]> {
  const snap = await adminDb.collection("locations").where("active", "==", true).get();
  return snap.docs
    .map((d) => d.data() as import("@/types").StoreLocation)
    .sort((a, b) => a.order - b.order);
}
