import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { Product } from "@/types";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const snap = await adminDb.collection("products").doc(params.id).get();
  if (!snap.exists) notFound();
  const product = snap.data() as Product;

  return (
    <div>
      <h1 className="text-2xl font-display font-semibold mb-6">Edit Product</h1>
      <ProductForm product={product} />
    </div>
  );
}
