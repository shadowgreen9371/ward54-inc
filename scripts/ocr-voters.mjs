#!/usr/bin/env node
/**
 * Electoral Roll 2026 — OCR voter extraction pipeline
 *
 * Used when the source PDFs are scanned (not text). Renders each page
 * with pdfjs-dist → OCRs with tesseract.js → parses voter records →
 * writes data/voters/part-NN.json.
 *
 * Usage:
 *   node scripts/ocr-voters.mjs             # all parts
 *   node scripts/ocr-voters.mjs 1           # just Part 1
 *   node scripts/ocr-voters.mjs 1 --page 3  # just page 3 of Part 1 (debug)
 *
 * Performance: ~10–20 sec per page with tesseract.js → ~30 pages × 38 parts
 * × 15 sec = ~5 hours for a full run. Run in background with --background
 * or process parts incrementally.
 */

import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const PDF_DIR   = join(ROOT, 'data', 'pdfs');
const OUT_DIR   = join(ROOT, 'data', 'voters');
const TEXT_DIR  = join(ROOT, 'data', 'ocr-text'); // raw OCR text per part, kept for debugging

// ---- locate dependencies (standard install first, .tools fallback) --------
const NM_CANDIDATES = [
  join(ROOT, 'node_modules'),
  join(ROOT, '.tools', 'pdf-parse-isolated', 'node_modules'),
];
async function loadModule(relPath, specifierFallback) {
  for (const nm of NM_CANDIDATES) {
    const full = join(nm, relPath);
    if (existsSync(full)) return await import(pathToFileURL(full).href);
  }
  if (specifierFallback) {
    try { return await import(specifierFallback); } catch {}
  }
  throw new Error(`Cannot resolve ${relPath}. Run: npm install tesseract.js pdfjs-dist canvas`);
}
const { createCanvas } = await loadModule('canvas/index.js', 'canvas');
const pdfjsLib  = await loadModule('pdfjs-dist/legacy/build/pdf.mjs', 'pdfjs-dist/legacy/build/pdf.mjs');
const Tesseract = (await loadModule('tesseract.js/src/index.js', 'tesseract.js')).default;

// pdfjs in Node v18+ runs inline when workerPort is null (no separate worker)
// Setting workerSrc to '' or null doesn't work cleanly — instead we pass
// disableWorker:false at document level. Leave GlobalWorkerOptions alone.

// ---- CLI args -------------------------------------------------------------
const args = process.argv.slice(2);
const ONLY_PART = args[0] && !args[0].startsWith('--') ? parseInt(args[0], 10) : null;
const ONLY_PAGE = (() => {
  const i = args.indexOf('--page');
  return i >= 0 && args[i+1] ? parseInt(args[i+1], 10) : null;
})();

await mkdir(OUT_DIR,  { recursive: true });
await mkdir(TEXT_DIR, { recursive: true });

const files = (await readdir(PDF_DIR))
  .filter(f => /^Part_\d{2}\.pdf$/i.test(f))
  .sort();

if (files.length === 0) {
  console.error('❌ No Part_NN.pdf files in data/pdfs/');
  process.exit(1);
}

console.log(`Found ${files.length} PDF${files.length === 1 ? '' : 's'} in data/pdfs/`);
if (ONLY_PART) console.log(`Only Part ${ONLY_PART}${ONLY_PAGE ? ` (page ${ONLY_PAGE})` : ''}`);
console.log('');

// ---- shared Tesseract worker ----------------------------------------------
// One worker → reused across pages → ~10x faster than spinning a new one each page.
console.log('Initialising Tesseract worker (downloads ~10 MB English model on first run)…');
const worker = await Tesseract.createWorker('eng', 1, {
  // Quiet logger — only print fatal errors
  logger: () => {},
});
// Tighten for printed roll layout: assume single uniform block of text, treat
// the page as a sparse page (auto layout), preserve interword spaces.
await worker.setParameters({
  preserve_interword_spaces: '1',
  tessedit_pageseg_mode: '6', // PSM 6 = single uniform block
});
console.log('✓ Tesseract ready\n');

// ---- per-PDF loop ---------------------------------------------------------
let grandTotalVoters = 0;
const summary = [];
const t0 = Date.now();

const FORCE = args.includes('--force'); // re-extract even if output exists

