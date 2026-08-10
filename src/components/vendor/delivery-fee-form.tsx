"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { updateDeliveryFee, type ActionState } from "@/lib/vendor/actions";

export function DeliveryFeeForm({
  locale,
  currentFee,
}: {
  locale: string;
  currentFee: number;
}) {
  const t = useTranslations("vendorDashboard");
  const tc = useTranslations("common");
  const [state, action, pending] = useActionState<ActionState, FormData>(
    updateDeliveryFee,
    undefined,
  );

  return (
    <form action={action} className="mb-6 flex items-end gap-3">
      <input type="hidden" name="locale" value={locale} />
      <div>
        <label htmlFor="deliveryFeeAed" className="mb-1 block text-sm font-medium">
          {t("deliveryFee")}
        </label>
        <input
          id="deliveryFeeAed"
          name="deliveryFeeAed"
          type="number"
          step="0.01"
          min="0"
          defaultValue={currentFee}
          className="w-32 rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-persian-600 px-4 py-2 text-sm font-medium text-persian-700 hover:bg-persian-50 disabled:opacity-60 dark:text-persian-300 dark:hover:bg-persian-950"
      >
        {tc("save")}
      </button>
      {state?.error && <p className="text-sm text-red-600">{tc("error")}</p>}
    </form>
  );
}
