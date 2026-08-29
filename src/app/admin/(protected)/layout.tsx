import {
  LayoutDashboard, Package, Layers, ShoppingBag, Users,
  FileText, Truck, Settings, Tag, Star,
} from "lucide-react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { LogoutButton } from "@/components/admin/logout-button";
import { AdminMobileNav } from "@/components/admin/mobile-nav";
import { ADMIN_NAV, AdminNavIconName } from "@/lib/admin-nav";

const ICONS: Record<AdminNavIconName, typeof LayoutDashboard> = {
  LayoutDashboard, Package, Layers, ShoppingBag, Users, Tag, Star, FileText, Truck, Settings,
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const adminName = admin.name || admin.email;

  return (
    <div className="min-h-screen bg-[#0B0D10] text-white flex flex-col md:flex-row">
      <AdminMobileNav adminName={adminName} />

      <aside className="w-60 shrink-0 border-r border-white/10 p-4 hidden md:block">
        <div className="font-display font-semibold px-2 py-3 text-lg">Admin</div>
        <nav className="space-y-1 mt-2">
          {ADMIN_NAV.map(({ href, label, icon }) => {
            const Icon = ICONS[icon];
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/5 hover:text-white transition"
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-8 px-3 text-xs text-white/40">
          Signed in as
          <div className="text-white/70">{adminName}</div>
        </div>
        <LogoutButton />
      </aside>
      <main className="flex-1 min-w-0 p-4 md:p-8">{children}</main>
    </div>
  );
}
