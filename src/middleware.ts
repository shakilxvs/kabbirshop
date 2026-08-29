import { NextRequest, NextResponse } from "next/server";

// Lightweight edge check: presence of the session cookie only. The real
// verification (signature + admin authorization) happens server-side in
// layout/page loaders using firebase-admin, since the Admin SDK can't run
// on the Edge runtime.
//
// IMPORTANT: we only ever redirect AWAY from a protected page when there is
// no cookie at all. We deliberately do NOT redirect /admin/login -> /admin
// just because a cookie is present, because that cookie might be stale or
// invalid — the layout below verifies it properly and redirects back to
// /admin/login if it's bad. If middleware also redirected login -> admin on
// mere cookie presence, an invalid cookie would bounce the browser between
// /admin and /admin/login forever (ERR_TOO_MANY_REDIRECTS).
export function middleware(req: NextRequest) {
  const isLoginPage = req.nextUrl.pathname === "/admin/login";
  const isSetupPage = req.nextUrl.pathname === "/admin/setup";
  const hasSession = req.cookies.has("__session");

  if (!isLoginPage && !isSetupPage && !hasSession) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
