# CMS data — published source of truth

The public site reads `data/cms/cms.json` from this folder at startup to
override the hardcoded defaults in `index.html`. This is how committee
edits made on the admin panel propagate to every device.

## Workflow

1. **Edit on the admin panel** (`admin.html` after signing in) — your
   edits save into your browser's localStorage. They're visible only to
   you, on that browser.
2. Scroll to the **"Publish to Live Site"** section at the top of the
   admin panel and click **Export & Download**. A `cms.json` file is
   downloaded.
3. Open https://github.com/shadowgreen9371/ward54-inc/upload/main/data/cms
   in your browser, drag the `cms.json` file into the drop zone, write a
   commit message ("Update committee data" is fine), click **Commit**.
4. GitHub Pages rebuilds in ~1 minute. The public site (and admin too,
   when freshly opened) now shows your edits on **every device** — your
   phone, your laptop, anyone else who visits.

## Why this exists

`localStorage` is per-device. Without a backend, edits made on your
desktop browser won't appear on your mobile browser. Committing
`cms.json` to the repo is a poor man's database that works perfectly
on a static GitHub Pages site.

## What goes in cms.json

The exported file holds the full CMS state — homepage copy, committee
office bearers (with photos as base64), polling agents and their
target areas / responsibilities. It is overwritten in full on each
upload. Schema is documented in admin.html (`exportCmsJson()`).

## Privacy

Committee names and phone numbers will be **publicly readable** —
this file is served from the same public URL as `index.html`. That's
the same as if they were hardcoded into `index.html`. If you need
private contact info, that requires the Next.js + Supabase build under
`/apps`, which gates data behind auth.
