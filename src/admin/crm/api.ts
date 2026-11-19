const BASE = ((import.meta as any).env?.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '';
const KEY = 'igo_crm_token';
export const getToken = () => { try { return sessionStorage.getItem(KEY); } catch { return null; } };
export const setToken = (t: string | null) => { try { t ? sessionStorage.setItem(KEY, t) : sessionStorage.removeItem(KEY); } catch { /* ignore */ } };

export class ApiError extends Error {
  status: number; fields: Record<string, string>;
  constructor(m: string, status: number, fields: Record<string, string> = {}) { super(m); this.status = status; this.fields = fields; }
}

export async function api<T = any>(path: string, opts: { method?: string; body?: any; form?: FormData } = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const t = getToken(); if (t) headers.Authorization = `Bearer ${t}`;
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  let res: Response;
  try {
    res = await fetch(`${BASE}/api${path}`, { method: opts.method || (opts.body || opts.form ? 'POST' : 'GET'), headers, body: opts.form ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined) });
  } catch { throw new ApiError('Cannot reach the server. Check your connection and that the API is running.', 0); }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && t) { setToken(null); window.dispatchEvent(new Event('crm-logout')); }
  if (!res.ok) throw new ApiError(data.error || `Request failed (${res.status})`, res.status, data.fields || {});
  return data as T;
}

export async function download(path: string, filename: string) {
  const res = await fetch(`${BASE}/api${path}`, { headers: { Authorization: `Bearer ${getToken()}` } });
  if (!res.ok) throw new ApiError('Export failed', res.status);
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}