for (const file of files) {
  const partNo = parseInt(file.match(/Part_(\d{2})/i)[1], 10);
  if (ONLY_PART !== null && ONLY_PART !== partNo) continue;

  const outPath = join(OUT_DIR, `part-${String(partNo).padStart(2,'0')}.json`);
  /* Skip parts whose JSON already exists (idempotent resume across crashes
     or interrupted runs). Pass --force to re-extract regardless. */
  if (!FORCE && existsSync(outPath) && !ONLY_PAGE) {
    console.log(`─── Part ${String(partNo).padStart(2,'0')}: already extracted, skipping (--force to re-run) ───`);
    continue;
  }

  const inPath = join(PDF_DIR, file);
  const sizeMB = ((await stat(inPath)).size / 1048576).toFixed(1);
  console.log(`─── Part ${String(partNo).padStart(2,'0')} (${sizeMB} MB) ───`);

  const partT0 = Date.now();
  const fullText = await ocrPart(inPath, partNo);

  // Save the raw OCR text for debugging
  await writeFile(join(TEXT_DIR, `part-${String(partNo).padStart(2,'0')}.txt`), fullText, 'utf8');

  // Parse voter records out of the OCR text
  const result = parsePart(fullText, partNo);

  await writeFile(outPath, JSON.stringify(result, null, 2), 'utf8');

  const dt = ((Date.now() - partT0) / 1000).toFixed(0);
  console.log(`✓ Part ${partNo}: ${result.voters.length} voters extracted in ${dt}s`);
  console.log(`   section: ${result.section || '(not detected)'}`);
  if (result.skipped) console.log(`   ${result.skipped} blocks skipped`);
  console.log('');

  grandTotalVoters += result.voters.length;
  summary.push({ part: partNo, voters: result.voters.length, section: result.section });
}

await worker.terminate();

// Manifest
await writeFile(join(OUT_DIR, 'manifest.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  totalVoters: grandTotalVoters,
  parts: summary,
}, null, 2), 'utf8');

const totalMin = ((Date.now() - t0) / 60000).toFixed(1);
console.log(`\n══════════════════════════════════════════════`);
console.log(`✓ Done. ${grandTotalVoters.toLocaleString()} voters across ${summary.length} parts in ${totalMin} min.`);
console.log(`  Output: data/voters/part-NN.json`);
console.log(`  Raw OCR: data/ocr-text/part-NN.txt (for debugging)`);

// ---------------------------------------------------------------------------
// PDF rendering + OCR

async function ocrPart(pdfPath, partNo) {
  const data = new Uint8Array(await readFile(pdfPath));
  const doc  = await pdfjsLib.getDocument({
    data,
    disableFontFace: true,
    standardFontDataUrl: '',
    useSystemFonts: false,
  }).promise;

  const numPages = doc.numPages;
  const allText = [];
  for (let p = 1; p <= numPages; p++) {
    if (ONLY_PAGE && p !== ONLY_PAGE) continue;
    process.stdout.write(`   page ${String(p).padStart(2,' ')}/${numPages}…`);

    const page = await doc.getPage(p);
    const viewport = page.getViewport({ scale: 2.0 });

    // Render the whole page first
    const fullCanvas = createCanvas(viewport.width, viewport.height);
    const fullCtx = fullCanvas.getContext('2d');
    await page.render({ canvasContext: fullCtx, viewport }).promise;

    const W = viewport.width, H = viewport.height;

    /* Crop into 3 vertical columns and OCR each separately.
       Within a column, voters stack top-to-bottom — no cross-column mixing.
       Small horizontal overlap (10 px) tolerates slight column-divider drift. */
    const colW = Math.floor(W / 3);
    const overlap = 10;
    let pageText = `\n--- PAGE ${p} ---\n`;
    for (let c = 0; c < 3; c++) {
      const sx = Math.max(0, c * colW - overlap);
      const sw = Math.min(W - sx, colW + overlap * 2);
      const colCanvas = createCanvas(sw, H);
      const colCtx = colCanvas.getContext('2d');
      colCtx.drawImage(fullCanvas, sx, 0, sw, H, 0, 0, sw, H);
      const png = colCanvas.toBuffer('image/png');
      const { data: { text } } = await worker.recognize(png);
      pageText += `\n--- COLUMN ${c + 1} ---\n${text}`;
    }

    allText.push(pageText);
    const wordCount = (pageText.match(/\S+/g) || []).length;
    process.stdout.write(` ${String(wordCount).padStart(4,' ')} words\n`);
    page.cleanup();
  }
  return allText.join('\n');
}

// ---------------------------------------------------------------------------
// Voter record parser (operates on OCR text)

/* Anchor on "Name :" rather than EPIC IDs — OCR mangles EPICs unreliably
   but "Name :" is consistently legible in every voter card. */
