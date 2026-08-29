import { Category } from "@/types";
import { saveCategory } from "@/lib/actions/categories";

export function CategoryForm({ category }: { category?: Category }) {
  return (
    <form action={saveCategory} className="space-y-4 max-w-lg">
      {category && <input type="hidden" name="id" value={category.id} />}
      <Field label="Name"><input required name="name" defaultValue={category?.name} className="input" /></Field>
      <Field label="Slug (auto if blank)"><input name="slug" defaultValue={category?.slug} className="input" /></Field>
      <Field label="Description"><textarea name="description" defaultValue={category?.description} rows={3} className="input" /></Field>
      <Field label="Image URL"><input name="imageUrl" defaultValue={category?.imageUrl} className="input" /></Field>
      <Field label="Display Order"><input type="number" name="order" defaultValue={category?.order ?? 0} className="input" /></Field>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="visible" defaultChecked={category?.visible ?? true} /> Visible</label>
      <Field label="SEO Title"><input name="seoTitle" defaultValue={category?.seoTitle} className="input" /></Field>
      <Field label="Meta Description"><textarea name="seoDescription" defaultValue={category?.seoDescription} rows={2} className="input" /></Field>
      <button type="submit" className="bg-white text-brand-secondary font-medium px-6 py-3 rounded-lg hover:bg-white/90">Save Category</button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-white/50 mb-1">{label}</span>
      {children}
    </label>
  );
}
