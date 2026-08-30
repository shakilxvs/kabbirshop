import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { Order } from "@/types";
import { formatBDT } from "@/lib/pricing";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { OrderNotesForm } from "@/components/admin/order-notes-form";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const snap = await adminDb.collection("orders").doc(params.id).get();
  if (!snap.exists) notFound();
  const order = snap.data() as Order;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-semibold">Order #{order.orderNumber}</h1>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="rounded-xl2 border border-white/10 p-4">
          <h2 className="text-xs uppercase text-white/40 mb-2">Customer</h2>
          <p className="text-sm">{order.customer.fullName}</p>
          <p className="text-sm text-white/60">{order.customer.phone}</p>
          {order.customer.email && <p className="text-sm text-white/60">{order.customer.email}</p>}
        </div>
        <div className="rounded-xl2 border border-white/10 p-4">
          <h2 className="text-xs uppercase text-white/40 mb-2">Delivery</h2>
          <p className="text-sm">{order.delivery.fullAddress}</p>
          <p className="text-sm text-white/60">{order.delivery.area}, {order.delivery.district}, {order.delivery.division}</p>
          {order.delivery.instructions && <p className="text-sm text-white/40 mt-1">Note: {order.delivery.instructions}</p>}
        </div>
      </div>

      <div className="rounded-xl2 border border-white/10 p-4 mb-6">
        <h2 className="text-xs uppercase text-white/40 mb-3">Products</h2>
        <div className="divide-y divide-white/10">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between py-2.5 text-sm">
              <div>
                <p>{item.productName}</p>
                {item.variantLabel && <p className="text-xs text-white/40">{item.variantLabel}</p>}
                <p className="text-xs text-white/40">Qty {item.quantity} × {formatBDT(item.unitPrice)}</p>
              </div>
              <p className="font-medium">{formatBDT(item.lineTotal)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-3 mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-white/50">Subtotal</span><span>{formatBDT(order.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-white/50">Delivery</span><span>{formatBDT(order.deliveryCharge)}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-green-400"><span>Discount {order.couponCode && `(${order.couponCode})`}</span><span>-{formatBDT(order.discount)}</span></div>}
          <div className="flex justify-between font-semibold pt-2 border-t border-white/10"><span>Total</span><span>{formatBDT(order.total)}</span></div>
          <div className="flex justify-between text-white/50"><span>Payment</span><span>Cash on Delivery</span></div>
        </div>
      </div>

      <div className="rounded-xl2 border border-white/10 p-4">
        <h2 className="text-xs uppercase text-white/40 mb-3">Internal Notes (never shown to customer)</h2>
        <div className="space-y-2 mb-4">
          {(order.internalNotes ?? []).length === 0 && <p className="text-sm text-white/40">No notes yet.</p>}
          {order.internalNotes?.map((n, i) => (
            <div key={i} className="text-sm bg-white/5 rounded-lg p-2.5">
              <p>{n.text}</p>
              <p className="text-xs text-white/40 mt-1">{n.author} · {new Date(n.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <OrderNotesForm orderId={order.id} />
      </div>
    </div>
  );
}