function parsePart(text, partNo) {
  const voters = [];

  // Section heading
  let section = '';
  const sm = text.match(/Section No and Name\s*[:+]?\s*([^\n]{4,200})/i);
  if (sm) section = sm[1].trim().replace(/\s+/g, ' ');

  // Find every "Name :" anchor. We must distinguish a voter-name line from a
  // relation line. The relation lines read like "Fathers Name:" / "Husbands
  // Name:" / "Mothers Name:" — i.e. the word "Name" is preceded by
  // "Fathers/Mothers/Husbands" (with no s sometimes, OCR-mangled with
  // "Nam[eo]s" sometimes). Also OCR sometimes reads ":" as "+" or ".".
  // Strategy: look at the 30 chars before each "Name" match — if any
  // Father/Mother/Husband stem appears there, it's a relation, skip it.
  const NAME_RE = /\bName\s*[:+\.]+\s*([^\n]{2,80})/g;
  const anchors = [];
  let m;
  while ((m = NAME_RE.exec(text)) !== null) {
    const back = text.slice(Math.max(0, m.index - 30), m.index);
    if (/(?:Father|Mother|Husband)/i.test(back)) continue;
    anchors.push({ index: m.index, name: m[1] });
  }

  // EPIC IDs throughout the document, used for nearest-match lookup
  const EPIC_RE = /\b((?:[A-Z]{2,4}\d{6,8})|(?:WB[\/\\][\d\/\\A-Z]{8,16}))\b/g;
  const epicHits = [...text.matchAll(EPIC_RE)].map(em => ({
    index: em.index,
    epic: em[1].replace(/[\\\/]/g, ''),
  }));

  for (let i = 0; i < anchors.length; i++) {
    const a = anchors[i];
    const end = i + 1 < anchors.length ? anchors[i + 1].index : Math.min(a.index + 600, text.length);
    const blockText = text.slice(a.index, end);
    const fullBlock = text.slice(Math.max(0, a.index - 400), end);

    const name = cleanName(a.name);
    if (!name || name.length < 3) continue;
    // Reject header-text bleeds: "163-ENTAI", "1-DR.SURESH SARKAR ROAD",
    // "Assembly Constituency …", page footers like "Total Pages …", etc.
    if (/^\d+\s*-\s*[A-Z]/.test(name)) continue;
    if (/^(Photo|Available|Assembly|Section|Total|Page|Constituency|And|Name)\b/i.test(name)) continue;

    // Relation (tolerant of OCR variants: "Nam[eo]s?", colon → "+" or ".")
    const relMatch = blockText.match(/(Father|Husband|Mother)(?:'?s)?\s*Nam[eo]s?\s*[:+\.]+\s*([^\n]{2,80})/i);
    const relType = relMatch ? relMatch[1][0].toUpperCase() : null;
    const relName = relMatch ? cleanName(relMatch[2]) : null;

    // House number — strip trailing "Photo" word that often follows
    const houseMatch = blockText.match(/House\s*Number\s*[:+\.]+\s*([^\n]{1,40}?)\s+(?:Photo|Available|Age|Ago)/i);
    const house = houseMatch ? houseMatch[1].trim().replace(/\s+/g, ' ') : null;

    // Age — OCR sometimes reads "Age" as "Ago"
    const ageMatch = blockText.match(/(?:Age|Ago|Aga)\s*[:+\.]*\s*(\d{1,3})/i);
    const age = ageMatch ? parseInt(ageMatch[1], 10) : null;

    // Gender — OCR reads "Male" cleanly but "Female" sometimes as "Femalo"
    const genderMatch = blockText.match(/(?:Gender|Gonder|Sex)\s*[:+\.]*\s*(M\w*|F\w*)/i);
    let gender = 'O';
    if (genderMatch) {
      const g = genderMatch[1].toLowerCase();
      gender = g.startsWith('m') ? 'M' : g.startsWith('f') ? 'F' : 'O';
    }

    // EPIC — closest one to this anchor (within ±300 chars)
    let voterId = '';
    let bestDist = 350;
    for (const eh of epicHits) {
      const d = Math.abs(eh.index - a.index);
      if (d < bestDist) { bestDist = d; voterId = eh.epic; }
    }
    if (!voterId) voterId = `P${String(partNo).padStart(2,'0')}S${String(voters.length+1).padStart(4,'0')}`;

    if (!age && !relName && !house) continue; // not enough signal

    voters.push({
      sl: voters.length + 1,
      voterId,
      name,
      relType,
      relName,
      house,
      age,
      gender,
    });
  }

  const male   = voters.filter(v => v.gender === 'M').length;
  const female = voters.filter(v => v.gender === 'F').length;
  const thirdGender = voters.filter(v => v.gender === 'O').length;

  return {
    part: partNo,
    extractedAt: new Date().toISOString(),
    extractedVia: 'tesseract.js (OCR)',
    totals: { male, female, thirdGender, total: voters.length },
    section,
    voters,
  };
}

function cleanName(s) {
  return s
    .replace(/\s+/g, ' ')
    .replace(/^[\W_]+|[\W_]+$/g, '')
    .replace(/\s+(Photo|Available|Photo Available|Photo Not)$/i, '')
    .trim();
}
