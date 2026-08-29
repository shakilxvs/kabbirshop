import { getStoreSettings } from "@/lib/data";
import { CheckoutClient } from "@/components/checkout-client";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const settings = await getStoreSettings();
  return <CheckoutClient settings={settings} />;
}
