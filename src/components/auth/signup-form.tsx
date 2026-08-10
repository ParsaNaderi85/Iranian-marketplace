"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { signup, type AuthFormState } from "@/lib/auth/actions";

export function SignupForm({
  locale,
  refCode,
}: {
  locale: string;
  refCode?: string;
}) {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    signup,
    undefined,
  );
  const [role, setRole] = useState<"customer" | "vendor_owner">("customer");

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      {refCode && <input type="hidden" name="ref" value={refCode} />}

      <div>
        <label htmlFor="fullName" className="mb-1 block text-sm font-medium">
          {t("fullName")}
        </label>
        <input
          id="fullName"
          name="fullName"
          required
          minLength={2}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

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
          minLength={8}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <fieldset>
        <legend className="mb-1 block text-sm font-medium">{t("role")}</legend>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="role"
              value="customer"
              checked={role === "customer"}
              onChange={() => setRole("customer")}
            />
            {t("roleCustomer")}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="role"
              value="vendor_owner"
              checked={role === "vendor_owner"}
              onChange={() => setRole("vendor_owner")}
            />
            {t("roleVendor")}
          </label>
        </div>
      </fieldset>

      {state?.error && (
        <p className="text-sm text-red-600">
          {state.error === "emailInUse" ? t("emailInUse") : tc("error")}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-persian-600 px-4 py-2 font-medium text-white hover:bg-persian-700 disabled:opacity-60"
      >
        {t("signupCta")}
      </button>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {t("haveAccount")}{" "}
        <Link href="/login" className="text-persian-700 dark:text-persian-400">
          {t("loginCta")}
        </Link>
      </p>
    </form>
  );
}
