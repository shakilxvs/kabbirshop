import Link from "next/link";
import { hasAnyAdmin, createFirstAdmin } from "@/lib/actions/setup";
import { SeedDataButton } from "@/components/admin/seed-data-button";

export default async function AdminSetupPage() {
  const alreadySetUp = await hasAnyAdmin();

  if (alreadySetUp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0D10] px-4">
        <div className="w-full max-w-sm rounded-xl2 bg-[#14171C] p-8 shadow-2xl border border-white/5 text-center">
          <h1 className="text-xl font-display font-semibold text-white mb-2">Setup already completed</h1>
          <p className="text-sm text-white/50 mb-6">An admin account already exists for this store.</p>
          <Link href="/admin/login" className="inline-block w-full bg-white text-[#0B0D10] font-medium text-sm py-2.5 rounded-lg hover:bg-white/90 transition">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D10] px-4 py-16">
      <div className="mx-auto max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-display font-semibold text-white mb-1">Store Setup</h1>
          <p className="text-sm text-white/50">This runs once — create your admin account to get started.</p>
        </div>

        <div className="rounded-xl2 bg-[#14171C] p-6 border border-white/5">
          <h2 className="text-sm font-medium text-white mb-4">1. Create your admin account</h2>
          <form action={createFirstAdmin} className="space-y-3">
            <input required name="name" placeholder="Your Name" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30" />
            <input required type="email" name="email" placeholder="you@store.com" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30" />
            <input required type="password" name="password" placeholder="Password (min 8 characters)" minLength={8} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30" />
            <button type="submit" className="w-full bg-white text-[#0B0D10] font-medium text-sm py-2.5 rounded-lg hover:bg-white/90 transition">
              Create Admin Account
            </button>
          </form>
        </div>

        <div className="rounded-xl2 bg-[#14171C] p-6 border border-white/5">
          <h2 className="text-sm font-medium text-white mb-1">2. Load starter data (optional)</h2>
          <p className="text-xs text-white/40 mb-4">
            Adds default store settings, a few demo categories/products, an FAQ entry, and starter content pages —
            everything is editable afterward. You can also do this later from the dashboard.
          </p>
          <SeedDataButton />
        </div>
      </div>
    </div>
  );
}
