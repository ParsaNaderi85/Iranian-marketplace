import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentUser, getCurrentProfile } from "@/lib/auth/session";
import { getOrderForInvoice } from "@/lib/data/orders";
import { getVendorById } from "@/lib/data/vendors";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { PrintButton } from "@/components/print-button";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);
  if (!user) notFound();

  const order = await getOrderForInvoice(id, user.id, profile?.role === "admin");
  if (!order) notFound();

  const [vendor, t, tc, tOrders] = await Promise.all([
    getVendorById(order.vendor_id),
    getTranslations("invoice"),
    getTranslations("common"),
    getTranslations("orders"),
  ]);

  const service = await createServiceRoleClient();
  const { data: customerProfile } = await service
    .from("profiles")
    .select("full_name")
    .eq("id", order.customer_id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 print:py-0">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {t("title")}
        </h1>
        <PrintButton label={t("print")} />
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 print:border-none print:p-0">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {t("invoiceNumber", { id: order.id.slice(0, 8) })}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t("date")}: {order.created_at.slice(0, 10)}
            </p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="mb-1 font-medium text-zinc-900 dark:text-zinc-50">
              {t("soldBy")}
            </p>
            <p className="text-zinc-600 dark:text-zinc-300">{vendor?.name}</p>
            {vendor?.address && (
              <p className="text-zinc-500 dark:text-zinc-400">{vendor.address}</p>
            )}
          </div>
          <div>
            <p className="mb-1 font-medium text-zinc-900 dark:text-zinc-50">
              {t("billedTo")}
            </p>
            <p className="text-zinc-600 dark:text-zinc-300">
              {customerProfile?.full_name ?? "—"}
            </p>
            <p className="text-zinc-500 dark:text-zinc-400">
              {order.delivery_line1}, {order.delivery_area}
            </p>
          </div>
        </div>

        <table className="mb-6 w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700">
              <th className="py-2 text-start font-medium">{t("item")}</th>
              <th className="py-2 text-end font-medium">{t("qty")}</th>
              <th className="py-2 text-end font-medium">{t("unitPrice")}</th>
              <th className="py-2 text-end font-medium">{t("lineTotal")}</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items.map((item) => (
              <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="py-2">{item.name_snapshot}</td>
                <td className="py-2 text-end">{item.quantity}</td>
                <td className="py-2 text-end">
                  {item.price_snapshot_aed.toFixed(2)} {tc("currency")}
                </td>
                <td className="py-2 text-end">
                  {(item.quantity * item.price_snapshot_aed).toFixed(2)} {tc("currency")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ms-auto flex max-w-xs flex-col gap-1 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500 dark:text-zinc-400">{t("subtotal")}</span>
            <span>{order.subtotal_aed.toFixed(2)} {tc("currency")}</span>
          </div>
          {order.delivery_fee_aed > 0 && (
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">{t("deliveryFee")}</span>
              <span>{order.delivery_fee_aed.toFixed(2)} {tc("currency")}</span>
            </div>
          )}
          <div className="flex justify-between text-zinc-400">
            <span>{t("commission")}</span>
            <span>-{order.commission_amount_aed.toFixed(2)} {tc("currency")}</span>
          </div>
          <div className="flex justify-between border-t border-zinc-200 pt-1 font-semibold text-zinc-900 dark:border-zinc-700 dark:text-zinc-50">
            <span>{t("grandTotal")}</span>
            <span>{order.total_aed.toFixed(2)} {tc("currency")}</span>
          </div>
          <div className="mt-2 flex justify-between text-xs text-zinc-400">
            <span>{t("paymentMethod")}</span>
            <span>
              {tOrders(`paymentMethod.${order.payment_method}` as "paymentMethod.online")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
