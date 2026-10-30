export interface TerritoryCoordinate {
  latitude: number;
  longitude: number;
}

export interface Territory {
  id: string;
  congregation_id: string;
  number: string;
  name: string | null;
  description: string | null;
  status: string;
  polygon: TerritoryCoordinate[] | null;
  active: boolean | null;
  observations: string | null;
  last_assigned_date?: string | null;
  last_assigned_to_id?: string | null;
  last_assigned_to_name?: string | null;
  last_completed_date?: string | null;
  last_progress?: string | null;
  last_progress_date?: string | null;
  last_progress_publisher?: string | null;
  created_at?: string;
}

export type PreachingSessionStatus = 'idle' | 'territory_selected' | 'in_progress';

export interface PreachingSession {
  status: PreachingSessionStatus;
  territoryId: string | null;
  territoryNumber: string | null;
  territoryName: string | null;
  date: string; // YYYY-MM-DD
  startTime: string | null; // HH:mm
  startTimestamp: number | null; // epoch ms for live timer
  elapsedSeconds: number;
}

export interface ActivityRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  hours: number;
  minutes: number;
  publications: number;
  videos: number;
  returnVisits: number;
  bibleStudies: number;
  territoryId?: string | null;
  territoryNumber?: string | null;
  territoryName?: string | null;
  notes?: string;
  createdAt: string;
}

export interface Congregation {
  id: string;
  name: string;
  circuit?: string | null;
  city?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone: string;
  meeting_day_midweek?: string | null;
  meeting_time_midweek?: string | null;
  meeting_day_weekend?: string | null;
  meeting_time_weekend?: string | null;
}

export interface UserProfile {
  id: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role: string;
  service_group?: number | null;
  is_regular_pioneer?: boolean;
  is_auxiliary_pioneer?: boolean;
  is_elder?: boolean;
  is_ministerial_servant?: boolean;
}

