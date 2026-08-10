import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { getVendorByOwnerId } from "@/lib/data/vendors";
import { getCustomersForVendor } from "@/lib/data/vendor-customers";
import { ReminderButton } from "@/components/vendor/reminder-button";

const REMINDER_ELIGIBLE_DAYS = 14;

export default async function VendorCustomersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const profile = await getCurrentProfile();
  const vendor = profile ? await getVendorByOwnerId(profile.id) : null;
  if (!vendor) redirect({ href: "/vendor/onboarding", locale });

  const [t, tc, customers] = await Promise.all([
    getTranslations("vendorDashboard"),
    getTranslations("common"),
    getCustomersForVendor(vendor!.id),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("customersTitle")}
      </h1>

      {customers.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">{t("noCustomersYet")}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
              <tr>
                <th className="px-4 py-2 text-start font-medium">
                  {t("customerName")}
                </th>
                <th className="px-4 py-2 text-end font-medium">
                  {t("customerOrders")}
                </th>
                <th className="px-4 py-2 text-end font-medium">
                  {t("customerTotalSpent")}
                </th>
                <th className="px-4 py-2 text-end font-medium">
                  {t("customerLastOrder")}
                </th>
                <th className="px-4 py-2 text-end font-medium" />
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => {
                const daysSinceLastOrder =
                  (Date.now() - new Date(c.lastOrderAt).getTime()) / 86_400_000;
                return (
                  <tr key={c.customerId} className="border-t border-zinc-100 dark:border-zinc-800">
                    <td className="px-4 py-2 text-zinc-900 dark:text-zinc-50">
                      {c.name}
                    </td>
                    <td className="px-4 py-2 text-end text-zinc-600 dark:text-zinc-300">
                      {c.orderCount}
                    </td>
                    <td className="px-4 py-2 text-end font-medium text-zinc-900 dark:text-zinc-50">
                      {c.totalSpent.toFixed(2)} {tc("currency")}
                    </td>
                    <td className="px-4 py-2 text-end text-zinc-500 dark:text-zinc-400">
                      {c.lastOrderAt.slice(0, 10)}
                    </td>
                    <td className="px-4 py-2 text-end">
                      {daysSinceLastOrder >= REMINDER_ELIGIBLE_DAYS && (
                        <ReminderButton customerId={c.customerId} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
