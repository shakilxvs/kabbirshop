"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";
import { Coupon, CmsPage, FaqEntry, StoreLocation, DeliveryZone, StoreSettings } from "@/types";

// ---------- Coupons ----------

export async function saveCoupon(formData: FormData) {
  await requireAdmin();
  const id = (formData.get("id") as string) || adminDb.collection("coupons").doc().id;
  const now = Date.now();
  const existing = await adminDb.collection("coupons").doc(id).get();
  const createdAt = existing.exists ? (existing.data() as Coupon).audit.createdAt : now;
  const startDate = formData.get("startDate") as string;
  const expiryDate = formData.get("expiryDate") as string;

  const coupon: Coupon = {
    id,
    code: (formData.get("code") as string).trim().toUpperCase(),
    type: formData.get("type") === "fixed" ? "fixed" : "percentage",
    value: Number(formData.get("value") || 0),
    minOrderAmount: formData.get("minOrderAmount") ? Number(formData.get("minOrderAmount")) : undefined,
    maxDiscount: formData.get("maxDiscount") ? Number(formData.get("maxDiscount")) : undefined,
    startDate: startDate ? new Date(startDate).getTime() : undefined,
    expiryDate: expiryDate ? new Date(expiryDate).getTime() : undefined,
    usageLimit: formData.get("usageLimit") ? Number(formData.get("usageLimit")) : undefined,
    perCustomerLimit: formData.get("perCustomerLimit") ? Number(formData.get("perCustomerLimit")) : undefined,
    usedCount: existing.exists ? (existing.data() as Coupon).usedCount ?? 0 : 0,
    active: formData.get("active") === "on",
    audit: { createdAt, updatedAt: now },
  };

  await adminDb.collection("coupons").doc(id).set(coupon, { merge: true });
  revalidatePath("/admin/coupons");
  redirect("/admin/coupons");
}

export async function deleteCoupon(id: string) {
  await requireAdmin();
  await adminDb.collection("coupons").doc(id).delete();
  revalidatePath("/admin/coupons");
}

// ---------- Reviews ----------

export async function setReviewStatus(id: string, status: "approved" | "rejected") {
  await requireAdmin();
  await adminDb.collection("reviews").doc(id).update({ status, "audit.updatedAt": Date.now() });
  revalidatePath("/admin/reviews");
}

export async function toggleReviewFeatured(id: string, featured: boolean) {
  await requireAdmin();
  await adminDb.collection("reviews").doc(id).update({ featured });
  revalidatePath("/admin/reviews");
}

export async function deleteReview(id: string) {
  await requireAdmin();
  await adminDb.collection("reviews").doc(id).delete();
  revalidatePath("/admin/reviews");
}

// ---------- CMS Pages ----------

export async function saveCmsPage(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const now = Date.now();
  const existing = await adminDb.collection("pages").doc(id).get();
  const createdAt = existing.exists ? (existing.data() as CmsPage).audit.createdAt : now;

  const page: CmsPage = {
    id,
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    imageUrl: (formData.get("imageUrl") as string) || undefined,
    seoTitle: (formData.get("seoTitle") as string) || undefined,
    seoDescription: (formData.get("seoDescription") as string) || undefined,
    status: formData.get("status") === "published" ? "published" : "draft",
    audit: { createdAt, updatedAt: now },
  };

  await adminDb.collection("pages").doc(id).set(page, { merge: true });
  revalidatePath(`/admin/pages/${id}`);
  revalidatePath(`/${id}`);
  redirect("/admin/pages");
}

// ---------- FAQs ----------

export async function saveFaq(formData: FormData) {
  await requireAdmin();
  const id = (formData.get("id") as string) || adminDb.collection("faqs").doc().id;
  const now = Date.now();
  const existing = await adminDb.collection("faqs").doc(id).get();
  const createdAt = existing.exists ? (existing.data() as FaqEntry).audit.createdAt : now;

  const faq: FaqEntry = {
    id,
    question: formData.get("question") as string,
    answer: formData.get("answer") as string,
    category: (formData.get("category") as string) || undefined,
    active: formData.get("active") === "on",
    order: Number(formData.get("order") || 0),
    audit: { createdAt, updatedAt: now },
  };

  await adminDb.collection("faqs").doc(id).set(faq, { merge: true });
  revalidatePath("/admin/pages/faq");
  revalidatePath("/faq");
  redirect("/admin/pages/faq");
}

