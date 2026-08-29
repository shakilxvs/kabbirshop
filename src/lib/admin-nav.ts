// Plain, serializable nav data — no component references here. Icon
// components are looked up locally (by name) inside whichever component
// renders them, because passing a React component function as a prop from
// a Server Component into a Client Component is not serializable and
// throws a server-side render error.
export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/admin/products", label: "Products", icon: "Package" },
  { href: "/admin/categories", label: "Categories", icon: "Layers" },
  { href: "/admin/orders", label: "Orders", icon: "ShoppingBag" },
  { href: "/admin/customers", label: "Customers", icon: "Users" },
  { href: "/admin/coupons", label: "Coupons", icon: "Tag" },
  { href: "/admin/reviews", label: "Reviews", icon: "Star" },
  { href: "/admin/pages", label: "Content", icon: "FileText" },
  { href: "/admin/delivery", label: "Delivery", icon: "Truck" },
  { href: "/admin/settings", label: "Settings", icon: "Settings" },
] as const;

export type AdminNavIconName = (typeof ADMIN_NAV)[number]["icon"];
