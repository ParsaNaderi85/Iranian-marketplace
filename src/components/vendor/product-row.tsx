"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  toggleProductAvailability,
  deleteProduct,
  updateProductInventory,
} from "@/lib/vendor/actions";
import { toggleBestSeller } from "@/lib/vendor/category-actions";
import type { Product } from "@/lib/types";

export function ProductRow({
  product,
  locale,
}: {
  product: Product;
  locale: string;
}) {
  const t = useTranslations("vendorDashboard");
  const tc = useTranslations("common");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [costPrice, setCostPrice] = useState(
    product.cost_price_aed?.toString() ?? "",
  );
  const [stock, setStock] = useState(product.stock_quantity?.toString() ?? "");

  async function handleBestSellerToggle(checked: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await toggleBestSeller(product.id, checked, locale);
      if (result.error) setError(result.error);
    });
  }

  function saveInventory() {
    startTransition(() => {
      void updateProductInventory(
        product.id,
        costPrice === "" ? null : Number(costPrice),
        stock === "" ? null : Number(stock),
        locale,
      );
    });
  }

  const margin =
    product.cost_price_aed != null
      ? (((product.price_aed - product.cost_price_aed) / product.price_aed) * 100)
      : null;
  const isLowStock =
    product.stock_quantity != null &&
    product.stock_quantity <= product.low_stock_threshold;

  return (
    <div className="flex items-center justify-between gap-3 border-b border-zinc-100 py-3 last:border-none dark:border-zinc-800">
      <div className="flex items-center gap-3">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="h-12 w-12 rounded-md object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
            {product.name.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-medium text-zinc-900 dark:text-zinc-50">
            {product.name}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {product.price_aed.toFixed(2)} {tc("currency")}
            {margin != null && (
              <span className="ms-2 text-xs text-zinc-400">
                ({margin.toFixed(0)}% {t("margin")})
              </span>
            )}
          </p>
          {isLowStock && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {t("lowStock", { count: product.stock_quantity! })}
            </p>
          )}
          {error && <p className="text-xs text-red-600">{t("bestSellerLimit")}</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1 text-sm">
          {t("costPrice")}
          <input
            type="number"
            min="0"
            step="0.01"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            onBlur={saveInventory}
            disabled={isPending}
            className="w-20 rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <label className="flex items-center gap-1 text-sm">
          {t("stock")}
          <input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            onBlur={saveInventory}
            disabled={isPending}
            className="w-20 rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={product.is_best_seller}
            disabled={isPending}
            onChange={(e) => handleBestSellerToggle(e.target.checked)}
          />
          {t("bestSeller")}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={product.is_available}
            disabled={isPending}
            onChange={(e) =>
              startTransition(() =>
                toggleProductAvailability(product.id, e.target.checked, locale),
              )
            }
          />
          {t("productAvailable")}
        </label>
        <button
          disabled={isPending}
          onClick={() => startTransition(() => deleteProduct(product.id, locale))}
          className="text-sm text-red-600 hover:underline disabled:opacity-60"
        >
          {tc("delete")}
        </button>
      </div>
    </div>
  );
}
