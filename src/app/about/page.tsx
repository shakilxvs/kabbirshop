import { getCmsPage } from "@/lib/data";
import { CmsPageView } from "@/components/cms-page-view";

export const metadata = { title: "About Us" };

export default async function AboutPage() {
  const page = await getCmsPage("about");
  return <CmsPageView page={page} fallbackTitle="About Us" />;
}
