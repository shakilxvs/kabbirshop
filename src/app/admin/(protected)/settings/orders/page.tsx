import { getStoreSettings } from "@/lib/data";
import { saveOrderSettings } from "@/lib/actions/cms";

export default async function OrderSettingsPage() {
  const { orders } = await getStoreSettings();
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-display font-semibold mb-6">Order Settings</h1>
      <form action={saveOrderSettings} className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Order Number Prefix"><input name="numberPrefix" defaultValue={orders.numberPrefix} className="input" /></Field>
          <Field label="Starting Number"><input type="number" name="startingNumber" defaultValue={orders.startingNumber} className="input" /></Field>
          <Field label="Number Padding"><input type="number" name="padding" defaultValue={orders.padding} className="input" /></Field>
        </div>
        <p className="text-xs text-white/40">
          Changing the starting number only affects future orders — it does not rewind the live counter used for new orders.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Minimum Order Amount (৳)"><input type="number" name="minOrderAmount" defaultValue={orders.minOrderAmount} className="input" /></Field>
          <Field label="Maximum Order Amount (৳)"><input type="number" name="maxOrderAmount" defaultValue={orders.maxOrderAmount} className="input" /></Field>
        </div>
        <div className="flex flex-wrap gap-5 text-sm pt-2">
          <label className="flex items-center gap-2"><input type="checkbox" name="codEnabled" defaultChecked={orders.codEnabled} /> COD Enabled</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="guestCheckoutEnabled" defaultChecked={orders.guestCheckoutEnabled} /> Guest Checkout</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="phoneRequired" defaultChecked={orders.phoneRequired} /> Phone Required</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="emailRequired" defaultChecked={orders.emailRequired} /> Email Required</label>
        </div>
        <Field label="Order Confirmation Message"><textarea name="confirmationMessage" defaultValue={orders.confirmationMessage} rows={2} className="input" /></Field>
        <button type="submit" className="bg-white text-brand-secondary font-medium px-6 py-3 rounded-lg hover:bg-white/90">Save Order Settings</button>
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
