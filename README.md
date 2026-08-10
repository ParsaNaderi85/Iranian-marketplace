# Iranian Souq

Multi-vendor marketplace connecting Iranian supermarkets and restaurants in Dubai with customers. Vendors manage their own store/menu and receive orders directly; the platform takes a commission per order. Built with Next.js 16 (App Router), Supabase (Postgres + Auth), Stripe, and next-intl (English/Farsi/Arabic, with full RTL support).

## Setup

### 1. Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL editor, run the contents of [`supabase/schema.sql`](supabase/schema.sql) — this creates all tables, RLS policies, the seed categories, and the trigger that creates a `profiles` row on signup.
3. In **Project Settings → API**, copy the Project URL, `anon` public key, and `service_role` secret key.

### 2. Stripe

1. Create a [Stripe](https://stripe.com) account (test mode is fine to start).
2. Copy the test **Publishable key** and **Secret key** from the Stripe Dashboard.
3. For local webhook testing, install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   This prints a webhook signing secret (`whsec_...`) to use locally.

### 3. Environment variables

Copy `.env.local.example` to `.env.local` and fill in the values from the two steps above.

### 4. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How the marketplace works

- **Customers** browse approved supermarkets/restaurants, add items from a single vendor to a cart (stored in `localStorage`), and check out with either Stripe (online) or cash/card on delivery.
- **Vendors** sign up, submit a store profile (pending admin approval), then manage products/menu and incoming orders once approved.
- **Admins** approve/suspend vendors, adjust each vendor's commission rate, and see all orders across the platform.
- Commission is calculated and recorded on every order; for this MVP, online payments go to the platform's own Stripe account and vendor payouts are settled manually outside the app (see the build plan for why — Stripe Connect onboarding is deferred until there's real vendor volume).

## Known gaps (intentionally deferred)

- No automatic vendor payouts (Stripe Connect) — commission is tracked, payouts are manual for now.
- No delivery/courier system — vendors deliver their own orders.
- No native mobile app yet (this is the web app the mobile app would eventually share a backend with).
- No automated test suite.
