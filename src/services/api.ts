import { Territory, ActivityRecord, Congregation, UserProfile } from '../types';

export async function fetchHealth(): Promise<{ status: string; database: string }> {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error('Error al conectar con el servidor.');
  return res.json();
}

export async function fetchTerritories(): Promise<Territory[]> {
  const res = await fetch('/api/territories');
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al obtener territorios de la base de datos externa.');
  }
  return res.json();
}

export async function fetchTerritoryById(id: string): Promise<Territory> {
  const res = await fetch(`/api/territories/${id}`);
  if (!res.ok) throw new Error('Error al cargar detalle del territorio.');
  return res.json();
}

export async function fetchCongregation(): Promise<Congregation | null> {
  try {
    const res = await fetch('/api/congregation');
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchPublishers(): Promise<UserProfile[]> {
  try {
    const res = await fetch('/api/users');
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchActivities(filters?: {
  month?: number;
  year?: number;
  territoryId?: string;
}): Promise<ActivityRecord[]> {
  const params = new URLSearchParams();
  if (filters?.month) params.append('month', String(filters.month));
  if (filters?.year) params.append('year', String(filters.year));
  if (filters?.territoryId) params.append('territoryId', filters.territoryId);

  const res = await fetch(`/api/activities?${params.toString()}`);
  if (!res.ok) throw new Error('Error al cargar historial de actividades.');
  return res.json();
}

export async function createActivity(activity: Partial<ActivityRecord>): Promise<ActivityRecord> {
  const res = await fetch('/api/activities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(activity),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al guardar actividad ministerial.');
  }
  return res.json();
}

export async function deleteActivity(id: string): Promise<boolean> {
  const res = await fetch(`/api/activities/${id}`, {
    method: 'DELETE',
  });
  return res.ok;
}

export async function loginWithNeon(
  emailOrName: string,
  password: string
): Promise<UserProfile> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrName, password }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Error al iniciar sesión con Neon Console');
  }
  return data.user;
}

