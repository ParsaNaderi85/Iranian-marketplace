import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { getVendorByOwnerId } from "@/lib/data/vendors";
import { VendorImagesForm } from "@/components/vendor/vendor-images-form";

export default async function VendorSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const profile = await getCurrentProfile();
  const vendor = profile ? await getVendorByOwnerId(profile.id) : null;
  if (!vendor) redirect({ href: "/vendor/onboarding", locale });

  const t = await getTranslations("vendorDashboard");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("settings")}
      </h1>
      <VendorImagesForm
        locale={locale}
        logoUrl={vendor!.logo_url}
        bannerUrl={vendor!.banner_url}
      />
    </div>
  );
}
