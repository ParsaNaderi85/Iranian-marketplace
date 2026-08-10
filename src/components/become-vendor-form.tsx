"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  submitVendorApplication,
  type ActionState,
} from "@/lib/vendor-applications/actions";
import { VENDOR_TYPES } from "@/lib/types";

export function BecomeVendorForm() {
  const t = useTranslations("becomeVendor");
  const tv = useTranslations("vendorTypes");
  const tc = useTranslations("common");
  const [state, action, pending] = useActionState<ActionState, FormData>(
    submitVendorApplication,
    undefined,
  );

  if (state?.success) {
    return (
      <p className="rounded-lg border border-persian-200 bg-persian-50 p-4 text-persian-800 dark:border-persian-900 dark:bg-persian-950 dark:text-persian-200">
        {t("success")}
      </p>
    );
  }

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div>
        <label className="mb-1 block text-sm font-medium">{t("businessName")}</label>
        <input
          name="businessName"
          required
          className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">{t("businessType")}</label>
        <select
          name="businessType"
          required
          className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        >
          {VENDOR_TYPES.map((type) => (
            <option key={type} value={type}>
              {tv(type)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">{t("area")}</label>
        <input
          name="area"
          placeholder={t("areaPlaceholder")}
          className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">{t("contactName")}</label>
          <input
            name="contactName"
            required
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t("contactPhone")}</label>
          <input
            name="contactPhone"
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">{t("contactEmail")}</label>
        <input
          type="email"
          name="contactEmail"
          required
          className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">{t("message")}</label>
        <textarea
          name="message"
          rows={3}
          placeholder={t("messagePlaceholder")}
          className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
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
        {pending ? tc("loading") : t("submit")}
      </button>
    </form>
  );
}
