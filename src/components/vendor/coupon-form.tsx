"use client";

import { useActionState, useRef } from "react";
import { useTranslations } from "next-intl";
import { createVendorCoupon, type ActionState } from "@/lib/vendor/coupon-actions";

export function CouponForm({ locale }: { locale: string }) {
  const t = useTranslations("vendorDashboard");
  const tc = useTranslations("common");
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const result = await createVendorCoupon(prev, formData);
      if (!result?.error) formRef.current?.reset();
      return result;
    },
    undefined,
  );

  return (
    <form
      ref={formRef}
      action={action}
      className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <input type="hidden" name="locale" value={locale} />
      <div>
        <label className="mb-1 block text-sm font-medium">{t("couponCode")}</label>
        <input
          name="code"
          required
          maxLength={20}
          placeholder="SAVE10"
          className="w-40 rounded-md border border-zinc-300 px-3 py-2 text-sm uppercase dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{t("couponDiscount")}</label>
        <input
          name="discountPercent"
          type="number"
          min="1"
          max="100"
          required
          className="w-24 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-persian-600 px-4 py-2 text-sm font-medium text-white hover:bg-persian-700 disabled:opacity-60"
      >
        {t("createCoupon")}
      </button>
      {state?.error && (
        <p className="text-sm text-red-600">
          {state.error === "codeTaken" ? t("couponCodeTaken") : tc("error")}
        </p>
      )}
    </form>
  );
}
