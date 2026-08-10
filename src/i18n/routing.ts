import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fa", "ar"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

export const localeDirections: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  fa: "rtl",
  ar: "rtl",
};

export const localeLabels: Record<Locale, string> = {
  en: "English",
  fa: "فارسی",
  ar: "العربية",
};
