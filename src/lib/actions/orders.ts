"use server";

import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";
import { OrderStatus } from "@/types";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await requireAdmin();
  await adminDb.collection("orders").doc(orderId).update({ status, "audit.updatedAt": Date.now() });
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

export async function addOrderNote(orderId: string, text: string) {
  const admin = await requireAdmin();
  if (!text.trim()) return;
  await adminDb
    .collection("orders")
    .doc(orderId)
    .update({
      internalNotes: [
        ...(await adminDb.collection("orders").doc(orderId).get()).data()?.internalNotes ?? [],
        { text: text.trim(), author: admin.name || admin.email, createdAt: Date.now() },
      ],
    });
  revalidatePath(`/admin/orders/${orderId}`);
}
