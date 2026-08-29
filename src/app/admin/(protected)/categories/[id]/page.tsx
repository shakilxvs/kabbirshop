import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { Category } from "@/types";
import { CategoryForm } from "@/components/admin/category-form";

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const snap = await adminDb.collection("categories").doc(params.id).get();
  if (!snap.exists) notFound();
  return (
    <div>
      <h1 className="text-2xl font-display font-semibold mb-6">Edit Category</h1>
      <CategoryForm category={snap.data() as Category} />
    </div>
  );
}
