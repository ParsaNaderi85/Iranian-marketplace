import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { redirect, Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getOrderForCustomer } from "@/lib/data/orders";
import { getVendorById } from "@/lib/data/vendors";
import { OrderStatusStepper } from "@/components/order-status-stepper";
import { OrderMap } from "@/components/order-map";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect({ href: "/login", locale });

  const order = await getOrderForCustomer(id, user!.id);
  if (!order) notFound();

  const [vendor, t, tc, tInvoice] = await Promise.all([
    getVendorById(order.vendor_id),
    getTranslations("orders"),
    getTranslations("common"),
    getTranslations("invoice"),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("orderNumber", { id: order.id.slice(0, 8) })}
      </h1>
      {vendor && (
        <p className="mb-1 text-sm text-zinc-500 dark:text-zinc-400">{vendor.name}</p>
      )}
      <Link
        href={`/invoice/${order.id}`}
        className="mb-6 inline-block text-sm text-persian-700 hover:underline dark:text-persian-300"
      >
        {tInvoice("title")}
      </Link>

      <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <OrderStatusStepper status={order.status} />
      </div>

      {vendor?.latitude && vendor?.longitude && (
        <div className="mb-8 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <OrderMap
            vendor={{ lat: vendor.latitude, lng: vendor.longitude }}
            delivery={
              order.delivery_lat && order.delivery_lng
                ? { lat: order.delivery_lat, lng: order.delivery_lng }
                : null
            }
            vendorLabel={vendor.name}
            deliveryLabel={t("deliveryAddress")}
          />
        </div>
      )}

      <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 font-medium text-zinc-900 dark:text-zinc-50">
          {t("title")}
        </h2>
        <ul className="mb-4 flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-300">
          {order.order_items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>
                {item.quantity}× {item.name_snapshot}
              </span>
              <span>
                {(item.quantity * item.price_snapshot_aed).toFixed(2)} {tc("currency")}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-1 border-t border-zinc-100 pt-3 text-sm dark:border-zinc-800">
          <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
            <span>{t("deliveryAddress")}</span>
            <span>
              {order.delivery_line1}, {order.delivery_area}
            </span>
          </div>
          {order.delivery_fee_aed > 0 && (
            <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
              <span>{t("deliveryFeeLabel")}</span>
              <span>
                {order.delivery_fee_aed.toFixed(2)} {tc("currency")}
              </span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-zinc-900 dark:text-zinc-50">
            <span>{tc("confirm")}</span>
            <span>
              {order.total_aed.toFixed(2)} {tc("currency")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
