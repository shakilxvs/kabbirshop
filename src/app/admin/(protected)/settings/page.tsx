import Link from "next/link";
import { Building2, Palette, Share2, LayoutTemplate, Search, BarChart3, ShoppingBag, MessageCircle } from "lucide-react";

const SECTIONS = [
  { href: "/admin/settings/business", label: "Business", icon: Building2, desc: "Name, contact info, hours" },
  { href: "/admin/settings/branding", label: "Branding", icon: Palette, desc: "Logo, favicon, colors, fonts" },
  { href: "/admin/settings/social", label: "Social Media", icon: Share2, desc: "Facebook, Instagram, etc." },
  { href: "/admin/settings/orders", label: "Orders", icon: ShoppingBag, desc: "Order number, COD, min/max" },
  { href: "/admin/settings/notifications", label: "Notifications", icon: MessageCircle, desc: "Free WhatsApp order alerts" },
  { href: "/admin/settings/footer", label: "Footer", icon: LayoutTemplate, desc: "Credit, copyright, socials" },
  { href: "/admin/settings/seo", label: "SEO", icon: Search, desc: "Default title, description" },
  { href: "/admin/settings/analytics", label: "Analytics", icon: BarChart3, desc: "GA / Meta Pixel IDs" },
];

export default function AdminSettingsHub() {
  return (
    <div>
      <h1 className="text-2xl font-display font-semibold mb-6">Settings</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SECTIONS.map(({ href, label, icon: Icon, desc }) => (
          <Link key={href} href={href} className="flex items-start gap-3 rounded-xl2 border border-white/10 p-4 hover:bg-white/5">
            <Icon size={18} className="text-brand-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-white/40">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
