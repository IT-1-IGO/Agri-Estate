/**
 * Applies the selected language to everything rendered on the page.
 *
 * Why a DOM layer: the site has hundreds of components and data files with hard-coded English.
 * Instead of rewriting each one, visible text (text nodes, placeholder/title/alt/aria-label attributes)
 * is looked up in the central dictionaries (see ./index.ts) and swapped in place. The original English
 * is remembered per node, so switching back to English restores it exactly, and React re-renders
 * (new routes, modals, form errors, notifications) are translated as they appear.
 *
 * Opt out for any element with translate="no" or data-no-translate.
 */
import { Language, lookup, translate, normalizeKey } from './index';

type Rec = { orig: string; applied: string };

const textRecs = new WeakMap<Text, Rec>();
const attrRecs = new WeakMap<Element, Record<string, Rec>>();
const ATTRS = ['placeholder', 'title', 'alt', 'aria-label'] as const;
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'CODE', 'PRE', 'TEMPLATE']);

let current: Language = 'en';

/* ---- CMS text overrides (set from the admin panel; see src/cms) ---- */
let textOverrides: Record<string, string> = {};
/** Replaces visible text inside <main> whose original English text matches a key. */
export const setTextOverrides = (map: Record<string, string>) => {
  textOverrides = map || {};
  if (typeof document !== 'undefined' && observer) walk(document.body);
};
/** The original (source) text of a text node, regardless of translation/override applied to it. */
export const getOrigText = (node: Text): string => {
  const rec = textRecs.get(node);
  const cur = node.nodeValue ?? '';
  return rec && cur === rec.applied ? rec.orig : cur;
};
let observer: MutationObserver | null = null;
let patched = false;

const isSkipped = (el: Element | null, attrsOnly = false): boolean => {
  while (el) {
    if (!attrsOnly && SKIP_TAGS.has(el.tagName)) return true;
    if (el.getAttribute('translate') === 'no' || el.hasAttribute('data-no-translate')) return true;
    el = el.parentElement;
  }
  return false;
};

const leading = (s: string) => (s.match(/^\s*/) as RegExpMatchArray)[0];
const trailing = (s: string) => (s.match(/\s*$/) as RegExpMatchArray)[0];

const processText = (node: Text) => {
  const parent = node.parentElement;
  if (!parent || isSkipped(parent)) return;
  const cur = node.nodeValue ?? '';
  const rec = textRecs.get(node);
  // If React changed the text since we last touched it, `cur` is the new English source.
  const orig = rec && cur === rec.applied ? rec.orig : cur;

  const key = normalizeKey(orig);
  const ov = key && parent.closest('main,#cms-root') ? textOverrides[key] : undefined;
  const tr = ov !== undefined ? ov : key ? lookup(current, key) : undefined;

  if (!tr) {
    if (rec && cur === rec.applied && node.nodeValue !== orig) node.nodeValue = orig;
    textRecs.delete(node);
    return;
  }

  // <option> without an explicit value submits its text: pin the English value first.
  if (parent.tagName === 'OPTION' && !parent.hasAttribute('value')) parent.setAttribute('value', key);

  const next = leading(orig) + tr + trailing(orig);
  if (node.nodeValue !== next) node.nodeValue = next;
  textRecs.set(node, { orig, applied: next });
};

const META_TEXT = /^(description|og:title|og:description|twitter:title|twitter:description)$/i;

const processAttrs = (el: Element) => {
  // Placeholders of <textarea> must be translated even though its text content is user input.
  if (isSkipped(el, true)) return;
  let recs = attrRecs.get(el);
  const names: readonly string[] =
    el.tagName === 'META' && META_TEXT.test(el.getAttribute('name') ?? el.getAttribute('property') ?? '')
      ? [...ATTRS, 'content']
      : ATTRS;
  for (const name of names) {
    if (!el.hasAttribute(name)) continue;
    const cur = el.getAttribute(name) ?? '';
    const rec = recs?.[name];
    const orig = rec && cur === rec.applied ? rec.orig : cur;
    const tr = current === 'en' ? undefined : lookup(current, orig);
    if (!tr) {
      if (rec && cur === rec.applied && cur !== orig) el.setAttribute(name, orig);
      if (recs) delete recs[name];
      continue;
    }
    if (cur !== tr) el.setAttribute(name, tr);
    if (!recs) {
      recs = {};
      attrRecs.set(el, recs);
    }
    recs[name] = { orig, applied: tr };
  }
};

const walk = (root: Node) => {
  if (root.nodeType === Node.TEXT_NODE) {
    processText(root as Text);
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  const el = root as Element;
  processAttrs(el);
  if (isSkipped(el)) return;
  el.querySelectorAll('[placeholder],[title],[alt],[aria-label],meta[content]').forEach(processAttrs);
  const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let n = tw.nextNode();
  while (n) {
    processText(n as Text);
    n = tw.nextNode();
  }
};

const onMutations = (records: MutationRecord[]) => {
  for (const r of records) {
    if (r.type === 'characterData') {
      processText(r.target as Text);
    } else if (r.type === 'childList') {
      r.addedNodes.forEach(walk);
    } else if (r.type === 'attributes') {
      processAttrs(r.target as Element);
    }
  }
};

/** Native dialogs (alert/confirm/prompt) are not part of the DOM, so translate their messages too. */
const patchDialogs = () => {
  if (patched || typeof window === 'undefined') return;
  patched = true;
  const wrap = (name: 'alert' | 'confirm' | 'prompt') => {
    const original = (window as any)[name].bind(window);
    (window as any)[name] = (message?: unknown, ...rest: unknown[]) =>
      original(typeof message === 'string' ? translate(current, message) : message, ...rest);
  };
  wrap('alert');
  wrap('confirm');
  wrap('prompt');
};

export const startDomTranslator = (lang: Language) => {
  current = lang;
  patchDialogs();
  if (!observer) {
    observer = new MutationObserver(onMutations);
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...ATTRS],
    });
    // Document title and meta description (react-helmet) live in <head>.
    new MutationObserver(onMutations).observe(document.head, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['content'],
    });
  }
  walk(document.head);
  walk(document.body);
};

export const setDomLanguage = (lang: Language) => {
  current = lang;
  walk(document.head);
  walk(document.body);
};
