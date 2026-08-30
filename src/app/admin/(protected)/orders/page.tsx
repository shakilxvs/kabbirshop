import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import { Order, OrderStatus } from "@/types";
import { formatBDT } from "@/lib/pricing";

const STATUSES: OrderStatus[] = ["pending", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "returned", "refunded"];

export default async function AdminOrdersPage({ searchParams }: { searchParams: { q?: string; status?: string } }) {
  const snap = await adminDb.collection("orders").orderBy("audit.createdAt", "desc").limit(300).get();
  let orders = snap.docs.map((d) => d.data() as Order);

  if (searchParams.status) orders = orders.filter((o) => o.status === searchParams.status);
  if (searchParams.q) {
    const q = searchParams.q.toLowerCase();
    orders = orders.filter((o) =>
      `${o.orderNumber} ${o.customer.fullName} ${o.customer.phone} ${o.delivery.fullAddress}`.toLowerCase().includes(q)
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-display font-semibold mb-6">Orders</h1>

      <div className="flex justify-end mb-2">
        <a href="/api/admin/export/orders" className="text-sm text-white/60 hover:text-white px-3 py-2 rounded-lg border border-white/10">
          Export CSV
        </a>
      </div>

      <form className="flex flex-wrap gap-3 mb-4">
        <input name="q" defaultValue={searchParams.q} placeholder="Search order #, name, phone…" className="input max-w-sm" />
        <select name="status" defaultValue={searchParams.status ?? ""} className="input max-w-[200px]">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
        <button className="bg-white/10 hover:bg-white/20 text-sm px-4 rounded-lg">Filter</button>
      </form>

      <div className="rounded-xl2 border border-white/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-white/5 text-white/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-white/40">No orders found.</td></tr>}
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-white/10 hover:bg-white/5">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="text-brand-primary font-medium">#{o.orderNumber}</Link>
                </td>
                <td className="px-4 py-3">{o.customer.fullName}</td>
                <td className="px-4 py-3 text-white/60">{o.customer.phone}</td>
                <td className="px-4 py-3">{formatBDT(o.total)}</td>
                <td className="px-4 py-3 capitalize">{o.status.replace(/_/g, " ")}</td>
                <td className="px-4 py-3 text-white/50">{new Date(o.audit.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
