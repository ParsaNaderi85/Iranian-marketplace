import { getTranslations } from "next-intl/server";
import { getAllVendors } from "@/lib/data/vendors";
import { AdminVendorRow } from "@/components/admin/vendor-row";

export default async function AdminVendorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [vendors, t] = await Promise.all([
    getAllVendors(),
    getTranslations("admin"),
  ]);

  const pending = vendors.filter((v) => v.status === "pending");
  const others = vendors.filter((v) => v.status !== "pending");

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {t("pendingVendors")}
        </h2>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          {pending.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">—</p>
          ) : (
            pending.map((v) => (
              <AdminVendorRow key={v.id} vendor={v} locale={locale} />
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {t("approvedVendors")}
        </h2>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          {others.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">—</p>
          ) : (
            others.map((v) => (
              <AdminVendorRow key={v.id} vendor={v} locale={locale} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
