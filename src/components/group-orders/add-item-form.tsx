"use client";

import { useActionState, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { addGroupOrderItem, type ActionState } from "@/lib/group-orders/actions";
import type { Product } from "@/lib/types";

export function AddItemForm({
  groupOrderId,
  products,
}: {
  groupOrderId: string;
  products: Product[];
}) {
  const t = useTranslations("groupOrders");
  const tc = useTranslations("common");
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const result = await addGroupOrderItem(prev, formData);
      if (!result?.error) {
        formRef.current?.reset();
        router.refresh();
      }
      return result;
    },
    undefined,
  );

  if (products.length === 0) return null;

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <input type="hidden" name="groupOrderId" value={groupOrderId} />
      <div>
        <label className="mb-1 block text-sm font-medium">{t("item")}</label>
        <select
          name="productId"
          required
          className="w-56 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {(p.sale_price_aed ?? p.price_aed).toFixed(2)} {tc("currency")}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{t("quantity")}</label>
        <input
          name="quantity"
          type="number"
          min="1"
          defaultValue={1}
          required
          className="w-20 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-persian-600 px-4 py-2 text-sm font-medium text-white hover:bg-persian-700 disabled:opacity-60"
      >
        {t("addItem")}
      </button>
      {state?.error && <p className="w-full text-sm text-red-600">{tc("error")}</p>}
    </form>
  );
}
