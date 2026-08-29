import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { getStoreSettings } from "@/lib/data";
import { hexToRgbTriplet } from "@/lib/color";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StorefrontChrome } from "@/components/storefront-chrome";
import { ToastProvider } from "@/components/toast";

const body = Manrope({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const display = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  return {
    title: { default: settings.seo.defaultTitle, template: `%s — ${settings.business.businessName}` },
    description: settings.seo.defaultDescription,
    keywords: settings.seo.keywords,
    icons: settings.branding.faviconUrl ? [{ rel: "icon", url: settings.branding.faviconUrl }] : undefined,
    openGraph: {
      title: settings.seo.defaultTitle,
      description: settings.seo.defaultDescription,
      images: settings.seo.defaultOgImageUrl ? [settings.seo.defaultOgImageUrl] : undefined,
    },
    verification: settings.seo.googleVerification ? { google: settings.seo.googleVerification } : undefined,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getStoreSettings();
  const { colors } = settings.branding;

  const brandVars = `
    :root {
      --brand-primary: ${hexToRgbTriplet(colors.primary)};
      --brand-secondary: ${hexToRgbTriplet(colors.secondary)};
      --brand-accent: ${hexToRgbTriplet(colors.accent)};
      --brand-bg: ${hexToRgbTriplet(colors.background)};
      --brand-text: ${hexToRgbTriplet(colors.text)};
    }
  `;

  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <head>
        {/* eslint-disable-next-line react/no-danger */}
        <style dangerouslySetInnerHTML={{ __html: brandVars }} />
        {settings.analytics.gaMeasurementId && (
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${settings.analytics.gaMeasurementId}`} />
        )}
      </head>
      <body className="font-body antialiased">
        <ToastProvider>
          <StorefrontChrome header={<SiteHeader settings={settings} />} footer={<SiteFooter settings={settings} />}>
            {children}
          </StorefrontChrome>
        </ToastProvider>
      </body>
    </html>
  );
}
