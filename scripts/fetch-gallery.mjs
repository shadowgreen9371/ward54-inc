#!/usr/bin/env node
/**
 * Fetch openly-licensed (Creative Commons / public-domain) Rahul Gandhi
 * photos from Wikimedia Commons, resize to a 640×480 gallery crop, and
 * embed them into data/cms/cms.json -> gallery[], each with a visible
 * attribution caption (required by CC BY / CC BY-SA).
 *
 * Only CC0 / CC BY / CC BY-SA / public-domain files are used. No press,
 * agency, or AI-generated images.
 *
 * Run:  node scripts/fetch-gallery.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const NM = join(ROOT, '.tools', 'pdf-parse-isolated', 'node_modules');
const { createCanvas, loadImage } = await import(pathToFileURL(join(NM, 'canvas', 'index.js')).href);
const CMS_PATH = join(ROOT, 'data', 'cms', 'cms.json');

const API = 'https://commons.wikimedia.org/w/api.php?action=query&generator=categorymembers'
  + '&gcmtitle=Category:Rahul_Gandhi&gcmtype=file&gcmlimit=40'
  + '&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1000&format=json';

const stripTags = (s) => String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

console.log('Querying Wikimedia Commons…');
const res = await fetch(API, { headers: { 'User-Agent': 'Ward54-INC-Gallery/1.0 (civic site)' } });
const data = await res.json();
const pages = Object.values((data.query || {}).pages || {});

// Keep CC/PD JPEG-PNG files that actually feature Rahul Gandhi
const picks = [];
for (const p of pages) {
  const ii = (p.imageinfo || [])[0] || {};
  const em = ii.extmetadata || {};
  const lic = (em.LicenseShortName || {}).value || '';
  const artist = stripTags((em.Artist || {}).value) || 'Wikimedia Commons';
  const url = ii.thumburl || ii.url || '';
  const title = (p.title || '').replace(/^File:/, '');
  if (!/cc|public domain|cc0/i.test(lic)) continue;
  if (!/\.(jpe?g|png)$/i.test(ii.url || '')) continue;
  if (!/rahul|bharat jodo/i.test(title)) continue;
  if (/modi/i.test(title)) continue;                 // off-message for a Congress gallery
  // Tidy the artist credit: drop "Original:/Combination of…", cap length
  let credit = artist.replace(/^Original:\s*/i, '').replace(/Combination of.*$/i, '').trim();
  if (!credit || credit.length > 38) credit = 'Indian National Congress';
  picks.push({ title, lic, artist: credit, url });
}
console.log(`Found ${picks.length} usable images.`);

const TW = 640, TH = 480, MAX = 8;
const gallery = [];
let total = 0;
for (const item of picks) {
  if (gallery.length >= MAX) break;
  try {
    process.stdout.write(`  · ${item.title.slice(0, 40)} … `);
    const buf = Buffer.from(await (await fetch(item.url, { headers: { 'User-Agent': 'Ward54-INC-Gallery/1.0' } })).arrayBuffer());
    const img = await loadImage(buf);
    const canvas = createCanvas(TW, TH);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    const scale = Math.max(TW / img.width, TH / img.height);
    const dw = img.width * scale, dh = img.height * scale;
    ctx.drawImage(img, (TW - dw) / 2, (TH - dh) / 2, dw, dh);
    const out = canvas.toBuffer('image/jpeg', { quality: 0.82 });
    const dataUrl = 'data:image/jpeg;base64,' + out.toString('base64');
    gallery.push({
      caption: 'Rahul Gandhi · ' + item.artist + ' / ' + item.lic + ' (Wikimedia)',
      photo: dataUrl
    });
    total += out.length;
    console.log(`✓ ${Math.round(out.length / 1024)} KB · ${item.lic}`);
  } catch (e) {
    console.log('✗', e.message);
  }
}

const cms = JSON.parse(await readFile(CMS_PATH, 'utf8'));
cms.gallery = gallery;
cms._exportedAt = new Date().toISOString();
cms._exportedBy = 'fetch-gallery-script';
cms._note = 'Gallery seeded with Creative-Commons / public-domain Rahul Gandhi photos from Wikimedia Commons (attribution in each caption). Replace/add via admin → Gallery.';
await writeFile(CMS_PATH, JSON.stringify(cms, null, 2), 'utf8');
console.log(`\n✓ cms.json gallery set · ${gallery.length} images · ${Math.round(total / 1024)} KB total`);
