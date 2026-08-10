"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { sendReorderReminder } from "@/lib/vendor/reminder-actions";

export function ReminderButton({ customerId }: { customerId: string }) {
  const t = useTranslations("vendorDashboard");
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  if (sent) {
    return <span className="text-xs text-persian-600 dark:text-persian-400">{t("reminderSent")}</span>;
  }

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await sendReorderReminder(customerId);
          if (!result.error) setSent(true);
        })
      }
      className="text-xs font-medium text-persian-700 hover:underline disabled:opacity-60 dark:text-persian-300"
    >
      {t("sendReminder")}
    </button>
  );
}
