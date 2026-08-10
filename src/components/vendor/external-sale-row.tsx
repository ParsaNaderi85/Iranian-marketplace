"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { deleteExternalSale } from "@/lib/vendor/external-sales-actions";
import type { ExternalSale } from "@/lib/types";

const channelLabelKey = {
  whatsapp: "channelWhatsapp",
  instagram: "channelInstagram",
  walk_in: "channelWalkIn",
  other: "channelOther",
} as const;

export function ExternalSaleRow({
  sale,
  locale,
  currency,
}: {
  sale: ExternalSale;
  locale: string;
  currency: string;
}) {
  const t = useTranslations("vendorDashboard");
  const tc = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between gap-3 border-b border-zinc-100 py-3 last:border-none dark:border-zinc-800">
      <div>
        <p className="font-medium text-zinc-900 dark:text-zinc-50">
          {sale.amount_aed.toFixed(2)} {currency}
          <span className="ms-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {t(channelLabelKey[sale.channel])}
          </span>
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {sale.sale_date}
          {sale.description ? ` — ${sale.description}` : ""}
        </p>
      </div>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => deleteExternalSale(sale.id, locale))}
        className="text-sm text-red-600 hover:underline disabled:opacity-60"
      >
        {tc("delete")}
      </button>
    </div>
  );
}
