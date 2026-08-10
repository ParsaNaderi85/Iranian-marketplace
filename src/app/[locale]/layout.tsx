import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { routing, localeDirections, type Locale } from "@/i18n/routing";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PersianDivider } from "@/components/persian-divider";
import { CartProvider } from "@/lib/cart/cart-context";
import { AssistantWidget } from "@/components/assistant-widget";
import { OnboardingFlow } from "@/components/onboarding-flow";
import { CampaignBanner } from "@/components/campaign-banner";
import { getActiveCampaign } from "@/lib/data/campaigns";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });
  return {
    title: t("appName"),
    description: t("tagline"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const [messages, activeCampaign] = await Promise.all([
    getMessages(),
    getActiveCampaign(),
  ]);
  const dir = localeDirections[locale as Locale];

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
        <NextIntlClientProvider messages={messages}>
          <CartProvider>
            {activeCampaign && <CampaignBanner campaign={activeCampaign} />}
            <PersianDivider />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <AssistantWidget />
            <OnboardingFlow />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
