"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";
import { Category } from "@/types";

function slugify(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function saveCategory(formData: FormData) {
  await requireAdmin();
  const id = (formData.get("id") as string) || adminDb.collection("categories").doc().id;
  const now = Date.now();
  const existing = await adminDb.collection("categories").doc(id).get();
  const createdAt = existing.exists ? (existing.data() as Category).audit.createdAt : now;
  const name = formData.get("name") as string;

  const category: Category = {
    id,
    name,
    slug: (formData.get("slug") as string)?.trim() || slugify(name),
    description: (formData.get("description") as string) || undefined,
    imageUrl: (formData.get("imageUrl") as string) || undefined,
    parentId: (formData.get("parentId") as string) || null,
    order: Number(formData.get("order") || 0),
    visible: formData.get("visible") === "on",
    seoTitle: (formData.get("seoTitle") as string) || undefined,
    seoDescription: (formData.get("seoDescription") as string) || undefined,
    audit: { createdAt, updatedAt: now },
  };

  await adminDb.collection("categories").doc(id).set(category, { merge: true });
  revalidatePath("/admin/categories");
  revalidatePath("/products");
  redirect("/admin/categories");
}

export async function deleteCategory(categoryId: string) {
  await requireAdmin();
  const inUse = await adminDb.collection("products").where("categoryId", "==", categoryId).limit(1).get();
  if (!inUse.empty) {
    throw new Error("Reassign or delete products in this category before deleting it.");
  }
  await adminDb.collection("categories").doc(categoryId).delete();
  revalidatePath("/admin/categories");
}

export async function reorderCategory(categoryId: string, direction: "up" | "down") {
  await requireAdmin();
  const snap = await adminDb.collection("categories").orderBy("order", "asc").get();
  const categories = snap.docs.map((d) => d.data() as Category);
  const idx = categories.findIndex((c) => c.id === categoryId);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapIdx < 0 || swapIdx >= categories.length) return;

  const a = categories[idx];
  const b = categories[swapIdx];
  const batch = adminDb.batch();
  batch.update(adminDb.collection("categories").doc(a.id), { order: b.order });
  batch.update(adminDb.collection("categories").doc(b.id), { order: a.order });
  await batch.commit();
  revalidatePath("/admin/categories");
}
