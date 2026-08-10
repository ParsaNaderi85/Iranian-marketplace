import { getTranslations } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { getOrCreateReferralCode, getMyCoupons } from "@/lib/referral/actions";
import { ReferralLinkCard } from "@/components/referral-link-card";

export default async function ReferPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("refer");
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="mb-3 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {t("title")}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">{t("loginPrompt")}</p>
      </div>
    );
  }

  const [code, coupons] = await Promise.all([
    getOrCreateReferralCode(),
    getMyCoupons(),
  ]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const referralLink = `${siteUrl}/${locale}/signup?ref=${code}`;

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="mb-3 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("title")}
      </h1>
      <p className="mb-6 text-zinc-600 dark:text-zinc-300">{t("body")}</p>

      <ReferralLinkCard link={referralLink} />

      <h2 className="mt-10 mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {t("myCoupons")}
      </h2>
      {coupons.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">{t("noCoupons")}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {coupons.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span className="font-mono font-medium text-zinc-900 dark:text-zinc-50">
                {c.code}
              </span>
              <span
                className={
                  c.status === "active"
                    ? "text-sm text-persian-700 dark:text-persian-300"
                    : "text-sm text-zinc-400"
                }
              >
                {c.status === "active" ? t("couponActive") : t("couponUsed")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
