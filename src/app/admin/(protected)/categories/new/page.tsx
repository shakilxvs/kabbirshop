import { CategoryForm } from "@/components/admin/category-form";

export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="text-2xl font-display font-semibold mb-6">Add Category</h1>
      <CategoryForm />
    </div>
  );
}
