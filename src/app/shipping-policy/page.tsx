import { getCmsPage } from "@/lib/data";
import { CmsPageView } from "@/components/cms-page-view";

export const metadata = { title: "Shipping Policy" };

export default async function ShippingPolicyPage() {
  const page = await getCmsPage("shipping-policy");
  return <CmsPageView page={page} fallbackTitle="Shipping Policy" />;
}
