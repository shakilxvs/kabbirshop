import { adminDb } from "@/lib/firebase/admin";
import { Category, Product } from "@/types";
import { saveProduct } from "@/lib/actions/products";
import { VariantBuilder } from "@/components/admin/variant-builder";

export async function ProductForm({ product }: { product?: Product }) {
  const catSnap = await adminDb.collection("categories").orderBy("order", "asc").get();
  const categories = catSnap.docs.map((d) => d.data() as Category);

  const specsText = (product?.specifications ?? []).map((s) => `${s.label}: ${s.value}`).join("\n");

  return (
    <form action={saveProduct} className="space-y-8 max-w-3xl">
      {product && <input type="hidden" name="id" value={product.id} />}

      <Section title="Basic">
        <Field label="Product Name"><input required name="name" defaultValue={product?.name} className="input" /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="SKU"><input required name="sku" defaultValue={product?.sku} className="input" /></Field>
          <Field label="Slug (auto if blank)"><input name="slug" defaultValue={product?.slug} className="input" /></Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Brand"><input name="brand" defaultValue={product?.brand} className="input" /></Field>
          <Field label="Category">
            <select required name="categoryId" defaultValue={product?.categoryId} className="input">
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Short Description"><input name="shortDescription" defaultValue={product?.shortDescription} className="input" /></Field>
        <Field label="Full Description"><textarea name="description" defaultValue={product?.description} rows={4} className="input" /></Field>
      </Section>

      <Section title="Pricing">
        <div className="grid grid-cols-3 gap-4">
          <Field label="Regular Price (৳)"><input required type="number" name="regularPrice" defaultValue={product?.regularPrice} className="input" /></Field>
          <Field label="Sale Price (৳)"><input type="number" name="salePrice" defaultValue={product?.salePrice} className="input" /></Field>
          <Field label="Cost Price (৳, internal only)"><input type="number" name="costPrice" defaultValue={product?.costPrice} className="input" /></Field>
        </div>
      </Section>

      <Section title="Inventory">
        <div className="grid grid-cols-3 gap-4 items-end">
          <Field label="Stock Quantity"><input type="number" name="stockQuantity" defaultValue={product?.stockQuantity ?? 0} className="input" /></Field>
          <Field label="Low Stock Threshold"><input type="number" name="lowStockThreshold" defaultValue={product?.lowStockThreshold ?? 5} className="input" /></Field>
          <label className="flex items-center gap-2 text-sm pb-2.5">
            <input type="checkbox" name="trackInventory" defaultChecked={product?.trackInventory ?? true} /> Track Inventory
          </label>
        </div>
      </Section>

      <Section title="Media">
        <Field label="Main Image URL"><input required name="mainImageUrl" defaultValue={product?.mainImageUrl} className="input" /></Field>
        <Field label="Gallery Image URLs (one per line)">
          <textarea name="galleryImageUrls" defaultValue={product?.galleryImageUrls?.join("\n")} rows={3} className="input" />
        </Field>
        <Field label="Video URL"><input name="videoUrl" defaultValue={product?.videoUrl} className="input" /></Field>
      </Section>

      <Section title="Variants">
        <p className="text-xs text-white/40 mb-1">
          Add a group (e.g. "Color"), then its options. Stock is required per option; SKU, image,
          and price overrides are optional — click the arrow to expand them.
        </p>
        <VariantBuilder initial={product?.variantGroups ?? []} />
      </Section>

      <Section title="Product Information">
        <Field label={`Specifications — one per line: "Battery: 300mAh"`}>
          <textarea name="specifications" defaultValue={specsText} rows={3} className="input" />
        </Field>
        <Field label="Features (one per line)"><textarea name="features" defaultValue={product?.features?.join("\n")} rows={3} className="input" /></Field>
        <Field label="What's Included (one per line)"><textarea name="whatsIncluded" defaultValue={product?.whatsIncluded?.join("\n")} rows={2} className="input" /></Field>
        <Field label="Warranty"><input name="warranty" defaultValue={product?.warranty} className="input" /></Field>
        <Field label="Tags (comma separated: New, Bestseller, Sale…)"><input name="tags" defaultValue={product?.tags?.join(", ")} className="input" /></Field>
      </Section>

      <Section title="Visibility">
        <div className="flex flex-wrap gap-5 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured} /> Featured</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="isNewArrival" defaultChecked={product?.isNewArrival} /> New Arrival</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="isBestseller" defaultChecked={product?.isBestseller} /> Bestseller</label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Status">
            <select name="status" defaultValue={product?.status ?? "draft"} className="input">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </Field>
          <Field label="Display Order"><input type="number" name="displayOrder" defaultValue={product?.displayOrder ?? 0} className="input" /></Field>
        </div>
      </Section>

      <Section title="SEO">
        <Field label="SEO Title"><input name="seoTitle" defaultValue={product?.seoTitle} className="input" /></Field>
        <Field label="Meta Description"><textarea name="seoDescription" defaultValue={product?.seoDescription} rows={2} className="input" /></Field>
      </Section>

      <button type="submit" className="bg-white text-brand-secondary font-medium px-6 py-3 rounded-lg hover:bg-white/90">
        Save Product
      </button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
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
