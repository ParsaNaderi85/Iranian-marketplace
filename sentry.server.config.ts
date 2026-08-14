import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  // Errors are the priority for a small marketplace app; keep the debug
  // logger off in production to avoid noisy server logs.
  debug: false,
});
