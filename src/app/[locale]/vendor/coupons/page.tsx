import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { getVendorByOwnerId } from "@/lib/data/vendors";
import { getVendorCoupons } from "@/lib/data/vendor-coupons";
import { CouponForm } from "@/components/vendor/coupon-form";
import { CouponRow } from "@/components/vendor/coupon-row";

export default async function VendorCouponsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const profile = await getCurrentProfile();
  const vendor = profile ? await getVendorByOwnerId(profile.id) : null;
  if (!vendor) redirect({ href: "/vendor/onboarding", locale });

  const [coupons, t] = await Promise.all([
    getVendorCoupons(vendor!.id),
    getTranslations("vendorDashboard"),
  ]);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("coupons")}
      </h1>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        {t("couponsHint")}
      </p>

      <CouponForm locale={locale} />

      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        {coupons.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">{t("noCoupons")}</p>
        ) : (
          coupons.map((coupon) => (
            <CouponRow key={coupon.id} coupon={coupon} locale={locale} />
          ))
        )}
      </div>
    </div>
  );
}
