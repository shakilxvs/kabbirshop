import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { Order } from "@/types";
import { toCsv } from "@/lib/csv";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

export async function GET() {
  const authError = await requireAdminApi();
  if (authError) return authError;

  const snap = await adminDb.collection("orders").orderBy("audit.createdAt", "desc").get();
  const orders = snap.docs.map((d) => d.data() as Order);

  const csv = toCsv(
    orders.map((o) => ({
      OrderNumber: o.orderNumber,
      Status: o.status,
      Customer: o.customer.fullName,
      Phone: o.customer.phone,
      Email: o.customer.email ?? "",
      Division: o.delivery.division,
      District: o.delivery.district,
      Address: o.delivery.fullAddress,
      Subtotal: o.subtotal,
      Delivery: o.deliveryCharge,
      Discount: o.discount,
      Total: o.total,
      Coupon: o.couponCode ?? "",
      Date: new Date(o.audit.createdAt).toISOString(),
    }))
  );

  return new NextResponse(csv, {
    headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="orders.csv"` },
  });
}
