"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { applyReferralCodeIfPresent } from "@/lib/referral/actions";
import type { UserRole } from "@/lib/types";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  locale: z.string(),
});

export type AuthFormState = { error?: string } | undefined;

export async function login(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    locale: formData.get("locale"),
  });
  if (!parsed.success) {
    return { error: "invalid" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "invalidCredentials" };
  }

  redirect(`/${parsed.data.locale}`);
}

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  role: z.enum(["customer", "vendor_owner"]),
  locale: z.string(),
  ref: z.string().optional(),
});

export async function signup(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    role: formData.get("role"),
    locale: formData.get("locale"),
    ref: formData.get("ref") || undefined,
  });
  if (!parsed.success) {
    return { error: "invalid" };
  }

  const { email, password, fullName, role, locale, ref } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role satisfies UserRole,
        preferred_locale: locale,
      },
    },
  });

  if (error) {
    return {
      error: error.message.toLowerCase().includes("already")
        ? "emailInUse"
        : "invalid",
    };
  }

  if (data.user && ref) {
    await applyReferralCodeIfPresent(data.user.id, ref);
  }

  if (role === "vendor_owner") {
    redirect(`/${locale}/vendor/onboarding`);
  }
  redirect(`/${locale}`);
}

export async function logout(formData: FormData) {
  const locale = formData.get("locale");
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${locale}`);
}
