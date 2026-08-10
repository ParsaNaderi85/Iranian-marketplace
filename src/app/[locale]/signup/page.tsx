import { getTranslations } from "next-intl/server";
import { SignupForm } from "@/components/auth/signup-form";

export default async function SignupPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { locale } = await params;
  const { ref } = await searchParams;
  const t = await getTranslations("auth");

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("signupTitle")}
      </h1>
      <SignupForm locale={locale} refCode={ref} />
    </div>
  );
}
