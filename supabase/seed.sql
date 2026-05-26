-- ============================================================================
-- Ward 54 INC — Seed data (slim — for first boot)
--
-- Polling stations and the 38 parts skeleton. Full per-part voter rolls and
-- agent rosters are imported via scripts/migrate-from-html.ts.
-- ============================================================================

begin;

-- Wipe existing data (idempotent reseed)
truncate table public.voters, public.parts, public.polling_stations,
              public.agents, public.activity_logs restart identity cascade;

-- Polling stations -----------------------------------------------------------
insert into public.polling_stations (slug, name, address, lat, lng, display_order, is_published) values
  ('entally-academy',         'Entally Academy',                              '11/B Convent Road, Kolkata 700014', 22.5681, 88.3711,  1, true),
  ('taltala-dispensary',      'Taltala Dispensary',                           'Taltala, Kolkata 700014',           22.5663, 88.3702,  2, true),
  ('fateh-hall',              'Fateh Hall',                                   'Wellesley Square, Kolkata 700014',  22.5650, 88.3690,  3, true),
  ('kmc-health-unit',         'KMC Health Unit & Community Hall',             'Ward 54, Kolkata 700014',           22.5655, 88.3719,  4, true),
  ('vip-hall',                'VIP Hall',                                     'Wellesley Square, Kolkata 700014',  22.5660, 88.3693,  5, true),
  ('kmc-primary-school',      'KMC Primary School',                           'Ward 54, Kolkata 700014',           22.5670, 88.3705,  6, true),
  ('alisha-ashiyana',         'Alisha Ashiyana',                              'Ward 54, Kolkata 700014',           22.5672, 88.3700,  7, true),
  ('anjuman-girls-hs',        'Anjuman Girls Higher Secondary School',        'Ward 54, Kolkata 700014',           22.5664, 88.3708,  8, true),
  ('anjuman-mofidul-islam',   'Anjuman Mofidul Islam Girls High School',      'Ward 54, Kolkata 700014',           22.5675, 88.3712,  9, true),
  ('white-house',             'White House',                                  'Ward 54, Kolkata 700014',           22.5678, 88.3718, 10, true),
  ('hena-hall',               'Hena Hall',                                    'Ward 54, Kolkata 700014',           22.5667, 88.3722, 11, true),
  ('sir-syed-ahmed-school',   'Sir Syed Ahmed School',                        'Ward 54, Kolkata 700014',           22.5685, 88.3715, 12, true);

-- 38 parts (stub — counts from the legacy index.html; real road names follow via migration script)
-- Distribution and counts will be refined by scripts/migrate-from-html.ts; this seed gets the app booting.
insert into public.parts (station_id, part_number, section_text, road_names, premises_range, locality, male_count, female_count, is_published)
select s.id,
       n.part_number,
       'Section ' || n.part_number || ' · ' || s.name,
       array['Road A-' || n.part_number, 'Road B-' || n.part_number],
       '1 — ' || (20 + ((n.part_number * 7) % 30)),
       'Entally · Ward 54',
       350 + ((n.part_number * 37) % 90),
       320 + ((n.part_number * 53) % 90),
       true
from generate_series(1, 38) as n(part_number)
join public.polling_stations s
  on s.display_order = ((n.part_number - 1) % 12) + 1;

-- Site config — homepage copy, editable from admin
insert into public.site_config (key, value, draft_value, published_at) values
  ('homepage.hero', jsonb_build_object(
     'eyebrow', 'Ward · 54 · 163-Entally Assembly Constituency',
     'title_line_1', 'Indian',
     'title_line_2', 'National Congress',
     'subtitle', 'The official voter directory and field-operations platform for the Ward 54 unit.'
   ), null, now()),
  ('homepage.cards', jsonb_build_array(
     jsonb_build_object('href','/directory','title','Enter Voter Directory','accent','amber'),
     jsonb_build_object('href','/parts','title','All Parts Database','accent','green'),
     jsonb_build_object('href','/volunteers','title','Effective Agent & Responsibilities','accent','blue')
   ), null, now()),
  ('ward.meta', jsonb_build_object(
     'total_electors', 26849,
     'male', 13850,
     'female', 12999,
     'third_gender', 0,
     'booths', 38,
     'stations', 12,
     'pin', '700014',
     'parliamentary_const', '24 — Kolkata Uttar (Gen)'
   ), null, now());

commit;
