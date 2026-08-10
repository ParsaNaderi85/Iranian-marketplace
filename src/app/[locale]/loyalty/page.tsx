import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { LoyaltyRedeemButton } from "@/components/loyalty-redeem-button";
import { REDEMPTION_COST, REDEMPTION_DISCOUNT_PERCENT } from "@/lib/loyalty/constants";

export default async function LoyaltyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect({ href: "/login", locale });

  const t = await getTranslations("loyalty");
  const points = profile!.loyalty_points;

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("title")}
      </h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-300">{t("earnExplainer")}</p>

      <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("balance")}</p>
        <p className="text-4xl font-bold text-persian-700 dark:text-persian-400">
          {points}
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-300">
          {t("redeemExplainer", {
            cost: REDEMPTION_COST,
            discount: REDEMPTION_DISCOUNT_PERCENT,
          })}
        </p>
        <LoyaltyRedeemButton locale={locale} canRedeem={points >= REDEMPTION_COST} />
      </div>
    </div>
  );
}
