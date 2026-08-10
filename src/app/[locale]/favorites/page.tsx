import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { getFavoriteVendors } from "@/lib/data/favorites";
import { VendorCard } from "@/components/vendor-card";
import { getRatingSummaries } from "@/lib/data/reviews";

export default async function FavoritesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect({ href: "/login", locale });

  const [vendors, t] = await Promise.all([
    getFavoriteVendors(profile!.id),
    getTranslations("vendorPublic"),
  ]);
  const ratings = await getRatingSummaries(vendors.map((v) => v.id));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("favorites")}
      </h1>
      {vendors.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">{t("noFavorites")}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {vendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} rating={ratings[vendor.id]} />
          ))}
        </div>
      )}
    </div>
  );
}
