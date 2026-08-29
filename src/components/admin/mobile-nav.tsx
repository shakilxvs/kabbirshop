"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu, X, LayoutDashboard, Package, Layers, ShoppingBag,
  Users, Tag, Star, FileText, Truck, Settings,
} from "lucide-react";
import { ADMIN_NAV, AdminNavIconName } from "@/lib/admin-nav";

const ICONS: Record<AdminNavIconName, typeof LayoutDashboard> = {
  LayoutDashboard, Package, Layers, ShoppingBag, Users, Tag, Star, FileText, Truck, Settings,
};

export function AdminMobileNav({ adminName }: { adminName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="font-display font-semibold">Admin</span>
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="p-2 rounded-lg hover:bg-white/5">
          <Menu size={20} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-[#0B0D10] overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="font-display font-semibold">Admin</span>
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-2 rounded-lg hover:bg-white/5">
              <X size={20} />
            </button>
          </div>
          <nav className="p-4 space-y-1">
            {ADMIN_NAV.map(({ href, label, icon }) => {
              const Icon = ICONS[icon];
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-white/80 hover:bg-white/5"
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="px-7 text-xs text-white/40 mt-4">
            Signed in as
            <div className="text-white/70">{adminName}</div>
          </div>
        </div>
      )}
    </div>
  );
}
