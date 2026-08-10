import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Vendor } from "@/lib/types";
import { VENDOR_TYPE_COLORS } from "@/lib/vendor-colors";
import { StarRating } from "@/components/star-rating";

export function VendorCard({
  vendor,
  rating,
}: {
  vendor: Vendor;
  rating?: { average: number; count: number };
}) {
  const tv = useTranslations("vendorTypes");
  const tp = useTranslations("vendorPublic");
  const colors = VENDOR_TYPE_COLORS[vendor.type];

  return (
    <Link
      href={`/vendors/${vendor.id}`}
      className="group flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-persian-300 hover:shadow-lg hover:shadow-persian-900/5 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-persian-700"
    >
      <div
        className={`relative flex h-32 items-center justify-center overflow-hidden rounded-md ${colors.iconBg}`}
      >
        {vendor.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vendor.logo_url}
            alt={vendor.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className={`text-3xl font-semibold ${colors.iconText}`}>
            {vendor.name.charAt(0)}
          </span>
        )}
        <span
          className={`absolute end-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-medium ${colors.badge}`}
        >
          {tv(vendor.type)}
        </span>
      </div>
      <h3 className="font-medium text-zinc-900 group-hover:text-persian-700 dark:text-zinc-50 dark:group-hover:text-persian-300">
        {vendor.name}
      </h3>
      {vendor.address && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {vendor.address}
        </p>
      )}
      {rating && rating.count > 0 && (
        <div className="flex items-center gap-1">
          <StarRating value={rating.average} size="text-xs" />
          <span className="text-xs text-zinc-400">
            {tp("ratingCount", { count: rating.count })}
          </span>
        </div>
      )}
    </Link>
  );
}
