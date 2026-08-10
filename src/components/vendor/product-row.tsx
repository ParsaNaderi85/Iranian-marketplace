"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  toggleProductAvailability,
  deleteProduct,
} from "@/lib/vendor/actions";
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
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
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
