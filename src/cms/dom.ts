import { getOrigText } from '../i18n/domTranslator';
import { normalizeKey } from '../i18n';
import type { AddedCard, LiveValues, ScanBlock, ScanGroup, ScanResult, ScanSection } from './types';
import { resolveMedia } from '../admin/store';
import { applyAddedSections } from './renderSection';

const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'OPTION', 'SELECT', 'svg', 'SVG']);
const HEAD = 'h1,h2,h3,h4,h5,h6';

export const slug = (s: string) => normalizeKey(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
const hasLetter = (s: string) => /[A-Za-zऀ-෿]/.test(s);

const textNodes = (root: Element): Text[] => {
  const out: Text[] = [];
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      let p = n.parentElement;
      while (p && p !== root) { if (SKIP.has(p.tagName) || p.hasAttribute('data-no-translate')) return NodeFilter.FILTER_REJECT; p = p.parentElement; }
      if (n.parentElement && SKIP.has(n.parentElement.tagName)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let n = tw.nextNode();
  while (n) { out.push(n as Text); n = tw.nextNode(); }
  return out;
};

export const origText = (el: Element): string =>
  normalizeKey(textNodes(el).map(getOrigText).join(' '));
const firstText = (el: Element): string => {
  const h = el.querySelector(HEAD);
  const t = h ? origText(h) : '';
  if (t) return t;
  for (const n of textNodes(el)) { const k = normalizeKey(getOrigText(n)); if (k.length > 1 && hasLetter(k)) return k; }
  return '';
};

export const getMain = (): HTMLElement | null => document.querySelector('main') || document.getElementById('cms-root');
export const getSections = (main: Element): HTMLElement[] => {
  const secs = Array.from(main.querySelectorAll<HTMLElement>('section')).filter((s) => !s.parentElement?.closest('section'));
  return secs.length ? secs : (Array.from(main.children).filter((c) => !SKIP.has(c.tagName)) as HTMLElement[]);
};

const isCardLike = (k: Element): boolean => {
  if (SKIP.has(k.tagName) || k.tagName === 'BR' || k.tagName === 'INPUT') return false;
  if (!k.querySelector(`${HEAD},p,img`) && k.children.length > 0 && origText(k).length < 12) return false;
  return origText(k).length >= 6;
};

export const findGroups = (section: Element): { parent: HTMLElement; items: HTMLElement[] }[] => {
  const groups: { parent: HTMLElement; items: HTMLElement[] }[] = [];
  const visit = (el: HTMLElement) => {
    const kids = (Array.from(el.children) as HTMLElement[]).filter((k) => !SKIP.has(k.tagName) && !k.dataset.cmsAdded);
    const bySig = new Map<string, HTMLElement[]>();
    for (const k of kids) {
      const sig = k.tagName + '|' + ((k.getAttribute('class') || '').split(/\s+/)[0] || '');
      (bySig.get(sig) || bySig.set(sig, []).get(sig)!).push(k);
    }
    const taken = new Set<HTMLElement>();
    for (const list of bySig.values()) {
      if (list.length >= 2 && list.length <= 40 && list.every(isCardLike)) { groups.push({ parent: el, items: list }); list.forEach((l) => taken.add(l)); }
    }
    for (const k of kids) if (!taken.has(k)) visit(k);
  };
  visit(section as HTMLElement);
  return groups;
};

/** Gives every section, card group and card a stable key (kept in data-attributes). */
export const stampAll = (main: HTMLElement) => {
  const secs = getSections(main);
  const used = new Set(secs.map((s) => s.dataset.cmsKey).filter(Boolean) as string[]);
  secs.forEach((s, i) => {
    if (s.dataset.cmsAddedSection) return;
    if (!s.dataset.cmsKey) {
      let base = s.id || slug(firstText(s)) || 'section';
      let key = base, n = 2;
      while (used.has(key)) key = `${base}-${n++}`;
      used.add(key); s.dataset.cmsKey = key;
      void i;
    }
    const sk = s.dataset.cmsKey!;
    findGroups(s).forEach((g, gi) => {
      if (!g.parent.dataset.cmsGroup) g.parent.dataset.cmsGroup = `${sk}#${gi}`;
      const seen = new Set<string>();
      g.items.forEach((it) => {
        if (it.dataset.cmsCard) { seen.add(it.dataset.cmsCard); return; }
        const base = `${sk}~${slug(firstText(it)) || 'item'}`;
        let key = base, n = 2;
        while (seen.has(key) || document.querySelector(`[data-cms-card="${CSS.escape(key)}"]`)) key = `${base}-${n++}`;
        seen.add(key); it.dataset.cmsCard = key;
      });
    });
  });
};

/* ---------------- cards added in the admin ---------------- */
const tKey = new WeakMap<Node, string>();        // cloned text node -> template text
const iKey = new WeakMap<Element, string>();     // cloned image / background element -> template src
const lKey = new WeakMap<Element, string>();     // cloned anchor -> template href
const BG_SEL = '[data-cms-bg],[style*="background-image"]';
const within = (root: HTMLElement, sel: string): HTMLElement[] => [root, ...Array.from(root.querySelectorAll<HTMLElement>(sel))].filter((e) => e.matches(sel));
const scanable = (k: string) => k.length >= 2 && hasLetter(k);

const stripCms = (root: HTMLElement) => {
  [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))].forEach((n) => {
    if (n.dataset.cmsHid) n.style.removeProperty('display');
    if (n.dataset.cmsOrd) n.style.removeProperty('order');
    // A card copied while its entrance animation (framer-motion: opacity 0 + translate) is still at its start state would stay invisible forever, leaving an empty grid slot.
    if (n.style.opacity) n.style.removeProperty('opacity');          // any value: the copy may be taken part-way through the fade-in
    if (/translate|scale/.test(n.style.transform)) n.style.removeProperty('transform');
    Object.keys(n.dataset).filter((k) => k.startsWith('cms')).forEach((k) => delete n.dataset[k]);
  });
};

