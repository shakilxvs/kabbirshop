import { getStoreSettings } from "@/lib/data";
import { saveBrandingSettings } from "@/lib/actions/cms";
import { ColorField } from "@/components/admin/color-field";

export default async function BrandingSettingsPage() {
  const { branding } = await getStoreSettings();
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-display font-semibold mb-6">Branding</h1>
      <form action={saveBrandingSettings} className="space-y-3">
        <Field label="Logo URL"><input name="logoUrl" defaultValue={branding.logoUrl} className="input" /></Field>
        <Field label="Dark Logo URL"><input name="darkLogoUrl" defaultValue={branding.darkLogoUrl} className="input" /></Field>
        <Field label="Mobile Logo URL"><input name="mobileLogoUrl" defaultValue={branding.mobileLogoUrl} className="input" /></Field>
        <Field label="Favicon URL"><input name="faviconUrl" defaultValue={branding.faviconUrl} className="input" /></Field>
        <Field label="Open Graph Image URL"><input name="ogImageUrl" defaultValue={branding.ogImageUrl} className="input" /></Field>

        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wide pt-4">Colors</h2>
        <div className="grid grid-cols-2 gap-3">
          <ColorField label="Primary" name="primary" value={branding.colors.primary} />
          <ColorField label="Secondary" name="secondary" value={branding.colors.secondary} />
          <ColorField label="Accent" name="accent" value={branding.colors.accent} />
          <ColorField label="Background" name="background" value={branding.colors.background} />
          <ColorField label="Text" name="text" value={branding.colors.text} />
        </div>

        <Field label="Font Family">
          <select name="fontFamily" defaultValue={branding.fontFamily} className="input">
            <option value="inter">Inter</option>
            <option value="manrope">Manrope</option>
            <option value="plusJakartaSans">Plus Jakarta Sans</option>
            <option value="dmSans">DM Sans</option>
          </select>
        </Field>

        <button type="submit" className="bg-white text-brand-secondary font-medium px-6 py-3 rounded-lg hover:bg-white/90">Save Branding</button>
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
