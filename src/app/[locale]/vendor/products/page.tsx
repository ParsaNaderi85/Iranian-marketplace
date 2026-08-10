import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { getVendorByOwnerId } from "@/lib/data/vendors";
import { getAllProductsForVendor, getCategoriesForType } from "@/lib/data/products";
import { AddProductForm } from "@/components/vendor/add-product-form";
import { ProductRow } from "@/components/vendor/product-row";

export default async function VendorProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const profile = await getCurrentProfile();
  const vendor = profile ? await getVendorByOwnerId(profile.id) : null;
  if (!vendor) redirect({ href: "/vendor/onboarding", locale });

  const [products, categories, t] = await Promise.all([
    getAllProductsForVendor(vendor!.id),
    getCategoriesForType(vendor!.type),
    getTranslations("vendorDashboard"),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("products")}
      </h1>

      <AddProductForm locale={locale} categories={categories} />

      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        {products.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">{t("noProducts")}</p>
        ) : (
          products.map((p) => (
            <ProductRow key={p.id} product={p} locale={locale} />
          ))
        )}
      </div>
    </div>
  );
}
