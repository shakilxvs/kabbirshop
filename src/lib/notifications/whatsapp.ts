import "server-only";
import { Order, StoreSettings } from "@/types";
import { formatBDT } from "@/lib/pricing";

/**
 * Sends a free WhatsApp alert via CallMeBot (unofficial, personal-use API)
 * whenever a new order is placed. Never throws — a notification failure
 * must never break checkout for the customer. Configured entirely from
 * Admin → Settings → Notifications, not env vars, because CallMeBot's bot
 * number occasionally goes offline and needs re-pairing; storing this in
 * Firestore lets the store owner fix it themselves without a redeploy.
 */
export async function sendNewOrderWhatsAppAlert(order: Order, settings: StoreSettings) {
  const { whatsappEnabled, whatsappAdminPhone, whatsappApiKey } = settings.notifications;
  if (!whatsappEnabled || !whatsappAdminPhone || !whatsappApiKey) return;

  const itemsSummary = order.items.map((i) => `${i.quantity}x ${i.productName}`).join(", ");
  const message =
    `🛒 New order #${order.orderNumber}\n` +
    `${order.customer.fullName} · ${order.customer.phone}\n` +
    `${itemsSummary}\n` +
    `Total: ${formatBDT(order.total)} (COD)\n` +
    `${order.delivery.district}, ${order.delivery.division}`;

  try {
    const url = new URL("https://api.callmebot.com/whatsapp.php");
    url.searchParams.set("phone", whatsappAdminPhone);
    url.searchParams.set("text", message);
    url.searchParams.set("apikey", whatsappApiKey);

    await fetch(url.toString(), { method: "GET" });
  } catch (err) {
    console.error("WhatsApp order notification failed:", err);
  }
}
