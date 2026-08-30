import { getCmsPage } from "@/lib/data";
import { CmsPageView } from "@/components/cms-page-view";

export const metadata = { title: "Return Policy" };

export default async function ReturnPolicyPage() {
  const page = await getCmsPage("return-policy");
  return <CmsPageView page={page} fallbackTitle="Return Policy" />;
}
