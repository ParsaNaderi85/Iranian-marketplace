import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { getVendorByOwnerId } from "@/lib/data/vendors";
import { OnboardingForm } from "@/components/vendor/onboarding-form";

export default async function VendorOnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const profile = await getCurrentProfile();
  const existing = profile ? await getVendorByOwnerId(profile.id) : null;

  if (existing) {
    redirect({ href: "/vendor", locale });
  }

  const t = await getTranslations("vendorOnboarding");

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("title")}
      </h1>
      <OnboardingForm locale={locale} />
    </div>
  );
}
