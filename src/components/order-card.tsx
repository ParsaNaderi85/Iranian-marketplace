import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import type { OrderWithItems } from "@/lib/data/orders";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  out_for_delivery:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  delivered:
    "bg-persian-100 text-persian-800 dark:bg-persian-900/40 dark:text-persian-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export async function OrderCard({
  order,
  actions,
  vendorName,
}: {
  order: OrderWithItems;
  actions?: ReactNode;
  vendorName?: string;
}) {
  const t = await getTranslations("orders");
  const tc = await getTranslations("common");

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium text-zinc-900 dark:text-zinc-50">
            {t("orderNumber", { id: order.id.slice(0, 8) })}
          </p>
          {vendorName && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {vendorName}
            </p>
          )}
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[order.status]}`}
        >
          {t(`status.${order.status}` as "status.pending")}
        </span>
      </div>

      <ul className="mb-3 flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-300">
        {order.order_items.map((item) => (
          <li key={item.id} className="flex justify-between">
            <span>
              {item.quantity}× {item.name_snapshot}
            </span>
            <span>
              {(item.quantity * item.price_snapshot_aed).toFixed(2)}{" "}
              {tc("currency")}
            </span>
          </li>
        ))}
      </ul>

      {order.delivery_fee_aed > 0 && (
        <div className="flex items-center justify-between border-t border-zinc-100 pt-3 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <span>{t("deliveryFeeLabel")}</span>
          <span>
            {order.delivery_fee_aed.toFixed(2)} {tc("currency")}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-zinc-100 pt-3 text-sm dark:border-zinc-800">
        <span className="text-zinc-500 dark:text-zinc-400">
          {t(`paymentMethod.${order.payment_method}` as "paymentMethod.online")}
        </span>
        <span className="font-semibold text-zinc-900 dark:text-zinc-50">
          {order.total_aed.toFixed(2)} {tc("currency")}
        </span>
      </div>

      {actions && <div className="mt-3 flex gap-2">{actions}</div>}
    </div>
  );
}
