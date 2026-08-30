import { StoreSettings } from "@/types";

// These are only the INITIAL defaults (spec #116, #126). Once seeded into
// Firestore at settings/store, every page reads from the database — nothing
// here is imported directly by rendered pages.
export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  business: {
    businessName: "Gadget Shop",
    tagline: "Premium gadgets, delivered across Bangladesh",
    description: "Your trusted source for mobile accessories, audio, wearables and smart home gadgets.",
    country: "Bangladesh",
    city: "Dhaka",
    phone: "+8801700000000",
    whatsapp: "+8801700000000",
    email: "hello@example.com",
    supportEmail: "support@example.com",
    orderEmail: "orders@example.com",
    businessHours: "Sat–Thu, 10:00 AM – 8:00 PM",
  },
  branding: {
    colors: {
      primary: "#3557FF",
      secondary: "#0B0D10",
      accent: "#C9784B",
      background: "#F7F6F3",
      text: "#0B0D10",
    },
    fontFamily: "manrope",
  },
  social: [
    { id: "s1", platform: "facebook", url: "https://facebook.com", active: true, order: 1 },
    { id: "s2", platform: "instagram", url: "https://instagram.com", active: true, order: 2 },
  ],
  delivery: [
    { id: "d1", name: "Inside Dhaka", charge: 60, estimatedDays: "1-2 days", active: true, order: 1 },
    { id: "d2", name: "Outside Dhaka", charge: 120, estimatedDays: "2-5 days", active: true, order: 2 },
  ],
  orders: {
    numberPrefix: "RJ",
    startingNumber: 10001,
    padding: 5,
    codEnabled: true,
    guestCheckoutEnabled: true,
    phoneRequired: true,
    emailRequired: false,
    confirmationMessage: "Thanks, your order is confirmed. We'll contact you if we need to confirm any details.",
  },
  footer: {
    showCredit: true,
    creditText: "by Shakil",
    creditUrl: "https://shakilxvs.com/",
    instagramUrl: "https://www.instagram.com/shakilxvs",
    facebookUrl: "https://www.facebook.com/shakilxvso",
    extraSocialLinks: [],
    copyrightTemplate: "© {year} {businessName}. All rights reserved.",
  },
  seo: {
    defaultTitle: "Gadget Shop — Premium Gadgets in Bangladesh",
    defaultDescription: "Shop mobile accessories, audio, wearables and smart home gadgets with Cash on Delivery across Bangladesh.",
    keywords: ["gadgets", "bangladesh", "electronics", "cash on delivery"],
  },
  analytics: {},
  notifications: {
    whatsappEnabled: false,
  },
};
