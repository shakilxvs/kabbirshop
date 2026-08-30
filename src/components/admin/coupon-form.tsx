import { Coupon } from "@/types";
import { saveCoupon } from "@/lib/actions/cms";

function toDateInput(ms?: number) {
  return ms ? new Date(ms).toISOString().slice(0, 10) : "";
}

export function CouponForm({ coupon }: { coupon?: Coupon }) {
  return (
    <form action={saveCoupon} className="space-y-4 max-w-lg">
      {coupon && <input type="hidden" name="id" value={coupon.id} />}
      <Field label="Code"><input required name="code" defaultValue={coupon?.code} className="input uppercase" /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Type">
          <select name="type" defaultValue={coupon?.type ?? "percentage"} className="input">
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
        </Field>
        <Field label="Value"><input required type="number" name="value" defaultValue={coupon?.value} className="input" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Minimum Order (৳)"><input type="number" name="minOrderAmount" defaultValue={coupon?.minOrderAmount} className="input" /></Field>
        <Field label="Max Discount (৳)"><input type="number" name="maxDiscount" defaultValue={coupon?.maxDiscount} className="input" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Start Date"><input type="date" name="startDate" defaultValue={toDateInput(coupon?.startDate)} className="input" /></Field>
        <Field label="Expiry Date"><input type="date" name="expiryDate" defaultValue={toDateInput(coupon?.expiryDate)} className="input" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Total Usage Limit"><input type="number" name="usageLimit" defaultValue={coupon?.usageLimit} className="input" /></Field>
        <Field label="Per-Customer Limit"><input type="number" name="perCustomerLimit" defaultValue={coupon?.perCustomerLimit} className="input" /></Field>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={coupon?.active ?? true} /> Active</label>
      <button type="submit" className="bg-white text-brand-secondary font-medium px-6 py-3 rounded-lg hover:bg-white/90">Save Coupon</button>
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
