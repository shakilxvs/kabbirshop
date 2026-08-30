"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { Lock, Mail } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();

      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Unable to sign in. Please try again.");
        setLoading(false);
        return;
      }

      router.push(params.get("redirect") || "/admin");
      router.refresh();
    } catch {
      setError("Incorrect email or password.");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-xl2 bg-[#14171C] p-8 shadow-2xl border border-white/5"
    >
      <h1 className="text-xl font-display font-semibold text-white mb-1">Admin sign in</h1>
      <p className="text-sm text-white/50 mb-6">Store management access only.</p>

      {params.get("setup") === "success" && (
        <div className="mb-4 rounded-lg bg-green-500/10 border border-green-500/30 px-3 py-2 text-sm text-green-300">
          Admin account created. Sign in below to continue.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <label className="block text-xs font-medium text-white/60 mb-1">Email</label>
      <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 mb-4 focus-within:border-white/30">
        <Mail size={16} className="text-white/40" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-transparent outline-none text-sm text-white w-full"
          placeholder="you@store.com"
        />
      </div>

      <label className="block text-xs font-medium text-white/60 mb-1">Password</label>
      <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 mb-6 focus-within:border-white/30">
        <Lock size={16} className="text-white/40" />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-transparent outline-none text-sm text-white w-full"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-white text-[#0B0D10] font-medium text-sm py-2.5 hover:bg-white/90 disabled:opacity-50 transition"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <a href="/admin/setup" className="block text-center text-xs text-white/30 hover:text-white/60 mt-4 transition">
        First time here? Run store setup
      </a>
    </form>
  );
}
