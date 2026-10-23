import { useCallback, useEffect, useState } from 'react';

/**
 * Content store for the admin panel.
 * Today it persists in this browser's localStorage. Every read/write goes through
 * this file, so it can be switched to the database later without touching the screens.
 */
const PREFIX = 'igo.cms.';
export const CMS_EVENT = 'igo:cms-sync';

const rawGet = (name: string): string | null => {
  try { return localStorage.getItem(PREFIX + name); } catch { return null; }
};

const rawSet = (name: string, value: unknown) => {
  try {
    localStorage.setItem(PREFIX + name, JSON.stringify(value));
  } catch {
    throw new Error('Storage is full or unavailable. Remove some media files and try again.');
  }
  window.dispatchEvent(new Event(CMS_EVENT));
};

export const readJson = <T,>(name: string, fallback: T): T => {
  const raw = rawGet(name);
  if (raw == null) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
};

export const writeJson = rawSet;

export const subscribeCms = (cb: () => void) => {
  const onStorage = (e: StorageEvent) => { if (e.key && e.key.startsWith(PREFIX)) cb(); };
  window.addEventListener(CMS_EVENT, cb);
  window.addEventListener('storage', onStorage);
  return () => { window.removeEventListener(CMS_EVENT, cb); window.removeEventListener('storage', onStorage); };
};

export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));

/* ---------------- collections ---------------- */
export type Status = 'draft' | 'published';
export interface CmsItem { id: string; status?: Status; order?: number; updatedAt?: string; [k: string]: unknown }

export const getCollection = <T extends CmsItem>(name: string, seed: T[]): T[] => {
  const v = readJson<T[] | null>('col.' + name, null);
  const list = v ?? seed;
  return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};

export const usePublishedCollection = <T extends CmsItem>(name: string, seed: T[]): T[] => {
  const [, tick] = useState(0);
  useEffect(() => subscribeCms(() => tick((n) => n + 1)), []);
  return getCollection<T>(name, seed).filter((i) => (i.status ?? 'published') === 'published');
};

export const useCollection = <T extends CmsItem>(name: string, seed: T[]) => {
  const [items, setItems] = useState<T[]>(() => getCollection<T>(name, seed));
  useEffect(() => {
    const sync = () => setItems(getCollection<T>(name, seed));
    sync();
    return subscribeCms(sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);
  const save = useCallback((next: T[]) => { rawSet('col.' + name, next); setItems(getCollection<T>(name, next)); }, [name]);
  return { items, save };
};

/* ---------------- documents (draft + published) ---------------- */
export interface CmsDoc { draft: Record<string, unknown>; published: Record<string, unknown>; updatedAt?: string; publishedAt?: string }
const emptyDoc: CmsDoc = { draft: {}, published: {} };

export const getDoc = (name: string): CmsDoc => readJson<CmsDoc>('doc.' + name, emptyDoc);
export const getPublishedDoc = (name: string): Record<string, unknown> => getDoc(name).published || {};

export const usePublishedDoc = (name: string): Record<string, unknown> => {
  const [, tick] = useState(0);
  useEffect(() => subscribeCms(() => tick((n) => n + 1)), []);
  return getPublishedDoc(name);
};

export const useDoc = (name: string) => {
  const [doc, setDoc] = useState<CmsDoc>(() => getDoc(name));
  useEffect(() => {
    const sync = () => setDoc(getDoc(name));
    sync();
    return subscribeCms(sync);
  }, [name]);
  const saveDraft = (values: Record<string, unknown>) => {
    const next = { ...getDoc(name), draft: values, updatedAt: new Date().toISOString() };
    rawSet('doc.' + name, next); setDoc(next);
  };
  const publish = (values: Record<string, unknown>) => {
    const now = new Date().toISOString();
    const next = { draft: values, published: values, updatedAt: now, publishedAt: now };
    rawSet('doc.' + name, next); setDoc(next);
  };
  return { doc, saveDraft, publish };
};

/* ---------------- media references ---------------- */
export interface MediaItem extends CmsItem { name: string; mime: string; size: number; dataUrl: string; createdAt: string }
export const MEDIA_COL = 'media';

/** Turns a stored image value ("media:ID" or a normal URL/path) into something an <img> can use. */
export const resolveMedia = (ref: unknown, fallback = ''): string => {
  if (typeof ref !== 'string' || !ref) return fallback;
  if (ref.startsWith('media:')) {
    const id = ref.slice(6);
    const m = getCollection<MediaItem>(MEDIA_COL, []).find((x) => x.id === id);
    return m ? m.dataUrl : fallback;
  }
  return ref;
};

/* ---------------- activity log ---------------- */
export interface AuditItem { id: string; at: string; action: string; target: string }
export const logActivity = (action: string, target: string) => {
  const list = readJson<AuditItem[]>('audit', []);
  const next = [{ id: uid(), at: new Date().toISOString(), action, target }, ...list].slice(0, 200);
  try { rawSet('audit', next); } catch { /* non-critical */ }
};
export const getActivity = () => readJson<AuditItem[]>('audit', []);

/** Counts places (collections and documents) that reference a media item. */
export const mediaUsage = (id: string): number => {
  let n = 0;
  const needle = 'media:' + id;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i) || '';
      if (!k.startsWith(PREFIX) || k === PREFIX + 'col.' + MEDIA_COL) continue;
      const v = localStorage.getItem(k) || '';
      let idx = v.indexOf(needle);
      while (idx !== -1) { n++; idx = v.indexOf(needle, idx + needle.length); }
    }
  } catch { /* ignore */ }
  return n;
};
