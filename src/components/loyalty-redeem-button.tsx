"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { redeemLoyaltyPoints } from "@/lib/loyalty/actions";

export function LoyaltyRedeemButton({
  locale,
  canRedeem,
}: {
  locale: string;
  canRedeem: boolean;
}) {
  const t = useTranslations("loyalty");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ error?: string; code?: string } | null>(null);

  return (
    <div>
      <button
        disabled={!canRedeem || isPending}
        onClick={() =>
          startTransition(async () => {
            setResult(await redeemLoyaltyPoints(locale));
          })
        }
        className="rounded-md bg-persian-600 px-4 py-2 font-medium text-white hover:bg-persian-700 disabled:opacity-50"
      >
        {isPending ? t("redeeming") : t("redeemButton")}
      </button>
      {result?.code && (
        <p className="mt-2 text-sm text-persian-700 dark:text-persian-300">
          {t("redeemSuccess", { code: result.code })}
        </p>
      )}
      {result?.error && (
        <p className="mt-2 text-sm text-red-600">{t("notEnoughPoints")}</p>
      )}
    </div>
  );
}
