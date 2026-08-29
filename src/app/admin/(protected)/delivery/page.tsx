import { getStoreSettings } from "@/lib/data";
import { saveDeliveryZone, deleteDeliveryZone } from "@/lib/actions/cms";
import { formatBDT } from "@/lib/pricing";
import { DeliveryZoneDeleteButton } from "@/components/admin/delivery-zone-delete-button";

export default async function AdminDeliveryPage() {
  const settings = await getStoreSettings();
  const zones = [...settings.delivery].sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-display font-semibold mb-6">Delivery Zones</h1>

      <div className="rounded-xl2 border border-white/10 divide-y divide-white/10 mb-8">
        {zones.length === 0 && <p className="px-4 py-8 text-center text-white/40 text-sm">No delivery zones yet.</p>}
        {zones.map((z) => (
          <div key={z.id} className="flex items-center gap-4 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{z.name}</p>
              <p className="text-xs text-white/40">{formatBDT(z.charge)} · {z.estimatedDays}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${z.active ? "bg-green-500/15 text-green-400" : "bg-white/10 text-white/50"}`}>
              {z.active ? "Active" : "Inactive"}
            </span>
            <DeliveryZoneDeleteButton id={z.id} name={z.name} />
          </div>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3">Add / Update Zone</h2>
      <form action={saveDeliveryZone} className="space-y-3">
        <input placeholder="Zone ID (leave blank to add new, or paste existing ID to edit)" name="id" className="input" />
        <input required placeholder="Zone Name (e.g. Inside Dhaka)" name="name" className="input" />
        <div className="grid grid-cols-2 gap-3">
          <input required type="number" placeholder="Charge (৳)" name="charge" className="input" />
          <input required placeholder="Estimated Time (e.g. 1-2 days)" name="estimatedDays" className="input" />
        </div>
        <input type="number" placeholder="Display Order" name="order" className="input" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked /> Active</label>
        <button type="submit" className="bg-white text-brand-secondary font-medium px-6 py-3 rounded-lg hover:bg-white/90">Save Zone</button>
      </form>
    </div>
  );
}
