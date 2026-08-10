import { getTranslations } from "next-intl/server";
import { getAllCampaigns } from "@/lib/data/campaigns";
import { CampaignForm } from "@/components/admin/campaign-form";
import { CampaignRow } from "@/components/admin/campaign-row";

export default async function AdminCampaignsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [campaigns, t] = await Promise.all([
    getAllCampaigns(),
    getTranslations("admin"),
  ]);

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {t("campaigns")}
      </h2>

      <CampaignForm locale={locale} />

      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        {campaigns.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">{t("noCampaigns")}</p>
        ) : (
          campaigns.map((campaign) => (
            <CampaignRow key={campaign.id} campaign={campaign} locale={locale} />
          ))
        )}
      </div>
    </div>
  );
}
