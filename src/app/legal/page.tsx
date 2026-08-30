import { getCmsPage } from "@/lib/data";
import { CmsPageView } from "@/components/cms-page-view";

export const metadata = { title: "Legal Notice" };

export default async function LegalPage() {
  const page = await getCmsPage("legal");
  return <CmsPageView page={page} fallbackTitle="Legal Notice" />;
}
