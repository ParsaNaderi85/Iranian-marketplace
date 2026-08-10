"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  approveVendor,
  suspendVendor,
  reactivateVendor,
  updateCommissionRate,
} from "@/lib/admin/actions";
import type { Vendor } from "@/lib/types";

export function AdminVendorRow({
  vendor,
  locale,
}: {
  vendor: Vendor;
  locale: string;
}) {
  const t = useTranslations("admin");
  const [isPending, startTransition] = useTransition();
  const [rate, setRate] = useState(vendor.commission_rate.toString());

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 py-3 last:border-none dark:border-zinc-800">
      <div>
        <p className="font-medium text-zinc-900 dark:text-zinc-50">
          {vendor.name}{" "}
          <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
            ({vendor.type})
          </span>
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {vendor.status}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1 text-sm">
          {t("commissionRate")}
          <input
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="w-20 rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(() =>
              updateCommissionRate(vendor.id, Number(rate), locale),
            )
          }
          className="rounded-md border border-zinc-300 px-2 py-1 text-sm hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          {t("updateCommission")}
        </button>

        {vendor.status === "pending" && (
          <button
            disabled={isPending}
            onClick={() => startTransition(() => approveVendor(vendor.id, locale))}
            className="rounded-md bg-persian-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-persian-700 disabled:opacity-60"
          >
            {t("approve")}
          </button>
        )}
        {vendor.status === "approved" && (
          <button
            disabled={isPending}
            onClick={() => startTransition(() => suspendVendor(vendor.id, locale))}
            className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
          >
            {t("suspend")}
          </button>
        )}
        {vendor.status === "suspended" && (
          <button
            disabled={isPending}
            onClick={() =>
              startTransition(() => reactivateVendor(vendor.id, locale))
            }
            className="rounded-md bg-persian-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-persian-700 disabled:opacity-60"
          >
            {t("reactivate")}
          </button>
        )}
      </div>
    </div>
  );
}
