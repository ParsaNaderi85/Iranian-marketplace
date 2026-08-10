"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { advanceOrderStatus, cancelOrder } from "@/lib/vendor/actions";
import type { OrderStatus } from "@/lib/types";

const nextActionLabel: Partial<Record<OrderStatus, string>> = {
  pending: "markConfirmed",
  confirmed: "markOutForDelivery",
  out_for_delivery: "markDelivered",
};

export function VendorOrderActions({
  orderId,
  status,
  locale,
}: {
  orderId: string;
  status: OrderStatus;
  locale: string;
}) {
  const t = useTranslations("vendorDashboard");
  const [isPending, startTransition] = useTransition();
  const nextLabel = nextActionLabel[status];
  const canCancel = status === "pending" || status === "confirmed";

  if (!nextLabel && !canCancel) return null;

  return (
    <>
      {nextLabel && (
        <button
          disabled={isPending}
          onClick={() => startTransition(() => advanceOrderStatus(orderId, locale))}
          className="rounded-md bg-persian-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-persian-700 disabled:opacity-60"
        >
          {t(nextLabel as "markConfirmed")}
        </button>
      )}
      {canCancel && (
        <button
          disabled={isPending}
          onClick={() => startTransition(() => cancelOrder(orderId, locale))}
          className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
        >
          {t("markCancelled")}
        </button>
      )}
    </>
  );
}
