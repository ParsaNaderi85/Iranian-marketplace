"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toggleCampaign } from "@/lib/admin/actions";
import type { Campaign } from "@/lib/types";

export function CampaignRow({
  campaign,
  locale,
}: {
  campaign: Campaign;
  locale: string;
}) {
  const t = useTranslations("admin");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between border-b border-zinc-100 py-3 last:border-none dark:border-zinc-800">
      <div>
        <p className="font-medium text-zinc-900 dark:text-zinc-50">
          {campaign.title}
          {campaign.discount_percent && (
            <span className="ms-2 text-sm font-normal text-saffron-600 dark:text-saffron-400">
              -{campaign.discount_percent}%
            </span>
          )}
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{campaign.message}</p>
        <p className="text-xs text-zinc-400">
          {campaign.starts_at.slice(0, 10)} → {campaign.ends_at.slice(0, 10)}
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={campaign.active}
          disabled={isPending}
          onChange={(e) =>
            startTransition(() =>
              toggleCampaign(campaign.id, e.target.checked, locale),
            )
          }
        />
        {t("campaignActive")}
      </label>
    </div>
  );
}
