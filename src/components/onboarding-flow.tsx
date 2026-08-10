"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, Link } from "@/i18n/navigation";
import { routing, localeLabels, type Locale } from "@/i18n/routing";
import { VENDOR_TYPES, type VendorType } from "@/lib/types";

const ONBOARDED_KEY = "im_onboarded";
export const FAVORITE_CATEGORIES_KEY = "im_favorite_categories";

type Step = "language" | "access" | "categories";

export function OnboardingFlow() {
  const t = useTranslations("onboardingFlow");
  const tv = useTranslations("vendorTypes");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [step, setStep] = useState<Step>("language");
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<VendorType[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.localStorage.getItem(ONBOARDED_KEY)) {
      setVisible(true);
    }
  }, []);

  function finish(categories: VendorType[]) {
    window.localStorage.setItem(ONBOARDED_KEY, "true");
    window.localStorage.setItem(FAVORITE_CATEGORIES_KEY, JSON.stringify(categories));
    setVisible(false);
  }

  function toggleCategory(type: VendorType) {
    setSelected((prev) =>
      prev.includes(type) ? prev.filter((c) => c !== type) : [...prev, type],
    );
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        {step === "language" && (
          <>
            <h2 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {t("languageTitle")}
            </h2>
            <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
              {t("languageBody")}
            </p>
            <div className="flex flex-col gap-2">
              {routing.locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    if (loc !== locale) {
                      router.replace(pathname, { locale: loc as Locale });
                    }
                    setStep("access");
                  }}
                  className={`rounded-md border px-4 py-2 text-start font-medium ${
                    loc === locale
                      ? "border-persian-500 bg-persian-50 text-persian-700 dark:bg-persian-950 dark:text-persian-300"
                      : "border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  }`}
                >
                  {localeLabels[loc]}
                </button>
              ))}
            </div>
          </>
        )}

        {step === "access" && (
          <>
            <h2 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {t("accessTitle")}
            </h2>
            <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
              {t("accessBody")}
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setStep("categories")}
                className="rounded-md bg-persian-600 px-4 py-2 font-medium text-white hover:bg-persian-700"
              >
                {t("browseAsGuest")}
              </button>
              <Link
                href="/signup"
                onClick={() => finish(selected)}
                className="rounded-md border border-zinc-300 px-4 py-2 text-center font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                {t("createAccount")}
              </Link>
              <Link
                href="/login"
                onClick={() => finish(selected)}
                className="rounded-md px-4 py-2 text-center text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {t("logIn")}
              </Link>
            </div>
          </>
        )}

        {step === "categories" && (
          <>
            <h2 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {t("categoriesTitle")}
            </h2>
            <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
              {t("categoriesBody")}
            </p>
            <div className="mb-5 flex flex-wrap gap-2">
              {VENDOR_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleCategory(type)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                    selected.includes(type)
                      ? "border-persian-500 bg-persian-600 text-white"
                      : "border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                >
                  {tv(type)}
                </button>
              ))}
            </div>
            <button
              onClick={() => finish(selected)}
              className="w-full rounded-md bg-persian-600 px-4 py-2 font-medium text-white hover:bg-persian-700"
            >
              {t("done")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
