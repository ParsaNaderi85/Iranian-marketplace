import { useTranslations } from "next-intl";
import type { Product } from "@/lib/types";
import { AddToCartButton } from "@/components/add-to-cart-button";

export function ProductCard({
  product,
  vendorId,
  vendorName,
}: {
  product: Product;
  vendorId: string;
  vendorName: string;
}) {
  const t = useTranslations("common");
  const tv = useTranslations("vendorDashboard");
  const onSale = product.sale_price_aed !== null;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-2xl font-semibold text-zinc-400">
            {product.name.charAt(0)}
          </span>
        )}
        {product.is_best_seller && (
          <span className="absolute start-2 top-2 rounded-full bg-saffron-500 px-2 py-0.5 text-[11px] font-medium text-zinc-900">
            {tv("bestSeller")}
          </span>
        )}
      </div>
      <h4 className="font-medium text-zinc-900 dark:text-zinc-50">
        {product.name}
      </h4>
      {product.description && (
        <p className="line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
          {product.description}
        </p>
      )}
      <div className="mt-auto flex items-center justify-between pt-2">
        <span className="flex items-baseline gap-1.5">
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">
            {(onSale ? product.sale_price_aed! : product.price_aed).toFixed(2)} {t("currency")}
          </span>
          {onSale && (
            <span className="text-xs text-zinc-400 line-through">
              {product.price_aed.toFixed(2)}
            </span>
          )}
        </span>
        <AddToCartButton
          vendorId={vendorId}
          vendorName={vendorName}
          productId={product.id}
          name={product.name}
          priceAed={onSale ? product.sale_price_aed! : product.price_aed}
        />
      </div>
    </div>
  );
}
