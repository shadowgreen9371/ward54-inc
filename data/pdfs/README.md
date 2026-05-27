# Electoral Roll 2026 PDFs — Drop Zone

Upload all 38 part PDFs into **this folder** (`data/pdfs/`) and the
extraction pipeline will produce clean voter records for every part.

## Naming convention

Use this exact pattern so the parser can match each PDF to its part number:

```
data/pdfs/Part_01.pdf
data/pdfs/Part_02.pdf
data/pdfs/Part_03.pdf
...
data/pdfs/Part_38.pdf
```

If the official ECI filename is different (e.g. `S25A163P001.pdf`),
just rename it to `Part_NN.pdf` before uploading. The two-digit
zero-padded number is what matters.

## How to upload (three options)

### A. GitHub web UI — easiest, no setup

1. Open the repo on GitHub in your browser
2. Click the **`data/pdfs/`** folder
3. Click **Add file → Upload files**
4. Drag all 38 PDFs into the drop zone
5. Scroll down, write a short commit message like
   *"Upload Electoral Roll 2026 PDFs"*, click **Commit changes**

GitHub allows up to **25 MB per file** and **100 MB per push** via the
web UI. Electoral Roll PDFs are typically 500 KB – 3 MB each, so all
38 fit comfortably.

### B. Git CLI

```bash
cd ward54-inc
mkdir -p data/pdfs
# copy your PDFs into data/pdfs/ first (rename to Part_NN.pdf)
git add data/pdfs/*.pdf
git commit -m "Upload Electoral Roll 2026 PDFs"
git push origin main
```

### C. GitHub Desktop

Drag the PDFs into the `data/pdfs/` folder via Finder/Explorer,
GitHub Desktop will detect them as changes, write a commit message,
push.

## After upload

When all 38 PDFs are in place, tell Claude:
> *"All 38 PDFs uploaded — please extract voters"*

Claude will run `scripts/extract-voters.mjs`, which:
1. Reads each PDF with `pdf-parse`
2. Pulls out **Sl. No · EPIC ID · Name · Father/Husband Name · House No · Age · Sex** for every voter
3. Writes one JSON file per part to `data/voters/part-NN.json`
4. Updates the public site so each part loads its real voter list on demand

Expected output: ~26,849 voter records across 38 JSON files,
total ~5–8 MB of structured data.

## What gets extracted vs what doesn't

✅ **Extracted from PDF text:**
- Serial number within the part
- EPIC (voter ID) — the 10-character alphanumeric code
- Voter's name
- Father / Husband / Mother's name (relation code F/H/M)
- House number
- Age
- Sex (M/F/O)

❌ **Not extracted (and won't be):**
- **Religion / community classification** — the ECI roll deliberately
  excludes religion and the app does not infer it from names.
  This is both legally required (Model Code of Conduct) and ethically
  the only correct stance for a campaign tool.
- Voter photos — the ECI PDFs publish thumbnails at very low
  resolution and reproducing them in this app would not improve
  recognition. If you have a photographer collecting photos for
  outreach, those can be uploaded via the admin panel per-voter.

## Privacy reminder

Voter data is personal information under the Digital Personal Data
Protection Act, 2023. Whatever you publish on the public GitHub
Pages URL is readable by anyone — be mindful about what fields you
expose vs what you keep admin-only.

The current build keeps the voter database **on the public page**
because it's the same data already published by the ECI. If you
want voter records gated behind login, that's a separate cleanup
and I can wire it.
