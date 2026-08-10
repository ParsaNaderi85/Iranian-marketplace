"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function ReferralPopup() {
  const t = useTranslations("refer");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // First-time visitors see the onboarding flow first; give it room to
    // finish before this popup appears on top of it.
    const isFirstVisit =
      typeof window !== "undefined" && !window.localStorage.getItem("im_onboarded");
    const timer = setTimeout(() => setOpen(true), isFirstVisit ? 10000 : 1500);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-sm rounded-xl border border-saffron-200 bg-white p-6 shadow-xl dark:border-saffron-900 dark:bg-zinc-900">
        <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {t("popupTitle")}
        </h2>
        <p className="mb-5 text-sm text-zinc-600 dark:text-zinc-300">
          {t("popupBody")}
        </p>
        <div className="flex flex-col gap-2">
          <Link
            href="/refer"
            onClick={dismiss}
            className="rounded-md bg-saffron-500 px-4 py-2 text-center font-medium text-zinc-900 hover:bg-saffron-400"
          >
            {t("popupCta")}
          </Link>
          <button
            onClick={dismiss}
            className="rounded-md px-4 py-2 text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            {t("popupDismiss")}
          </button>
        </div>
      </div>
    </div>
  );
}
