#!/usr/bin/env node
/**
 * Electoral Roll 2026 — voter extraction pipeline
 *
 * Reads every PDF in data/pdfs/ matching `Part_NN.pdf`, extracts voter
 * records, and writes one JSON file per part to data/voters/.
 *
 * Usage:
 *   npm install pdf-parse              # one-time, ~20 MB
 *   node scripts/extract-voters.mjs    # parse all parts
 *   node scripts/extract-voters.mjs 7  # parse only Part 7
 *
 * Format produced (data/voters/part-NN.json):
 *   {
 *     "part": 7,
 *     "extractedAt": "2026-05-27T...",
 *     "totals": { "male": 412, "female": 413, "thirdGender": 0, "total": 825 },
 *     "section": "Dr. Suresh Sarkar Road (Premises No. 16 to 29)",
 *     "voters": [
 *       {
 *         "sl": 1,
 *         "voterId": "ABC1234567",
 *         "name": "Md. Rafiqul Islam",
 *         "relType": "F",
 *         "relName": "Md. Abdul Karim",
 *         "house": "16",
 *         "age": 42,
 *         "gender": "M"
 *       },
 *       ...
 *     ]
 *   }
 */

import { readFile, writeFile, readdir, mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT     = join(__dirname, '..');
const PDF_DIR  = join(ROOT, 'data', 'pdfs');
const OUT_DIR  = join(ROOT, 'data', 'voters');

// Lazy import — tries standard install first, then a private .tools/ install
// (helpful when the project is a pnpm workspace that blocks plain npm install
// at the root). pdf-parse v1.1.1 has a buggy index.js that tries to read a
// non-existent debug file at load time, so we always import the inner lib path.
import { pathToFileURL } from 'node:url';
async function importPdfParse() {
  const candidates = [
    'pdf-parse/lib/pdf-parse.js',
    join(ROOT, 'node_modules/pdf-parse/lib/pdf-parse.js'),
    join(ROOT, '.tools/pdf-parse-isolated/node_modules/pdf-parse/lib/pdf-parse.js'),
  ];
  for (const c of candidates) {
    try {
      const url = c.startsWith('/') ? pathToFileURL(c).href : c;
      return (await import(url)).default;
    } catch {}
  }
  console.error('\n❌ pdf-parse not installed. Run:\n   npm install pdf-parse\n');
  process.exit(1);
}
const pdfParse = await importPdfParse();

// ---------------------------------------------------------------------------

const ONLY_PART = process.argv[2] ? parseInt(process.argv[2], 10) : null;

await mkdir(OUT_DIR, { recursive: true });

const files = (await readdir(PDF_DIR))
  .filter(f => /^Part_\d{2}\.pdf$/i.test(f))
  .sort();

if (files.length === 0) {
  console.error('❌ No Part_NN.pdf files found in data/pdfs/');
  console.error('   See data/pdfs/README.md for upload instructions.');
  process.exit(1);
}

console.log(`Found ${files.length} part PDF${files.length === 1 ? '' : 's'} in data/pdfs/`);

let totalVoters = 0;
let totalSkipped = 0;
const summary = [];

for (const file of files) {
  const partNo = parseInt(file.match(/Part_(\d{2})/i)[1], 10);
  if (ONLY_PART !== null && ONLY_PART !== partNo) continue;

  const inPath  = join(PDF_DIR, file);
  const outPath = join(OUT_DIR, `part-${String(partNo).padStart(2, '0')}.json`);
  const size    = (await stat(inPath)).size;

  process.stdout.write(`  Part ${String(partNo).padStart(2, '0')}  ${(size / 1024).toFixed(0).padStart(5)} KB  …`);

  try {
    const buf = await readFile(inPath);
    const pdf = await pdfParse(buf);
    const result = extractPart(pdf.text, partNo);
    await writeFile(outPath, JSON.stringify(result, null, 2), 'utf8');
    totalVoters += result.voters.length;
    totalSkipped += result.skipped || 0;
    summary.push({ part: partNo, voters: result.voters.length, section: result.section });
    console.log(` ✓ ${result.voters.length.toString().padStart(4)} voters extracted`
              + (result.skipped ? `, ${result.skipped} skipped` : ''));
  } catch (err) {
    console.log(` ✗ ${err.message.split('\n')[0]}`);
  }
}

// ---------------------------------------------------------------------------
// Per-PDF extraction

/**
 * Parse the raw text of a single Electoral Roll part PDF.
 * The ECI format is broadly:
 *   - Cover page: assembly constituency, part number, polling station
 *   - Section header: street name + premise range
 *   - Voter blocks (typically 3 per row, 10 rows per page):
 *       <Sl. No>  <EPIC ID>
 *       Name
 *       Father/Husband/Mother's Name
 *       House No: <#>
 *       Age: <##>    Sex: <Male|Female|Third Gender>
 *
 * This parser does its best to be permissive — different state EROs format
 * pages slightly differently. We extract whatever we can confidently identify
 * and skip blocks we can't (counted in `skipped`).
 */
function extractPart(text, partNo) {
  const voters = [];
  let skipped = 0;

  // Section heading — first "Main Town/Village:" or "Section:" line
  const sectionMatch = text.match(
    /(?:Main Town\/Village|Section|Locality)\s*[:\-]?\s*([^\n\r]{4,200})/i
  );
  const section = sectionMatch ? sectionMatch[1].trim() : '';

  // The voter records start after the section header and continue until the
  // final summary page. We split into blocks anchored by an EPIC ID pattern.
  // EPIC IDs are 3 letters + 7 digits, e.g. "ABC1234567".
  const EPIC_RE = /\b([A-Z]{2,3}\d{6,8})\b/g;

  // Index of every EPIC occurrence — gives us anchors to slice voter blocks.
  const epicMatches = [...text.matchAll(EPIC_RE)];

  for (let i = 0; i < epicMatches.length; i++) {
    const m = epicMatches[i];
    const epic = m[1];
    const start = m.index;
    const end = i + 1 < epicMatches.length ? epicMatches[i + 1].index : Math.min(start + 600, text.length);
    const block = text.slice(start, end);

    const parsed = parseVoterBlock(block, epic, voters.length + 1);
    if (parsed) {
      voters.push(parsed);
    } else {
      skipped++;
    }
  }

  // Renumber serials sequentially — the PDF Sl.No can have gaps from
  // deletions across revisions, but the in-app serial should be tidy.
  voters.forEach((v, i) => { v.sl = i + 1; });

  // Totals from the voter list (the cover page's printed totals may include
  // deletions; the extracted count is the ground truth for what we display).
  const male = voters.filter(v => v.gender === 'M').length;
  const female = voters.filter(v => v.gender === 'F').length;
  const thirdGender = voters.filter(v => v.gender === 'O').length;

  return {
    part: partNo,
    extractedAt: new Date().toISOString(),
    totals: { male, female, thirdGender, total: voters.length },
    section,
    skipped,
    voters
  };
}

/**
 * Parse a single voter block (text from one EPIC anchor to the next).
 * Returns null if we can't confidently extract the four critical fields
 * (name, age, gender, and either house or relation).
 */
function parseVoterBlock(block, epic, fallbackSl) {
  // Strip the EPIC itself so it doesn't pollute name parsing
  const after = block.replace(epic, '').replace(/[\r\t]+/g, ' ');

  // Name: first non-empty line after the EPIC, length 3-80, alphabetic
  const lines = after.split(/\n/).map(s => s.trim()).filter(Boolean);
  let name = lines.find(l =>
    l.length >= 3 && l.length <= 80 &&
    /[A-Za-z]/.test(l) &&
    !/^House|^Age|^Sex|^Father|^Husband|^Mother|^Name/i.test(l)
  );
  if (!name) return null;
  name = cleanName(name);

  // Relation
  const relMatch = after.match(/(Father|Husband|Mother)(?:'s)?\s*Name\s*[:\-]?\s*([^\n\r]{2,80})/i);
  const relType = relMatch ? relMatch[1][0].toUpperCase() : null;
  const relName = relMatch ? cleanName(relMatch[2]) : null;

  // House number
  const houseMatch = after.match(/House\s*(?:No\.?|Number)?\s*[:\-]?\s*([^\s\n\r]{1,30})/i);
  const house = houseMatch ? houseMatch[1].replace(/[^A-Za-z0-9\-/]/g, '') : null;

  // Age
  const ageMatch = after.match(/Age\s*[:\-]?\s*(\d{1,3})/i);
  const age = ageMatch ? parseInt(ageMatch[1], 10) : null;

  // Sex / gender
  const sexMatch = after.match(/Sex\s*[:\-]?\s*(Male|Female|Third Gender|Other|M|F|O|T)/i);
  let gender = 'O';
  if (sexMatch) {
    const t = sexMatch[1].toUpperCase();
    gender = t.startsWith('M') ? 'M' : t.startsWith('F') ? 'F' : 'O';
  }

  if (!age && !relName && !house) return null; // not enough signal

  return {
    sl: fallbackSl,
    voterId: epic,
    name,
    relType,
    relName,
    house,
    age,
    gender
  };
}

function cleanName(s) {
  return s
    .replace(/\s+/g, ' ')
    .replace(/^[\W_]+|[\W_]+$/g, '')
    .trim();
}

// ---------------------------------------------------------------------------
// Manifest

const manifestPath = join(OUT_DIR, 'manifest.json');
await writeFile(manifestPath, JSON.stringify({
  generatedAt: new Date().toISOString(),
  totalVoters,
  totalSkipped,
  parts: summary
}, null, 2));

console.log(`\n✓ Done. ${totalVoters.toLocaleString()} voters extracted across ${summary.length} parts.`);
if (totalSkipped) console.log(`  (${totalSkipped.toLocaleString()} blocks skipped — usually duplicate EPIC matches in headers/footers.)`);
console.log(`\n  Output: data/voters/part-NN.json`);
console.log(`  Index:  data/voters/manifest.json`);
console.log(`\nNext: commit the JSON files and the public site will load real voter data per part.`);
