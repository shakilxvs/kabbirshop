import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { Order } from "@/types";
import { toCsv } from "@/lib/csv";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

export async function GET() {
  const authError = await requireAdminApi();
  if (authError) return authError;

  const snap = await adminDb.collection("orders").get();
  const orders = snap.docs.map((d) => d.data() as Order);

  const byPhone = new Map<string, { Name: string; Phone: string; Email: string; Orders: number; TotalSpent: number }>();
  for (const o of orders) {
    const existing = byPhone.get(o.customer.phone);
    if (existing) {
      existing.Orders += 1;
      existing.TotalSpent += o.total;
    } else {
      byPhone.set(o.customer.phone, {
        Name: o.customer.fullName,
        Phone: o.customer.phone,
        Email: o.customer.email ?? "",
        Orders: 1,
        TotalSpent: o.total,
      });
    }
  }

  const csv = toCsv([...byPhone.values()]);

  return new NextResponse(csv, {
    headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="customers.csv"` },
  });
}
