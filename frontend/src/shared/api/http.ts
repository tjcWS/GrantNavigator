import { API_URL } from '@/shared/config/env';

const ACCESS_KEY = 'gn_access_token';
const REFRESH_KEY = 'gn_refresh_token';
let accessToken: string | null = sessionStorage.getItem(ACCESS_KEY);
let refreshInFlight: Promise<boolean> | null = null;

export function saveTokens(access: string, refresh: string) {
  accessToken = access;
  sessionStorage.setItem(ACCESS_KEY, access);
  sessionStorage.setItem(REFRESH_KEY, refresh);
}
export function clearTokens() {
  accessToken = null;
  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
}
export function getRefreshToken() { return sessionStorage.getItem(REFRESH_KEY); }

async function rotateTokens(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    }).then(async (response) => {
      if (!response.ok) { clearTokens(); return false; }
      const pair = await response.json();
      saveTokens(pair.access_token, pair.refresh_token);
      return true;
    }).catch(() => { clearTokens(); return false; }).finally(() => { refreshInFlight = null; });
  }
  return refreshInFlight;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  let response = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (response.status === 401 && retry && path !== '/auth/refresh') {
    if (await rotateTokens()) return apiRequest<T>(path, init, false);
  }
  if (!response.ok) {
    let message = `Ошибка запроса (${response.status})`;
    try {
      const body = await response.json();
      if (typeof body.detail === 'string') message = body.detail;
      else if (Array.isArray(body.errors)) message = body.errors.map((e: {loc?: (string|number)[]; msg?: string}) => `${(e.loc ?? []).slice(1).join('.') || 'Поле'}: ${e.msg ?? 'некорректное значение'}`).join('\n') || message;
      else if (Array.isArray(body.detail)) message = body.detail.map((e: {loc?: (string|number)[]; msg?: string}) => `${(e.loc ?? []).slice(1).join('.') || 'Поле'}: ${e.msg ?? 'некорректное значение'}`).join('\n') || message;
    } catch { /* no response body */ }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function authRequest<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  if (!response.ok) {
    let message = 'Не удалось выполнить запрос';
    try { message = (await response.json()).detail || message; } catch { /* ignore */ }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}
