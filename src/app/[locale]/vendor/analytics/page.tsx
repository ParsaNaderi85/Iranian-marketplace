import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { getVendorByOwnerId } from "@/lib/data/vendors";
import { getVendorAnalytics } from "@/lib/data/vendor-analytics";
import { RevenueChart } from "@/components/vendor/revenue-chart";
import { InfoTooltip } from "@/components/info-tooltip";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500",
  confirmed: "bg-blue-500",
  out_for_delivery: "bg-purple-500",
  delivered: "bg-persian-500",
  cancelled: "bg-red-500",
};

function StatTile({
  label,
  value,
  help,
}: {
  label: string;
  value: string;
  help?: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        {label}
        {help && <InfoTooltip text={help} />}
      </p>
      <p className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
    </div>
  );
}

function SectionHeading({
  children,
  help,
}: {
  children: React.ReactNode;
  help?: string;
}) {
  return (
    <h2 className="mb-4 mt-10 flex items-center gap-1.5 text-lg font-semibold text-persian-700 first:mt-0 dark:text-persian-300">
      {children}
      {help && <InfoTooltip text={help} />}
    </h2>
  );
}

function CardHeading({
  children,
  help,
}: {
  children: React.ReactNode;
  help?: string;
}) {
  return (
    <h3 className="mb-3 flex items-center gap-1.5 font-medium text-zinc-900 dark:text-zinc-50">
      {children}
      {help && <InfoTooltip text={help} />}
    </h3>
  );
}

