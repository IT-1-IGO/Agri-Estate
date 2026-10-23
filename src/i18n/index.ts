/**
 * Central translation registry.
 *
 * English is the source language: every dictionary is keyed by the exact English text
 * used in the UI. A missing key simply falls back to the English text.
 *
 * To translate new customer-facing text, add the English string as a key in ta.ts and hi.ts
 * (or call t('English text') in a component, which uses the same dictionaries).
 */
import ta from './ta';
import hi from './hi';
import { localizeTerms } from './localize';
import { applyPatterns } from './patterns';

export type Language = 'en' | 'ta' | 'hi';

export const LANGUAGES: { code: Language; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ta', label: 'தமிழ்', short: 'த' },
  { code: 'hi', label: 'हिन्दी', short: 'हि' },
];

export const STORAGE_KEY = 'igo-lang';

/** Collapse whitespace and unify typographic quotes so source text matches rendered text. */
export const normalizeKey = (s: string): string =>
  s
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const build = (dict: Record<string, string>): Map<string, string> => {
  const m = new Map<string, string>();
  for (const k of Object.keys(dict)) m.set(normalizeKey(k), dict[k]);
  return m;
};

const maps: Record<Language, Map<string, string>> = {
  en: new Map(),
  ta: build(ta),
  hi: build(hi),
};

export const isLanguage = (v: unknown): v is Language => v === 'en' || v === 'ta' || v === 'hi';

/** Dictionary or pattern hit only (no token-level fallback). */
const strict = (lang: Language, text: string): string | undefined => {
  const key = normalizeKey(text);
  const base = maps[lang].get(key);
  if (base !== undefined) return localizeTerms(lang, base);
  const patterned = applyPatterns(lang, key, s => translate(lang, s));
  return patterned !== undefined ? localizeTerms(lang, patterned) : undefined;
};

/** Returns the translation for `text`, or undefined when there is none (caller keeps English). */
export const lookup = (lang: Language, text: string): string | undefined => {
  if (lang === 'en') return undefined;
  const hit = strict(lang, text);
  if (hit !== undefined) return hit;
  const key = normalizeKey(text);
  // Page titles: "<page title> | <site name>" — translate the parts separately.
  if (key.includes(' | ')) {
    const parts = key.split(' | ');
    const head = strict(lang, parts.slice(0, -1).join(' | '));
    if (head !== undefined) return `${head} | ${lookup(lang, parts[parts.length - 1]) ?? parts[parts.length - 1]}`;
    const each = parts.map(p => strict(lang, p));
    if (each.some(p => p !== undefined)) return parts.map((p, i) => each[i] ?? lookup(lang, p) ?? p).join(' | ');
  }
  // "<estate> — <location>" style headings built from data.
  if (key.includes(' — ')) {
    const parts = key.split(' — ');
    const each = parts.map(p => strict(lang, p));
    if (each.every(p => p !== undefined)) return each.join(' — ');
  }
  // No sentence-level entry: still localise brand / acronym / name tokens when present.
  const localized = localizeTerms(lang, text);
  return localized !== text ? localized : undefined;
};

/** Translate a string, falling back to English. */
export const translate = (lang: Language, text: string): string => lookup(lang, text) ?? text;
