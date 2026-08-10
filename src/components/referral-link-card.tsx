"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function ReferralLinkCard({ link }: { link: string }) {
  const t = useTranslations("refer");
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg border border-persian-200 bg-persian-50 p-4 dark:border-persian-800 dark:bg-persian-950/40">
      <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {t("yourLink")}
      </p>
      <div className="flex gap-2">
        <input
          readOnly
          value={link}
          className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          onClick={handleCopy}
          className="rounded-md bg-persian-600 px-4 py-2 text-sm font-medium text-white hover:bg-persian-700"
        >
          {copied ? t("copied") : t("copy")}
        </button>
      </div>
    </div>
  );
}
