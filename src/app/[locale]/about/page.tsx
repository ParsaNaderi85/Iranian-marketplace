import { getTranslations } from "next-intl/server";

export default async function AboutPage() {
  const t = await getTranslations("about");

  const sections = [
    ["missionTitle", "missionBody"],
    ["storyTitle", "storyBody"],
    ["howTitle", "howBody"],
    ["visionTitle", "visionBody"],
  ] as const;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="mb-10 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("title")}
      </h1>
      <div className="flex flex-col gap-10">
        {sections.map(([titleKey, bodyKey]) => (
          <section key={titleKey}>
            <h2 className="mb-2 text-xl font-semibold text-persian-700 dark:text-persian-300">
              {t(titleKey)}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-300">{t(bodyKey)}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
