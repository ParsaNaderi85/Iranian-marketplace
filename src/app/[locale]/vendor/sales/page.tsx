import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { getVendorByOwnerId } from "@/lib/data/vendors";
import { getExternalSalesForVendor } from "@/lib/data/external-sales";
import { AddExternalSaleForm } from "@/components/vendor/add-external-sale-form";
import { ExternalSaleRow } from "@/components/vendor/external-sale-row";

export default async function VendorSalesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const profile = await getCurrentProfile();
  const vendor = profile ? await getVendorByOwnerId(profile.id) : null;
  if (!vendor) redirect({ href: "/vendor/onboarding", locale });

  const [t, tc, sales] = await Promise.all([
    getTranslations("vendorDashboard"),
    getTranslations("common"),
    getExternalSalesForVendor(vendor!.id),
  ]);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("externalSales")}
      </h1>
      <p className="mb-6 max-w-xl text-sm text-zinc-500 dark:text-zinc-400">
        {t("externalRevenue")}
      </p>

      <AddExternalSaleForm locale={locale} />

      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        {sales.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">{t("noExternalSales")}</p>
        ) : (
          sales.map((sale) => (
            <ExternalSaleRow key={sale.id} sale={sale} locale={locale} currency={tc("currency")} />
          ))
        )}
      </div>
    </div>
  );
}
