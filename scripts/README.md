# Scripts

## `migrate-from-html.mjs`

Extracts `partsBase`, `partSection`, `voterDB`, and `buildingPhotos` from the legacy `index.html` and upserts them into Supabase via the service-role key.

```bash
# Dry run — parses everything, prints sample, makes no DB calls
node scripts/migrate-from-html.mjs

# Apply — requires service-role env vars
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=eyJ... \
MIGRATE=apply \
  node scripts/migrate-from-html.mjs
```

Run the seed SQL **first** so `polling_stations` exists with the canonical slugs the migration maps to.

```bash
supabase db push                       # creates schema
psql "$DATABASE_URL" -f supabase/seed.sql   # inserts 12 stations + 38 part stubs
node scripts/migrate-from-html.mjs     # dry run
MIGRATE=apply node scripts/migrate-from-html.mjs
```
