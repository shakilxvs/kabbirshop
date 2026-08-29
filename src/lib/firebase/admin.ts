import "server-only";
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// Server-only. Never import this file from a "use client" component.
// Credentials come from environment variables — see .env.local.example.
// The raw service-account JSON should never live in the repo.
//
// NOTE: Next.js re-evaluates this module once per route bundle (build time
// and in serverless functions), but the underlying firebase-admin app
// registry (getApps()) is shared process-wide. Firestore.settings() can
// only ever be called ONCE per app — calling it again throws "Firestore
// has already been initialized". So we only call it the very first time
// this app is created, never on subsequent re-imports that just reuse the
// existing app.

function getAdminApp(): { app: App; isNew: boolean } {
  if (getApps().length) return { app: getApps()[0], isNew: false };

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials. Set FIREBASE_ADMIN_PROJECT_ID, " +
        "FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY."
    );
  }

  const app = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
  return { app, isNew: true };
}

const { app, isNew } = getAdminApp();

export const adminApp = app;
export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);

if (isNew) {
  // Firestore's Admin SDK throws on any field whose value is `undefined`
  // (e.g. an unapplied coupon code, empty optional delivery instructions,
  // a product with no brand set) instead of just omitting that field. Since
  // this codebase commonly uses `field: value || undefined` for optional
  // data, tell Firestore to silently drop those fields rather than reject
  // the entire write. Only safe to call right after the app is first created.
  adminDb.settings({ ignoreUndefinedProperties: true });
}
