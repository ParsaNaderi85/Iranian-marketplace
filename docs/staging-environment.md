# Staging environment

Goal: a second, working copy of the site at a separate URL, so new features
can be tested against real (but non-production) data before they reach
`main` / the live site.

## How it works

Vercel automatically builds a **Preview deployment** — a separate URL, e.g.
`iranian-marketplace-git-staging-<team>.vercel.app` — for every push to any
branch other than `main`. No extra Vercel project or plan is required. The
only two things needed to make that Preview deployment actually work are:

1. A `staging` branch to push to.
2. Its own set of environment variables (Vercel calls this the **Preview**
   environment, separate from the **Production** environment used by
   `main`).

## One-time setup

1. Create and push the branch:

   ```bash
   git checkout -b staging
   git push -u origin staging
   ```

2. In the Vercel dashboard: **Settings → Environments → Preview** (the
   sibling of the "Production" tab used when Production env vars were set
   up) → **Environment Variables** → add the same 8 variables used for
   Production:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`,
   `STRIPE_SECRET_KEY`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`,
   `NEXT_PUBLIC_SITE_URL`.

   **Database choice for staging** — two options, in order of preference:

   - **Separate Supabase project (recommended).** Create a second, free
     Supabase project, run every file in `supabase/migrations/` (or
     `supabase/schema.sql` for a fresh install) against it, and point the
     Preview environment's `NEXT_PUBLIC_SUPABASE_URL` /
     `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` at that
     project instead of the production one. This means staging can never
     corrupt real orders/customers, and is the only way to safely test a
     schema migration before running it in production.
   - **Reuse the production Supabase project (fastest, riskier).** Point
     staging's env vars at the *same* Supabase project as production. This
     is fine short-term while pre-launch (no real customers yet), but it
     means staging writes real Stripe test-mode orders into the same
     tables production reads from, and a bad migration tested on
     "staging" is actually run against production. Switch to a separate
     project before real customer traffic starts.

   For Stripe specifically, use **Stripe test-mode keys**
   (`pk_test_.../sk_test_...`) for staging regardless of which database
   option is chosen, so test checkouts never touch real cards.

3. Set `NEXT_PUBLIC_SITE_URL` for the Preview environment to the staging
   deployment's own URL (Vercel shows it after the first deploy — it's
   *not* the same value as production's).

## Day-to-day workflow

```bash
git checkout staging
git merge main          # bring staging up to date, or work directly on staging
git push                # triggers a new Preview deployment automatically
```

Test the feature at the staging URL. When it looks right, merge `staging`
into `main` and push `main` to update the live site.

## What this does not give you

This is a lightweight staging setup, not a full CI/CD pipeline: there's no
automatic promotion, no smoke tests gating the merge to `main`, and (if
reusing the production database) no true data isolation. That's an
acceptable tradeoff for a pre-launch marketplace; revisit it once there's
real customer traffic to protect.
