"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { updateApplicationStatus } from "@/lib/vendor-applications/actions";
import type { VendorApplication } from "@/lib/types";

export function AdminApplicationRow({
  application,
  locale,
}: {
  application: VendorApplication;
  locale: string;
}) {
  const t = useTranslations("admin");
  const tv = useTranslations("vendorTypes");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 py-3 last:border-none dark:border-zinc-800">
      <div>
        <p className="font-medium text-zinc-900 dark:text-zinc-50">
          {application.business_name}{" "}
          <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
            ({tv(application.business_type)}
            {application.area ? `, ${application.area}` : ""})
          </span>
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {application.contact_name} · {application.contact_email}
          {application.contact_phone ? ` · ${application.contact_phone}` : ""}
        </p>
        {application.message && (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            {application.message}
          </p>
        )}
        <p className="mt-1 text-xs text-zinc-400">{application.status}</p>
      </div>

      <div className="flex items-center gap-2">
        {application.status !== "contacted" && (
          <button
            disabled={isPending}
            onClick={() =>
              startTransition(() =>
                updateApplicationStatus(application.id, "contacted", locale),
              )
            }
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            {t("markContacted")}
          </button>
        )}
        {application.status !== "approved" && (
          <button
            disabled={isPending}
            onClick={() =>
              startTransition(() =>
                updateApplicationStatus(application.id, "approved", locale),
              )
            }
            className="rounded-md bg-persian-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-persian-700 disabled:opacity-60"
          >
            {t("approve")}
          </button>
        )}
        {application.status !== "rejected" && (
          <button
            disabled={isPending}
            onClick={() =>
              startTransition(() =>
                updateApplicationStatus(application.id, "rejected", locale),
              )
            }
            className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
          >
            {t("reject")}
          </button>
        )}
      </div>
    </div>
  );
}
