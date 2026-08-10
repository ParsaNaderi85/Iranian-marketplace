"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createVendorCategory } from "@/lib/vendor/category-actions";
import type { ActionState } from "@/lib/vendor/actions";

export function NewCategoryForm({ locale }: { locale: string }) {
  const t = useTranslations("vendorDashboard");
  const tc = useTranslations("common");
  const [state, action, pending] = useActionState<ActionState, FormData>(
    createVendorCategory,
    undefined,
  );

  return (
    <form action={action} className="mb-6 flex items-end gap-2">
      <input type="hidden" name="locale" value={locale} />
      <div className="flex-1">
        <input
          name="name"
          placeholder={t("newCategoryPlaceholder")}
          required
          maxLength={60}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-persian-600 px-3 py-2 text-sm font-medium text-persian-700 hover:bg-persian-50 disabled:opacity-60 dark:text-persian-300 dark:hover:bg-persian-950"
      >
        {t("addCategory")}
      </button>
      {state?.error && <span className="text-sm text-red-600">{tc("error")}</span>}
    </form>
  );
}
