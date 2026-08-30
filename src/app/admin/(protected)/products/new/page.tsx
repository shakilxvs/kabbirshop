import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-2xl font-display font-semibold mb-6">Add Product</h1>
      <ProductForm />
    </div>
  );
}
