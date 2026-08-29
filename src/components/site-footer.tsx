import Link from "next/link";
import { StoreSettings } from "@/types";
import { Facebook, Instagram, Youtube, Linkedin, MapPin, Phone, Mail } from "lucide-react";

const SOCIAL_ICON = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
  tiktok: Instagram, // Lucide has no TikTok glyph; swapped in Phase 2 with a custom SVG
  x: Instagram,
  pinterest: Instagram,
} as const;

export function SiteFooter({ settings }: { settings: StoreSettings }) {
  const { business, footer, social } = settings;
  const year = new Date().getFullYear();
  const copyright = footer.copyrightTemplate
    .replace("{year}", String(year))
    .replace("{businessName}", business.businessName);

  return (
    <footer className="bg-brand-secondary text-white/70 mt-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div className="col-span-2">
          <div className="font-display font-semibold text-white text-lg mb-2">{business.businessName}</div>
          {business.description && <p className="text-white/50 max-w-sm">{business.description}</p>}
          <div className="mt-4 space-y-1.5 text-white/60">
            {business.phone && (
              <div className="flex items-center gap-2"><Phone size={14} /> {business.phone}</div>
            )}
            {business.email && (
              <div className="flex items-center gap-2"><Mail size={14} /> {business.email}</div>
            )}
            {business.address && (
              <div className="flex items-center gap-2"><MapPin size={14} /> {business.address}</div>
            )}
          </div>
        </div>

        <div>
          <div className="text-white font-medium mb-3">Shop</div>
          <ul className="space-y-2 text-white/60">
            <li><Link href="/products">All Products</Link></li>
            <li><Link href="/track-order">Track Order</Link></li>
            <li><Link href="/cart">Cart</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-white font-medium mb-3">Company</div>
          <ul className="space-y-2 text-white/60">
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/shipping-policy">Shipping Policy</Link></li>
            <li><Link href="/return-policy">Return Policy</Link></li>
            <li><Link href="/privacy-policy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <div className="flex items-center gap-4">
            <span>{copyright}</span>
            {footer.showCredit && (
              <a href={footer.creditUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                {footer.creditText}
              </a>
            )}
          </div>
          <div className="flex items-center gap-3">
            {social.filter((s) => s.active).map((s) => {
              const Icon = SOCIAL_ICON[s.platform] ?? Instagram;
              return (
                <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.platform} className="hover:text-white transition">
                  <Icon size={16} />
                </a>
              );
            })}
            {footer.instagramUrl && (
              <a href={footer.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-white transition">
                <Instagram size={16} />
              </a>
            )}
            {footer.facebookUrl && (
              <a href={footer.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-white transition">
                <Facebook size={16} />
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
