import { getTranslations } from "next-intl/server";
import { redirect, Link } from "@/i18n/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { getVendorByOwnerId } from "@/lib/data/vendors";
import { getOrdersForVendor } from "@/lib/data/orders";
import { OrderCard } from "@/components/order-card";
import { VendorOrderActions } from "@/components/vendor/order-actions";

export default async function VendorOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const profile = await getCurrentProfile();
  const vendor = profile ? await getVendorByOwnerId(profile.id) : null;
  if (!vendor) redirect({ href: "/vendor/onboarding", locale });

  const [orders, t, tInvoice] = await Promise.all([
    getOrdersForVendor(vendor!.id),
    getTranslations("vendorDashboard"),
    getTranslations("invoice"),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {t("orders")}
        </h1>
        {orders.length > 0 && (
          <a
            href="/api/vendor/orders/export"
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            {t("exportCsv")}
          </a>
        )}
      </div>
      {orders.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">{t("noOrders")}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              actions={
                <>
                  <VendorOrderActions
                    orderId={order.id}
                    status={order.status}
                    locale={locale}
                  />
                  <Link
                    href={`/invoice/${order.id}`}
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
                  >
                    {tInvoice("title")}
                  </Link>
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
