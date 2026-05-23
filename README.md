# Ward 54 — Indian National Congress (Voter Directory)

A single-page web app for **Ward No. 54 (163-Entally Assembly Constituency)**, Kolkata Municipal Corporation. Built for INC ward-level operations: polling booth lookup, part-wise voter lists, an admin control panel, and offline-friendly PDF export.

## Live

Open `index.html` in any modern browser — no build step, no backend required.

## Data source

All booth metadata is sourced from the official **Electoral Roll 2026 S25 West Bengal — Draft Roll Revision 1** (Date of Updation: 16-12-2025), Special Intensive Revision 2026:

- **Assembly Constituency:** 163 — Entally (General)
- **Parliamentary Constituency:** 24 — Kolkata Uttar (Gen)
- **Ward:** 054, District: Kolkata North, PIN: 700014
- **Total electors:** 26,849 (Male: 13,850 / Female: 12,999 / Third Gender: 0)
- **38 polling booths** across 12 physical buildings (Entally Academy, Taltala Dispensary, Fateh Hall, KMC Health Unit & Community Hall, VIP Hall, KMC Primary School, Alisha Ashiyana, Anjuman Girls Higher Secondary School, Anjuman Mofidul Islam Girls High School, White House, Hena Hall, Sir Syed Ahmed School)

Each part includes its official section name (street + premise ranges) verbatim from the ECI roll.

## Features

### Public (no login)
- Landing page with INC branding for Ward No. 54
- **Polling stations** — interactive Leaflet map of all 38 booths with search by name/address
- **Part view** — per-booth section info, voter totals (Male/Female), and read-only voter table
- **PDF / CSV export** of any part's voter list

### Admin (OTP login)
- Login via email + 6-digit OTP (demo mode logs OTP to browser console)
- **Admin Control Panel** with:
  - Site logo upload, propagated across all pages
  - Ward & constituency info editor
  - Inline editor for every polling station (name, address, lat/lng, parts)
  - Voter management grid with per-station counts
- Voter list table gains Add / Edit / Delete with auto-reindex on part moves and deletes
- Context-aware edit modal showing the voter's name, serial, and part being edited

## Files

| Path | Purpose |
|---|---|
| `index.html` | Entire app (HTML + CSS + inline JS, no dependencies bundled — Leaflet & jsPDF via CDN) |
| `README.md` | This file |

## Admin login (demo)

- **Email:** `admin@ward54.in` (or `admin`)
- **OTP:** Generated on send and **logged to the browser console** (F12 → Console). No real email is sent — production deployment would need a backend OTP service.

## Status

- ✅ Booth metadata (all 38 parts) — official Electoral Roll 2026
- ✅ Section names & per-part totals — official
- 🟡 Voter entries — in progress; sample entries currently loaded for Part 1 (real names from PDF) and a few others. Bulk import of all 26,849 entries requires OCR/data-entry work beyond a single session.

## License

Internal campaign tool for the Ward 54 INC unit. Not for redistribution.
