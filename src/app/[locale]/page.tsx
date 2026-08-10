import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getFeaturedVendors, getTopRatedVendors } from "@/lib/data/vendors";
import { getRatingSummaries } from "@/lib/data/reviews";
import { getOnSaleProducts } from "@/lib/data/products";
import { getPersonalizedRecommendations } from "@/lib/data/recommendations";
import { getCurrentProfile } from "@/lib/auth/session";
import { VendorCard } from "@/components/vendor-card";
import { OnSaleProductCard } from "@/components/on-sale-product-card";
import { ProductCard } from "@/components/product-card";
import { CategoryTile } from "@/components/category-tile";
import { PersianDivider } from "@/components/persian-divider";
import { ReferralPopup } from "@/components/referral-popup";
import { VENDOR_TYPES } from "@/lib/types";

export default async function HomePage() {
  const t = await getTranslations("home");
  const tv = await getTranslations("vendorTypes");
  const profile = await getCurrentProfile();
  const [featured, recommended, onSale, personalized] = await Promise.all([
    getFeaturedVendors(),
    getTopRatedVendors(4),
    getOnSaleProducts(4),
    profile?.role === "customer"
      ? getPersonalizedRecommendations(profile.id, 4)
      : Promise.resolve([]),
  ]);
  const ratings = await getRatingSummaries(featured.map((v) => v.id));

  return (
    <div>
      <ReferralPopup />
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-persian-900 via-firoozeh-800 to-saffron-700 px-4 py-20 text-center text-white sm:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 60% 70%, white 1px, transparent 1px)",
            backgroundSize: "48px 48px, 64px 64px",
          }}
        />
        <div className="relative mx-auto max-w-2xl">
          <p className="mb-3 text-sm font-semibold tracking-wide text-saffron-200 uppercase">
            {t("heroEyebrow")}
          </p>
          <h1 className="text-3xl font-semibold sm:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-white/90">
            {t("heroSubtitle")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/supermarkets"
              className="rounded-md bg-saffron-400 px-5 py-2.5 font-medium text-zinc-900 hover:bg-saffron-300"
            >
              {t("heroCtaBrowse")}
            </Link>
            <Link
              href="/become-a-vendor"
              className="rounded-md border border-white/70 px-5 py-2.5 font-medium text-white hover:bg-white/10"
            >
              {t("heroCtaVendor")}
            </Link>
          </div>
        </div>
      </section>

      <PersianDivider />

      {/* Categories */}
      <section className="bg-white py-14 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-6 text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {t("exploreCategories")}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {VENDOR_TYPES.map((type) => (
              <CategoryTile key={type} type={type} label={tv(type)} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-firoozeh-50 py-14 dark:bg-firoozeh-950/40">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-10 text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {t("howItWorksTitle")}
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {(
              [
                ["1", t("step1Title"), t("step1Body"), "bg-persian-600"],
                ["2", t("step2Title"), t("step2Body"), "bg-firoozeh-600"],
                ["3", t("step3Title"), t("step3Body"), "bg-saffron-600"],
              ] as const
            ).map(([n, title, body, color]) => (
              <div key={n} className="text-center">
                <span
                  className={`mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full font-semibold text-white ${color}`}
                >
                  {n}
                </span>
                <h3 className="mb-2 font-medium text-zinc-900 dark:text-zinc-50">
                  {title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="bg-saffron-50 py-16 dark:bg-saffron-950/30">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {t("whyTitle")}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-300">{t("whyBody")}</p>
        </div>
      </section>

      {/* Recommended for you */}
      {recommended.length > 0 && (
        <section className="bg-white py-14 dark:bg-zinc-950">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {t("recommendedTitle")}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {recommended.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} rating={vendor.rating} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* On sale */}
      {onSale.length > 0 && (
        <section className="bg-anar-50 py-14 dark:bg-anar-950/30">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {t("onSaleTitle")}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {onSale.map((product) => (
                <OnSaleProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Personalized recommendations */}
      {personalized.length > 0 && (
        <section className="bg-firoozeh-50 py-14 dark:bg-firoozeh-950/40">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {t("basedOnYourOrdersTitle")}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {personalized.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  vendorId={product.vendorId}
                  vendorName={product.vendorName}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured vendors */}
      {featured.length > 0 && (
        <section className="bg-white py-14 dark:bg-zinc-950">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {t("featuredTitle")}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {featured.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} rating={ratings[vendor.id]} />
              ))}
            </div>
          </div>
        </section>
      )}

      <PersianDivider />

      {/* Vendor CTA */}
      <section className="bg-gradient-to-br from-banafsh-800 to-anar-700 px-4 py-16 text-center text-white">
        <h2 className="mb-3 text-2xl font-semibold">{t("vendorCtaTitle")}</h2>
        <p className="mx-auto mb-6 max-w-xl text-white/90">
          {t("vendorCtaBody")}
        </p>
        <Link
          href="/become-a-vendor"
          className="inline-block rounded-md bg-saffron-400 px-5 py-2.5 font-medium text-zinc-900 hover:bg-saffron-300"
        >
          {t("vendorCtaButton")}
        </Link>
      </section>
    </div>
  );
}
