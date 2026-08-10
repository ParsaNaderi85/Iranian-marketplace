import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getGroupOrder, getGroupOrderItems } from "@/lib/data/group-orders";
import { getVendorById, getAvailableProductsForVendor } from "@/lib/data/vendors";
import { AddItemForm } from "@/components/group-orders/add-item-form";
import { ShareLink } from "@/components/group-orders/share-link";
import { ItemRow } from "@/components/group-orders/item-row";
import { GroupOrderCheckoutForm } from "@/components/group-orders/checkout-form";

export default async function GroupOrderPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const groupOrder = await getGroupOrder(id);
  if (!groupOrder) notFound();

  const [vendor, products, items, user, t, tc] = await Promise.all([
    getVendorById(groupOrder.vendor_id),
    getAvailableProductsForVendor(groupOrder.vendor_id),
    getGroupOrderItems(id),
    getCurrentUser(),
    getTranslations("groupOrders"),
    getTranslations("common"),
  ]);
  if (!vendor) notFound();

  const isOrganizer = user?.id === groupOrder.organizer_id;
  const grandTotal = items.reduce((sum, i) => sum + i.priceAed * i.quantity, 0);

  const byContributor = new Map<string, { name: string; items: typeof items }>();
  for (const item of items) {
    const bucket = byContributor.get(item.contributorId) ?? {
      name: item.contributorName,
      items: [],
    };
    bucket.items.push(item);
    byContributor.set(item.contributorId, bucket);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("title")}
      </h1>
      <p className="mb-6 text-zinc-600 dark:text-zinc-300">
        {t("forVendor", { vendor: vendor.name })}
      </p>

      {groupOrder.status === "checked_out" ? (
        <div className="rounded-lg border border-persian-200 bg-persian-50 p-6 text-center dark:border-persian-900 dark:bg-persian-950">
          <p className="mb-3 text-persian-800 dark:text-persian-200">{t("alreadyCheckedOut")}</p>
          {isOrganizer && groupOrder.order_id && (
            <Link
              href={`/orders/${groupOrder.order_id}`}
              className="font-medium text-persian-700 underline dark:text-persian-300"
            >
              {t("viewOrder")}
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="mb-6">
            <ShareLink />
          </div>

          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {t("addYourItems")}
          </h2>
          <div className="mb-6">
            <AddItemForm groupOrderId={id} products={products} />
          </div>

          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {t("contributions")}
          </h2>
          {items.length === 0 ? (
            <p className="mb-6 text-zinc-500 dark:text-zinc-400">{t("noItemsYet")}</p>
          ) : (
            <div className="mb-6 flex flex-col gap-4">
              {Array.from(byContributor.entries()).map(([contributorId, bucket]) => (
                <div
                  key={contributorId}
                  className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <p className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {bucket.name}
                  </p>
                  {bucket.items.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      canRemove={item.contributorId === user?.id || isOrganizer}
                    />
                  ))}
                </div>
              ))}
              <div className="flex items-center justify-between rounded-lg bg-zinc-100 px-4 py-3 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
                <span>{t("grandTotal")}</span>
                <span>
                  {grandTotal.toFixed(2)} {tc("currency")}
                </span>
              </div>
            </div>
          )}

          {isOrganizer && items.length > 0 && (
            <GroupOrderCheckoutForm groupOrderId={id} locale={locale} />
          )}
          {!isOrganizer && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t("onlyOrganizerCanCheckout")}
            </p>
          )}
        </>
      )}
    </div>
  );
}
