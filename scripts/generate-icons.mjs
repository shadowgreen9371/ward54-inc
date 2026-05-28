#!/usr/bin/env node
/**
 * Generate PWA icons from the INC logo embedded in index.html.
 *
 * Outputs into icons/:
 *   icon-192.png, icon-512.png            — standard "any" icons (logo on dark bg)
 *   icon-192-maskable.png, icon-512-maskable.png — maskable (logo in 80% safe zone)
 *   apple-touch-icon.png (180)            — iOS home-screen icon
 *   favicon-32.png, favicon-16.png        — browser tab
 *
 * Run:  node scripts/generate-icons.mjs
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const NM = join(ROOT, '.tools', 'pdf-parse-isolated', 'node_modules');
const { createCanvas, loadImage } = await import(pathToFileURL(join(NM, 'canvas', 'index.js')).href);

const ICONS_DIR = join(ROOT, 'icons');
await mkdir(ICONS_DIR, { recursive: true });

// ── Extract the inc-logo data URL from index.html ──────────────────────────
const html = await readFile(join(ROOT, 'index.html'), 'utf8');
const m = html.match(/class="inc-logo"\s+src="(data:image\/[a-z]+;base64,[^"]+)"/);
if (!m) { console.error('✗ could not find inc-logo data URL in index.html'); process.exit(1); }
const logo = await loadImage(m[1]);
console.log('Loaded logo', logo.width + '×' + logo.height);

function paintBackground(ctx, size) {
  // Cinematic navy radial with a faint tricolour glow — matches the hero.
  const g = ctx.createRadialGradient(size*0.5, size*0.32, size*0.05, size*0.5, size*0.55, size*0.75);
  g.addColorStop(0, '#1a2348');
  g.addColorStop(0.6, '#0d1430');
  g.addColorStop(1, '#070b18');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  // subtle saffron + green corner glows
  const sa = ctx.createRadialGradient(size*0.18, size*0.18, 0, size*0.18, size*0.18, size*0.55);
  sa.addColorStop(0, 'rgba(255,153,51,0.22)'); sa.addColorStop(1, 'transparent');
  ctx.fillStyle = sa; ctx.fillRect(0, 0, size, size);
  const gr = ctx.createRadialGradient(size*0.84, size*0.86, 0, size*0.84, size*0.86, size*0.55);
  gr.addColorStop(0, 'rgba(19,136,8,0.22)'); gr.addColorStop(1, 'transparent');
  ctx.fillStyle = gr; ctx.fillRect(0, 0, size, size);
}

function drawLogo(ctx, size, scale) {
  const d = size * scale;
  const x = (size - d) / 2, y = (size - d) / 2;
  // circular clip so the (square) logo reads as a round emblem
  ctx.save();
  ctx.beginPath();
  ctx.arc(size/2, size/2, d/2, 0, Math.PI*2);
  ctx.closePath();
  ctx.clip();
  // cover-fit the source into the circle box
  const src = Math.min(logo.width, logo.height);
  const sx = (logo.width - src)/2, sy = (logo.height - src)/2;
  ctx.drawImage(logo, sx, sy, src, src, x, y, d, d);
  ctx.restore();
  // gold ring
  ctx.beginPath();
  ctx.arc(size/2, size/2, d/2 - Math.max(1, size*0.006), 0, Math.PI*2);
  ctx.lineWidth = Math.max(2, size*0.018);
  ctx.strokeStyle = '#c9a84c';
  ctx.stroke();
}

async function make(name, size, { maskable=false, transparent=false } = {}) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  if (!transparent) paintBackground(ctx, size);
  // maskable: keep logo inside the central 80% safe zone → scale 0.66
  // standard: fill more of the tile → scale 0.86
  drawLogo(ctx, size, maskable ? 0.66 : 0.86);
  const buf = canvas.toBuffer('image/png');
  await writeFile(join(ICONS_DIR, name), buf);
  console.log('  ✓', name, Math.round(buf.length/1024) + ' KB');
}

console.log('Generating icons…');
await make('icon-192.png', 192);
await make('icon-512.png', 512);
await make('icon-192-maskable.png', 192, { maskable: true });
await make('icon-512-maskable.png', 512, { maskable: true });
await make('apple-touch-icon.png', 180);
await make('favicon-32.png', 32);
await make('favicon-16.png', 16);
console.log('Done → icons/');