const fillAdded = (el: HTMLElement, a: AddedCard, resolve: (r: string) => string) => {
  textNodes(el).forEach((n) => {
    const k = tKey.get(n); if (k === undefined || !scanable(k)) return;
    const want = a.texts?.[k] ?? '';
    if (n.nodeValue !== want) n.nodeValue = want;
  });
  Array.from(el.querySelectorAll<HTMLImageElement>('img')).forEach((im) => {
    const orig = iKey.get(im); if (orig === undefined) return;
    const ov = a.img?.[orig];
    if (ov?.src) { im.setAttribute('src', resolve(ov.src)); im.removeAttribute('srcset'); im.style.display = ''; } else im.style.display = 'none';
    im.setAttribute('alt', ov?.alt || '');
  });
  within(el, BG_SEL).forEach((b) => {
    if (b.tagName === 'IMG') return; const orig = iKey.get(b); if (orig === undefined) return;
    const ov = a.img?.[orig]; b.style.backgroundImage = ov?.src ? `url("${resolve(ov.src)}")` : 'none';
  });
  within(el, 'a').forEach((x) => {
    const orig = lKey.get(x); if (orig === undefined) return;
    const val = a.link?.[orig];
    if (val) { x.setAttribute('href', val); x.dataset.cmsNew = '1'; } else { x.removeAttribute('href'); delete x.dataset.cmsNew; }
  });
};

