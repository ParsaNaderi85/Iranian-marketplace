"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toggleVendorCoupon } from "@/lib/vendor/coupon-actions";
import type { VendorCoupon } from "@/lib/data/vendor-coupons";

export function CouponRow({
  coupon,
  locale,
}: {
  coupon: VendorCoupon;
  locale: string;
}) {
  const t = useTranslations("vendorDashboard");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between border-b border-zinc-100 py-3 last:border-none dark:border-zinc-800">
      <div>
        <p className="font-mono font-medium text-zinc-900 dark:text-zinc-50">
          {coupon.code}
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {coupon.discount_percent}% {t("off").toLowerCase()}
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={coupon.active}
          disabled={isPending}
          onChange={(e) =>
            startTransition(() =>
              toggleVendorCoupon(coupon.id, e.target.checked, locale),
            )
          }
        />
        {t("active")}
      </label>
    </div>
  );
}
