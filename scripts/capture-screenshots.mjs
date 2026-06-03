#!/usr/bin/env node
/**
 * Captures Play-Store-ready phone screenshots of the live ward 54 site
 * using puppeteer-core driving the system-installed Google Chrome.
 *
 * Output 4 PNGs at 1080x1920 (Pixel-7-class portrait): play-store-assets/screen-{1..4}.png
 *
 * Run:  node scripts/capture-screenshots.mjs
 */
import puppeteer from '/Users/shadowfx/54ward.inc/ward54-inc/mobile/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT  = join(ROOT, 'play-store-assets');
const URL  = 'https://shadowgreen9371.github.io/ward54-inc/';

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--hide-scrollbars','--disable-web-security']
});
const page = await browser.newPage();
// Pixel-7 portrait viewport, 2x DPR for crisp text
await page.setViewport({ width: 540, height: 960, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.setUserAgent('Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36');

const sleep = ms => new Promise(r => setTimeout(r, ms));

console.log('Loading site…');
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
await sleep(1500); // Allow CMS fetch + animations

// 1) Hero top — logo + bars + LIVE strip
await page.evaluate(() => window.scrollTo(0,0));
await sleep(300);
await page.screenshot({ path: join(OUT,'screen-1-hero.png'), fullPage: false });
console.log('screen-1-hero.png  ✓');

// 2) Scroll to Find-Your-Booth + Notice Board + Inspirations row
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await sleep(400);
await page.screenshot({ path: join(OUT,'screen-2-find-booth.png'), fullPage: false });
console.log('screen-2-find-booth.png  ✓');

// 3) Polling Stations page (p2)
await page.evaluate(() => window.scrollTo(0,0));
await page.evaluate(() => { if (typeof goTo === 'function') goTo('p2'); });
await sleep(1200);
await page.screenshot({ path: join(OUT,'screen-3-stations.png'), fullPage: false });
console.log('screen-3-stations.png  ✓');

// 4) Committee / Office Bearers page (p5)
await page.evaluate(() => { if (typeof goTo === 'function') goTo('p5'); });
await sleep(1200);
await page.evaluate(() => window.scrollTo(0,0));
await page.screenshot({ path: join(OUT,'screen-4-committee.png'), fullPage: false });
console.log('screen-4-committee.png  ✓');

await browser.close();
console.log('Done.');
