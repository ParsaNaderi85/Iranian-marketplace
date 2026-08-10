import { getTranslations } from "next-intl/server";
import { redirect, Link } from "@/i18n/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { getVendorByOwnerId } from "@/lib/data/vendors";
import { DeliveryFeeForm } from "@/components/vendor/delivery-fee-form";

const statusKey = {
  pending: "statusPending",
  approved: "statusApproved",
  suspended: "statusSuspended",
} as const;

export default async function VendorDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const profile = await getCurrentProfile();
  const vendor = profile ? await getVendorByOwnerId(profile.id) : null;

  if (!vendor) {
    redirect({ href: "/vendor/onboarding", locale });
  }

  const t = await getTranslations("vendorDashboard");
  const tOnboard = await getTranslations("vendorOnboarding");

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {vendor!.name}
      </h1>
      <p className="mb-6 inline-block rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
        {t(statusKey[vendor!.status])}
      </p>

      {vendor!.status === "pending" && (
        <p className="mb-6 text-sm text-amber-700 dark:text-amber-400">
          {tOnboard("pendingNotice")}
        </p>
      )}

      <DeliveryFeeForm locale={locale} currentFee={vendor!.delivery_fee_aed} />

      <div className="flex flex-wrap gap-4">
        <Link
          href="/vendor/products"
          className="rounded-md border border-zinc-300 px-4 py-2 font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          {t("products")}
        </Link>
        <Link
          href="/vendor/orders"
          className="rounded-md border border-zinc-300 px-4 py-2 font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          {t("orders")}
        </Link>
        <Link
          href="/vendor/analytics"
          className="rounded-md border border-zinc-300 px-4 py-2 font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          {t("analytics")}
        </Link>
        <Link
          href="/vendor/sales"
          className="rounded-md border border-zinc-300 px-4 py-2 font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          {t("externalSales")}
        </Link>
        <Link
          href="/vendor/customers"
          className="rounded-md border border-zinc-300 px-4 py-2 font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          {t("customers")}
        </Link>
        <Link
          href="/vendor/coupons"
          className="rounded-md border border-zinc-300 px-4 py-2 font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          {t("coupons")}
        </Link>
        <Link
          href="/vendor/payouts"
          className="rounded-md border border-zinc-300 px-4 py-2 font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          {t("payouts")}
        </Link>
        <Link
          href="/vendor/settings"
          className="rounded-md border border-zinc-300 px-4 py-2 font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          {t("settings")}
        </Link>
      </div>
    </div>
  );
}
