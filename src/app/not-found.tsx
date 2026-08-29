import Link from "next/link";
import { PackageX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-lg px-4 py-24 text-center">
      <PackageX size={44} className="mx-auto mb-4 text-brand-text/20" />
      <h1 className="font-display text-2xl font-semibold mb-2">Page not found</h1>
      <p className="text-sm text-brand-text/50 mb-6">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link href="/" className="inline-block bg-brand-primary text-white font-medium px-5 py-3 rounded-lg hover:opacity-90 transition">
        Back to Home
      </Link>
    </main>
  );
}
