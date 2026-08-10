"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { removeGroupOrderItem } from "@/lib/group-orders/actions";
import type { GroupOrderItemWithProduct } from "@/lib/data/group-orders";

export function ItemRow({
  item,
  canRemove,
}: {
  item: GroupOrderItemWithProduct;
  canRemove: boolean;
}) {
  const tc = useTranslations("common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-zinc-700 dark:text-zinc-300">
        {item.quantity}× {item.productName}
      </span>
      <div className="flex items-center gap-3">
        <span className="font-medium text-zinc-900 dark:text-zinc-50">
          {(item.priceAed * item.quantity).toFixed(2)} {tc("currency")}
        </span>
        {canRemove && (
          <button
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await removeGroupOrderItem(item.id);
                router.refresh();
              })
            }
            className="text-xs text-red-600 hover:underline disabled:opacity-60"
          >
            {tc("delete")}
          </button>
        )}
      </div>
    </div>
  );
}