function ProductTable({
  products,
  currency,
}: {
  products: { name: string; quantity: number; revenue: number }[];
  currency: string;
}) {
  return (
    <table className="w-full text-sm">
      <tbody>
        {products.map((p) => (
          <tr key={p.name} className="border-t border-zinc-100 dark:border-zinc-800">
            <td className="py-2 text-zinc-900 dark:text-zinc-50">{p.name}</td>
            <td className="py-2 text-zinc-500 dark:text-zinc-400">×{p.quantity}</td>
            <td className="py-2 text-end font-medium text-zinc-900 dark:text-zinc-50">
              {p.revenue.toFixed(2)} {currency}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function VendorAnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const profile = await getCurrentProfile();
  const vendor = profile ? await getVendorByOwnerId(profile.id) : null;
  if (!vendor) redirect({ href: "/vendor/onboarding", locale });

  const [t, tc, tOrders, h] = await Promise.all([
    getTranslations("vendorDashboard"),
    getTranslations("common"),
    getTranslations("orders"),
    getTranslations("vendorDashboard.help"),
  ]);
  const analytics = await getVendorAnalytics(vendor!.id);

  if (analytics.totalOrders === 0 && analytics.externalRevenue === 0) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {t("analyticsTitle")}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">{t("noAnalyticsYet")}</p>
      </div>
    );
  }

  const statusEntries = Object.entries(analytics.ordersByStatus).filter(
    ([, count]) => count > 0,
  );
  const maxStatusCount = Math.max(...statusEntries.map(([, c]) => c), 1);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("analyticsTitle")}
      </h1>

      {/* 1. Revenue & sales performance */}
      <SectionHeading>{t("sectionRevenue")}</SectionHeading>
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatTile
          label={t("gmv")}
          value={`${analytics.gmv.toFixed(2)} ${tc("currency")}`}
          help={h("gmv")}
        />
        <StatTile
          label={t("netRevenue")}
          value={`${analytics.netRevenue.toFixed(2)} ${tc("currency")}`}
          help={h("netRevenue")}
        />
        <StatTile
          label={t("avgOrderValue")}
          value={`${analytics.avgOrderValue.toFixed(2)} ${tc("currency")}`}
          help={h("avgOrderValue")}
        />
        <StatTile
          label={t("salesGrowthRate")}
          value={
            analytics.salesGrowthRate === null
              ? "—"
              : `${analytics.salesGrowthRate >= 0 ? "+" : ""}${analytics.salesGrowthRate.toFixed(1)}%`
          }
          help={h("salesGrowthRate")}
        />
        <StatTile
          label={t("combinedRevenue")}
          value={`${analytics.combinedRevenue.toFixed(2)} ${tc("currency")}`}
          help={h("combinedRevenue")}
        />
        <StatTile
          label={t("marketplaceRevenue")}
          value={`${analytics.marketplaceRevenue.toFixed(2)} ${tc("currency")}`}
          help={h("marketplaceRevenue")}
        />
        <StatTile
          label={t("externalRevenue")}
          value={`${analytics.externalRevenue.toFixed(2)} ${tc("currency")}`}
          help={h("externalRevenue")}
        />
        <StatTile
          label={t("commissionPaid")}
          value={`${analytics.totalCommission.toFixed(2)} ${tc("currency")}`}
          help={h("commissionPaid")}
        />
      </div>

      <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <RevenueChart data={analytics.revenueByDay} />
      </div>

      <div className="mb-2 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <CardHeading help={h("ordersByStatus")}>{t("ordersByStatus")}</CardHeading>
          <div className="flex flex-col gap-2">
            {statusEntries.map(([status, count]) => (
              <div key={status} className="flex items-center gap-2">
                <span className="w-32 shrink-0 text-sm text-zinc-600 dark:text-zinc-300">
                  {tOrders(`status.${status}` as "status.pending")}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className={`h-full rounded-full ${STATUS_COLORS[status]}`}
                    style={{ width: `${(count / maxStatusCount) * 100}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-end text-sm text-zinc-500">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <CardHeading help={h("paymentMethods")}>{t("paymentMethods")}</CardHeading>
          <div className="flex flex-col gap-3">
            {(["online", "cod"] as const).map((method) => (
              <div key={method} className="flex items-center justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-300">
                  {tOrders(`paymentMethod.${method}` as "paymentMethod.online")}
                </span>
                <span className="text-zinc-900 dark:text-zinc-50">
                  {analytics.paymentBreakdown[method].count} —{" "}
                  {analytics.paymentBreakdown[method].revenue.toFixed(2)} {tc("currency")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Customer dynamics & retention */}
      <SectionHeading>{t("sectionCustomers")}</SectionHeading>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatTile
          label={t("uniqueCustomers")}
          value={String(analytics.uniqueCustomers)}
          help={h("uniqueCustomers")}
        />
        <StatTile
          label={t("repeatCustomers")}
          value={String(analytics.repeatCustomers)}
          help={h("repeatCustomers")}
        />
        <StatTile
          label={t("repeatBuyerRate")}
          value={`${analytics.repeatBuyerRate.toFixed(1)}%`}
          help={h("repeatBuyerRate")}
        />
        <StatTile
          label={t("cancellationRate")}
          value={`${analytics.cancellationRate.toFixed(1)}%`}
          help={h("cancellationRate")}
        />
        <StatTile
          label={t("avgRating")}
          value={
            analytics.rating.count > 0
              ? `${analytics.rating.average.toFixed(1)} (${analytics.rating.count})`
              : "—"
          }
          help={h("avgRating")}
        />
        <StatTile
          label={t("avgRating30d")}
          value={
            analytics.rating30d.count > 0
              ? `${analytics.rating30d.average.toFixed(1)} (${analytics.rating30d.count})`
              : "—"
          }
          help={h("avgRating30d")}
        />
      </div>

      {/* 5. Product & pricing intelligence */}
      <SectionHeading>{t("sectionProducts")}</SectionHeading>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <CardHeading help={h("topProductsByRevenue")}>
            {t("topProductsByRevenue")}
          </CardHeading>
          <ProductTable products={analytics.topProductsByRevenue} currency={tc("currency")} />
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <CardHeading help={h("topProductsByVolume")}>
            {t("topProductsByVolume")}
          </CardHeading>
          <ProductTable products={analytics.topProductsByVolume} currency={tc("currency")} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <CardHeading help={h("deadStockAlerts")}>{t("deadStockAlerts")}</CardHeading>
          <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
            {t("deadStockBody")}
          </p>
          {analytics.deadStock.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("noDeadStock")}</p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {analytics.deadStock.map((p) => (
                <li key={p.id} className="text-amber-700 dark:text-amber-400">
                  {p.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <CardHeading help={h("priceCompetitiveness")}>
            {t("priceCompetitiveness")}
          </CardHeading>
          <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
            {t("priceCompetitivenessBody")}
          </p>
          {analytics.priceCompetitiveness.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("noPriceData")}</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {analytics.priceCompetitiveness.map((p) => (
                <li key={p.id} className="flex items-center justify-between">
                  <span className="text-zinc-900 dark:text-zinc-50">{p.name}</span>
                  <span
                    className={
                      p.diffPercent > 0
                        ? "text-anar-600 dark:text-anar-400"
                        : "text-persian-700 dark:text-persian-300"
                    }
                  >
                    {p.diffPercent > 0 ? "+" : ""}
                    {p.diffPercent.toFixed(0)}%{" "}
                    {p.diffPercent > 0 ? t("aboveAverage") : t("belowAverage")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
