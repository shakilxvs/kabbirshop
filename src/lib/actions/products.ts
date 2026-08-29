"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";
import { Product, ProductVariantGroup } from "@/types";

function slugify(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function parseVariantGroups(raw: string): ProductVariantGroup[] {
  // Admin enters variants as simple lines: "Color: Black, White, Blue"
  if (!raw.trim()) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, gi) => {
      const [name, optionsRaw] = line.split(":");
      const options = (optionsRaw ?? "")
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean)
        .map((name, oi) => ({ id: `${slugify(name)}-${gi}-${oi}`, name }));
      return { id: `${slugify(name ?? "group")}-${gi}`, name: (name ?? "Option").trim(), options };
    });
}

export async function saveProduct(formData: FormData) {
  const admin = await requireAdmin();
  const id = (formData.get("id") as string) || adminDb.collection("products").doc().id;
  const now = Date.now();

  const existingSnap = await adminDb.collection("products").doc(id).get();
  const createdAt = existingSnap.exists ? (existingSnap.data() as Product).audit.createdAt : now;

  const name = formData.get("name") as string;
  const regularPrice = Number(formData.get("regularPrice") || 0);
  const salePriceRaw = formData.get("salePrice") as string;

  const product: Product = {
    id,
    name,
    slug: (formData.get("slug") as string)?.trim() || slugify(name),
    sku: formData.get("sku") as string,
    brand: (formData.get("brand") as string) || undefined,
    categoryId: formData.get("categoryId") as string,
    shortDescription: (formData.get("shortDescription") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
    regularPrice,
    salePrice: salePriceRaw ? Number(salePriceRaw) : undefined,
    costPrice: formData.get("costPrice") ? Number(formData.get("costPrice")) : undefined,
    stockQuantity: Number(formData.get("stockQuantity") || 0),
    trackInventory: formData.get("trackInventory") === "on",
    lowStockThreshold: Number(formData.get("lowStockThreshold") || 5),
    mainImageUrl: formData.get("mainImageUrl") as string,
    galleryImageUrls: ((formData.get("galleryImageUrls") as string) || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    videoUrl: (formData.get("videoUrl") as string) || undefined,
    warranty: (formData.get("warranty") as string) || undefined,
    features: ((formData.get("features") as string) || "").split("\n").map((s) => s.trim()).filter(Boolean),
    whatsIncluded: ((formData.get("whatsIncluded") as string) || "").split("\n").map((s) => s.trim()).filter(Boolean),
    specifications: ((formData.get("specifications") as string) || "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const [label, ...rest] = l.split(":");
        return { label: label.trim(), value: rest.join(":").trim() };
      }),
    variantGroups: parseVariantGroups((formData.get("variants") as string) || ""),
    tags: ((formData.get("tags") as string) || "").split(",").map((s) => s.trim()).filter(Boolean),
    isFeatured: formData.get("isFeatured") === "on",
    isNewArrival: formData.get("isNewArrival") === "on",
    isBestseller: formData.get("isBestseller") === "on",
    status: formData.get("status") === "published" ? "published" : "draft",
    displayOrder: Number(formData.get("displayOrder") || 0),
    seoTitle: (formData.get("seoTitle") as string) || undefined,
    seoDescription: (formData.get("seoDescription") as string) || undefined,
    audit: { createdAt, updatedAt: now, createdBy: existingSnap.exists ? undefined : admin.uid, updatedBy: admin.uid },
  };

  await adminDb.collection("products").doc(id).set(product, { merge: true });
  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function duplicateProduct(productId: string) {
  await requireAdmin();
  const snap = await adminDb.collection("products").doc(productId).get();
  if (!snap.exists) return;
  const original = snap.data() as Product;
  const newId = adminDb.collection("products").doc().id;
  const now = Date.now();
  await adminDb.collection("products").doc(newId).set({
    ...original,
    id: newId,
    name: `${original.name} (Copy)`,
    slug: `${original.slug}-copy-${newId.slice(0, 5)}`,
    sku: `${original.sku}-COPY`,
    status: "draft",
    audit: { createdAt: now, updatedAt: now },
  });
  revalidatePath("/admin/products");
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  await adminDb.collection("products").doc(productId).delete();
  revalidatePath("/admin/products");
}

export async function toggleProductStatus(productId: string, status: "draft" | "published") {
  await requireAdmin();
  await adminDb.collection("products").doc(productId).update({ status, "audit.updatedAt": Date.now() });
  revalidatePath("/admin/products");
  revalidatePath("/products");
}
