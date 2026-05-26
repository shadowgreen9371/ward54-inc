-- ============================================================================
-- Ward 54 INC — Database schema
--
-- Public app reads via the `anon` role, bounded by RLS.
-- Admin app writes via the `authenticated` role + an `admin_users.role` check.
-- Service role bypasses RLS — only used by trusted server-side admin code.
-- ============================================================================

-- -- Extensions -----------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- -- Enums ----------------------------------------------------------------------
do $$ begin
  create type gender_t as enum ('M', 'F', 'O');
exception when duplicate_object then null; end $$;

do $$ begin
  create type agent_role_t as enum ('Effective Leader', 'PIC', 'Polling Agent', 'Volunteer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type agent_status_t as enum ('active', 'inactive', 'standby');
exception when duplicate_object then null; end $$;

do $$ begin
  create type admin_role_t as enum ('super_admin', 'editor', 'viewer');
exception when duplicate_object then null; end $$;

-- -- Admin users ----------------------------------------------------------------
-- Mirrors auth.users with an explicit role. Created on first sign-in.
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  role admin_role_t not null default 'viewer',
  created_at timestamptz not null default now()
);

create or replace function public.is_admin(min_role admin_role_t default 'editor')
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users u
    where u.id = auth.uid()
      and (
        u.role = 'super_admin'
        or (min_role = 'editor' and u.role in ('super_admin', 'editor'))
        or (min_role = 'viewer' and u.role in ('super_admin', 'editor', 'viewer'))
      )
  );
$$;

