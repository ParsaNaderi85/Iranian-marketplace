import { getTranslations } from "next-intl/server";
import { getVendorApplications } from "@/lib/data/vendor-applications";
import { AdminApplicationRow } from "@/components/admin/application-row";

export default async function AdminApplicationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [applications, t] = await Promise.all([
    getVendorApplications(),
    getTranslations("admin"),
  ]);

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {t("applications")}
      </h2>
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        {applications.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">{t("noApplications")}</p>
        ) : (
          applications.map((application) => (
            <AdminApplicationRow
              key={application.id}
              application={application}
              locale={locale}
            />
          ))
        )}
      </div>
    </div>
  );
}
