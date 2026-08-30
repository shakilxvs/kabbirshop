"use client";

import { usePathname } from "next/navigation";

// The root layout wraps every route in the app (there's only one root
// layout). Admin pages have their own header/sidebar built into their own
// layout, so the public storefront header/footer must not render there —
// otherwise you get the storefront nav sitting on top of the admin panel.
// SiteHeader/SiteFooter are passed in as already-rendered JSX (safe to pass
// across the server/client boundary — unlike raw component functions).
export function StorefrontChrome({
  header,
  footer,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      {header}
      {children}
      {footer}
    </>
  );
}
