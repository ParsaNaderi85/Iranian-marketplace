"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { checkoutGroupOrder } from "@/lib/group-orders/actions";

export function GroupOrderCheckoutForm({
  groupOrderId,
  locale,
}: {
  groupOrderId: string;
  locale: string;
}) {
  const t = useTranslations("groupOrders");
  const tCheckout = useTranslations("checkout");
  const tc = useTranslations("common");

  const [addressLabel, setAddressLabel] = useState("Home");
  const [addressLine1, setAddressLine1] = useState("");
  const [area, setArea] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await checkoutGroupOrder({
      groupOrderId,
      paymentMethod,
      addressLabel,
      addressLine1,
      area,
      locale,
    });

    if ("error" in result) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    window.location.href = result.redirectUrl;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
        {t("checkoutForEveryone")}
      </h3>
      <div>
        <label className="mb-1 block text-sm font-medium">{tCheckout("addressLabel")}</label>
        <input
          value={addressLabel}
          onChange={(e) => setAddressLabel(e.target.value)}
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{tCheckout("addressLine")}</label>
        <input
          value={addressLine1}
          onChange={(e) => setAddressLine1(e.target.value)}
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{tCheckout("area")}</label>
        <input
          value={area}
          onChange={(e) => setArea(e.target.value)}
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={paymentMethod === "online"}
            onChange={() => setPaymentMethod("online")}
          />
          {tCheckout("payOnline")}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={paymentMethod === "cod"}
            onChange={() => setPaymentMethod("cod")}
          />
          {tCheckout("payOnDelivery")}
        </label>
      </div>
      {error && <p className="text-sm text-red-600">{tc("error")}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-persian-600 px-4 py-2 font-medium text-white hover:bg-persian-700 disabled:opacity-60"
      >
        {submitting ? tc("loading") : t("checkoutForEveryone")}
      </button>
    </form>
  );
}
