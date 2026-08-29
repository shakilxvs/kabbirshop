import { getCmsPage } from "@/lib/data";
import { CmsPageView } from "@/components/cms-page-view";

export const metadata = { title: "Terms & Conditions" };

export default async function TermsPage() {
  const page = await getCmsPage("terms");
  return <CmsPageView page={page} fallbackTitle="Terms & Conditions" />;
}
