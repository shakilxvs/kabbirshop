"use server";

import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { Review } from "@/types";

export async function submitReview(input: { productId: string; customerName: string; rating: number; text: string }) {
  if (!input.customerName.trim() || !input.text.trim() || input.rating < 1 || input.rating > 5) {
    throw new Error("Please provide a name, rating, and review text.");
  }
  const id = adminDb.collection("reviews").doc().id;
  const now = Date.now();
  const review: Review = {
    id,
    productId: input.productId,
    customerName: input.customerName.trim(),
    rating: input.rating,
    text: input.text.trim(),
    status: "pending",
    featured: false,
    orderVerified: false,
    audit: { createdAt: now, updatedAt: now },
  };
  await adminDb.collection("reviews").doc(id).set(review);
  revalidatePath(`/products`);
}
