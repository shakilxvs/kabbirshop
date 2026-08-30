import { adminDb } from "@/lib/firebase/admin";
import { StoreLocation } from "@/types";
import { saveLocation } from "@/lib/actions/cms";
import { LocationDeleteButton } from "@/components/admin/location-delete-button";

export default async function AdminContactPage() {
  const snap = await adminDb.collection("locations").orderBy("order", "asc").get();
  const locations = snap.docs.map((d) => d.data() as StoreLocation);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-display font-semibold mb-1">Contact & Locations</h1>
      <p className="text-sm text-white/40 mb-6">
        Core contact details (phone, email, WhatsApp, business hours) are managed under Settings → Business.
        This section manages unlimited store locations shown on the Contact page.
      </p>

      <div className="rounded-xl2 border border-white/10 divide-y divide-white/10 mb-8">
        {locations.length === 0 && <p className="px-4 py-8 text-center text-white/40 text-sm">No locations yet.</p>}
        {locations.map((l) => (
          <div key={l.id} className="flex items-center gap-4 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{l.name}</p>
              <p className="text-xs text-white/40">{l.address}, {l.city}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${l.active ? "bg-green-500/15 text-green-400" : "bg-white/10 text-white/50"}`}>
              {l.active ? "Active" : "Hidden"}
            </span>
            <LocationDeleteButton id={l.id} name={l.name} />
          </div>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3">Add Location</h2>
      <form action={saveLocation} className="space-y-3">
        <input required placeholder="Location Name" name="name" className="input" />
        <input required placeholder="Address" name="address" className="input" />
        <div className="grid grid-cols-2 gap-3">
          <input required placeholder="City" name="city" className="input" />
          <input required placeholder="Division" name="division" className="input" />
        </div>
        <input placeholder="Country" name="country" defaultValue="Bangladesh" className="input" />
        <input placeholder="Phone numbers (comma separated)" name="phones" className="input" />
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Email" name="email" className="input" />
          <input placeholder="WhatsApp" name="whatsapp" className="input" />
        </div>
        <input placeholder="Google Maps URL" name="googleMapsUrl" className="input" />
        <input placeholder="Opening Hours" name="openingHours" className="input" />
        <input placeholder="Image URL" name="imageUrl" className="input" />
        <textarea placeholder="Description" name="description" rows={2} className="input" />
        <div className="grid grid-cols-2 gap-3 items-end">
          <input type="number" placeholder="Display Order" name="order" className="input" />
          <label className="flex items-center gap-2 text-sm pb-2.5"><input type="checkbox" name="active" defaultChecked /> Active</label>
        </div>
        <button type="submit" className="bg-white text-brand-secondary font-medium px-6 py-3 rounded-lg hover:bg-white/90">Save Location</button>
      </form>
    </div>
  );
}
