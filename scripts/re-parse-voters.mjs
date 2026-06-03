#!/usr/bin/env node
/**
 * Re-parse the existing data/ocr-text/part-NN.txt with smarter EPIC-ID
 * association. The raw OCR text already contains the real EPIC IDs
 * (e.g. FND2786788) — they just weren't being linked to the right voter
 * because the original ±350-char proximity window was too small for
 * parts 3+ where the OCR layout puts IDs further from the Name anchor.
 *
 * This script does no OCR — it only re-parses → ~seconds per part.
 *
 * Output:  data/voters/part-NN.json (overwrite, with `_reparsedAt`)
 * Audit:   prints before/after share of voters with real EPIC IDs.
 *
 * Run:  node scripts/re-parse-voters.mjs
 *       node scripts/re-parse-voters.mjs 3       # only Part 3
 *       node scripts/re-parse-voters.mjs --from 3 --to 38
 */
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT     = join(__dirname, '..');
const TEXT_DIR = join(ROOT, 'data', 'ocr-text');
const OUT_DIR  = join(ROOT, 'data', 'voters');

// ── CLI ───────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const ONLY = args[0] && !args[0].startsWith('--') ? parseInt(args[0],10) : null;
const FROM = parseInt((args[args.indexOf('--from')+1])||1,10) || 1;
const TO   = parseInt((args[args.indexOf('--to')+1])||38,10) || 38;

await mkdir(OUT_DIR,{recursive:true});

// Real West Bengal EPIC patterns observed in the raw OCR:
//   FND2786788, FDZ360004, WB21154024627, etc.
//   3 letters + 7–8 digits OR "WB" + 11 digits OR similar variants
const EPIC_RE = /\b([A-Z]{2,4}\d{7,12}|WB\d{10,14})\b/g;

const summary = [];
let grandReal = 0, grandTotal = 0;

const files = (await readdir(TEXT_DIR))
  .filter(f => /^part-\d{2}\.txt$/i.test(f))
  .sort();

for (const file of files) {
  const partNo = parseInt(file.match(/part-(\d{2})/i)[1], 10);
  if (ONLY !== null && ONLY !== partNo) continue;
  if (partNo < FROM || partNo > TO) continue;

  const text  = await readFile(join(TEXT_DIR, file), 'utf8');
  const inJson = join(OUT_DIR, `part-${String(partNo).padStart(2,'0')}.json`);
  const existing = existsSync(inJson) ? JSON.parse(await readFile(inJson,'utf8')) : null;

  const result = parsePart(text, partNo);
  const realIds = result.voters.filter(v => isRealEpic(v.voterId)).length;
  const total   = result.voters.length;
  grandReal += realIds; grandTotal += total;
  summary.push({ part: partNo, total, realIds });

  // Preserve original section/metadata if any
  const out = {
    part: partNo,
    extractedAt: existing?.extractedAt ?? new Date().toISOString(),
    extractedVia: existing?.extractedVia ?? 'tesseract.js (OCR)',
    _reparsedAt: new Date().toISOString(),
    _reparsedVia: 're-parse-voters.mjs (smarter EPIC association)',
    totals: result.totals,
    section: result.section || existing?.section || '',
    voters: result.voters,
  };
  await writeFile(inJson, JSON.stringify(out, null, 2), 'utf8');

  const pct = total ? (realIds*100/total).toFixed(1) : '0.0';
  console.log(`Part ${String(partNo).padStart(2,'0')}: ${total} voters · ${realIds} real EPIC IDs (${pct}%)`);
}

console.log('\n────────────────────────────────────────');
const overall = grandTotal ? (grandReal*100/grandTotal).toFixed(1) : '0.0';
console.log(`Total: ${grandTotal.toLocaleString()} voters · ${grandReal.toLocaleString()} real EPIC IDs (${overall}%)`);

// ── parser (improved from scripts/ocr-voters.mjs) ─────────────────────────
function isRealEpic(id){ return /^[A-Z]{2,4}\d{7,12}$/.test(id || '') || /^WB\d{10,14}$/.test(id || ''); }