const applyAdded = (main: HTMLElement, v: LiveValues, resolve: (r: string) => string) => {
  main.querySelectorAll<HTMLElement>('[data-cms-group]').forEach((parent) => {
    // Never render a card that has no usable content (it would show as an empty box in the grid).
    const list = (v.addedCards?.[parent.dataset.cmsGroup || ''] || []).filter((a) => Object.values(a.texts || {}).some((t) => String(t).trim()) || Object.values(a.img || {}).some((i) => i?.src));
    const kids = Array.from(parent.children) as HTMLElement[];
    const clones = kids.filter((c) => c.dataset.cmsAdded);
    clones.forEach((c) => { if (!list.some((a) => a.id === c.dataset.cmsAdded)) c.remove(); });
    const originals = kids.filter((c) => c.dataset.cmsCard && !c.dataset.cmsAdded);
    list.forEach((a) => {
      let el = clones.find((c) => c.dataset.cmsAdded === a.id);
      if (!el) {
        const tpl = originals.find((o) => o.dataset.cmsCard === a.tpl) || originals[0]; if (!tpl) return;
        el = tpl.cloneNode(true) as HTMLElement;
        const tn = textNodes(tpl), cn = textNodes(el);
        cn.forEach((n, i) => { if (tn[i]) tKey.set(n, normalizeKey(getOrigText(tn[i]))); });
        const pairEls = (sel: string, map: WeakMap<Element, string>, orig: (t: HTMLElement) => string) => {
          const a1 = within(tpl, sel), a2 = within(el!, sel); a2.forEach((n, i) => { if (a1[i]) map.set(n, orig(a1[i])); });
        };
        pairEls('img', iKey, (t) => t.dataset.cmsSrc ?? t.getAttribute('src') ?? '');
        pairEls(BG_SEL, iKey, (t) => bgUrl(t));
        pairEls('a[href]', lKey, (t) => t.dataset.cmsHref ?? t.getAttribute('href') ?? '');
        stripCms(el);
        el.dataset.cmsAdded = a.id; el.dataset.cmsCard = 'added:' + a.id; el.setAttribute('data-no-translate', '1');
        const lastCard = (Array.from(parent.children) as HTMLElement[]).filter((c) => c.dataset.cmsCard).pop() || tpl;
        lastCard.after(el);
      }
      fillAdded(el, a, resolve);
    });
  });
};

export const ownerKey = (el: Element): string =>
  (el.closest('[data-cms-card]') as HTMLElement | null)?.dataset.cmsCard ||
  (el.closest('[data-cms-key]') as HTMLElement | null)?.dataset.cmsKey || 'page';

