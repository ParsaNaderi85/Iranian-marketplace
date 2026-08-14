# Database backups and restore procedure

The marketplace's only durable state is the Supabase Postgres database
(orders, products, vendors, profiles, coupons, etc). Everything else
(Vercel deployment, Stripe, Resend) is stateless or externally owned. This
document is the one thing to read before touching backups or doing a
restore under pressure.

## 1. Confirm backups are actually enabled

Supabase backup behavior depends on your project's **plan tier**, checked
under **Supabase Dashboard → Project Settings → Backups** (some dashboard
versions show it under **Database → Backups**):

- **Free tier**: Supabase does *not* guarantee automatic backups. Treat the
  live database as unprotected until you've verified otherwise in the
  Backups page for this specific project.
- **Pro tier and above**: daily automatic backups are included, with
  retention length depending on plan (commonly 7 days on Pro). Point-in-Time
  Recovery (PITR, restore to any second within a retention window) is a
  paid add-on on top of Pro, not included by default.

**Action:** open the Backups page for this project and note down: (a) which
tier you're on, (b) whether "Scheduled backups" show any completed runs, (c)
retention window. If nothing has run yet or the page says backups aren't
available on your plan, the practical mitigation is manual, scripted exports
(see §3) until you upgrade or backups start running.

## 2. Restore procedure (from a Supabase-managed backup)

1. Go to **Project Settings → Backups** in the Supabase dashboard.
2. Pick the backup (a daily snapshot, or a PITR timestamp if enabled) you
   want to restore to.
3. **Read the warning carefully — restoring replaces the current database
   with the backup's contents.** Any orders, signups, or vendor changes
   made after that snapshot are lost. There is no partial/selective restore
   from this UI.
4. Because this is destructive, prefer restoring into a **new project**
   first (Supabase supports restoring a backup into a fresh project in some
   plans) or exporting/verifying data before restoring in place, whenever
   the situation allows time for that. Only restore directly in place when
   the current database is already unusable (e.g., after a bad migration or
   data corruption) and speed matters more than caution.
5. After a restore, re-run any `supabase/migrations/*.sql` files newer than
   the backup's timestamp — a restore rolls back schema changes too, not
   just data.
6. Rotate the Supabase service role key and anon key after any incident
   that triggered a restore (compromised data, leaked credentials), since a
   restore alone doesn't invalidate keys that may have been exposed.

## 3. Manual backup (works on any plan, including Free)

The Supabase CLI's own `db dump` command requires Docker Desktop to be
installed locally, which is unnecessary overhead just to take a backup. Use
`scripts/backup-database.mjs` instead — it connects with the same
service-role client the app already uses and exports every table's data to
one JSON file, no Docker required:

```bash
node scripts/backup-database.mjs
```

This writes `backups/backup-<date>.json`. That folder is gitignored — copy
the file somewhere outside the project (a cloud drive, USB stick) for
safekeeping; a backup that lives only next to the thing it's backing up
doesn't protect against an account-level incident.

To restore from one of these JSON files, write a small script that reads
the file and re-inserts each table's rows via the same service-role
client (`supabase.from(table).insert(rows)`), table by table. This is a
data-only restore — it assumes the schema (tables/columns) already exists,
so run any newer `supabase/migrations/*.sql` files first if restoring into
a fresh project.

## 4. What to check periodically

- Once a month: confirm the Backups page still shows recent successful
  runs (a silently failing backup schedule is the worst kind of
  "protected").
- Before any risky schema migration: take a manual `pg_dump` first, even if
  automatic backups are enabled — automatic backups run on a schedule, not
  on-demand right before your migration.
