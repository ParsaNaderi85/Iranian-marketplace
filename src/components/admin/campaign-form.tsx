"use client";

import { useActionState, useRef } from "react";
import { useTranslations } from "next-intl";
import { createCampaign, type ActionState } from "@/lib/admin/actions";

export function CampaignForm({ locale }: { locale: string }) {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const result = await createCampaign(prev, formData);
      if (!result?.error) formRef.current?.reset();
      return result;
    },
    undefined,
  );

  return (
    <form
      ref={formRef}
      action={action}
      className="mb-6 flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <input type="hidden" name="locale" value={locale} />
      <div>
        <label className="mb-1 block text-sm font-medium">{t("campaignTitle")}</label>
        <input
          name="title"
          required
          placeholder="Nowruz Sale"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{t("campaignMessage")}</label>
        <textarea
          name="message"
          required
          rows={2}
          placeholder="Celebrate Nowruz with 15% off across the marketplace!"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">
            {t("campaignDiscount")}
          </label>
          <input
            name="discountPercent"
            type="number"
            min="1"
            max="100"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t("campaignStarts")}</label>
          <input
            name="startsAt"
            type="date"
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t("campaignEnds")}</label>
          <input
            name="endsAt"
            type="date"
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
      </div>
      {state?.error && <p className="text-sm text-red-600">{tc("error")}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-persian-600 px-4 py-2 text-sm font-medium text-white hover:bg-persian-700 disabled:opacity-60"
      >
        {t("campaignCreate")}
      </button>
    </form>
  );
}
