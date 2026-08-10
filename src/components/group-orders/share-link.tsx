"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function ShareLink() {
  const t = useTranslations("groupOrders");
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex items-center gap-2 rounded-lg border border-saffron-300 bg-saffron-50 p-4 dark:border-saffron-900 dark:bg-saffron-950">
      <div className="flex-1">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {t("shareTitle")}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("shareHint")}</p>
      </div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="shrink-0 rounded-md bg-saffron-500 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-saffron-400"
      >
        {copied ? t("linkCopied") : t("copyLink")}
      </button>
    </div>
  );
}
