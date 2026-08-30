import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

// Spec #75/#76: authentication (Firebase Auth) is separate from authorization
// (being listed as an active admin in Firestore). Every authenticated
// Firebase user is NOT automatically an admin.
//
// EXCEPTION — first-run bootstrap: if the admins collection is completely
// empty, the first person who successfully authenticates with a valid
// email/password is auto-promoted to super_admin. This covers stores where
// the very first Firebase Auth user was created directly in the Firebase
// Console (bypassing /admin/setup) — without this, there would be no way
// to grant that account admin access without manually editing Firestore.
// Once any admin document exists, this exception never applies again.

const SESSION_COOKIE = "__session";
const FIVE_DAYS_MS = 60 * 60 * 24 * 5 * 1000;

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    let adminDoc = await adminDb.collection("admins").doc(decoded.uid).get();

    if (!adminDoc.exists || adminDoc.data()?.active !== true) {
      const anyAdminSnap = await adminDb.collection("admins").limit(1).get();

      if (anyAdminSnap.empty) {
        // Bootstrap: no admin exists anywhere yet — promote this authenticated user.
        const now = Date.now();
        const record = await adminAuth.getUser(decoded.uid);
        await adminDb.collection("admins").doc(decoded.uid).set({
          uid: decoded.uid,
          email: record.email ?? decoded.email ?? "",
          name: record.displayName ?? record.email ?? "Admin",
          role: "super_admin",
          active: true,
          audit: { createdAt: now, updatedAt: now },
        });
        adminDoc = await adminDb.collection("admins").doc(decoded.uid).get();
      } else {
        return NextResponse.json({ error: "This account is not authorized for admin access." }, { status: 403 });
      }
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: FIVE_DAYS_MS });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, sessionCookie, {
      maxAge: FIVE_DAYS_MS / 1000,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });
    return res;
  } catch (err) {
    return NextResponse.json({ error: "Unable to sign in. Please try again." }, { status: 401 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
