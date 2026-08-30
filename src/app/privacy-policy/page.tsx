import { getCmsPage } from "@/lib/data";
import { CmsPageView } from "@/components/cms-page-view";

export const metadata = { title: "Privacy Policy" };

export default async function PrivacyPolicyPage() {
  const page = await getCmsPage("privacy-policy");
  return <CmsPageView page={page} fallbackTitle="Privacy Policy" />;
}
