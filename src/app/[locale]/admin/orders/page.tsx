import { getTranslations } from "next-intl/server";
import { getAllOrders } from "@/lib/data/orders";
import { OrderCard } from "@/components/order-card";

export default async function AdminOrdersPage() {
  const [orders, t] = await Promise.all([
    getAllOrders(),
    getTranslations("orders"),
  ]);

  return (
    <div>
      {orders.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">{t("empty")}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
