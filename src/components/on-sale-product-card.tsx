import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { OnSaleProduct } from "@/lib/data/products";

export function OnSaleProductCard({ product }: { product: OnSaleProduct }) {
  const tc = useTranslations("common");
  const percentOff = Math.round(
    (1 - (product.sale_price_aed! / product.price_aed)) * 100,
  );

  return (
    <Link
      href={`/vendors/${product.vendors.id}`}
      className="group flex flex-col gap-2 rounded-lg border border-anar-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-anar-900 dark:bg-zinc-900"
    >
      <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-md bg-anar-50 dark:bg-anar-950">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-2xl font-semibold text-anar-300">
            {product.name.charAt(0)}
          </span>
        )}
        <span className="absolute end-2 top-2 rounded-full bg-anar-600 px-2 py-0.5 text-[11px] font-semibold text-white">
          -{percentOff}%
        </span>
      </div>
      <h3 className="text-sm font-medium text-zinc-900 group-hover:text-anar-700 dark:text-zinc-50 dark:group-hover:text-anar-300">
        {product.name}
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {product.vendors.name}
      </p>
      <div className="flex items-baseline gap-2">
        <span className="font-semibold text-anar-700 dark:text-anar-300">
          {product.sale_price_aed!.toFixed(2)} {tc("currency")}
        </span>
        <span className="text-xs text-zinc-400 line-through">
          {product.price_aed.toFixed(2)}
        </span>
      </div>
    </Link>
  );
}
