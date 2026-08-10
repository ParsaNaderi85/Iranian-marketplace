"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { submitReview, type ReviewActionState } from "@/lib/reviews/actions";

export function ReviewForm({
  vendorId,
  locale,
}: {
  vendorId: string;
  locale: string;
}) {
  const t = useTranslations("vendorPublic");
  const tc = useTranslations("common");
  const [state, action, pending] = useActionState<ReviewActionState, FormData>(
    submitReview,
    undefined,
  );
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  if (submitted && !pending && !state?.error) {
    return (
      <p className="text-sm text-persian-700 dark:text-persian-300">
        {t("reviewSubmitted")}
      </p>
    );
  }

  return (
    <form
      action={(fd) => {
        setSubmitted(true);
        return action(fd);
      }}
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <input type="hidden" name="vendorId" value={vendorId} />
      <input type="hidden" name="locale" value={locale} />

      <div>
        <label className="mb-1 block text-sm font-medium">
          {t("yourRating")}
        </label>
        <div className="flex gap-1 text-2xl">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={n <= rating ? "text-saffron-500" : "text-zinc-300 dark:text-zinc-700"}
              aria-label={`${n} stars`}
            >
              ★
            </button>
          ))}
        </div>
        <input type="hidden" name="rating" value={rating} />
      </div>

      <textarea
        name="comment"
        rows={2}
        placeholder={t("comment")}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
      />

      {state?.error === "mustOrderFirst" && (
        <p className="text-sm text-red-600">{t("mustOrderFirst")}</p>
      )}
      {state?.error && state.error !== "mustOrderFirst" && (
        <p className="text-sm text-red-600">{tc("error")}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-persian-600 px-4 py-2 text-sm font-medium text-white hover:bg-persian-700 disabled:opacity-60"
      >
        {t("submitReview")}
      </button>
    </form>
  );
}
