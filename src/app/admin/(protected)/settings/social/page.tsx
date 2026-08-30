import { getStoreSettings } from "@/lib/data";
import { SocialLinksForm } from "@/components/admin/social-links-form";

export default async function SocialSettingsPage() {
  const { social } = await getStoreSettings();
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-display font-semibold mb-6">Social Media</h1>
      <SocialLinksForm initial={social} />
    </div>
  );
}
