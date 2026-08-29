import { getStoreSettings } from "@/lib/data";
import { saveFooterSettings } from "@/lib/actions/cms";

export default async function FooterSettingsPage() {
  const { footer } = await getStoreSettings();
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-display font-semibold mb-6">Footer</h1>
      <form action={saveFooterSettings} className="space-y-3">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="showCredit" defaultChecked={footer.showCredit} /> Show developer credit</label>
        <Field label="Credit Text"><input name="creditText" defaultValue={footer.creditText} className="input" /></Field>
        <Field label="Credit URL"><input name="creditUrl" defaultValue={footer.creditUrl} className="input" /></Field>
        <Field label="Instagram URL"><input name="instagramUrl" defaultValue={footer.instagramUrl} className="input" /></Field>
        <Field label="Facebook URL"><input name="facebookUrl" defaultValue={footer.facebookUrl} className="input" /></Field>
        <Field label="Copyright Template (use {year} and {businessName})">
          <input name="copyrightTemplate" defaultValue={footer.copyrightTemplate} className="input" />
        </Field>
        <button type="submit" className="bg-white text-brand-secondary font-medium px-6 py-3 rounded-lg hover:bg-white/90">Save Footer</button>
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
