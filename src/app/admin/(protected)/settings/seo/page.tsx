import { getStoreSettings } from "@/lib/data";
import { saveSeoSettings } from "@/lib/actions/cms";

export default async function SeoSettingsPage() {
  const { seo } = await getStoreSettings();
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-display font-semibold mb-6">SEO</h1>
      <form action={saveSeoSettings} className="space-y-3">
        <Field label="Default Title"><input required name="defaultTitle" defaultValue={seo.defaultTitle} className="input" /></Field>
        <Field label="Default Description"><textarea required name="defaultDescription" defaultValue={seo.defaultDescription} rows={3} className="input" /></Field>
        <Field label="Default OG Image URL"><input name="defaultOgImageUrl" defaultValue={seo.defaultOgImageUrl} className="input" /></Field>
        <Field label="Google Search Console Verification"><input name="googleVerification" defaultValue={seo.googleVerification} className="input" /></Field>
        <Field label="Keywords (comma separated)"><input name="keywords" defaultValue={seo.keywords?.join(", ")} className="input" /></Field>
        <button type="submit" className="bg-white text-brand-secondary font-medium px-6 py-3 rounded-lg hover:bg-white/90">Save SEO Settings</button>
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
