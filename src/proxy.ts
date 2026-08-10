import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { createProxySupabaseClient } from "@/lib/supabase/proxy";

const handleI18nRouting = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const response = handleI18nRouting(request);

  // Refresh the Supabase auth session cookie on every request so server
  // components always see a valid (non-expired) session. Route-level
  // authorization still happens close to the data (see src/lib/auth/session.ts)
  // per Next.js's recommendation not to rely on proxy for anything beyond
  // optimistic checks.
  const supabase = createProxySupabaseClient(request, response);
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
