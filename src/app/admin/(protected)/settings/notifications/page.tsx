import { getStoreSettings } from "@/lib/data";
import { saveNotificationSettings } from "@/lib/actions/cms";
import { MessageCircle } from "lucide-react";

export default async function NotificationSettingsPage() {
  const { notifications } = await getStoreSettings();

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-display font-semibold mb-2">Notifications</h1>
      <p className="text-sm text-white/40 mb-6">
        Get a free WhatsApp message on your own phone whenever a new order comes in.
      </p>

      <div className="rounded-xl2 border border-white/10 p-4 mb-6 text-sm text-white/70 space-y-2">
        <div className="flex items-center gap-2 font-medium text-white mb-1">
          <MessageCircle size={16} className="text-brand-primary" /> One-time setup (takes ~2 minutes)
        </div>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>
            Go to{" "}
            <a href="https://www.callmebot.com/blog/free-api-whatsapp-messages/" target="_blank" rel="noopener noreferrer" className="text-brand-primary underline">
              callmebot.com's WhatsApp API page
            </a>{" "}
            and copy their current bot phone number (it changes occasionally — always use whatever's listed there, not an old number from anywhere else).
          </li>
          <li>Save that number to your phone's contacts.</li>
          <li>
            From <strong>your</strong> WhatsApp (the number you want alerts sent to), message that contact exactly:
            <br />
            <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded">I allow callmebot to send me messages</code>
          </li>
          <li>Within a minute or two, the bot replies with your personal API key.</li>
          <li>Paste your phone number and that API key below, enable notifications, and save.</li>
        </ol>
        <p className="text-xs text-white/40 pt-1">
          This is a free, unofficial personal-use service — not Meta's official WhatsApp Business API.
          If it ever stops working, the bot's number occasionally rotates; just repeat steps 1–4 with the current number and update the API key below. No redeploy needed.
        </p>
      </div>

      <form action={saveNotificationSettings} className="space-y-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="whatsappEnabled" defaultChecked={notifications.whatsappEnabled} /> Send WhatsApp alert on new orders
        </label>
        <Field label="Your WhatsApp Number (with country code, e.g. +8801700000000)">
          <input name="whatsappAdminPhone" defaultValue={notifications.whatsappAdminPhone} placeholder="+8801700000000" className="input" />
        </Field>
        <Field label="CallMeBot API Key">
          <input name="whatsappApiKey" defaultValue={notifications.whatsappApiKey} placeholder="123456" className="input" />
        </Field>
        <button type="submit" className="bg-white text-brand-secondary font-medium px-6 py-3 rounded-lg hover:bg-white/90">
          Save Notification Settings
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-white/50 mb-1">{label}</span>
      {children}
    </label>
  );
}
