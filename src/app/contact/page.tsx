import { Phone, Mail, MapPin, MessageCircle, Clock } from "lucide-react";
import { getStoreSettings, getLocations } from "@/lib/data";
import { NewsletterForm } from "@/components/newsletter-form";

export const metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const [settings, locations] = await Promise.all([getStoreSettings(), getLocations().catch(() => [])]);
  const { business } = settings;

  return (
    <main className="mx-auto max-w-4xl px-4 md:px-6 py-12">
      <h1 className="font-display text-2xl font-semibold mb-2">Contact Us</h1>
      <p className="text-sm text-brand-text/50 mb-8">We&apos;re happy to help with any questions about your order.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {business.phone && (
          <ContactItem icon={Phone} label="Phone" value={business.phone} href={`tel:${business.phone}`} />
        )}
        {business.whatsapp && (
          <ContactItem icon={MessageCircle} label="WhatsApp" value={business.whatsapp} href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`} />
        )}
        {business.email && (
          <ContactItem icon={Mail} label="Email" value={business.email} href={`mailto:${business.email}`} />
        )}
        {business.address && <ContactItem icon={MapPin} label="Address" value={business.address} />}
        {business.businessHours && <ContactItem icon={Clock} label="Hours" value={business.businessHours} />}
      </div>

      {locations.length > 0 && (
        <div className="mb-10">
          <h2 className="font-display text-lg font-semibold mb-4">Our Locations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {locations.map((loc) => (
              <div key={loc.id} className="rounded-xl2 border border-black/5 p-4">
                <p className="font-medium text-sm mb-1">{loc.name}</p>
                <p className="text-xs text-brand-text/60">{loc.address}, {loc.city}, {loc.division}</p>
                {loc.phones.length > 0 && <p className="text-xs text-brand-text/60 mt-1">{loc.phones.join(", ")}</p>}
                {loc.openingHours && <p className="text-xs text-brand-text/40 mt-1">{loc.openingHours}</p>}
                {loc.googleMapsUrl && (
                  <a href={loc.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-primary font-medium mt-2 inline-block">
                    View on map
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl2 bg-black/[0.02] p-6">
        <h2 className="font-medium mb-1">Stay in the loop</h2>
        <p className="text-sm text-brand-text/50 mb-4">Get updates on new gadgets and deals.</p>
        <NewsletterForm />
      </div>
    </main>
  );
}

function ContactItem({ icon: Icon, label, value, href }: { icon: any; label: string; value: string; href?: string }) {
  const content = (
    <div className="flex items-start gap-3 rounded-xl2 border border-black/5 p-4">
      <Icon size={18} className="text-brand-primary mt-0.5" />
      <div>
        <p className="text-xs text-brand-text/50">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href} target="_blank" rel="noopener noreferrer">{content}</a> : content;
}
