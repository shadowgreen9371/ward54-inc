#!/usr/bin/env node
/**
 * Generates the Play Store feature graphic (1024x500) + the small store icon
 * (512x512). The graphic mirrors the visual identity of the in-app hero:
 * dark navy background, tricolour accents, gold-ringed INC seal centre-left,
 * and bold WARD NO. 54 text on the right.
 *
 * Run:  node scripts/gen-play-store-graphic.mjs
 * Out:  play-store-assets/feature-graphic.png  (1024x500, sRGB)
 *       play-store-assets/store-icon-512.png   (512x512, sRGB)
 */
import { createCanvas, loadImage } from '/Users/shadowfx/54ward.inc/ward54-inc/.tools/pdf-parse-isolated/node_modules/canvas/index.js';
import { writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT  = join(ROOT, 'play-store-assets');
const SEAL = join(ROOT, 'icons', 'icon-512.png');

// ── Feature graphic 1024 x 500 ───────────────────────────────────────────
{
  const W = 1024, H = 500;
  const c = createCanvas(W, H);
  const x = c.getContext('2d');

  // 1) Dark navy gradient background
  const bg = x.createRadialGradient(W*0.18, H*0.4, 60, W*0.18, H*0.4, W*0.85);
  bg.addColorStop(0,    '#1a2540');
  bg.addColorStop(0.55, '#0d1428');
  bg.addColorStop(1,    '#070b18');
  x.fillStyle = bg; x.fillRect(0,0,W,H);

  // 2) Subtle grid texture
  x.strokeStyle = 'rgba(255,255,255,0.04)'; x.lineWidth = 1;
  for (let i=0; i<W; i+=42) { x.beginPath(); x.moveTo(i,0); x.lineTo(i,H); x.stroke(); }
  for (let j=0; j<H; j+=42) { x.beginPath(); x.moveTo(0,j); x.lineTo(W,j); x.stroke(); }

  // 3) Soft saffron glow behind the seal
  const glow = x.createRadialGradient(290, H/2, 0, 290, H/2, 260);
  glow.addColorStop(0,   'rgba(255,153,51,0.32)');
  glow.addColorStop(0.5, 'rgba(232,130,30,0.18)');
  glow.addColorStop(1,   'rgba(232,130,30,0)');
  x.fillStyle = glow; x.fillRect(0,0,W,H);

  // 4) INC seal on the left
  const seal = await loadImage(SEAL);
  const SZ = 260;
  const sx = 290 - SZ/2, sy = H/2 - SZ/2;
  // outer gold ring
  x.beginPath();
  x.arc(290, H/2, SZ/2 + 8, 0, Math.PI*2);
  const ring = x.createLinearGradient(290-SZ/2, H/2, 290+SZ/2, H/2);
  ring.addColorStop(0,    '#c9a84c');
  ring.addColorStop(0.5,  '#ffd089');
  ring.addColorStop(1,    '#c9a84c');
  x.strokeStyle = ring; x.lineWidth = 4; x.stroke();
  // image clipped to circle
  x.save();
  x.beginPath(); x.arc(290, H/2, SZ/2, 0, Math.PI*2); x.clip();
  x.drawImage(seal, sx, sy, SZ, SZ);
  x.restore();

  // 5) Right column text block
  const TX = 520, baseY = 150;

  // "WEST BENGAL · KOLKATA" tiny line
  x.fillStyle = '#c9a84c';
  x.font = 'bold 16px sans-serif';
  x.textAlign = 'left';
  x.fillText('WEST BENGAL  ·  KOLKATA', TX, baseY);

  // "WARD NO. 54" tricolour gradient text
  const grad = x.createLinearGradient(TX, baseY+10, TX+540, baseY+90);
  grad.addColorStop(0,    '#FF9933');
  grad.addColorStop(0.45, '#FFD089');
  grad.addColorStop(0.55, '#FFFFFF');
  grad.addColorStop(0.85, '#86e08a');
  grad.addColorStop(1,    '#138808');
  x.fillStyle = grad;
  x.font = '900 78px sans-serif';
  x.fillText('WARD NO. 54', TX, baseY + 76);

  // "Kolkata Municipal Corporation" italic gold
  x.fillStyle = '#ffd089';
  x.font = 'italic 600 22px sans-serif';
  x.fillText('Kolkata Municipal Corporation', TX, baseY + 116);

  // Tricolour INC line
  x.font = '900 28px sans-serif';
  let cx = TX;
  const incParts = [['INDIAN ','#FF9933'], ['NATIONAL ','#FFFFFF'], ['CONGRESS','#22c55e']];
  for (const [w,colour] of incParts) {
    x.fillStyle = colour;
    x.fillText(w, cx, baseY + 168);
    cx += x.measureText(w).width;
  }

  // Stat strip
  x.fillStyle = 'rgba(255,255,255,0.06)';
  x.strokeStyle = 'rgba(255,255,255,0.18)';
  x.lineWidth = 1;
  const sX = TX, sY = baseY + 200, sW = 440, sH = 56, r = 28;
  // rounded rect
  x.beginPath();
  x.moveTo(sX+r,sY); x.lineTo(sX+sW-r,sY); x.arc(sX+sW-r,sY+r,r,-Math.PI/2,0);
  x.lineTo(sX+sW,sY+sH-r); x.arc(sX+sW-r,sY+sH-r,r,0,Math.PI/2);
  x.lineTo(sX+r,sY+sH); x.arc(sX+r,sY+sH-r,r,Math.PI/2,Math.PI);
  x.lineTo(sX,sY+r); x.arc(sX+r,sY+r,r,Math.PI,3*Math.PI/2); x.closePath();
  x.fill(); x.stroke();

  // LIVE pulse
  x.fillStyle = '#22ff88';
  x.beginPath(); x.arc(sX+22, sY+sH/2, 5, 0, Math.PI*2); x.fill();
  x.fillStyle = '#7fffaa';
  x.font = 'bold 13px sans-serif';
  x.fillText('LIVE', sX+34, sY+sH/2+5);

  // Stats: 26,849 voters · 12 stations · 38 booths
  const items = [
    {n:'26,849', l:'VOTERS'},
    {n:'12',     l:'STATIONS'},
    {n:'38',     l:'BOOTHS'}
  ];
  let ix = sX + 90;
  for (const it of items) {
    // Number at 900 20px white — measure with correct font
    x.font = '900 20px sans-serif';
    x.fillStyle = '#fff';
    x.fillText(it.n, ix, sY+sH/2 + 6);
    const numW = x.measureText(it.n).width;
    // Label at bold 11px gray — measure with correct font, leave gap
    x.font = '900 11px sans-serif';
    x.fillStyle = '#94a3b8';
    x.fillText(it.l, ix + numW + 6, sY+sH/2 + 6);
    const lblW = x.measureText(it.l).width;
    ix += numW + lblW + 22;
  }

  // tricolour underline at the bottom
  const stripe = x.createLinearGradient(0, H-6, W, H-6);
  stripe.addColorStop(0,   '#FF9933');
  stripe.addColorStop(0.5, '#FFFFFF');
  stripe.addColorStop(1,   '#138808');
  x.fillStyle = stripe; x.fillRect(0, H-6, W, 6);

  await writeFile(join(OUT,'feature-graphic.png'), c.toBuffer('image/png'));
  console.log('feature-graphic.png    1024x500  ✓');
}

// ── 512x512 high-res store icon (Play Console asks for this separately) ─
{
  const SZ = 512;
  const c = createCanvas(SZ,SZ);
  const x = c.getContext('2d');
  const seal = await loadImage(SEAL);
  // dark navy background
  x.fillStyle = '#0a0f1e'; x.fillRect(0,0,SZ,SZ);
  // gold ring + seal
  x.save();
  x.beginPath(); x.arc(SZ/2, SZ/2, SZ/2 - 16, 0, Math.PI*2); x.clip();
  x.drawImage(seal, 16, 16, SZ-32, SZ-32);
  x.restore();
  x.lineWidth = 6;
  const ring = x.createLinearGradient(0, 0, SZ, SZ);
  ring.addColorStop(0,'#c9a84c'); ring.addColorStop(0.5,'#ffd089'); ring.addColorStop(1,'#c9a84c');
  x.strokeStyle = ring;
  x.beginPath(); x.arc(SZ/2, SZ/2, SZ/2 - 13, 0, Math.PI*2); x.stroke();
  await writeFile(join(OUT,'store-icon-512.png'), c.toBuffer('image/png'));
  console.log('store-icon-512.png      512x512  ✓');
}
