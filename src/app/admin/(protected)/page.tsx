import { adminDb } from "@/lib/firebase/admin";
import { Order } from "@/types";
import { SeedDataButton } from "@/components/admin/seed-data-button";

async function getStats() {
  const [productsSnap, ordersSnap] = await Promise.all([
    adminDb.collection("products").get(),
    adminDb.collection("orders").orderBy("audit.createdAt", "desc").limit(200).get(),
  ]);

  const orders = ordersSnap.docs.map((d) => d.data() as Order);
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  return {
    totalProducts: productsSnap.size,
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    todaysOrders: orders.filter((o) => o.audit?.createdAt >= startOfDay).length,
    monthlySales: orders
      .filter((o) => o.audit?.createdAt >= startOfMonth && o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0),
    lowStock: 0, // computed properly once product stock indexing is in place (Phase 2)
    recentOrders: orders.slice(0, 8),
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { label: "Total Products", value: stats.totalProducts },
    { label: "Total Orders", value: stats.totalOrders },
    { label: "Pending Orders", value: stats.pendingOrders },
    { label: "Today's Orders", value: stats.todaysOrders },
    { label: "Monthly Sales", value: `৳${stats.monthlySales.toLocaleString("en-BD")}` },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-semibold">Dashboard</h1>
        <div className="max-w-[220px]">
          <SeedDataButton />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl2 bg-white/5 border border-white/10 p-4">
            <div className="text-xs text-white/50 mb-1">{c.label}</div>
            <div className="text-2xl font-display font-semibold">{c.value}</div>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-medium mb-3">Recent Orders</h2>
      <div className="rounded-xl2 border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentOrders.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-white/40">
                  No orders yet.
                </td>
              </tr>
            )}
            {stats.recentOrders.map((o) => (
              <tr key={o.id} className="border-t border-white/10">
                <td className="px-4 py-3">#{o.orderNumber}</td>
                <td className="px-4 py-3">{o.customer.fullName}</td>
                <td className="px-4 py-3">৳{o.total.toLocaleString("en-BD")}</td>
                <td className="px-4 py-3 capitalize">{o.status.replace(/_/g, " ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
