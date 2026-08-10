"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { addExternalSale } from "@/lib/vendor/external-sales-actions";
import type { ActionState } from "@/lib/vendor/actions";

const CHANNELS = ["whatsapp", "instagram", "walk_in", "other"] as const;
const channelLabelKey = {
  whatsapp: "channelWhatsapp",
  instagram: "channelInstagram",
  walk_in: "channelWalkIn",
  other: "channelOther",
} as const;

export function AddExternalSaleForm({ locale }: { locale: string }) {
  const t = useTranslations("vendorDashboard");
  const tc = useTranslations("common");
  const [state, action, pending] = useActionState<ActionState, FormData>(
    addExternalSale,
    undefined,
  );

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      action={action}
      className="mb-8 flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <input type="hidden" name="locale" value={locale} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="amountAed" className="mb-1 block text-sm font-medium">
            {t("saleAmount")}
          </label>
          <input
            id="amountAed"
            name="amountAed"
            type="number"
            step="0.01"
            min="0"
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div>
          <label htmlFor="saleDate" className="mb-1 block text-sm font-medium">
            {t("saleDate")}
          </label>
          <input
            id="saleDate"
            name="saleDate"
            type="date"
            defaultValue={today}
            max={today}
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
      </div>

      <div>
        <label htmlFor="channel" className="mb-1 block text-sm font-medium">
          {t("saleChannel")}
        </label>
        <select
          id="channel"
          name="channel"
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        >
          {CHANNELS.map((c) => (
            <option key={c} value={c}>
              {t(channelLabelKey[c])}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">
          {t("saleDescription")}
        </label>
        <input
          id="description"
          name="description"
          placeholder="2x Kubideh"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{tc("error")}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-persian-600 px-4 py-2 text-sm font-medium text-white hover:bg-persian-700 disabled:opacity-60"
      >
        {t("logSale")}
      </button>
    </form>
  );
}
