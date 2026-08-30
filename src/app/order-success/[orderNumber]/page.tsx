import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { adminDb } from "@/lib/firebase/admin";
import { Order, StoreSettings } from "@/types";
import { getStoreSettings } from "@/lib/data";
import { formatBDT } from "@/lib/pricing";
import { PrintOrderButton } from "@/components/print-order-button";

async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const snap = await adminDb.collection("orders").where("orderNumber", "==", orderNumber).limit(1).get();
  if (snap.empty) return null;
  return snap.docs[0].data() as Order;
}

export default async function OrderSuccessPage({ params }: { params: { orderNumber: string } }) {
  const [order, settings] = await Promise.all([getOrderByNumber(params.orderNumber), getStoreSettings()]);
  if (!order) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 md:px-6 py-12">
      <div className="text-center mb-8">
        <CheckCircle2 size={48} className="mx-auto text-green-500 mb-3" />
        <h1 className="font-display text-2xl font-semibold mb-1">Order Confirmed</h1>
        <p className="text-brand-text/60">Order #{order.orderNumber}</p>
        <p className="text-sm text-brand-text/50 mt-2 max-w-sm mx-auto">{settings.orders.confirmationMessage}</p>
      </div>

      <div id="order-print-area" className="rounded-xl2 border border-black/5 p-6 mb-6">
        <div className="flex justify-between text-sm mb-4">
          <div>
            <p className="font-medium">{order.customer.fullName}</p>
            <p className="text-brand-text/60">{order.customer.phone}</p>
            <p className="text-brand-text/60 mt-1">
              {order.delivery.fullAddress}, {order.delivery.area}, {order.delivery.district}, {order.delivery.division}
            </p>
          </div>
          <div className="text-right text-brand-text/50">
            <p>{new Date(order.audit.createdAt).toLocaleDateString()}</p>
            <p className="font-medium text-brand-text mt-1">Cash on Delivery</p>
          </div>
        </div>

        <div className="divide-y divide-black/5 border-t border-black/5">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between py-2.5 text-sm">
              <div>
                <p className="font-medium">{item.productName}</p>
                {item.variantLabel && <p className="text-xs text-brand-text/50">{item.variantLabel}</p>}
                <p className="text-xs text-brand-text/50">Qty {item.quantity}</p>
              </div>
              <p className="font-medium">{formatBDT(item.lineTotal)}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-black/5 pt-3 mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-brand-text/60">Subtotal</span><span>{formatBDT(order.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-brand-text/60">Delivery</span><span>{formatBDT(order.deliveryCharge)}</span></div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatBDT(order.discount)}</span></div>
          )}
          <div className="flex justify-between font-semibold text-base pt-2 border-t border-black/5">
            <span>Total</span><span>{formatBDT(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/track-order" className="flex-1 text-center border border-black/10 font-medium py-3 rounded-lg hover:bg-black/5 transition">
          Track Order
        </Link>
        <Link href="/products" className="flex-1 text-center bg-brand-primary text-white font-medium py-3 rounded-lg hover:opacity-90 transition">
          Continue Shopping
        </Link>
        <PrintOrderButton />
      </div>
    </main>
  );
}
