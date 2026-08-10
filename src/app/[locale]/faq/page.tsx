import { getTranslations } from "next-intl/server";

export default async function FaqPage() {
  const t = await getTranslations("faq");
  const items = [1, 2, 3, 4, 5, 6, 7] as const;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="mb-8 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("title")}
      </h1>
      <div className="flex flex-col gap-3">
        {items.map((n) => (
          <details
            key={n}
            className="group rounded-lg border border-zinc-200 bg-white p-4 open:border-persian-300 dark:border-zinc-800 dark:bg-zinc-900 dark:open:border-persian-700"
          >
            <summary className="cursor-pointer list-none font-medium text-zinc-900 marker:content-none dark:text-zinc-50">
              {t(`q${n}` as "q1")}
            </summary>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              {t(`a${n}` as "a1")}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
