import { redirect, Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "admin") {
    redirect({ href: "/login", locale });
  }

  const t = await getTranslations("admin");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("title")}
      </h1>
      <nav className="mb-6 flex gap-4 text-sm">
        <Link href="/admin/vendors">{t("vendors")}</Link>
        <Link href="/admin/orders">{t("orders")}</Link>
      </nav>
      {children}
    </div>
  );
}
