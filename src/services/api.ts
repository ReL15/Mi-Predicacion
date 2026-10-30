import { Territory, ActivityRecord, Congregation, UserProfile } from '../types';

async function parseJsonResponse<T>(res: Response, fallbackError: string): Promise<T> {
  let text = '';
  try {
    text = await res.text();
  } catch (err: any) {
    throw new Error(fallbackError || 'Error al comunicarse con el servidor.');
  }

  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // Si la respuesta fue HTML (ej. página de error del proxy "The page could not be loaded")
    if (!res.ok) {
      throw new Error(`Error en el servidor (${res.status}). Por favor reintenta en unos momentos.`);
    }
    throw new Error(`Respuesta inesperada del servidor: ${fallbackError}`);
  }

  if (!res.ok) {
    const errorMsg = data?.error || data?.message || fallbackError;
    throw new Error(errorMsg);
  }

  return data as T;
}

export async function fetchHealth(): Promise<{ status: string; database: string }> {
  try {
    const res = await fetch('/api/health');
    return await parseJsonResponse<{ status: string; database: string }>(
      res,
      'Error al verificar estado de la base de datos.'
    );
  } catch {
    return { status: 'error', database: 'disconnected' };
  }
}

export async function fetchTerritories(): Promise<Territory[]> {
  const res = await fetch('/api/territories');
  return parseJsonResponse<Territory[]>(
    res,
    'Error al obtener territorios de la base de datos externa.'
  );
}

export async function fetchTerritoryById(id: string): Promise<Territory> {
  const res = await fetch(`/api/territories/${id}`);
  return parseJsonResponse<Territory>(
    res,
    'Error al cargar el detalle del territorio seleccionado.'
  );
}

export async function fetchCongregation(): Promise<Congregation | null> {
  try {
    const res = await fetch('/api/congregation');
    if (!res.ok) return null;
    return await parseJsonResponse<Congregation | null>(res, 'Error al obtener congregación.');
  } catch {
    return null;
  }
}

export async function fetchPublishers(): Promise<UserProfile[]> {
  try {
    const res = await fetch('/api/users');
    if (!res.ok) return [];
    return await parseJsonResponse<UserProfile[]>(res, 'Error al obtener publicadores.');
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
  return parseJsonResponse<ActivityRecord[]>(
    res,
    'Error al cargar el historial de actividades ministeriales.'
  );
}

export async function createActivity(activity: Partial<ActivityRecord>): Promise<ActivityRecord> {
  const res = await fetch('/api/activities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(activity),
  });
  return parseJsonResponse<ActivityRecord>(
    res,
    'Error al guardar la actividad ministerial en el servidor.'
  );
}

export async function deleteActivity(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/activities/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch {
    return false;
  }
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
  const data = await parseJsonResponse<{ success: boolean; user: UserProfile }>(
    res,
    'Error al iniciar sesión con Neon Console.'
  );
  if (!data?.user) {
    throw new Error('Respuesta de usuario inválida.');
  }
  return data.user;
}
