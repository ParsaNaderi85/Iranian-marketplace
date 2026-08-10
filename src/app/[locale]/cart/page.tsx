"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useCart } from "@/lib/cart/cart-context";
import { QuantityStepper } from "@/components/quantity-stepper";
import { SimilarProductsSection } from "@/components/similar-products-section";

export default function CartPage() {
  const t = useTranslations("cart");
  const tc = useTranslations("common");
  const { cart, subtotal, updateQuantity, removeItem } = useCart();
  const router = useRouter();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("title")}
      </h1>

      {!cart || cart.items.length === 0 ? (
        <div>
          <p className="mb-4 text-zinc-500 dark:text-zinc-400">{t("empty")}</p>
          <Link href="/" className="text-persian-700 dark:text-persian-400">
            {t("continueBrowsing")}
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            {cart.vendorName}
          </p>
          <div className="mb-6 flex flex-col gap-3">
            {cart.items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {item.name}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {item.priceAed.toFixed(2)} {tc("currency")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <QuantityStepper
                    quantity={item.quantity}
                    onChange={(q) => updateQuantity(item.productId, q)}
                  />
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    {t("remove")}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6 flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              {t("subtotal")}
            </span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
              {subtotal.toFixed(2)} {tc("currency")}
            </span>
          </div>

          <button
            onClick={() => router.push("/checkout")}
            className="w-full rounded-md bg-persian-600 px-4 py-3 font-medium text-white hover:bg-persian-700"
          >
            {t("checkout")}
          </button>

          <SimilarProductsSection
            vendorId={cart.vendorId}
            vendorName={cart.vendorName}
            excludeProductIds={cart.items.map((i) => i.productId)}
          />
        </>
      )}
    </div>
  );
}
