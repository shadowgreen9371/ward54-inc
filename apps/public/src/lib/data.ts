/**
 * Data access layer for the public app.
 *
 * - When Supabase env vars are set, queries Postgres via the anon RLS-bound client.
 * - Otherwise falls back to the bundled seed (migrated from index.html) so the app
 *   renders meaningfully during local development before the DB is wired up.
 */

import type { Agent, Part, PollingStation, Voter } from '@ward54/db';
import { getSupabase, hasSupabaseEnv } from './supabase';
import {
  seedStations,
  seedParts,
  seedAgents,
  seedVoters,
  type SeedPart,
  type SeedStation,
} from './seed';

export interface StationWithCounts extends PollingStation {
  parts: Part[];
  male_count: number;
  female_count: number;
  total_count: number;
}

function partsToCounts(parts: Pick<Part, 'male_count' | 'female_count' | 'total_count'>[]) {
  return parts.reduce(
    (acc, p) => ({
      male: acc.male + p.male_count,
      female: acc.female + p.female_count,
      total: acc.total + p.total_count,
    }),
    { male: 0, female: 0, total: 0 },
  );
}

export async function listStationsWithCounts(): Promise<StationWithCounts[]> {
  if (!hasSupabaseEnv()) {
    return seedStations.map((s) => {
      const parts = seedParts.filter((p) => p.station_slug === s.slug);
      const c = partsToCounts(parts);
      return adaptSeedStation(s, parts, c);
    });
  }
  const sb = getSupabase();
  const { data: stations, error } = await sb
    .from('polling_stations')
    .select('*, parts(*)')
    .eq('is_published', true)
    .order('display_order', { ascending: true });
  if (error) {
    console.error('listStationsWithCounts:', error.message);
    return [];
  }
  return (stations ?? []).map((s) => {
    const parts = (s as unknown as { parts: Part[] }).parts ?? [];
    const c = partsToCounts(parts);
    return {
      ...(s as PollingStation),
      parts,
      male_count: c.male,
      female_count: c.female,
      total_count: c.total,
    };
  });
}

export async function listParts(): Promise<Part[]> {
  if (!hasSupabaseEnv()) {
    return seedParts.map(adaptSeedPart);
  }
  const sb = getSupabase();
  const { data, error } = await sb
    .from('parts')
    .select('*')
    .eq('is_published', true)
    .order('part_number', { ascending: true });
  if (error) {
    console.error('listParts:', error.message);
    return [];
  }
  return data ?? [];
}

export async function listAgents(): Promise<Agent[]> {
  if (!hasSupabaseEnv()) {
    return seedAgents;
  }
  const sb = getSupabase();
  const { data, error } = await sb
    .from('agents')
    .select('*')
    .eq('status', 'active')
    .order('part_id', { ascending: true });
  if (error) {
    console.error('listAgents:', error.message);
    return [];
  }
  return data ?? [];
}

/**
 * NOTE: this never selects the `support` column.
 * RLS additionally hides it from the anon role at the database level.
 */
export async function listVotersByPart(partId: string): Promise<Voter[]> {
  if (!hasSupabaseEnv()) {
    return seedVoters.filter((v) => v.part_id === partId);
  }
  const sb = getSupabase();
  const { data, error } = await sb
    .from('voters')
    .select(
      'id, part_id, serial_in_part, voter_id, name, relation_type, relation_name, house_number, age, gender, photo_url, created_at, updated_at',
    )
    .eq('part_id', partId)
    .order('serial_in_part', { ascending: true });
  if (error) {
    console.error('listVotersByPart:', error.message);
    return [];
  }
  // Return type matches Voter row minus `support`; cast for callers
  return (data ?? []).map((v) => ({ ...v, support: null }) as Voter);
}

// -------------------- seed adapters --------------------

function adaptSeedStation(
  s: SeedStation,
  parts: SeedPart[],
  counts: { male: number; female: number; total: number },
): StationWithCounts {
  return {
    id: s.slug,
    slug: s.slug,
    name: s.name,
    address: s.address,
    building_photo_url: s.photo_url ?? null,
    lat: s.lat ?? null,
    lng: s.lng ?? null,
    display_order: s.display_order,
    is_published: true,
    created_at: '',
    updated_at: '',
    parts: parts.map(adaptSeedPart),
    male_count: counts.male,
    female_count: counts.female,
    total_count: counts.total,
  };
}

function adaptSeedPart(p: SeedPart): Part {
  return {
    id: `seed-part-${p.part_number}`,
    station_id: p.station_slug,
    part_number: p.part_number,
    section_text: p.section_text,
    road_names: p.road_names,
    premises_range: p.premises_range ?? null,
    locality: p.locality ?? null,
    male_count: p.male_count,
    female_count: p.female_count,
    third_gender_count: 0,
    total_count: p.total_count,
    is_published: true,
    created_at: '',
    updated_at: '',
  };
}
