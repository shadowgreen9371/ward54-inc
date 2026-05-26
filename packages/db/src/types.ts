/**
 * Database types for the Ward 54 INC schema.
 * These mirror supabase/schema.sql and should be regenerated with
 *   supabase gen types typescript --linked > packages/db/src/types.generated.ts
 * once the database is live. Hand-written for now.
 */

export type UUID = string;
export type ISODate = string;

export type Gender = 'M' | 'F' | 'O';
export type AgentRole = 'Effective Leader' | 'PIC' | 'Polling Agent' | 'Volunteer';
export type AgentStatus = 'active' | 'inactive' | 'standby';

export interface SiteConfig {
  id: UUID;
  key: string;
  value: unknown;
  draft_value: unknown | null;
  published_at: ISODate | null;
  updated_at: ISODate;
  updated_by: UUID | null;
}

export interface PollingStation {
  id: UUID;
  slug: string;
  name: string;
  address: string;
  building_photo_url: string | null;
  lat: number | null;
  lng: number | null;
  display_order: number;
  is_published: boolean;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface Part {
  id: UUID;
  station_id: UUID;
  part_number: number;
  section_text: string;
  road_names: string[];
  premises_range: string | null;
  locality: string | null;
  male_count: number;
  female_count: number;
  third_gender_count: number;
  total_count: number;
  is_published: boolean;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface Voter {
  id: UUID;
  part_id: UUID;
  serial_in_part: number;
  voter_id: string;
  name: string;
  relation_type: 'F' | 'H' | 'M' | 'O' | null;
  relation_name: string | null;
  house_number: string | null;
  age: number | null;
  gender: Gender;
  photo_url: string | null;
  /** Political affinity — admin-only column. Never selected by anon role. */
  support: string | null;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface Agent {
  id: UUID;
  agent_code: string;
  name: string;
  role: AgentRole;
  part_id: UUID | null;
  station_id: UUID | null;
  phone: string | null;
  photo_url: string | null;
  responsibilities: string[];
  status: AgentStatus;
  notes: string | null;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface ActivityLog {
  id: UUID;
  actor_id: UUID | null;
  actor_email: string | null;
  action: string;
  entity_type: string;
  entity_id: UUID | null;
  diff: unknown;
  created_at: ISODate;
}

export interface AdminUser {
  id: UUID;
  email: string;
  display_name: string | null;
  role: 'super_admin' | 'editor' | 'viewer';
  created_at: ISODate;
}

export interface Database {
  public: {
    Tables: {
      site_config: { Row: SiteConfig; Insert: Partial<SiteConfig>; Update: Partial<SiteConfig> };
      polling_stations: {
        Row: PollingStation;
        Insert: Partial<PollingStation>;
        Update: Partial<PollingStation>;
      };
      parts: { Row: Part; Insert: Partial<Part>; Update: Partial<Part> };
      voters: { Row: Voter; Insert: Partial<Voter>; Update: Partial<Voter> };
      agents: { Row: Agent; Insert: Partial<Agent>; Update: Partial<Agent> };
      activity_logs: {
        Row: ActivityLog;
        Insert: Partial<ActivityLog>;
        Update: Partial<ActivityLog>;
      };
      admin_users: { Row: AdminUser; Insert: Partial<AdminUser>; Update: Partial<AdminUser> };
    };
  };
}
