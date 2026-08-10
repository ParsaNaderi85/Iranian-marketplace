"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { addProduct, type ActionState } from "@/lib/vendor/actions";
import type { Category } from "@/lib/types";

export function AddProductForm({
  locale,
  categories,
}: {
  locale: string;
  categories: Category[];
}) {
  const t = useTranslations("vendorDashboard");
  const tc = useTranslations("common");
  const [state, action, pending] = useActionState<ActionState, FormData>(
    addProduct,
    undefined,
  );
  const [preview, setPreview] = useState<string | null>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  return (
    <form
      action={action}
      className="mb-8 flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <input type="hidden" name="locale" value={locale} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            {t("productName")}
          </label>
          <input
            id="name"
            name="name"
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div>
          <label htmlFor="priceAed" className="mb-1 block text-sm font-medium">
            {t("productPrice")}
          </label>
          <input
            id="priceAed"
            name="priceAed"
            type="number"
            step="0.01"
            min="0"
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
      </div>

      <div>
        <label htmlFor="categoryId" className="mb-1 block text-sm font-medium">
          {t("productCategory")}
        </label>
        <select
          id="categoryId"
          name="categoryId"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value=""></option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">
          {tc("edit")}
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div>
        <label htmlFor="image" className="mb-1 block text-sm font-medium">
          {t("productImage")}
        </label>
        <div className="flex items-center gap-3">
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt=""
              className="h-16 w-16 rounded-md object-cover"
            />
          )}
          <input
            id="image"
            name="image"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleImageChange}
            className="w-full text-sm file:me-3 file:rounded-md file:border-0 file:bg-persian-100 file:px-3 file:py-2 file:text-persian-700 dark:file:bg-persian-950 dark:file:text-persian-300"
          />
        </div>
      </div>

      {state?.error && <p className="text-sm text-red-600">{tc("error")}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-persian-600 px-4 py-2 text-sm font-medium text-white hover:bg-persian-700 disabled:opacity-60"
      >
        {t("addProduct")}
      </button>
    </form>
  );
}
