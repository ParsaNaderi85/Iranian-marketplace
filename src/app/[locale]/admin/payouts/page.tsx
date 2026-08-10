import { getTranslations } from "next-intl/server";
import { getAllPayoutSummaries } from "@/lib/data/vendor-payouts";
import { PayoutRow } from "@/components/admin/payout-row";

export default async function AdminPayoutsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [summaries, t] = await Promise.all([
    getAllPayoutSummaries(),
    getTranslations("admin"),
  ]);

  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {t("payouts")}
      </h2>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        {t("payoutsHint")}
      </p>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        {summaries.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">{t("noPayoutsOwed")}</p>
        ) : (
          summaries.map((summary) => (
            <PayoutRow key={summary.vendorId} summary={summary} locale={locale} />
          ))
        )}
      </div>
    </div>
  );
}
