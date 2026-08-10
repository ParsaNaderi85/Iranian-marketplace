"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { updateVendorImages, type ActionState } from "@/lib/vendor/actions";

export function VendorImagesForm({
  locale,
  logoUrl,
  bannerUrl,
}: {
  locale: string;
  logoUrl: string | null;
  bannerUrl: string | null;
}) {
  const t = useTranslations("vendorDashboard");
  const tc = useTranslations("common");
  const [state, action, pending] = useActionState<ActionState, FormData>(
    updateVendorImages,
    undefined,
  );

  return (
    <form
      action={action}
      className="flex flex-col gap-5 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <input type="hidden" name="locale" value={locale} />

      <div>
        <label className="mb-2 block text-sm font-medium">{t("logo")}</label>
        <div className="flex items-center gap-4">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-16 w-16 rounded-lg object-cover" />
          ) : (
            <div className="h-16 w-16 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
          )}
          <input type="file" name="logo" accept="image/png,image/jpeg,image/webp" />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">{t("banner")}</label>
        {bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bannerUrl}
            alt=""
            className="mb-2 h-24 w-full rounded-lg object-cover"
          />
        ) : (
          <div className="mb-2 h-24 w-full rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        )}
        <input type="file" name="banner" accept="image/png,image/jpeg,image/webp" />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("bannerHint")}</p>
      </div>

      {state?.error && <p className="text-sm text-red-600">{tc("error")}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-persian-600 px-4 py-2 font-medium text-white hover:bg-persian-700 disabled:opacity-60"
      >
        {pending ? tc("loading") : tc("save")}
      </button>
    </form>
  );
}
