import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { Product } from "@/types";
import { toCsv } from "@/lib/csv";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

export async function GET() {
  const authError = await requireAdminApi();
  if (authError) return authError;

  const snap = await adminDb.collection("products").get();
  const products = snap.docs.map((d) => d.data() as Product);

  const csv = toCsv(
    products.map((p) => ({
      Name: p.name,
      SKU: p.sku,
      Brand: p.brand ?? "",
      Category: p.categoryId,
      RegularPrice: p.regularPrice,
      SalePrice: p.salePrice ?? "",
      Stock: p.trackInventory ? p.stockQuantity : "",
      Status: p.status,
    }))
  );

  return new NextResponse(csv, {
    headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="products.csv"` },
  });
}
