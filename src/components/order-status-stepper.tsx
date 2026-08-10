import { useTranslations } from "next-intl";
import type { OrderStatus } from "@/lib/types";

const STEPS: OrderStatus[] = ["pending", "confirmed", "out_for_delivery", "delivered"];

export function OrderStatusStepper({ status }: { status: OrderStatus }) {
  const t = useTranslations("orders");

  if (status === "cancelled") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
        {t("status.cancelled")}
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => {
        const isDone = i <= currentIndex;
        return (
          <div key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  isDone
                    ? "bg-persian-600 text-white"
                    : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                }`}
              >
                {i + 1}
              </span>
              <span
                className={`max-w-20 text-center text-xs ${
                  isDone
                    ? "font-medium text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-400"
                }`}
              >
                {t(`status.${step}` as "status.pending")}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-1 h-0.5 flex-1 ${
                  i < currentIndex ? "bg-persian-600" : "bg-zinc-100 dark:bg-zinc-800"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
