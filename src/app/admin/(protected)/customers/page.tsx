import { adminDb } from "@/lib/firebase/admin";
import { Order } from "@/types";
import { formatBDT } from "@/lib/pricing";

interface CustomerSummary {
  phone: string;
  name: string;
  email?: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: number;
}

export default async function AdminCustomersPage() {
  const snap = await adminDb.collection("orders").orderBy("audit.createdAt", "desc").limit(500).get();
  const orders = snap.docs.map((d) => d.data() as Order);

  const byPhone = new Map<string, CustomerSummary>();
  for (const o of orders) {
    const key = o.customer.phone;
    const existing = byPhone.get(key);
    if (existing) {
      existing.orderCount += 1;
      existing.totalSpent += o.total;
      existing.lastOrderAt = Math.max(existing.lastOrderAt, o.audit.createdAt);
    } else {
      byPhone.set(key, {
        phone: key,
        name: o.customer.fullName,
        email: o.customer.email,
        orderCount: 1,
        totalSpent: o.total,
        lastOrderAt: o.audit.createdAt,
      });
    }
  }

  const customers = [...byPhone.values()].sort((a, b) => b.lastOrderAt - a.lastOrderAt);

  return (
    <div>
      <h1 className="text-2xl font-display font-semibold mb-6">Customers</h1>
      <div className="flex justify-end mb-2">
        <a href="/api/admin/export/customers" className="text-sm text-white/60 hover:text-white px-3 py-2 rounded-lg border border-white/10">
          Export CSV
        </a>
      </div>
      <p className="text-sm text-white/40 mb-4">
        Derived from order history — this store supports guest checkout, so customers are identified by phone number.
      </p>
      <div className="rounded-xl2 border border-white/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-white/5 text-white/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Total Spent</th>
              <th className="px-4 py-3 font-medium">Last Order</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-white/40">No customers yet.</td></tr>}
            {customers.map((c) => (
              <tr key={c.phone} className="border-t border-white/10">
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3 text-white/60">{c.phone}</td>
                <td className="px-4 py-3">{c.orderCount}</td>
                <td className="px-4 py-3">{formatBDT(c.totalSpent)}</td>
                <td className="px-4 py-3 text-white/50">{new Date(c.lastOrderAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
