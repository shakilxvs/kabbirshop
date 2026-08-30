import { adminDb } from "@/lib/firebase/admin";
import { CmsPage } from "@/types";
import { saveCmsPage } from "@/lib/actions/cms";

const LABELS: Record<string, string> = {
  about: "About",
  "shipping-policy": "Shipping Policy",
  "return-policy": "Return Policy",
  "privacy-policy": "Privacy Policy",
  terms: "Terms & Conditions",
  legal: "Legal Notice",
};

export default async function AdminPageEditor({ params }: { params: { id: string } }) {
  const label = LABELS[params.id] ?? params.id;
  const snap = await adminDb.collection("pages").doc(params.id).get();
  const page = snap.exists ? (snap.data() as CmsPage) : null;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-display font-semibold mb-6">Edit: {label}</h1>
      <form action={saveCmsPage} className="space-y-4">
        <input type="hidden" name="id" value={params.id} />
        <Field label="Title"><input required name="title" defaultValue={page?.title ?? label} className="input" /></Field>
        <Field label="Image URL"><input name="imageUrl" defaultValue={page?.imageUrl} className="input" /></Field>
        <Field label="Content (HTML supported)">
          <textarea required name="content" defaultValue={page?.content} rows={12} className="input font-mono text-xs" />
        </Field>
        <Field label="SEO Title"><input name="seoTitle" defaultValue={page?.seoTitle} className="input" /></Field>
        <Field label="Meta Description"><textarea name="seoDescription" defaultValue={page?.seoDescription} rows={2} className="input" /></Field>
        <Field label="Status">
          <select name="status" defaultValue={page?.status ?? "draft"} className="input">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </Field>
        <button type="submit" className="bg-white text-brand-secondary font-medium px-6 py-3 rounded-lg hover:bg-white/90">Save Page</button>
      </form>
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
