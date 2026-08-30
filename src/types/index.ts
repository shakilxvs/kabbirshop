// Central type definitions. Firestore documents map 1:1 to these shapes.

export type PublishStatus = "draft" | "published";

export interface AuditFields {
  createdAt: number; // epoch ms
  updatedAt: number;
  createdBy?: string;
  updatedBy?: string;
}

// ---------- Business / Branding / Settings ----------

export interface BusinessSettings {
  businessName: string;
  legalBusinessName?: string;
  tagline?: string;
  description?: string;
  industry?: string;
  establishedYear?: number;
  country: string;
  city?: string;
  address?: string;
  phone?: string;
  secondaryPhone?: string;
  whatsapp?: string;
  email?: string;
  supportEmail?: string;
  orderEmail?: string;
  businessHours?: string;
}

export interface BrandingSettings {
  logoUrl?: string;
  darkLogoUrl?: string;
  mobileLogoUrl?: string;
  faviconUrl?: string;
  ogImageUrl?: string;
  colors: {
    primary: string; // hex
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fontFamily: "inter" | "manrope" | "plusJakartaSans" | "dmSans";
}

export interface SocialLink {
  id: string;
  platform: "facebook" | "instagram" | "youtube" | "tiktok" | "x" | "linkedin" | "pinterest";
  url: string;
  label?: string;
  active: boolean;
  order: number;
}

export interface DeliveryZone {
  id: string;
  name: string; // e.g. "Inside Dhaka"
  charge: number; // BDT
  estimatedDays: string; // e.g. "1-2 days"
  active: boolean;
  order: number;
}

export interface OrderSettings {
  numberPrefix: string; // e.g. "RJ"
  startingNumber: number;
  padding: number; // digits, e.g. 5 -> RJ10001
  codEnabled: boolean;
  minOrderAmount?: number;
  maxOrderAmount?: number;
  guestCheckoutEnabled: boolean;
  phoneRequired: boolean;
  emailRequired: boolean;
  confirmationMessage?: string;
}

export interface FooterSettings {
  showCredit: boolean;
  creditText: string; // e.g. "by Shakil"
  creditUrl: string; // e.g. https://shakilxvs.com/
  instagramUrl?: string;
  facebookUrl?: string;
  extraSocialLinks: SocialLink[];
  copyrightTemplate: string; // "© {year} {businessName}. All rights reserved."
}

export interface SeoSettings {
  defaultTitle: string;
  defaultDescription: string;
  defaultOgImageUrl?: string;
  googleVerification?: string;
  keywords?: string[];
}

export interface AnalyticsSettings {
  gaMeasurementId?: string;
  metaPixelId?: string;
}

export interface NotificationSettings {
  whatsappEnabled: boolean;
  whatsappAdminPhone?: string; // e.g. "+8801700000000" — where alerts are sent
  whatsappApiKey?: string; // CallMeBot API key (see Admin → Settings → Notifications for setup)
}

export interface StoreSettings {
  business: BusinessSettings;
  branding: BrandingSettings;
  social: SocialLink[];
  delivery: DeliveryZone[];
  orders: OrderSettings;
  footer: FooterSettings;
  seo: SeoSettings;
  analytics: AnalyticsSettings;
  notifications: NotificationSettings;
}

// ---------- Catalog ----------

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string | null; // subcategory support
  order: number;
  visible: boolean;
  seoTitle?: string;
  seoDescription?: string;
  audit: AuditFields;
}

export interface ProductVariantOption {
  id: string;
  name: string; // e.g. "Black", "128GB"
  sku?: string;
  price?: number;
  salePrice?: number;
  stock?: number;
  imageUrl?: string;
  weightGrams?: number;
}

export interface ProductVariantGroup {
  id: string;
  name: string; // e.g. "Color", "Storage"
  options: ProductVariantOption[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand?: string;
  categoryId: string;
  subcategoryId?: string;
  shortDescription?: string;
  description?: string;

  regularPrice: number;
  salePrice?: number;
  costPrice?: number; // NEVER rendered on public pages
  compareAtPrice?: number;

  stockQuantity: number;
  trackInventory: boolean;
  lowStockThreshold: number;

  mainImageUrl: string;
  galleryImageUrls: string[];
  videoUrl?: string;

  specifications?: { label: string; value: string }[];
  features?: string[];
  whatsIncluded?: string[];
  warranty?: string;
  materials?: string;
  dimensions?: string;
  weight?: string;
  compatibility?: string;

  variantGroups: ProductVariantGroup[];
  tags: string[]; // "New" | "Bestseller" | "Trending" | "Sale" | "Featured" | "Limited" | custom

  isFeatured: boolean;
  isNewArrival: boolean;
  isBestseller: boolean;
  status: PublishStatus;
  displayOrder: number;

  seoTitle?: string;
  seoDescription?: string;
  ogImageUrl?: string;

  audit: AuditFields;
}

// ---------- Orders ----------

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned"
  | "refunded";

export interface OrderLineItem {
  productId: string;
  productName: string;
  productSlug: string;
  imageUrl: string;
  variantLabel?: string; // e.g. "Color: Black, Storage: 128GB"
  sku: string;
  quantity: number;
  unitPrice: number; // trusted, server-resolved at order time
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "RJ10001"
  status: OrderStatus;

  customer: {
    fullName: string;
    phone: string;
    email?: string;
    userId?: string; // present if placed while authenticated (optional accounts)
  };

  delivery: {
    division: string;
    district: string;
    area: string;
    fullAddress: string;
    instructions?: string;
  };

  items: OrderLineItem[];

  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;

  couponCode?: string;
  paymentMethod: "cod";

  internalNotes?: { text: string; author: string; createdAt: number }[];

  audit: AuditFields;
}

// ---------- Coupons ----------

export interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  startDate?: number;
  expiryDate?: number;
  usageLimit?: number;
  perCustomerLimit?: number;
  usedCount: number;
  active: boolean;
  audit: AuditFields;
}

// ---------- Reviews ----------

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number; // 1-5
  text: string;
  status: "pending" | "approved" | "rejected";
  featured: boolean;
  orderVerified: boolean;
  audit: AuditFields;
}

// ---------- CMS pages ----------

export interface CmsPage {
  id: string; // "about" | "faq" | "shipping-policy" | ...
  title: string;
  content: string; // rich text HTML
  imageUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  status: PublishStatus;
  audit: AuditFields;
}

// ---------- Admin users ----------

export type AdminRole = "super_admin" | "manager" | "order_manager" | "product_manager" | "content_manager";

export interface AdminUser {
  uid: string;
  email: string;
  name: string;
  role: AdminRole;
  active: boolean;
  audit: AuditFields;
}

// ---------- FAQ ----------

export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  category?: string;
  active: boolean;
  order: number;
  audit: AuditFields;
}

// ---------- Locations (contact page) ----------

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  division: string;
  country: string;
  phones: string[];
  email?: string;
  whatsapp?: string;
  googleMapsUrl?: string;
  openingHours?: string;
  imageUrl?: string;
  description?: string;
  active: boolean;
  order: number;
  audit: AuditFields;
}

// ---------- Newsletter ----------

export interface NewsletterSubscriber {
  email: string;
  subscribedAt: number;
}