function parsePart(text, partNo) {
  // section
  let section = '';
  const sm = text.match(/Section No and Name\s*[:+]?\s*([^\n]{4,200})/i);
  if (sm) section = sm[1].trim().replace(/\s+/g,' ');

  // every "Name :" anchor that isn't a relation
  const NAME_RE = /\bName\s*[:+\.]+\s*([^\n]{2,80})/g;
  const anchors = [];
  let m;
  while ((m = NAME_RE.exec(text)) !== null) {
    const back = text.slice(Math.max(0, m.index - 30), m.index);
    if (/(?:Father|Mother|Husband)/i.test(back)) continue;
    anchors.push({ index: m.index, name: m[1] });
  }

  // collect every EPIC-like token in the document with its position
  const epicHits = [...text.matchAll(EPIC_RE)].map(em => ({ index: em.index, epic: em[1] }));

  // strategy: pair each anchor to the nearest EPIC that comes AFTER it
  //   (in voter cards, the layout is Name → [other fields] → EPIC).
  // Walk both arrays in order — O(n).
  // Each EPIC can only be used once (so a near-duplicate EPIC doesn't
  // get assigned to the wrong voter).
  let epicCursor = 0;
  const usedEpic = new Set();
  function nextEpicAfter(idx, limitNext) {
    // limitNext = the index of the next anchor → don't reach past it
    while (epicCursor < epicHits.length && epicHits[epicCursor].index < idx) epicCursor++;
    for (let k = epicCursor; k < epicHits.length; k++) {
      if (limitNext != null && epicHits[k].index >= limitNext) break;
      if (!usedEpic.has(k)) { usedEpic.add(k); return epicHits[k].epic; }
    }
    return null;
  }

  // fallback: nearest EPIC by absolute distance, within a wide window
  function fallbackEpic(idx) {
    let best = '', bestDist = 1500;
    for (let k = 0; k < epicHits.length; k++) {
      if (usedEpic.has(k)) continue;
      const d = Math.abs(epicHits[k].index - idx);
      if (d < bestDist) { bestDist = d; best = epicHits[k].epic; }
    }
    return best;
  }

  const voters = [];
  let skipped = 0;
  for (let i = 0; i < anchors.length; i++) {
    const a   = anchors[i];
    const nxt = i + 1 < anchors.length ? anchors[i + 1].index : null;
    const end = nxt ?? Math.min(a.index + 800, text.length);
    const blockText = text.slice(a.index, end);

    const name = cleanName(a.name);
    if (!name || name.length < 3) { skipped++; continue; }
    if (/^\d+\s*-\s*[A-Z]/.test(name)) { skipped++; continue; }
    if (/^(Photo|Available|Assembly|Section|Total|Page|Constituency|And|Name)\b/i.test(name)) { skipped++; continue; }

    const relMatch = blockText.match(/(Father|Husband|Mother)(?:'?s)?\s*Nam[eo]s?\s*[:+\.]+\s*([^\n]{2,80})/i);
    const relType  = relMatch ? relMatch[1][0].toUpperCase() : null;
    const relName  = relMatch ? cleanName(relMatch[2]) : null;

    const houseMatch = blockText.match(/House\s*Number\s*[:+\.]+\s*([^\n]{1,40}?)\s+(?:Photo|Available|Age|Ago)/i);
    const house = houseMatch ? houseMatch[1].trim().replace(/\s+/g,' ') : null;

    const ageMatch = blockText.match(/(?:Age|Ago|Aga)\s*[:+\.]*\s*(\d{1,3})/i);
    const age = ageMatch ? parseInt(ageMatch[1], 10) : null;

    const genderMatch = blockText.match(/(?:Gender|Gonder|Sex)\s*[:+\.]*\s*(M\w*|F\w*)/i);
    let gender = 'O';
    if (genderMatch) {
      const g = genderMatch[1].toLowerCase();
      gender = g.startsWith('m') ? 'M' : g.startsWith('f') ? 'F' : 'O';
    }

    if (!age && !relName && !house) { skipped++; continue; }

    // Try forward EPIC association first (within block), then fall back to
    // wider window if forward search came up empty.
    let voterId = nextEpicAfter(a.index, nxt) || fallbackEpic(a.index);
    if (!voterId) voterId = `P${String(partNo).padStart(2,'0')}S${String(voters.length+1).padStart(4,'0')}`;

    voters.push({ sl: voters.length + 1, voterId, name, relType, relName, house, age, gender });
  }

  const male   = voters.filter(v => v.gender === 'M').length;
  const female = voters.filter(v => v.gender === 'F').length;
  const thirdGender = voters.filter(v => v.gender === 'O').length;

  return { totals: { male, female, thirdGender, total: voters.length }, section, voters, skipped };
}

function cleanName(s) {
  return s
    .replace(/\s+/g, ' ')
    .replace(/^[\W_]+|[\W_]+$/g, '')
    .replace(/\s+(Photo|Available|Photo Available|Photo Not)$/i, '')
    .trim();
}
