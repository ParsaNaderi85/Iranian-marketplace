import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
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

  const [orders, t] = await Promise.all([
    getOrdersForVendor(vendor!.id),
    getTranslations("vendorDashboard"),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("orders")}
      </h1>
      {orders.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">{t("noOrders")}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              actions={
                <VendorOrderActions
                  orderId={order.id}
                  status={order.status}
                  locale={locale}
                />
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
