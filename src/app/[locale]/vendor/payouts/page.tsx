import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { getVendorByOwnerId } from "@/lib/data/vendors";
import {
  getVendorPayoutSummary,
  getVendorPayoutHistory,
} from "@/lib/data/vendor-payouts";

export default async function VendorPayoutsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const profile = await getCurrentProfile();
  const vendor = profile ? await getVendorByOwnerId(profile.id) : null;
  if (!vendor) redirect({ href: "/vendor/onboarding", locale });

  const [summary, history, t, tc] = await Promise.all([
    getVendorPayoutSummary(vendor!.id),
    getVendorPayoutHistory(vendor!.id),
    getTranslations("vendorDashboard"),
    getTranslations("common"),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("payouts")}
      </h1>

      <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("owedToYou")}</p>
        <p className="text-3xl font-bold text-persian-700 dark:text-persian-400">
          {summary.owedAed.toFixed(2)} {tc("currency")}
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          {t("ordersCount", { count: summary.unpaidOrderCount })}
        </p>
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          {t("payoutSettlementNote")}
        </p>
      </div>

      <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {t("payoutHistory")}
      </h2>
      {history.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">{t("noPayoutsYet")}</p>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {history.map((payout) => (
            <div
              key={payout.id}
              className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 last:border-none dark:border-zinc-800"
            >
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {payout.created_at.slice(0, 10)} · {t("ordersCount", { count: payout.order_count })}
              </span>
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {payout.amount_aed.toFixed(2)} {tc("currency")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
