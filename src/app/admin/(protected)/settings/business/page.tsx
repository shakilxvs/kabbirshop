import { getStoreSettings } from "@/lib/data";
import { saveBusinessSettings } from "@/lib/actions/cms";

export default async function BusinessSettingsPage() {
  const { business } = await getStoreSettings();
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-display font-semibold mb-6">Business Settings</h1>
      <form action={saveBusinessSettings} className="space-y-3">
        <Field label="Business Name"><input required name="businessName" defaultValue={business.businessName} className="input" /></Field>
        <Field label="Legal Business Name"><input name="legalBusinessName" defaultValue={business.legalBusinessName} className="input" /></Field>
        <Field label="Tagline"><input name="tagline" defaultValue={business.tagline} className="input" /></Field>
        <Field label="Description"><textarea name="description" defaultValue={business.description} rows={3} className="input" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Country"><input name="country" defaultValue={business.country} className="input" /></Field>
          <Field label="City"><input name="city" defaultValue={business.city} className="input" /></Field>
        </div>
        <Field label="Address"><input name="address" defaultValue={business.address} className="input" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone"><input name="phone" defaultValue={business.phone} className="input" /></Field>
          <Field label="Secondary Phone"><input name="secondaryPhone" defaultValue={business.secondaryPhone} className="input" /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="WhatsApp"><input name="whatsapp" defaultValue={business.whatsapp} className="input" /></Field>
          <Field label="Email"><input name="email" defaultValue={business.email} className="input" /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Support Email"><input name="supportEmail" defaultValue={business.supportEmail} className="input" /></Field>
          <Field label="Order Email"><input name="orderEmail" defaultValue={business.orderEmail} className="input" /></Field>
        </div>
        <Field label="Business Hours"><input name="businessHours" defaultValue={business.businessHours} className="input" /></Field>
        <button type="submit" className="bg-white text-brand-secondary font-medium px-6 py-3 rounded-lg hover:bg-white/90">Save Business Settings</button>
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
