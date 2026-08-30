import Link from "next/link";
import { FileText, MessageSquareText, MapPin } from "lucide-react";

const PAGES = [
  { id: "about", label: "About" },
  { id: "shipping-policy", label: "Shipping Policy" },
  { id: "return-policy", label: "Return Policy" },
  { id: "privacy-policy", label: "Privacy Policy" },
  { id: "terms", label: "Terms & Conditions" },
  { id: "legal", label: "Legal Notice" },
];

export default function AdminPagesHub() {
  return (
    <div>
      <h1 className="text-2xl font-display font-semibold mb-6">Content</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {PAGES.map((p) => (
          <Link key={p.id} href={`/admin/pages/${p.id}`} className="flex items-center gap-3 rounded-xl2 border border-white/10 p-4 hover:bg-white/5">
            <FileText size={18} className="text-brand-primary" />
            <span className="text-sm font-medium">{p.label}</span>
          </Link>
        ))}
        <Link href="/admin/pages/faq" className="flex items-center gap-3 rounded-xl2 border border-white/10 p-4 hover:bg-white/5">
          <MessageSquareText size={18} className="text-brand-primary" />
          <span className="text-sm font-medium">FAQ</span>
        </Link>
        <Link href="/admin/pages/contact" className="flex items-center gap-3 rounded-xl2 border border-white/10 p-4 hover:bg-white/5">
          <MapPin size={18} className="text-brand-primary" />
          <span className="text-sm font-medium">Contact & Locations</span>
        </Link>
      </div>
    </div>
  );
}
