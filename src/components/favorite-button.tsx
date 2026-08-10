"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toggleFavorite } from "@/lib/favorites/actions";

export function FavoriteButton({
  vendorId,
  initialFavorited,
  locale,
  isLoggedIn,
}: {
  vendorId: string;
  initialFavorited: boolean;
  locale: string;
  isLoggedIn: boolean;
}) {
  const t = useTranslations("vendorPublic");
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  if (!isLoggedIn) return null;

  return (
    <button
      disabled={isPending}
      onClick={() => {
        setFavorited(!favorited);
        startTransition(() => {
          void toggleFavorite(vendorId, favorited, locale);
        });
      }}
      aria-pressed={favorited}
      className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium disabled:opacity-60 ${
        favorited
          ? "border-anar-300 bg-anar-50 text-anar-700 dark:border-anar-900 dark:bg-anar-950 dark:text-anar-300"
          : "border-zinc-300 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      }`}
    >
      <span aria-hidden>{favorited ? "♥" : "♡"}</span>
      {favorited ? t("favorited") : t("addFavorite")}
    </button>
  );
}
