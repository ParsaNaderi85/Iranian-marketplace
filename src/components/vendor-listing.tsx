import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import {
  getApprovedVendors,
  getVendorAreas,
  getTopRatedVendors,
} from "@/lib/data/vendors";
import { getRatingSummaries } from "@/lib/data/reviews";
import { getOnSaleProducts } from "@/lib/data/products";
import { VendorCard } from "@/components/vendor-card";
import { OnSaleProductCard } from "@/components/on-sale-product-card";
import { CategoryIcon } from "@/components/category-icon";
import { VENDOR_TYPE_SLUGS, type VendorType } from "@/lib/types";
import { VENDOR_TYPE_COLORS } from "@/lib/vendor-colors";

export async function generateVendorListingMetadata(
  type: VendorType,
  locale: string,
): Promise<Metadata> {
  const [t, tv] = await Promise.all([
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "vendorTypes" }),
  ]);
  const slug = VENDOR_TYPE_SLUGS[type];
  return {
    title: t(slug as "supermarkets"),
    description: `Browse Iranian ${tv(type).toLowerCase()} businesses in Dubai on Iranian Marketplace.`,
  };
}

export async function VendorListing({
  type,
  searchParams,
}: {
  type: VendorType;
  searchParams?: { q?: string; area?: string };
}) {
  const q = searchParams?.q?.trim() || undefined;
  const area = searchParams?.area || undefined;
  const hasFilters = Boolean(q || area);

  const [t, tf, locale, vendors, areas, recommended, onSale] =
    await Promise.all([
      getTranslations(),
      getTranslations("filters"),
      getLocale(),
      getApprovedVendors(type, { q, area }),
      getVendorAreas(type),
      hasFilters ? Promise.resolve([]) : getTopRatedVendors(4, type),
      hasFilters ? Promise.resolve([]) : getOnSaleProducts(4, type),
    ]);
  const ratings = await getRatingSummaries(vendors.map((v) => v.id));
  const colors = VENDOR_TYPE_COLORS[type];
  const slug = VENDOR_TYPE_SLUGS[type];
  const basePath = `/${locale}/${slug}`;

  return (
    <div>
      <div className={`${colors.headerBg} px-4 py-10 text-white`}>
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <CategoryIcon type={type} className="h-8 w-8" />
          <h1 className="text-2xl font-semibold">
            {t(`nav.${slug}` as "nav.supermarkets")}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <form
          className="mb-8 flex flex-wrap items-center gap-3"
          action={basePath}
        >
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder={tf("searchPlaceholder")}
            className="min-w-0 flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <select
            name="area"
            defaultValue={area ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">{tf("allAreas")}</option>
            {areas.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-md bg-persian-600 px-4 py-2 text-sm font-medium text-white hover:bg-persian-700"
          >
            {tf("search")}
          </button>
          {hasFilters && (
            <a
              href={basePath}
              className="text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              {tf("clear")}
            </a>
          )}
        </form>

        {recommended.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {t("home.recommendedTitle")}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {recommended.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} rating={vendor.rating} />
              ))}
            </div>
          </section>
        )}

        {onSale.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {t("home.onSaleTitle")}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {onSale.map((product) => (
                <OnSaleProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {vendors.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">
            {hasFilters ? tf("noResults") : t("home.noVendors")}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {vendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} rating={ratings[vendor.id]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
