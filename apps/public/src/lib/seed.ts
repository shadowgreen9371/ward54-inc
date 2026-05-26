/**
 * Bundled seed data — a slim subset migrated from the legacy index.html.
 * Used as a pre-Supabase fallback so the Next.js app renders meaningfully
 * during local development. The full dataset lives in supabase/seed.sql.
 *
 * Once Supabase is connected, this file is unreferenced at runtime.
 */

import type { Agent, Voter } from '@ward54/db';

export interface SeedStation {
  slug: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  display_order: number;
  photo_url?: string;
}

export interface SeedPart {
  station_slug: string;
  part_number: number;
  section_text: string;
  road_names: string[];
  premises_range?: string;
  locality?: string;
  male_count: number;
  female_count: number;
  total_count: number;
}

export const seedStations: SeedStation[] = [
  {
    slug: 'entally-academy',
    name: 'Entally Academy',
    address: '11/B Convent Road, Kolkata 700014',
    lat: 22.5681,
    lng: 88.3711,
    display_order: 1,
  },
  {
    slug: 'taltala-dispensary',
    name: 'Taltala Dispensary',
    address: 'Taltala, Kolkata 700014',
    lat: 22.5663,
    lng: 88.3702,
    display_order: 2,
  },
  {
    slug: 'fateh-hall',
    name: 'Fateh Hall',
    address: 'Wellesley Square, Kolkata 700014',
    lat: 22.5650,
    lng: 88.3690,
    display_order: 3,
  },
  {
    slug: 'kmc-health-unit',
    name: 'KMC Health Unit & Community Hall',
    address: 'Ward 54, Kolkata 700014',
    lat: 22.5655,
    lng: 88.3719,
    display_order: 4,
  },
  {
    slug: 'vip-hall',
    name: 'VIP Hall',
    address: 'Wellesley Square, Kolkata 700014',
    lat: 22.5660,
    lng: 88.3693,
    display_order: 5,
  },
  {
    slug: 'kmc-primary-school',
    name: 'KMC Primary School',
    address: 'Ward 54, Kolkata 700014',
    lat: 22.5670,
    lng: 88.3705,
    display_order: 6,
  },
  {
    slug: 'alisha-ashiyana',
    name: 'Alisha Ashiyana',
    address: 'Ward 54, Kolkata 700014',
    lat: 22.5672,
    lng: 88.3700,
    display_order: 7,
  },
  {
    slug: 'anjuman-girls-hs',
    name: 'Anjuman Girls Higher Secondary School',
    address: 'Ward 54, Kolkata 700014',
    lat: 22.5664,
    lng: 88.3708,
    display_order: 8,
  },
  {
    slug: 'anjuman-mofidul-islam',
    name: 'Anjuman Mofidul Islam Girls High School',
    address: 'Ward 54, Kolkata 700014',
    lat: 22.5675,
    lng: 88.3712,
    display_order: 9,
  },
  {
    slug: 'white-house',
    name: 'White House',
    address: 'Ward 54, Kolkata 700014',
    lat: 22.5678,
    lng: 88.3718,
    display_order: 10,
  },
  {
    slug: 'hena-hall',
    name: 'Hena Hall',
    address: 'Ward 54, Kolkata 700014',
    lat: 22.5667,
    lng: 88.3722,
    display_order: 11,
  },
  {
    slug: 'sir-syed-ahmed-school',
    name: 'Sir Syed Ahmed School',
    address: 'Ward 54, Kolkata 700014',
    lat: 22.5685,
    lng: 88.3715,
    display_order: 12,
  },
];

/**
 * Slim seed — 38 parts with representative road/premises text.
 * Real per-part metadata lives in supabase/seed.sql (extracted from the
 * Electoral Roll 2026 PDFs).
 */
export const seedParts: SeedPart[] = Array.from({ length: 38 }, (_, idx) => {
  const partNumber = idx + 1;
  // Round-robin assign parts to the 12 stations
  const station = seedStations[idx % seedStations.length]!;
  // Plausible counts — randomised but deterministic per part
  const male = 350 + ((partNumber * 37) % 90);
  const female = 320 + ((partNumber * 53) % 90);
  return {
    station_slug: station.slug,
    part_number: partNumber,
    section_text: `Section ${partNumber} · ${station.name}`,
    road_names: [`Road A-${partNumber}`, `Road B-${partNumber}`],
    premises_range: `1 — ${20 + ((partNumber * 7) % 30)}`,
    locality: 'Entally · Ward 54',
    male_count: male,
    female_count: female,
    total_count: male + female,
  };
});

/**
 * Slim agent seed — 4 roles per part = ~152 agents.
 */
const agentRoles: Agent['role'][] = ['Effective Leader', 'PIC', 'Polling Agent', 'Volunteer'];

export const seedAgents: Agent[] = seedParts.flatMap((p) =>
  agentRoles.map((role, ri) => {
    const code = `A-${String(p.part_number).padStart(2, '0')}-${ri + 1}`;
    return {
      id: code,
      agent_code: code,
      name: `${role.split(' ')[0]} ${p.part_number}.${ri + 1}`,
      role,
      part_id: `seed-part-${p.part_number}`,
      station_id: p.station_slug,
      phone: null,
      photo_url: null,
      responsibilities: defaultResponsibilities(role),
      status: 'active',
      notes: null,
      created_at: '',
      updated_at: '',
    } satisfies Agent;
  }),
);

function defaultResponsibilities(role: Agent['role']): string[] {
  switch (role) {
    case 'Effective Leader':
      return ['Booth strategy', 'Voter outreach', 'Cluster supervision'];
    case 'PIC':
      return ['Booth coordination', 'Issue escalation', 'Volunteer rota'];
    case 'Polling Agent':
      return ['Voter verification', 'Roll observation', 'Result certificate'];
    case 'Volunteer':
      return ['Door-to-door', 'Slip distribution', 'Transport assist'];
  }
}

/**
 * Voter seed — empty by default. Real entries live in supabase/seed.sql
 * (extracted from the 38 booth PDFs).
 */
export const seedVoters: Voter[] = [];
