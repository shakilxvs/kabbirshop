"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/admin/session", { method: "DELETE" });
        router.push("/admin/login");
        router.refresh();
      }}
      className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition px-3 py-2"
    >
      <LogOut size={14} /> Sign out
    </button>
  );
}