-- -- Site config (editable homepage titles, ward info, etc) --------------------
create table if not exists public.site_config (
  id uuid primary key default uuid_generate_v4(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  draft_value jsonb,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.admin_users(id) on delete set null
);

-- -- Polling stations ----------------------------------------------------------
create table if not exists public.polling_stations (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  address text not null default '',
  building_photo_url text,
  lat double precision,
  lng double precision,
  display_order int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -- Parts ---------------------------------------------------------------------
create table if not exists public.parts (
  id uuid primary key default uuid_generate_v4(),
  station_id uuid not null references public.polling_stations(id) on delete cascade,
  part_number int not null,
  section_text text not null default '',
  road_names text[] not null default '{}'::text[],
  premises_range text,
  locality text,
  male_count int not null default 0,
  female_count int not null default 0,
  third_gender_count int not null default 0,
  total_count int generated always as (male_count + female_count + third_gender_count) stored,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (part_number)
);
create index if not exists parts_station_idx on public.parts(station_id);

-- -- Voters --------------------------------------------------------------------
-- The `support` column is the political-affinity tag. RLS hides it from `anon`.
create table if not exists public.voters (
  id uuid primary key default uuid_generate_v4(),
  part_id uuid not null references public.parts(id) on delete cascade,
  serial_in_part int not null,
  voter_id text not null,
  name text not null,
  relation_type char(1) check (relation_type in ('F','H','M','O') or relation_type is null),
  relation_name text,
  house_number text,
  age int,
  gender gender_t not null default 'O',
  photo_url text,
  support text,                              -- PRIVATE: admin-only
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (part_id, serial_in_part),
  unique (voter_id)
);
create index if not exists voters_part_idx on public.voters(part_id);
create index if not exists voters_name_trgm on public.voters using gin (lower(name) gin_trgm_ops);

-- The trigram index needs the extension
create extension if not exists pg_trgm;

-- -- Agents (Effective Leaders, PIC, Polling Agents, Volunteers) --------------
create table if not exists public.agents (
  id uuid primary key default uuid_generate_v4(),
  agent_code text not null unique,
  name text not null,
  role agent_role_t not null,
  part_id uuid references public.parts(id) on delete set null,
  station_id uuid references public.polling_stations(id) on delete set null,
  phone text,
  photo_url text,
  responsibilities text[] not null default '{}'::text[],
  status agent_status_t not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists agents_part_idx on public.agents(part_id);
create index if not exists agents_role_idx on public.agents(role);

-- -- Activity logs (audit trail) ----------------------------------------------
create table if not exists public.activity_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references public.admin_users(id) on delete set null,
  actor_email text,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  diff jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists activity_logs_created_idx on public.activity_logs(created_at desc);

-- -- Updated-at trigger -------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$ begin
  perform 1 from pg_trigger where tgname = 'touch_stations';
  if not found then
    create trigger touch_stations before update on public.polling_stations
      for each row execute function public.touch_updated_at();
    create trigger touch_parts before update on public.parts
      for each row execute function public.touch_updated_at();
    create trigger touch_voters before update on public.voters
      for each row execute function public.touch_updated_at();
    create trigger touch_agents before update on public.agents
      for each row execute function public.touch_updated_at();
    create trigger touch_site_config before update on public.site_config
      for each row execute function public.touch_updated_at();
  end if;
end $$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.admin_users     enable row level security;
alter table public.site_config     enable row level security;
alter table public.polling_stations enable row level security;
alter table public.parts           enable row level security;
alter table public.voters          enable row level security;
alter table public.agents          enable row level security;
alter table public.activity_logs   enable row level security;

-- admin_users — admins read all; users read themselves; only super_admin writes
drop policy if exists admin_users_self_read on public.admin_users;
create policy admin_users_self_read on public.admin_users
  for select using (id = auth.uid() or public.is_admin('viewer'));

drop policy if exists admin_users_super_write on public.admin_users;
create policy admin_users_super_write on public.admin_users
  for all using (public.is_admin('super_admin'::admin_role_t))
  with check (public.is_admin('super_admin'::admin_role_t));

-- site_config — public reads published; admins read/write all
drop policy if exists site_config_public_read on public.site_config;
create policy site_config_public_read on public.site_config
  for select using (published_at is not null);

drop policy if exists site_config_admin_all on public.site_config;
create policy site_config_admin_all on public.site_config
  for all using (public.is_admin()) with check (public.is_admin());

-- polling_stations — public reads published; admins read/write all
drop policy if exists ps_public_read on public.polling_stations;
create policy ps_public_read on public.polling_stations
  for select using (is_published = true);

drop policy if exists ps_admin_all on public.polling_stations;
create policy ps_admin_all on public.polling_stations
  for all using (public.is_admin()) with check (public.is_admin());

-- parts — public reads published; admins read/write all
drop policy if exists parts_public_read on public.parts;
create policy parts_public_read on public.parts
  for select using (is_published = true);

drop policy if exists parts_admin_all on public.parts;
create policy parts_admin_all on public.parts
  for all using (public.is_admin()) with check (public.is_admin());

-- voters — admins read/write all; anon role gets a constrained view via the
-- `voters_public` view below (which omits `support`). RLS on the table denies
-- direct anon SELECT.
drop policy if exists voters_admin_all on public.voters;
create policy voters_admin_all on public.voters
  for all using (public.is_admin()) with check (public.is_admin());

-- Public-facing view that explicitly drops `support` — used by anon role.
create or replace view public.voters_public
with (security_invoker = true)
as
select
  v.id, v.part_id, v.serial_in_part, v.voter_id, v.name,
  v.relation_type, v.relation_name, v.house_number, v.age, v.gender,
  v.photo_url, v.created_at, v.updated_at
from public.voters v
join public.parts p on p.id = v.part_id
where p.is_published = true;

grant select on public.voters_public to anon;

-- agents — public reads active rows (the operational view); admins read/write all
drop policy if exists agents_public_read on public.agents;
create policy agents_public_read on public.agents
  for select using (status = 'active');

drop policy if exists agents_admin_all on public.agents;
create policy agents_admin_all on public.agents
  for all using (public.is_admin()) with check (public.is_admin());

-- activity_logs — admins only
drop policy if exists logs_admin_read on public.activity_logs;
create policy logs_admin_read on public.activity_logs
  for select using (public.is_admin('viewer'));

drop policy if exists logs_admin_insert on public.activity_logs;
create policy logs_admin_insert on public.activity_logs
  for insert with check (public.is_admin());

-- ============================================================================
-- Storage buckets
-- ============================================================================
-- Run separately via Supabase dashboard or storage API:
--   - 'station-photos'   (public)
--   - 'voter-photos'     (public, but file names are non-guessable UUIDs)
--   - 'agent-photos'     (public)
--   - 'cms-uploads'      (private, signed-URL only)
