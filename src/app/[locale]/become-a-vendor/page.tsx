import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BecomeVendorForm } from "@/components/become-vendor-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("becomeVendor");
  return { title: t("title"), description: t("subtitle") };
}

export default async function BecomeVendorPage() {
  const t = await getTranslations("becomeVendor");

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("title")}
      </h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-300">{t("subtitle")}</p>
      <BecomeVendorForm />
    </div>
  );
}
