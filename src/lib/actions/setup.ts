"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { DEFAULT_STORE_SETTINGS } from "@/lib/defaults";

/** True if no admin account exists yet — used to decide whether /admin/setup is usable. */
export async function hasAnyAdmin(): Promise<boolean> {
  const snap = await adminDb.collection("admins").limit(1).get();
  return !snap.empty;
}

/**
 * Creates the very first admin account. Only works while the admins
 * collection is empty — this is the one-time bootstrap step, replacing the
 * "create a user in Firebase Console + manually add a Firestore doc" flow.
 * Once any admin exists, this refuses to run again (prevents anyone else
 * from ever using this public page to grant themselves access).
 */
export async function createFirstAdmin(formData: FormData) {
  const alreadySetUp = await hasAnyAdmin();
  if (alreadySetUp) {
    throw new Error("Setup has already been completed. Please sign in instead.");
  }

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!name || !email || !password || password.length < 8) {
    throw new Error("Please fill in your name, email, and a password of at least 8 characters.");
  }

  const userRecord = await adminAuth.createUser({ email, password, displayName: name });
  const now = Date.now();
  await adminDb.collection("admins").doc(userRecord.uid).set({
    uid: userRecord.uid,
    email,
    name,
    role: "super_admin",
    active: true,
    audit: { createdAt: now, updatedAt: now },
  });

  redirect("/admin/login?setup=success");
}

/**
 * Loads default store settings + demo categories/products/FAQ/CMS pages.
 * Safe to run more than once (merge writes, deterministic IDs).
 *
 * Allowed in two situations:
 *  1. No admin exists yet (part of first-run setup, before anyone can log in).
 *  2. Caller is a verified, active admin (the "Load Default Data" button
 *     inside the dashboard, for reseeding demo content later).
 */
export async function seedDefaultData() {
  const setupComplete = await hasAnyAdmin();

  if (setupComplete) {
    const sessionCookie = cookies().get("__session")?.value;
    if (!sessionCookie) throw new Error("Please sign in as an admin to load default data.");
    try {
      const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
      const adminDoc = await adminDb.collection("admins").doc(decoded.uid).get();
      if (!adminDoc.exists || adminDoc.data()?.active !== true) {
        throw new Error("Not authorized.");
      }
    } catch {
      throw new Error("Please sign in as an admin to load default data.");
    }
  }

  const now = Date.now();
  const audit = { createdAt: now, updatedAt: now };

  await adminDb.collection("settings").doc("store").set(DEFAULT_STORE_SETTINGS, { merge: true });

  const categories = [
    { id: "mobile-accessories", name: "Mobile Accessories", slug: "mobile-accessories", order: 1, visible: true, parentId: null },
    { id: "chargers-cables", name: "Chargers & Cables", slug: "chargers-cables", order: 2, visible: true, parentId: null },
    { id: "earbuds-headphones", name: "Earbuds & Headphones", slug: "earbuds-headphones", order: 3, visible: true, parentId: null },
    { id: "smart-watches", name: "Smart Watches", slug: "smart-watches", order: 4, visible: true, parentId: null },
    { id: "power-banks", name: "Power Banks", slug: "power-banks", order: 5, visible: true, parentId: null },
    { id: "speakers", name: "Speakers", slug: "speakers", order: 6, visible: true, parentId: null },
  ];
  await Promise.all(categories.map((c) => adminDb.collection("categories").doc(c.id).set({ ...c, audit }, { merge: true })));

  const products = [
    {
      id: "wireless-earbuds-x1", name: "Wireless Earbuds X1", slug: "wireless-earbuds-x1", sku: "EAR-X1-BLK",
      brand: "Generic", categoryId: "earbuds-headphones",
      shortDescription: "True wireless earbuds with 24hr case battery.",
      description: "Compact true-wireless earbuds with touch controls, punchy bass, and a 24-hour charging case.",
      regularPrice: 2200, salePrice: 1499, stockQuantity: 40, trackInventory: true, lowStockThreshold: 5,
      mainImageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800", galleryImageUrls: [],
      variantGroups: [{ id: "color", name: "Color", options: [{ id: "black", name: "Black" }, { id: "white", name: "White" }] }],
      tags: ["Sale", "Bestseller"], isFeatured: true, isNewArrival: false, isBestseller: true,
      status: "published", displayOrder: 1,
    },
    {
      id: "fast-charger-20w", name: "20W Fast Charger", slug: "fast-charger-20w", sku: "CHG-20W",
      brand: "Generic", categoryId: "chargers-cables",
      shortDescription: "Compact PD fast charger, 20W USB-C.",
      description: "A compact 20W USB-C power delivery charger that fast-charges most modern phones safely.",
      regularPrice: 900, stockQuantity: 60, trackInventory: true, lowStockThreshold: 10,
      mainImageUrl: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800", galleryImageUrls: [],
      variantGroups: [], tags: ["New"], isFeatured: true, isNewArrival: true, isBestseller: false,
      status: "published", displayOrder: 2,
    },
    {
      id: "smart-watch-s3", name: "Smart Watch S3", slug: "smart-watch-s3", sku: "SW-S3",
      brand: "Generic", categoryId: "smart-watches",
      shortDescription: "Fitness tracking smart watch with AMOLED display.",
      description: "Track heart rate, steps and sleep with a bright AMOLED display and multi-day battery life.",
      regularPrice: 3500, salePrice: 2799, stockQuantity: 25, trackInventory: true, lowStockThreshold: 5,
      mainImageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800", galleryImageUrls: [],
      variantGroups: [], tags: ["Sale", "Featured"], isFeatured: true, isNewArrival: false, isBestseller: true,
      status: "published", displayOrder: 3,
    },
  ];
  await Promise.all(products.map((p) => adminDb.collection("products").doc(p.id).set({ ...p, audit }, { merge: true })));

  await adminDb.collection("counters").doc("orders").set(
    { next: DEFAULT_STORE_SETTINGS.orders.startingNumber },
    { merge: true }
  );

  await adminDb.collection("faqs").doc("faq-1").set(
    {
      id: "faq-1",
      question: "Do you offer Cash on Delivery?",
      answer: "Yes — Cash on Delivery is available on every order, anywhere in Bangladesh.",
      active: true,
      order: 1,
      audit,
    },
    { merge: true }
  );

  const starterPages: Record<string, string> = {
    about: "<p>Tell your customers who you are and why they should shop with you. Edit this from Admin → Content → About.</p>",
    "shipping-policy": "<p>Describe delivery areas, charges, and timelines here. Edit from Admin → Content → Shipping Policy.</p>",
    "return-policy": "<p>Describe your return window and process here. Edit from Admin → Content → Return Policy.</p>",
    "privacy-policy": "<p>Add your privacy policy here. Edit from Admin → Content → Privacy Policy.</p>",
    terms: "<p>Add your terms and conditions here. Edit from Admin → Content → Terms.</p>",
    legal: "<p>Add any legal notices here. Edit from Admin → Content → Legal Notice.</p>",
  };
  await Promise.all(
    Object.entries(starterPages).map(([id, content]) =>
      adminDb.collection("pages").doc(id).set(
        { id, title: id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), content, status: "published", audit },
        { merge: true }
      )
    )
  );
}
