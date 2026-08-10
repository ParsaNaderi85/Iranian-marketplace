"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { login, type AuthFormState } from "@/lib/auth/actions";

export function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    login,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          {t("email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          {t("password")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600">
          {state.error === "invalidCredentials"
            ? t("invalidCredentials")
            : tc("error")}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-persian-600 px-4 py-2 font-medium text-white hover:bg-persian-700 disabled:opacity-60"
      >
        {t("loginCta")}
      </button>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {t("noAccount")}{" "}
        <Link href="/signup" className="text-persian-700 dark:text-persian-400">
          {t("signupCta")}
        </Link>
      </p>
    </form>
  );
}
