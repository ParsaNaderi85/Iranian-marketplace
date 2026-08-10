import type { Campaign } from "@/lib/types";

export function CampaignBanner({ campaign }: { campaign: Campaign }) {
  return (
    <div className="bg-saffron-500 px-4 py-2.5 text-center text-sm font-medium text-zinc-900">
      <span className="font-semibold">{campaign.title}</span>
      {" — "}
      {campaign.message}
      {campaign.discount_percent && (
        <span className="ms-1 font-semibold">
          ({campaign.discount_percent}% off)
        </span>
      )}
    </div>
  );
}
