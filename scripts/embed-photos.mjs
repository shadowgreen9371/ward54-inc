#!/usr/bin/env node
/**
 * Embed committee photos into data/cms/cms.json.
 *
 * Reads each PNG/JPG in data/cms/, crops to a 400×400 square (biased
 * upward 12% so faces aren't cut at the chin), compresses to JPEG
 * quality 0.82, and writes the data URL into the named committee slot.
 *
 * Run:  node scripts/embed-photos.mjs
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Locate canvas + pdfjs from the isolated install
const NM = join(ROOT, '.tools', 'pdf-parse-isolated', 'node_modules');
const canvasMod = await import(pathToFileURL(join(NM, 'canvas', 'index.js')).href);
const { createCanvas, loadImage } = canvasMod;

const CMS_PATH = join(ROOT, 'data', 'cms', 'cms.json');
const CMS_DIR  = join(ROOT, 'data', 'cms');

/* Mapping from filename → committee slot.
   I derived this by comparing the uploaded photos against the desktop
   committee screenshot the user shared earlier. Each line: { file, post,
   name, phone } so the script can both embed the photo AND set the name
   in cms.json in one shot. */
const MAPPING = [
  { file: 'Firefly_Gemini Flash_8k cinematic style , refine image 843470.png',
    name: 'Manas Sarkar',     post: 'President',         phone: '+91 98300 39011' },
  { file: 'Firefly_refine and give me the image to upload on site 242481.jpg',
    name: 'Mohammad Nadim',   post: 'Vice President',    phone: '+91 99034 76305' },
  { file: 'Firefly_Gemini Flash_improve this image 8k cinematic 587284.png',
    name: 'Md. Shakil',       post: 'Vice President',    phone: '+91 98365 13741' },
  { file: 'Firefly_Gemini Flash_refine and 8k cinemtaic style blur background 22145.png',
    name: 'Samir Alam',       post: 'General Secretary', phone: '+91 82960 28972' },
  { file: 'Firefly_Gemini Flash_8k cinematic style, improve quality blur background and refine  457101.png',
    name: 'Atif Azmi',        post: 'Secretary',         phone: '+91 97488 60300' },
];

const TARGET = 400; // square output side
const QUALITY = 0.82;

async function processOne(filename) {
  const fullPath = join(CMS_DIR, filename);
  if (!existsSync(fullPath)) {
    console.error('  ✗ not found:', filename);
    return null;
  }
  const img = await loadImage(fullPath);
  const srcSize = Math.min(img.width, img.height);
  const sx = (img.width - srcSize) / 2;
  const sy = Math.max(0, (img.height - srcSize) / 2 - srcSize * 0.12);

  const canvas = createCanvas(TARGET, TARGET);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = '#0e1628';
  ctx.fillRect(0, 0, TARGET, TARGET);
  ctx.drawImage(img, sx, sy, srcSize, srcSize, 0, 0, TARGET, TARGET);

  const buf = canvas.toBuffer('image/jpeg', { quality: QUALITY });
  const dataUrl = 'data:image/jpeg;base64,' + buf.toString('base64');
  return { dataUrl, size: buf.length };
}

// ─── Run ──────────────────────────────────────────────────────────────────
console.log('Reading cms.json…');
const cms = JSON.parse(await readFile(CMS_PATH, 'utf8'));
const congress = cms.committee.congress = []; // rebuild

let total = 0;
for (const row of MAPPING) {
  process.stdout.write(`  Processing ${row.file.slice(0, 50)}…`);
  const result = await processOne(row.file);
  if (!result) { congress.push({ post: row.post, name: row.name, phone: row.phone, photo: null }); continue; }
  congress.push({
    post: row.post,
    name: row.name,
    phone: row.phone,
    photo: result.dataUrl,
  });
  total += result.size;
  console.log(` ✓ ${Math.round(result.size / 1024)} KB`);
}

cms._exportedAt = new Date().toISOString();
cms._exportedBy = 'claude-embed-photos-script';
cms._note = 'Committee photos embedded from data/cms/*.png/jpg uploads. Names + phones + posts also set per the mapping in scripts/embed-photos.mjs. To regenerate: drop new photos into data/cms/ and re-run the script.';

await writeFile(CMS_PATH, JSON.stringify(cms, null, 2), 'utf8');
console.log(`\n✓ cms.json updated · ${congress.length} members · total photo bytes ${Math.round(total / 1024)} KB`);
console.log('  Final committee:');
congress.forEach(m => console.log('  ·', m.post.padEnd(20), '·', m.name.padEnd(20), '·', m.phone, '·', m.photo ? '✓ photo' : '✗ no photo'));
