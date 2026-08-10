import { getTranslations } from "next-intl/server";

const SECTION_COUNTS = {
  terms: 11,
  privacy: 9,
  vendorAgreement: 9,
} as const;

export async function LegalDocument({
  namespace,
}: {
  namespace: keyof typeof SECTION_COUNTS;
}) {
  const t = await getTranslations(`legal.${namespace}`);
  const tl = await getTranslations("legal");
  const count = SECTION_COUNTS[namespace];

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="mb-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("title")}
      </h1>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        {tl("lastUpdated")}: 2026
      </p>
      <div className="mb-10 rounded-lg border border-saffron-200 bg-saffron-50 px-4 py-3 text-sm text-zinc-700 dark:border-saffron-900 dark:bg-saffron-950/30 dark:text-zinc-300">
        {tl("disclaimer")}
      </div>
      <div className="flex flex-col gap-8">
        {Array.from({ length: count }, (_, i) => i + 1).map((n) => (
          <section key={n}>
            <h2 className="mb-2 text-lg font-semibold text-persian-700 dark:text-persian-300">
              {t(`s${n}Title` as "s1Title")}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-300">
              {t(`s${n}Body` as "s1Body")}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
