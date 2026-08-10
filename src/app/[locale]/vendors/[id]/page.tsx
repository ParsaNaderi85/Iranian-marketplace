import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import {
  getApprovedVendorById,
  getAvailableProductsForVendor,
} from "@/lib/data/vendors";
import { getReviewsForVendor, getRatingSummary } from "@/lib/data/reviews";
import { getCurrentProfile } from "@/lib/auth/session";
import { ProductCard } from "@/components/product-card";
import { StarRating } from "@/components/star-rating";
import { ReviewForm } from "@/components/review-form";

export default async function VendorStorefrontPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vendor = await getApprovedVendorById(id);
  if (!vendor) notFound();

  const [products, t, locale, reviews, rating, profile] = await Promise.all([
    getAvailableProductsForVendor(id),
    getTranslations("vendorPublic"),
    getLocale(),
    getReviewsForVendor(id),
    getRatingSummary(id),
    getCurrentProfile(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center gap-4">
        {vendor.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vendor.logo_url}
            alt={vendor.name}
            className="h-20 w-20 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-zinc-100 text-2xl font-semibold text-zinc-400 dark:bg-zinc-800">
            {vendor.name.charAt(0)}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {vendor.name}
          </h1>
          {vendor.address && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {vendor.address}
            </p>
          )}
          {vendor.description && (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              {vendor.description}
            </p>
          )}
          {rating.count > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <StarRating value={rating.average} />
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {t("ratingCount", { count: rating.count })}
              </span>
            </div>
          )}
        </div>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {vendor.type === "restaurant" ? t("menu") : t("products")}
      </h2>

      {products.length === 0 ? (
        <p className="mb-10 text-zinc-500 dark:text-zinc-400">
          {t("outOfStock")}
        </p>
      ) : (
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              vendorId={vendor.id}
              vendorName={vendor.name}
            />
          ))}
        </div>
      )}

      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {t("reviews")}
      </h2>

      {profile?.role === "customer" && (
        <div className="mb-6">
          <ReviewForm vendorId={vendor.id} locale={locale} />
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">{t("noReviews")}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <StarRating value={review.rating} size="text-sm" />
              {review.comment && (
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