export async function deleteFaq(id: string) {
  await requireAdmin();
  await adminDb.collection("faqs").doc(id).delete();
  revalidatePath("/admin/pages/faq");
  revalidatePath("/faq");
}

// ---------- Locations ----------

export async function saveLocation(formData: FormData) {
  await requireAdmin();
  const id = (formData.get("id") as string) || adminDb.collection("locations").doc().id;
  const now = Date.now();
  const existing = await adminDb.collection("locations").doc(id).get();
  const createdAt = existing.exists ? (existing.data() as StoreLocation).audit.createdAt : now;

  const location: StoreLocation = {
    id,
    name: formData.get("name") as string,
    address: formData.get("address") as string,
    city: formData.get("city") as string,
    division: formData.get("division") as string,
    country: (formData.get("country") as string) || "Bangladesh",
    phones: ((formData.get("phones") as string) || "").split(",").map((s) => s.trim()).filter(Boolean),
    email: (formData.get("email") as string) || undefined,
    whatsapp: (formData.get("whatsapp") as string) || undefined,
    googleMapsUrl: (formData.get("googleMapsUrl") as string) || undefined,
    openingHours: (formData.get("openingHours") as string) || undefined,
    imageUrl: (formData.get("imageUrl") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
    active: formData.get("active") === "on",
    order: Number(formData.get("order") || 0),
    audit: { createdAt, updatedAt: now },
  };

  await adminDb.collection("locations").doc(id).set(location, { merge: true });
  revalidatePath("/admin/pages/contact");
  revalidatePath("/contact");
  redirect("/admin/pages/contact");
}

export async function deleteLocation(id: string) {
  await requireAdmin();
  await adminDb.collection("locations").doc(id).delete();
  revalidatePath("/admin/pages/contact");
  revalidatePath("/contact");
}

// ---------- Delivery Zones ----------

export async function saveDeliveryZone(formData: FormData) {
  await requireAdmin();
  const settingsRef = adminDb.collection("settings").doc("store");
  const snap = await settingsRef.get();
  const settings = snap.data() as StoreSettings;
  const zones = settings?.delivery ?? [];

  const id = (formData.get("id") as string) || `zone-${Date.now()}`;
  const zone: DeliveryZone = {
    id,
    name: formData.get("name") as string,
    charge: Number(formData.get("charge") || 0),
    estimatedDays: formData.get("estimatedDays") as string,
    active: formData.get("active") === "on",
    order: Number(formData.get("order") || zones.length + 1),
  };

  const idx = zones.findIndex((z) => z.id === id);
  const updatedZones = idx >= 0 ? zones.map((z) => (z.id === id ? zone : z)) : [...zones, zone];

  await settingsRef.set({ delivery: updatedZones }, { merge: true });
  revalidatePath("/admin/delivery");
  redirect("/admin/delivery");
}

export async function deleteDeliveryZone(id: string) {
  await requireAdmin();
  const settingsRef = adminDb.collection("settings").doc("store");
  const snap = await settingsRef.get();
  const settings = snap.data() as StoreSettings;
  const updatedZones = (settings?.delivery ?? []).filter((z) => z.id !== id);
  await settingsRef.set({ delivery: updatedZones }, { merge: true });
  revalidatePath("/admin/delivery");
}

// ---------- Store Settings (business / branding / social / footer / seo / analytics / orders) ----------

export async function saveBusinessSettings(formData: FormData) {
  await requireAdmin();
  const business = Object.fromEntries(
    ["businessName", "legalBusinessName", "tagline", "description", "industry", "country", "city", "address",
      "phone", "secondaryPhone", "whatsapp", "email", "supportEmail", "orderEmail", "businessHours"]
      .map((k) => [k, (formData.get(k) as string) || undefined])
  );
  await adminDb.collection("settings").doc("store").set({ business }, { merge: true });
  revalidatePath("/", "layout");
  redirect("/admin/settings/business");
}

export async function saveBrandingSettings(formData: FormData) {
  await requireAdmin();
  await adminDb.collection("settings").doc("store").set(
    {
      branding: {
        logoUrl: (formData.get("logoUrl") as string) || undefined,
        darkLogoUrl: (formData.get("darkLogoUrl") as string) || undefined,
        mobileLogoUrl: (formData.get("mobileLogoUrl") as string) || undefined,
        faviconUrl: (formData.get("faviconUrl") as string) || undefined,
        ogImageUrl: (formData.get("ogImageUrl") as string) || undefined,
        colors: {
          primary: formData.get("primary") as string,
          secondary: formData.get("secondary") as string,
          accent: formData.get("accent") as string,
          background: formData.get("background") as string,
          text: formData.get("text") as string,
        },
        fontFamily: formData.get("fontFamily") as string,
      },
    },
    { merge: true }
  );
  revalidatePath("/", "layout");
  redirect("/admin/settings/branding");
}

export async function saveSocialLinks(formData: FormData) {
  await requireAdmin();
  const raw = (formData.get("socialJson") as string) || "[]";
  let social;
  try {
    social = JSON.parse(raw);
  } catch {
    throw new Error("Invalid social links data.");
  }
  await adminDb.collection("settings").doc("store").set({ social }, { merge: true });
  revalidatePath("/", "layout");
  redirect("/admin/settings/social");
}

export async function saveFooterSettings(formData: FormData) {
  await requireAdmin();
  await adminDb.collection("settings").doc("store").set(
    {
      footer: {
        showCredit: formData.get("showCredit") === "on",
        creditText: formData.get("creditText") as string,
        creditUrl: formData.get("creditUrl") as string,
        instagramUrl: (formData.get("instagramUrl") as string) || undefined,
        facebookUrl: (formData.get("facebookUrl") as string) || undefined,
        extraSocialLinks: [],
        copyrightTemplate: formData.get("copyrightTemplate") as string,
      },
    },
    { merge: true }
  );
  revalidatePath("/", "layout");
  redirect("/admin/settings/footer");
}

export async function saveSeoSettings(formData: FormData) {
  await requireAdmin();
  await adminDb.collection("settings").doc("store").set(
    {
      seo: {
        defaultTitle: formData.get("defaultTitle") as string,
        defaultDescription: formData.get("defaultDescription") as string,
        defaultOgImageUrl: (formData.get("defaultOgImageUrl") as string) || undefined,
        googleVerification: (formData.get("googleVerification") as string) || undefined,
        keywords: ((formData.get("keywords") as string) || "").split(",").map((s) => s.trim()).filter(Boolean),
      },
    },
    { merge: true }
  );
  revalidatePath("/", "layout");
  redirect("/admin/settings/seo");
}

export async function saveAnalyticsSettings(formData: FormData) {
  await requireAdmin();
  await adminDb.collection("settings").doc("store").set(
    {
      analytics: {
        gaMeasurementId: (formData.get("gaMeasurementId") as string) || undefined,
        metaPixelId: (formData.get("metaPixelId") as string) || undefined,
      },
    },
    { merge: true }
  );
  revalidatePath("/", "layout");
  redirect("/admin/settings/analytics");
}

export async function saveOrderSettings(formData: FormData) {
  await requireAdmin();
  await adminDb.collection("settings").doc("store").set(
    {
      orders: {
        numberPrefix: formData.get("numberPrefix") as string,
        startingNumber: Number(formData.get("startingNumber") || 10001),
        padding: Number(formData.get("padding") || 5),
        codEnabled: formData.get("codEnabled") === "on",
        minOrderAmount: formData.get("minOrderAmount") ? Number(formData.get("minOrderAmount")) : undefined,
        maxOrderAmount: formData.get("maxOrderAmount") ? Number(formData.get("maxOrderAmount")) : undefined,
        guestCheckoutEnabled: formData.get("guestCheckoutEnabled") === "on",
        phoneRequired: formData.get("phoneRequired") === "on",
        emailRequired: formData.get("emailRequired") === "on",
        confirmationMessage: (formData.get("confirmationMessage") as string) || undefined,
      },
    },
    { merge: true }
  );
  revalidatePath("/", "layout");
  redirect("/admin/settings/orders");
}

export async function saveNotificationSettings(formData: FormData) {
  await requireAdmin();
  await adminDb.collection("settings").doc("store").set(
    {
      notifications: {
        whatsappEnabled: formData.get("whatsappEnabled") === "on",
        whatsappAdminPhone: (formData.get("whatsappAdminPhone") as string) || undefined,
        whatsappApiKey: (formData.get("whatsappApiKey") as string) || undefined,
      },
    },
    { merge: true }
  );
  revalidatePath("/admin/settings/notifications");
  redirect("/admin/settings/notifications");
}
