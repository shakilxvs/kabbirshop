/**
 * Run with: npm run seed
 * Requires FIREBASE_ADMIN_* env vars to be set (see .env.local.example).
 * Safe to re-run — uses deterministic doc IDs and merge writes.
 */
import { adminDb } from "../src/lib/firebase/admin";
import { DEFAULT_STORE_SETTINGS } from "../src/lib/defaults";
import { Category, Product } from "../src/types";

const now = Date.now();
const audit = { createdAt: now, updatedAt: now, createdBy: "seed", updatedBy: "seed" };

const CATEGORIES: Category[] = [
  { id: "mobile-accessories", name: "Mobile Accessories", slug: "mobile-accessories", order: 1, visible: true, audit, parentId: null },
  { id: "chargers-cables", name: "Chargers & Cables", slug: "chargers-cables", order: 2, visible: true, audit, parentId: null },
  { id: "earbuds-headphones", name: "Earbuds & Headphones", slug: "earbuds-headphones", order: 3, visible: true, audit, parentId: null },
  { id: "smart-watches", name: "Smart Watches", slug: "smart-watches", order: 4, visible: true, audit, parentId: null },
  { id: "power-banks", name: "Power Banks", slug: "power-banks", order: 5, visible: true, audit, parentId: null },
  { id: "speakers", name: "Speakers", slug: "speakers", order: 6, visible: true, audit, parentId: null },
] as unknown as Category[];

const PRODUCTS: Product[] = [
  {
    id: "wireless-earbuds-x1",
    name: "Wireless Earbuds X1",
    slug: "wireless-earbuds-x1",
    sku: "EAR-X1-BLK",
    brand: "Generic",
    categoryId: "earbuds-headphones",
    shortDescription: "True wireless earbuds with 24hr case battery.",
    description: "Compact true-wireless earbuds with touch controls, punchy bass, and a 24-hour charging case. Great for calls, commutes and workouts.",
    regularPrice: 2200,
    salePrice: 1499,
    stockQuantity: 40,
    trackInventory: true,
    lowStockThreshold: 5,
    mainImageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
    galleryImageUrls: [],
    variantGroups: [{ id: "color", name: "Color", options: [
      { id: "black", name: "Black" }, { id: "white", name: "White" },
    ] }],
    tags: ["Sale", "Bestseller"],
    isFeatured: true, isNewArrival: false, isBestseller: true,
    status: "published", displayOrder: 1, audit,
  },
  {
    id: "fast-charger-20w",
    name: "20W Fast Charger",
    slug: "fast-charger-20w",
    sku: "CHG-20W",
    brand: "Generic",
    categoryId: "chargers-cables",
    shortDescription: "Compact PD fast charger, 20W USB-C.",
    description: "A compact 20W USB-C power delivery charger that fast-charges most modern phones safely.",
    regularPrice: 900,
    stockQuantity: 60,
    trackInventory: true,
    lowStockThreshold: 10,
    mainImageUrl: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800",
    galleryImageUrls: [],
    variantGroups: [],
    tags: ["New"],
    isFeatured: true, isNewArrival: true, isBestseller: false,
    status: "published", displayOrder: 2, audit,
  },
  {
    id: "smart-watch-s3",
    name: "Smart Watch S3",
    slug: "smart-watch-s3",
    sku: "SW-S3",
    brand: "Generic",
    categoryId: "smart-watches",
    shortDescription: "Fitness tracking smart watch with AMOLED display.",
    description: "Track heart rate, steps and sleep with a bright AMOLED display and multi-day battery life.",
    regularPrice: 3500,
    salePrice: 2799,
    stockQuantity: 25,
    trackInventory: true,
    lowStockThreshold: 5,
    mainImageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
    galleryImageUrls: [],
    variantGroups: [],
    tags: ["Sale", "Featured"],
    isFeatured: true, isNewArrival: false, isBestseller: true,
    status: "published", displayOrder: 3, audit,
  },
] as unknown as Product[];

async function seed() {
  console.log("Seeding store settings…");
  await adminDb.collection("settings").doc("store").set(DEFAULT_STORE_SETTINGS, { merge: true });

  console.log(`Seeding ${CATEGORIES.length} categories…`);
  await Promise.all(CATEGORIES.map((c) => adminDb.collection("categories").doc(c.id).set(c, { merge: true })));

  console.log(`Seeding ${PRODUCTS.length} demo products…`);
  await Promise.all(PRODUCTS.map((p) => adminDb.collection("products").doc(p.id).set(p, { merge: true })));

  console.log("Initializing order counter…");
  await adminDb.collection("counters").doc("orders").set({ next: DEFAULT_STORE_SETTINGS.orders.startingNumber }, { merge: true });

  console.log("Seeding a starter FAQ entry…");
  await adminDb.collection("faqs").doc("faq-1").set(
    {
      id: "faq-1",
      question: "Do you offer Cash on Delivery?",
      answer: "Yes — Cash on Delivery is available on every order, anywhere in Bangladesh.",
      active: true,
      order: 1,
      audit: { createdAt: now, updatedAt: now },
    },
    { merge: true }
  );

  console.log("Seeding starter CMS pages…");
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
        {
          id,
          title: id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          content,
          status: "published",
          audit: { createdAt: now, updatedAt: now },
        },
        { merge: true }
      )
    )
  );

  console.log("Done. Remember to also create your first admin user manually:");
  console.log("  1. Firebase Console → Authentication → Add user (email/password)");
  console.log("  2. Firestore → admins/{that user's UID} → { email, name, role: 'super_admin', active: true }");
}

seed().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
