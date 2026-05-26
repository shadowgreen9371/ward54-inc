#!/usr/bin/env node
/**
 * Migrate data from the legacy single-file `index.html` into Supabase.
 *
 * Strategy: the legacy app embedded its dataset in plain JS objects at the
 * top of `<script>` (partsBase, partSection, voterDB, buildingPhotos, agents).
 * This script:
 *   1. Reads `index.html`,
 *   2. Extracts each named JS literal via balanced-brace parsing,
 *   3. Evaluates them inside an isolated `vm.Script` sandbox,
 *   4. Maps to Supabase rows and upserts via the service-role client.
 *
 * Usage:
 *   pnpm dlx ts-node scripts/migrate-from-html.mjs       # dry-run (prints)
 *   MIGRATE=apply node scripts/migrate-from-html.mjs    # writes to DB
 *
 * Required env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HTML_PATH = join(__dirname, '..', 'index.html');
const APPLY = process.env.MIGRATE === 'apply';

/** Extract a `name = <expr>;` literal from the JS source via brace-matching. */
function extractLiteral(src, name) {
  const re = new RegExp(`\\b(?:var|let|const)\\s+${name}\\s*=\\s*`, 'g');
  const m = re.exec(src);
  if (!m) return null;
  let i = re.lastIndex;
  const opener = src[i];
  if (opener !== '{' && opener !== '[') return null;
  const close = opener === '{' ? '}' : ']';
  let depth = 0;
  let inString = null;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (inString) {
      if (ch === '\\') { i++; continue; }
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inString = ch; continue; }
    if (ch === opener) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return src.slice(re.lastIndex, i + 1);
    }
  }
  return null;
}

function evalSafe(literal) {
  return vm.runInNewContext(`(${literal})`, {}, { timeout: 2000 });
}

function readScriptBlocks(html) {
  const out = [];
  const re = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  return out.join('\n');
}

async function main() {
  const html = readFileSync(HTML_PATH, 'utf8');
  const js = readScriptBlocks(html);

  const names = ['partsBase', 'partSection', 'voterDB', 'buildingPhotos'];
  const extracted = {};
  for (const n of names) {
    const lit = extractLiteral(js, n);
    if (!lit) {
      console.warn(`! Could not find literal: ${n}`);
      continue;
    }
    try {
      extracted[n] = evalSafe(lit);
      console.log(`✓ ${n}: ${Array.isArray(extracted[n]) ? extracted[n].length : Object.keys(extracted[n]).length} entries`);
    } catch (err) {
      console.error(`✗ Failed to eval ${n}:`, err.message);
    }
  }

  if (!APPLY) {
    console.log('\nDry run only — set MIGRATE=apply to write to Supabase.');
    console.log('Sample partsBase[1]:', JSON.stringify(extracted.partsBase?.[1] ?? extracted.partsBase?.['1']));
    return;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }
  const sb = createClient(url, key);

  // Build station slug → uuid map from existing rows
  const { data: stations } = await sb.from('polling_stations').select('id, slug');
  const stationBySlug = new Map(stations?.map((s) => [s.slug, s.id]) ?? []);

  // -- parts --
  const partsRows = [];
  const partsBase = extracted.partsBase ?? {};
  const partSection = extracted.partSection ?? {};
  for (const [partKey, base] of Object.entries(partsBase)) {
    const num = Number(partKey);
    const sectionText = partSection[partKey] ?? '';
    const stationId = stationBySlug.get(slugForStationName(base.station ?? ''));
    if (!stationId) {
      console.warn(`  skip part ${num}: station "${base.station}" not in DB`);
      continue;
    }
    partsRows.push({
      station_id: stationId,
      part_number: num,
      section_text: sectionText,
      road_names: parseRoads(sectionText),
      premises_range: extractPremises(sectionText),
      locality: base.locality ?? null,
      male_count: base.M ?? base.male ?? 0,
      female_count: base.F ?? base.female ?? 0,
      is_published: true,
    });
  }
  if (partsRows.length) {
    const { error } = await sb.from('parts').upsert(partsRows, { onConflict: 'part_number' });
    if (error) console.error('parts upsert:', error.message);
    else console.log(`✓ upserted ${partsRows.length} parts`);
  }

  // -- voters --
  const voterDB = extracted.voterDB ?? {};
  const { data: refreshedParts } = await sb.from('parts').select('id, part_number');
  const partIdByNumber = new Map(refreshedParts?.map((p) => [p.part_number, p.id]) ?? []);
  const voterRows = [];
  for (const [partKey, voters] of Object.entries(voterDB)) {
    const partId = partIdByNumber.get(Number(partKey));
    if (!partId) continue;
    voters.forEach((v, idx) => {
      voterRows.push({
        part_id: partId,
        serial_in_part: v.sl ?? idx + 1,
        voter_id: v.voterId ?? v.id ?? `LEGACY-${partKey}-${idx + 1}`,
        name: v.name ?? '',
        relation_type: (v.relType ?? null)?.[0] ?? null,
        relation_name: v.relName ?? v.father ?? null,
        house_number: v.house ?? null,
        age: v.age ?? null,
        gender: (v.gender ?? 'O').toUpperCase().startsWith('M') ? 'M' : (v.gender ?? 'O').toUpperCase().startsWith('F') ? 'F' : 'O',
        photo_url: null,
        support: v.support ?? null, // preserved for admin
      });
    });
  }
  if (voterRows.length) {
    // Chunked upsert (Postgres has a parameter limit)
    const chunk = 500;
    for (let i = 0; i < voterRows.length; i += chunk) {
      const slice = voterRows.slice(i, i + chunk);
      const { error } = await sb.from('voters').upsert(slice, { onConflict: 'voter_id' });
      if (error) console.error('voters upsert:', error.message);
    }
    console.log(`✓ upserted ${voterRows.length} voters`);
  }

  console.log('\nMigration complete.');
}

// Helpers ---------------------------------------------------------------------

function slugForStationName(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function parseRoads(sectionText) {
  // Sections typically contain "Street name & Premises 1-50" style strings,
  // separated by `;`. Take everything before " & " on each segment as a road.
  return String(sectionText)
    .split(';')
    .map((seg) => seg.trim())
    .map((seg) => seg.split(/\s*&\s*premises\b/i)[0]?.trim())
    .filter(Boolean);
}

function extractPremises(sectionText) {
  const m = /premises\s*([0-9]+\s*-\s*[0-9]+)/i.exec(String(sectionText));
  return m ? m[1].replace(/\s+/g, '') : null;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
