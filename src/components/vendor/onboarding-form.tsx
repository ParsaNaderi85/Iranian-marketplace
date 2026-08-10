"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createVendorProfile, type ActionState } from "@/lib/vendor/actions";
import { VENDOR_TYPES } from "@/lib/types";

export function OnboardingForm({ locale }: { locale: string }) {
  const t = useTranslations("vendorOnboarding");
  const tc = useTranslations("common");
  const tv = useTranslations("vendorTypes");
  const [state, action, pending] = useActionState<ActionState, FormData>(
    createVendorProfile,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          {t("storeName")}
        </label>
        <input
          id="name"
          name="name"
          required
          minLength={2}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div>
        <label htmlFor="type" className="mb-1 block text-sm font-medium">
          {t("storeType")}
        </label>
        <select
          id="type"
          name="type"
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          {VENDOR_TYPES.map((type) => (
            <option key={type} value={type}>
              {tv(type)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="address" className="mb-1 block text-sm font-medium">
          {t("address")}
        </label>
        <input
          id="address"
          name="address"
          required
          minLength={3}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">
          {t("description")}
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600">{tc("error")}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-persian-600 px-4 py-2 font-medium text-white hover:bg-persian-700 disabled:opacity-60"
      >
        {t("submit")}
      </button>
    </form>
  );
}
