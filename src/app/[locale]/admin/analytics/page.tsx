import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAdminAnalytics } from "@/lib/data/admin-analytics";
import { RevenueChart } from "@/components/vendor/revenue-chart";

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  const [t, tc, tOrders, tv, analytics] = await Promise.all([
    getTranslations("admin"),
    getTranslations("common"),
    getTranslations("orders"),
    getTranslations("vendorTypes"),
    getAdminAnalytics(),
  ]);

  const statusEntries = Object.entries(analytics.ordersByStatus).filter(
    ([, count]) => count > 0,
  );

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("analyticsTitle")}
      </h2>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label={t("gmv")} value={`${analytics.gmv.toFixed(2)} ${tc("currency")}`} />
        <StatTile
          label={t("platformRevenue")}
          value={`${analytics.platformCommissionRevenue.toFixed(2)} ${tc("currency")}`}
        />
        <StatTile label={t("totalOrders")} value={String(analytics.totalOrders)} />
        <StatTile
          label={t("avgOrderValue")}
          value={`${analytics.avgOrderValue.toFixed(2)} ${tc("currency")}`}
        />
      </div>

      <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <RevenueChart data={analytics.revenueByDay} />
      </div>

      <div className="mb-6 grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-3 font-medium text-zinc-900 dark:text-zinc-50">
            {t("vendorsByStatus")}
          </h3>
          <ul className="flex flex-col gap-1 text-sm">
            {Object.entries(analytics.vendorsByStatus).map(([status, count]) => (
              <li key={status} className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-300">{status}</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">{count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-3 font-medium text-zinc-900 dark:text-zinc-50">
            {t("vendorsByType")}
          </h3>
          <ul className="flex flex-col gap-1 text-sm">
            {Object.entries(analytics.vendorsByType).map(([type, count]) => (
              <li key={type} className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-300">
                  {tv(type as "supermarket")}
                </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">{count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-3 font-medium text-zinc-900 dark:text-zinc-50">
            {t("ordersByStatus")}
          </h3>
          <ul className="flex flex-col gap-1 text-sm">
            {statusEntries.map(([status, count]) => (
              <li key={status} className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-300">
                  {tOrders(`status.${status}` as "status.pending")}
                </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-3 font-medium text-zinc-900 dark:text-zinc-50">
          {t("topVendors")}
        </h3>
        <table className="w-full text-sm">
          <tbody>
            {analytics.topVendors.map((v) => (
              <tr key={v.id} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="py-2">
                  <Link href={`/vendors/${v.id}`} className="text-persian-700 hover:underline dark:text-persian-300">
                    {v.name}
                  </Link>
                </td>
                <td className="py-2 text-zinc-500 dark:text-zinc-400">{v.orders} orders</td>
                <td className="py-2 text-end font-medium text-zinc-900 dark:text-zinc-50">
                  {v.revenue.toFixed(2)} {tc("currency")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