const bgUrl = (el: HTMLElement): string => {
  const m = (el.dataset.cmsBg || el.style.backgroundImage || '').match(/url\(["']?(.*?)["']?\)/);
  return m ? m[1] : '';
};

const setHidden = (el: HTMLElement, hide: boolean) => {
  if (hide) { el.style.setProperty('display', 'none', 'important'); el.dataset.cmsHid = '1'; }
  else if (el.dataset.cmsHid) { el.style.removeProperty('display'); delete el.dataset.cmsHid; }
};
const isFlex = (el: HTMLElement) => /flex|grid/.test(getComputedStyle(el).display);

const applyOrder = (parent: HTMLElement, items: HTMLElement[], keyOf: (e: HTMLElement) => string, order: string[] | undefined, forceFlex: boolean) => {
  if (!order || !order.length) {
    items.forEach((i) => { if (i.dataset.cmsOrd) { i.style.removeProperty('order'); delete i.dataset.cmsOrd; } });
    if (parent.dataset.cmsFlex) { parent.style.removeProperty('display'); parent.style.removeProperty('flex-direction'); delete parent.dataset.cmsFlex; }
    return;
  }
  if (!isFlex(parent)) {
    if (!forceFlex) return;
    parent.style.display = 'flex'; parent.style.flexDirection = 'column'; parent.dataset.cmsFlex = '1';
  }
  const keys = items.map(keyOf);
  const final = [...order.filter((k) => keys.includes(k)), ...keys.filter((k) => !order.includes(k))];
  items.forEach((i) => { i.style.order = String(final.indexOf(keyOf(i))); i.dataset.cmsOrd = '1'; });
};

/** Applies saved overrides to the rendered page (text overrides are applied by the translator layer). */
export const applyAll = (v: LiveValues, resolve: (r: string) => string = (x) => x) => {
  const main = getMain(); if (!main) return;
  stampAll(main);
  applyAdded(main, v, resolve);
  applyAddedSections(main, v.addedSections || [], resolve, getSections(main).filter((x) => !x.dataset.cmsAddedSection));
  const secs = getSections(main);
  const hs = new Set([...(v.hiddenSections || []), ...(v.deletedSections || [])]);
  secs.forEach((s) => setHidden(s, hs.has(s.dataset.cmsKey || '')));
  if (secs[0]) applyOrder(secs[0].parentElement as HTMLElement, secs, (e) => e.dataset.cmsKey || '', v.sectionOrder, true);
  const hc = new Set([...(v.hiddenCards || []), ...(v.deletedCards || [])]);
  main.querySelectorAll<HTMLElement>('[data-cms-card]').forEach((c) => setHidden(c, hc.has(c.dataset.cmsCard || '')));
  main.querySelectorAll<HTMLElement>('[data-cms-group]').forEach((p) => {
    const items = (Array.from(p.children) as HTMLElement[]).filter((c) => c.dataset.cmsCard);
    applyOrder(p, items, (e) => e.dataset.cmsCard || '', v.cardOrder?.[p.dataset.cmsGroup || ''], false);
  });
  // images
  main.querySelectorAll<HTMLImageElement>('img').forEach((im) => {
    if (im.closest('[data-cms-added],[data-cms-added-section]')) return;
    if (im.dataset.cmsSrc === undefined) { im.dataset.cmsSrc = im.getAttribute('src') || ''; im.dataset.cmsAlt = im.getAttribute('alt') || ''; if (im.hasAttribute('srcset')) im.dataset.cmsSrcset = im.getAttribute('srcset') || ''; }
    else if (im.getAttribute('src') !== im.dataset.cmsApplied && im.getAttribute('src') !== im.dataset.cmsSrc) { im.dataset.cmsSrc = im.getAttribute('src') || ''; } // React set a new source
    const ov = v.img?.[`${ownerKey(im)}::${im.dataset.cmsSrc}`];
    const wantSrc = ov?.src ? resolve(ov.src) : im.dataset.cmsSrc!;
    const wantAlt = ov?.alt !== undefined && ov.alt !== '' ? ov.alt : im.dataset.cmsAlt!;
    if (im.getAttribute('src') !== wantSrc) im.setAttribute('src', wantSrc);
    im.dataset.cmsApplied = wantSrc;
    if (ov?.src) im.removeAttribute('srcset'); else if (im.dataset.cmsSrcset !== undefined && !im.hasAttribute('srcset')) im.setAttribute('srcset', im.dataset.cmsSrcset);
    if (im.getAttribute('alt') !== wantAlt) im.setAttribute('alt', wantAlt);
  });
  main.querySelectorAll<HTMLElement>('[style*="background-image"],[data-cms-bg]').forEach((el) => {
    if (el.tagName === 'IMG' || el.closest('[data-cms-added],[data-cms-added-section]')) return;
    if (el.dataset.cmsBg === undefined) el.dataset.cmsBg = el.style.backgroundImage;
    const orig = bgUrl(el);
    const ov = v.img?.[`${ownerKey(el)}::${orig}`];
    const want = ov?.src ? `url("${resolve(ov.src)}")` : el.dataset.cmsBg!;
    if (el.style.backgroundImage !== want) el.style.backgroundImage = want;
  });
  // links
  main.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((a) => {
    if (a.closest('[data-cms-added],[data-cms-added-section]')) return;
    if (a.dataset.cmsHref === undefined) a.dataset.cmsHref = a.getAttribute('href') || '';
    const ov = v.link?.[`${ownerKey(a)}::${a.dataset.cmsHref}`];
    if (ov) { if (a.getAttribute('href') !== ov) a.setAttribute('href', ov); a.dataset.cmsNew = '1'; }
    else { if (a.getAttribute('href') !== a.dataset.cmsHref) a.setAttribute('href', a.dataset.cmsHref); delete a.dataset.cmsNew; }
  });
};

/* ---------------- scan (runs inside the page being edited) ---------------- */
const emptyBlock = (): ScanBlock => ({ texts: [], images: [], links: [] });

const collect = (root: Element, filter: (el: Element) => boolean, block: ScanBlock, usage?: Record<string, number>) => {
  const seen = new Set(block.texts.map((t) => t.key));
  for (const n of textNodes(root)) {
    if (!filter(n.parentElement!)) continue;
    const key = normalizeKey(getOrigText(n));
    if (key.length < 2 || !hasLetter(key)) continue;
    if (usage) usage[key] = (usage[key] || 0) + 1;
    if (seen.has(key)) continue;
    seen.add(key);
    block.texts.push({ key, value: normalizeKey(n.nodeValue || ''), tag: n.parentElement!.tagName.toLowerCase() });
  }
  const seenId = new Set<string>();
  root.querySelectorAll<HTMLElement>('img,[data-cms-bg],[style*="background-image"]').forEach((el) => {
    if (!filter(el)) return;
    const isImg = el.tagName === 'IMG';
    const orig = isImg ? (el as HTMLImageElement).dataset.cmsSrc ?? el.getAttribute('src') ?? '' : bgUrl(el);
    if (!orig) return;
    const id = `${ownerKey(el)}::${orig}`;
    if (seenId.has(id)) return; seenId.add(id);
    block.images.push({ id, orig, src: isImg ? el.getAttribute('src') || '' : bgUrl(el) || orig, alt: isImg ? el.getAttribute('alt') || '' : '', origAlt: isImg ? el.dataset.cmsAlt ?? el.getAttribute('alt') ?? '' : '', bg: !isImg });
  });
  const seenL = new Set<string>();
  root.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((a) => {
    if (!filter(a)) return;
    const orig = a.dataset.cmsHref ?? a.getAttribute('href') ?? '';
    if (!orig || orig === '#') return;
    const id = `${ownerKey(a)}::${orig}`;
    if (seenL.has(id)) return; seenL.add(id);
    block.links.push({ id, orig, href: a.getAttribute('href') || '', label: origText(a).slice(0, 60) || '(image link)' });
  });
};

export const scanPage = (): ScanResult => {
  const main = getMain();
  if (!main) return { sections: [], page: emptyBlock(), usage: {}, hasMain: false };
  stampAll(main);
  const usage: Record<string, number> = {};
  const sections: ScanSection[] = getSections(main).filter((s) => !s.dataset.cmsAddedSection).map((s) => {
    const general = emptyBlock();
    collect(s, (el) => !el.closest('[data-cms-card]'), general, usage);
    const groups: ScanGroup[] = [];
    // The section itself can be the card group (cards are its direct children, e.g. Services > Legal and documentation support).
    [...(s.dataset.cmsGroup ? [s] : []), ...Array.from(s.querySelectorAll<HTMLElement>('[data-cms-group]'))].forEach((p) => {
      const items = (Array.from(p.children) as HTMLElement[]).filter((c) => c.dataset.cmsCard && !c.dataset.cmsAdded);
      if (items.length < 2) return;
      groups.push({
        key: p.dataset.cmsGroup!,
        canReorder: isFlex(p) || !!p.dataset.cmsFlex,
        cards: items.map((it) => { const block = emptyBlock(); collect(it, () => true, block); return { key: it.dataset.cmsCard!, label: firstText(it) || 'Item', block }; }),
      });
    });
    return { key: s.dataset.cmsKey!, label: firstText(s) || s.id || 'Section', general, groups };
  });
  const page = emptyBlock();
  collect(main, (el) => !el.closest('[data-cms-key]'), page);
  return { sections, page, usage, hasMain: true };
};

export { resolveMedia };
