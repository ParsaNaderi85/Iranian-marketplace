import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  const t = await getTranslations("checkout");
  const tOrders = await getTranslations("orders");

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="mb-3 text-2xl font-semibold text-persian-700 dark:text-persian-400">
        {t("orderPlaced")}
      </h1>
      <p className="mb-2 text-zinc-600 dark:text-zinc-300">
        {t("orderPlacedDetail")}
      </p>
      {order && (
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          {tOrders("orderNumber", { id: order.slice(0, 8) })}
        </p>
      )}
      <Link
        href="/orders"
        className="rounded-md bg-persian-600 px-4 py-2 font-medium text-white hover:bg-persian-700"
      >
        {tOrders("title")}
      </Link>
    </div>
  );
}
