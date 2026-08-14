# Error monitoring (Sentry)

The app is already wired for Sentry (`src/instrumentation.ts`,
`src/instrumentation-client.ts`, `sentry.server.config.ts`,
`sentry.edge.config.ts`, and `withSentryConfig(...)` in `next.config.ts`).
Without a DSN configured, Sentry silently does nothing — the app behaves
exactly as before. Three env vars turn it on.

## One-time setup

1. Create a free account at sentry.io, then create a new project → choose
   **Next.js** as the platform.
2. Sentry shows a DSN that looks like
   `https://xxxxxxxx@oXXXXXX.ingest.us.sentry.io/XXXXXXX`. Copy it.
3. Add these to Vercel (**Settings → Environments → Production →
   Environment Variables**, same place the Supabase/Stripe keys were
   added), then repeat for the **Preview** environment once staging is set
   up (see `docs/staging-environment.md`):
   - `SENTRY_DSN` — the DSN from step 2 (used server-side).
   - `NEXT_PUBLIC_SENTRY_DSN` — the *same* DSN value (used client-side; it
     needs the `NEXT_PUBLIC_` prefix to be readable in the browser bundle).
4. Optional, for readable stack traces (source maps) instead of minified
   ones: in Sentry, go to **Settings → Auth Tokens**, create a token, and
   add three more Vercel env vars: `SENTRY_ORG` (your Sentry org slug),
   `SENTRY_PROJECT` (the project slug from step 1), `SENTRY_AUTH_TOKEN`
   (the token just created). Without these three, error monitoring still
   works fully — you just see minified stack traces instead of the
   original source.
5. Redeploy (env var changes need a redeploy to take effect, same as
   before).

## Verifying it's working

After redeploying with `SENTRY_DSN`/`NEXT_PUBLIC_SENTRY_DSN` set, trigger a
test error (e.g. temporarily `throw new Error("sentry test")` in a page,
load it, then remove the line) and confirm it shows up in the Sentry
project's **Issues** tab within a minute or two.
