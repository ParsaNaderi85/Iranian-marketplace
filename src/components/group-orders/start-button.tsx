"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { createGroupOrder } from "@/lib/group-orders/actions";

export function StartGroupOrderButton({ vendorId }: { vendorId: string }) {
  const t = useTranslations("groupOrders");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await createGroupOrder(vendorId);
          if (result.groupOrderId) {
            router.push(`/group-orders/${result.groupOrderId}`);
          }
        })
      }
      className="flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      {t("startGroupOrder")}
    </button>
  );
}
