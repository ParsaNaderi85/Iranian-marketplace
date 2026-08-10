"use client";

import { use, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "@/lib/cart/cart-context";
import {
  placeOrder,
  getVendorDeliveryFee,
  previewAnyCoupon,
} from "@/lib/checkout/actions";

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const t = useTranslations("checkout");
  const tc = useTranslations("common");
  const { cart, subtotal, clearCart } = useCart();

  const [addressLabel, setAddressLabel] = useState("Home");
  const [addressLine1, setAddressLine1] = useState("");
  const [area, setArea] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">(
    "online",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState<number | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);

  useEffect(() => {
    if (!cart) return;
    getVendorDeliveryFee(cart.vendorId).then(setDeliveryFee);
  }, [cart?.vendorId]);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <p className="text-zinc-500 dark:text-zinc-400">{t("title")}</p>
      </div>
    );
  }

  async function handleApplyCoupon() {
    setCheckingCoupon(true);
    setCouponError(null);
    const result = await previewAnyCoupon(couponCode, cart!.vendorId);
    setCheckingCoupon(false);
    if ("error" in result) {
      setCouponDiscount(null);
      setCouponError(result.error);
      return;
    }
    setCouponDiscount(result.discountPercent);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await placeOrder({
      vendorId: cart!.vendorId,
      items: cart!.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
      paymentMethod,
      addressLabel,
      addressLine1,
      area,
      locale,
      couponCode: couponDiscount !== null ? couponCode : undefined,
    });

    if ("error" in result) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    clearCart();
    window.location.href = result.redirectUrl;
  }

  const discountedSubtotal = couponDiscount
    ? Math.round(subtotal * (1 - couponDiscount / 100) * 100) / 100
    : subtotal;
  const total = Math.round((discountedSubtotal + deliveryFee) * 100) / 100;

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("title")}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 font-medium">{t("deliveryAddress")}</legend>
          <input
            value={addressLabel}
            onChange={(e) => setAddressLabel(e.target.value)}
            placeholder={t("addressLabel")}
            required
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <input
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            placeholder={t("addressLine")}
            required
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <input
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder={t("area")}
            required
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </fieldset>

        <fieldset>
          <legend className="mb-2 font-medium">{t("paymentMethod")}</legend>
          <label className="mb-2 flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={paymentMethod === "online"}
              onChange={() => setPaymentMethod("online")}
            />
            {t("payOnline")}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={paymentMethod === "cod"}
              onChange={() => setPaymentMethod("cod")}
            />
            {t("payOnDelivery")}
          </label>
        </fieldset>

        <fieldset>
          <legend className="mb-2 font-medium">{t("couponCode")}</legend>
          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase());
                setCouponDiscount(null);
                setCouponError(null);
              }}
              placeholder={t("couponPlaceholder")}
              className="flex-1 rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={checkingCoupon || !couponCode.trim()}
              className="rounded-md border border-persian-600 px-3 py-2 text-sm font-medium text-persian-700 hover:bg-persian-50 disabled:opacity-60 dark:text-persian-300 dark:hover:bg-persian-950"
            >
              {t("applyCoupon")}
            </button>
          </div>
          {couponDiscount !== null && (
            <p className="mt-2 text-sm text-persian-700 dark:text-persian-300">
              {t("couponApplied", { percent: couponDiscount })}
            </p>
          )}
          {couponError && (
            <p className="mt-2 text-sm text-red-600">{t("couponInvalid")}</p>
          )}
        </fieldset>

        <div className="flex flex-col gap-1 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
            <span>{t("subtotalLabel")}</span>
            <span>
              {subtotal.toFixed(2)} {tc("currency")}
            </span>
          </div>
          {deliveryFee > 0 && (
            <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
              <span>{t("deliveryFeeLabel")}</span>
              <span>
                {deliveryFee.toFixed(2)} {tc("currency")}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="font-medium">{t("orderTotal")}</span>
            <span className="font-semibold">
              {total.toFixed(2)} {tc("currency")}
            </span>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{tc("error")}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-persian-600 px-4 py-3 font-medium text-white hover:bg-persian-700 disabled:opacity-60"
        >
          {t("placeOrder")}
        </button>
      </form>
    </div>
  );
}
