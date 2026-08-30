import { getStoreSettings } from "@/lib/data";
import { saveAnalyticsSettings } from "@/lib/actions/cms";

export default async function AnalyticsSettingsPage() {
  const { analytics } = await getStoreSettings();
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-display font-semibold mb-2">Analytics</h1>
      <p className="text-sm text-white/40 mb-6">Tracking stays fully disabled until an ID is entered here.</p>
      <form action={saveAnalyticsSettings} className="space-y-3">
        <Field label="Google Analytics Measurement ID"><input name="gaMeasurementId" defaultValue={analytics.gaMeasurementId} placeholder="G-XXXXXXX" className="input" /></Field>
        <Field label="Meta Pixel ID"><input name="metaPixelId" defaultValue={analytics.metaPixelId} className="input" /></Field>
        <button type="submit" className="bg-white text-brand-secondary font-medium px-6 py-3 rounded-lg hover:bg-white/90">Save Analytics</button>
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
