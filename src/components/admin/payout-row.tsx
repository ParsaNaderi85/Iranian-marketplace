"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { markVendorPaidOut } from "@/lib/admin/actions";
import type { PayoutSummary } from "@/lib/data/vendor-payouts";

export function PayoutRow({
  summary,
  locale,
}: {
  summary: PayoutSummary;
  locale: string;
}) {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between border-b border-zinc-100 py-3 last:border-none dark:border-zinc-800">
      <div>
        <p className="font-medium text-zinc-900 dark:text-zinc-50">
          {summary.vendorName}
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {t("ordersCount", { count: summary.unpaidOrderCount })}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-semibold text-zinc-900 dark:text-zinc-50">
          {summary.owedAed.toFixed(2)} {tc("currency")}
        </span>
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(() => markVendorPaidOut(summary.vendorId, locale))
          }
          className="rounded-md bg-persian-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-persian-700 disabled:opacity-60"
        >
          {t("markPaid")}
        </button>
      </div>
    </div>
  );
}
