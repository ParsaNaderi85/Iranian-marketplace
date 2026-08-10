"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getSimilarProducts } from "@/lib/data/similar-products";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/types";

export function SimilarProductsSection({
  vendorId,
  vendorName,
  excludeProductIds,
}: {
  vendorId: string;
  vendorName: string;
  excludeProductIds: string[];
}) {
  const t = useTranslations("cart");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    getSimilarProducts(vendorId, excludeProductIds).then((result) => {
      if (!cancelled) setProducts(result);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId, excludeProductIds.join(",")]);

  if (products.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {t("youMightAlsoLike")}
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            vendorId={vendorId}
            vendorName={vendorName}
          />
        ))}
      </div>
    </div>
  );
}
