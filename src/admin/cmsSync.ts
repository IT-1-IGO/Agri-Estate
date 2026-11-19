import { api, getToken } from './crm/api';

/**
 * Keeps the website content store (browser cache) in step with the database.
 * - Visitors: published content is pulled from the API at start-up.
 * - Signed-in admins: drafts + published are pulled, and every save is pushed back.
 * Enabled only when VITE_API_URL is set; otherwise the site keeps using the local store as before.
 */
const API_URL = (import.meta as any).env?.VITE_API_URL as string | undefined;
export const cmsRemoteEnabled = !!API_URL;
const PREFIX = 'igo.cms.';
const EVENT = 'igo:cms-sync';
const PENDING = PREFIX + '_pending';
const SKIP = new Set(['col.media', 'col.activity', 'col.enquiries', 'col.applications']);

const lsGet = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* storage full */ } };
const pending = (): Record<string, number> => { try { return JSON.parse(lsGet(PENDING) || '{}'); } catch { return {}; } };
const setPending = (p: Record<string, number>) => lsSet(PENDING, JSON.stringify(p));
const notify = (ok: boolean, message = '') => window.dispatchEvent(new CustomEvent('igo:cms-remote', { detail: { ok, message } }));

/* ---- images: turn "media:ID" (browser-only upload) into a real file on the server ---- */
const urlKey = (id: string) => PREFIX + 'mediaurl.' + id;
async function uploadMedia(id: string): Promise<string> {
  const cached = lsGet(urlKey(id)); if (cached) return cached;
  let list: { id: string; name: string; dataUrl: string }[] = [];
  try { list = JSON.parse(lsGet(PREFIX + 'col.media') || '[]'); } catch { /* ignore */ }
  const m = list.find((x) => x.id === id); if (!m) throw new Error('An image used on this page is missing from the Media Library.');
  const blob = await (await fetch(m.dataUrl)).blob();
  const fd = new FormData(); fd.append('files', blob, m.name.replace(/\.[^.]+$/, '') + '.webp'); fd.append('category', 'cms');
  const r = await api<{ data: { url: string }[] }>('/media', { form: fd });
  const url = r.data[0].url; lsSet(urlKey(id), url); return url;
}
async function externalize<T>(v: T): Promise<T> {
  if (typeof v === 'string') return (v.startsWith('media:') ? await uploadMedia(v.slice(6)) : v) as unknown as T;
  if (Array.isArray(v)) return (await Promise.all(v.map(externalize))) as unknown as T;
  if (v && typeof v === 'object') { const o: Record<string, unknown> = {}; for (const [k, x] of Object.entries(v)) o[k] = await externalize(x); return o as T; }
  return v;
}

/* ---- push (admin → database) ---- */
const timers: Record<string, ReturnType<typeof setTimeout>> = {};
export function queuePush(key: string, value: unknown) {
  if (!cmsRemoteEnabled || !getToken() || SKIP.has(key)) return;
  if (!key.startsWith('doc.') && !key.startsWith('col.')) return;
  const p = pending(); p[key] = Date.now(); setPending(p);
  clearTimeout(timers[key]);
  timers[key] = setTimeout(() => push(key, value), 600);
}
async function push(key: string, value: unknown) {
  try {
    const name = key.slice(4);
    if (key.startsWith('doc.')) {
      const d = value as { draft?: unknown; published?: unknown };
      const clean = await externalize({ draft: d.draft || {}, published: d.published || {} });
      await api(`/cms/docs/${encodeURIComponent(name)}`, { method: 'PUT', body: clean });
    } else {
      await api(`/cms/collections/${encodeURIComponent(name)}`, { method: 'PUT', body: { items: await externalize(value) } });
    }
    const p = pending(); delete p[key]; setPending(p); notify(true);
  } catch (e) { notify(false, e instanceof Error ? e.message : 'Could not save to the server.'); }
}

/* ---- pull (database → browser) ---- */
const apply = (key: string, value: unknown) => lsSet(PREFIX + key, JSON.stringify(value));

async function pullPublic() {
  const r = await fetch(`${API_URL!.replace(/\/$/, '')}/api/public/cms`);
  if (!r.ok) return;
  const d = await r.json() as { docs: Record<string, { published: Record<string, unknown>; publishedAt?: string }>; collections: Record<string, unknown[]> };
  for (const [n, x] of Object.entries(d.docs)) apply('doc.' + n, { draft: x.published, published: x.published, publishedAt: x.publishedAt, updatedAt: x.publishedAt });
  for (const [n, items] of Object.entries(d.collections)) apply('col.' + n, items);
  window.dispatchEvent(new Event(EVENT));
}

async function pullAdmin() {
  const d = await api<{ docs: Record<string, { draft: Record<string, unknown>; published: Record<string, unknown>; updatedAt?: string; publishedAt?: string }>; collections: Record<string, unknown[]> }>('/cms');
  const p = pending();
  const empty = !Object.keys(d.docs).length && !Object.keys(d.collections).length;
  if (empty) { // first run: move whatever this browser already had into the database
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i) || '';
      if (!k.startsWith(PREFIX + 'doc.') && !k.startsWith(PREFIX + 'col.')) continue;
      const key = k.slice(PREFIX.length); try { queuePush(key, JSON.parse(lsGet(k) || 'null')); } catch { /* ignore */ }
    }
    return;
  }
  for (const [n, x] of Object.entries(d.docs)) if (!p['doc.' + n]) apply('doc.' + n, x);
  for (const [n, items] of Object.entries(d.collections)) if (!p['col.' + n]) apply('col.' + n, items);
  window.dispatchEvent(new Event(EVENT));
}

export async function initCmsSync() {
  if (!cmsRemoteEnabled) return;
  try { getToken() ? await pullAdmin() : await pullPublic(); } catch { /* offline: keep what is cached */ }
}
