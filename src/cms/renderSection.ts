import type { AddedSection, SectionItem } from './types';
import { tplOf } from './sectionTemplates';

const CSS = `
.cmsx{position:relative;isolation:isolate;overflow:hidden;background:var(--bg);color:var(--fg);box-sizing:border-box;width:100%}
.cmsx *{box-sizing:border-box}
.cmsx-bg{position:absolute;inset:0;z-index:-1;background-size:cover;background-position:center}
.cmsx-in{max-width:1280px;margin:0 auto;padding:52px 20px}
@media(min-width:768px){.cmsx-in{padding:72px 32px}}
.cmsx[data-align=center]{text-align:center}.cmsx[data-align=right]{text-align:right}
.cmsx-head{max-width:760px;margin:0 0 32px}
.cmsx[data-align=center] .cmsx-head{margin-left:auto;margin-right:auto}
.cmsx[data-align=right] .cmsx-head{margin-left:auto}
.cmsx-eyebrow{margin:0 0 10px;font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;opacity:.75}
.cmsx-h{margin:0;font-family:"DM Serif Display","Playfair Display",Georgia,serif;font-weight:400;font-size:clamp(1.7rem,3.2vw,2.6rem);line-height:1.15;letter-spacing:-.01em;text-transform:none}
.cmsx-sub{margin:14px 0 0;font-size:1.1rem;line-height:1.6;opacity:.9}
.cmsx-desc{margin:14px 0 0;font-size:15px;line-height:1.75;opacity:.85;white-space:pre-line}
.cmsx-btnrow{margin-top:26px}
.cmsx-btn{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:12px 26px;font-size:14px;font-weight:600;text-decoration:none;background:var(--btnbg);color:var(--btnfg);transition:opacity .2s,transform .2s;text-transform:none;letter-spacing:0}
.cmsx-btn:hover{opacity:.9;transform:translateY(-1px)}
.cmsx-grid{display:grid;gap:20px;grid-template-columns:1fr}
@media(min-width:640px){.cmsx-grid{grid-template-columns:repeat(min(var(--cols),2),1fr)}}
@media(min-width:1024px){.cmsx-grid{grid-template-columns:repeat(var(--cols),1fr)}}
.cmsx-list{display:grid;gap:16px}
.cmsx-card{display:flex;flex-direction:column;overflow:hidden;border-radius:18px;background:var(--card);border:1px solid var(--line);text-align:left}
.cmsx-card img{width:100%;aspect-ratio:16/10;object-fit:cover;display:block}
.cmsx-cb{padding:18px 20px 22px}
.cmsx-ct{margin:0;font-size:17px;font-weight:600;line-height:1.35;text-transform:none;letter-spacing:0}
.cmsx-ct a{color:inherit;text-decoration:none}.cmsx-ct a:hover{text-decoration:underline}
.cmsx-cx{margin:8px 0 0;font-size:14px;line-height:1.65;opacity:.82;white-space:pre-line}
.cmsx-list .cmsx-card{flex-direction:row;align-items:stretch}
.cmsx-list .cmsx-card img{width:200px;aspect-ratio:auto;flex:none}
@media(max-width:600px){.cmsx-list .cmsx-card{flex-direction:column}.cmsx-list .cmsx-card img{width:100%;aspect-ratio:16/10}}
.cmsx-tile{position:relative;overflow:hidden;border-radius:18px;background:var(--card);min-height:200px;display:block;color:#fff;text-decoration:none}
.cmsx-tile[data-r=wide]{aspect-ratio:16/10}.cmsx-tile[data-r=square]{aspect-ratio:1/1}
.cmsx-tile img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.cmsx-tile:after{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.7),rgba(0,0,0,0) 60%)}
.cmsx-tc{position:absolute;left:0;right:0;bottom:0;z-index:1;padding:16px 18px;text-align:left}
.cmsx-tc b{display:block;font-size:16px;font-weight:600}.cmsx-tc span{font-size:13px;opacity:.85}
.cmsx-stat{padding:12px 8px}.cmsx-stat[data-c=cards]{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:26px 16px}
.cmsx-sv{font-family:"DM Serif Display","Playfair Display",Georgia,serif;font-size:clamp(2rem,4vw,3rem);line-height:1.1}
.cmsx-sl{margin-top:6px;font-size:14px;opacity:.8}
.cmsx-step{text-align:left}.cmsx-n{display:inline-flex;width:38px;height:38px;border-radius:50%;align-items:center;justify-content:center;background:var(--btnbg);color:var(--btnfg);font-weight:700;margin-bottom:12px}
.cmsx-v .cmsx-step{display:grid;grid-template-columns:48px 1fr;gap:0 14px;padding:14px 0;border-bottom:1px solid var(--line)}.cmsx-v .cmsx-n{margin:0;grid-row:span 2}
.cmsx-faq{display:grid;gap:12px;grid-template-columns:1fr;text-align:left}
@media(min-width:900px){.cmsx-faq[data-c=two]{grid-template-columns:1fr 1fr;align-items:start}}
.cmsx-faq details{border:1px solid var(--line);background:var(--card);border-radius:14px;padding:0 18px}
.cmsx-faq summary{cursor:pointer;list-style:none;padding:16px 0;font-weight:600;font-size:16px;display:flex;justify-content:space-between;gap:12px}
.cmsx-faq summary::-webkit-details-marker{display:none}.cmsx-faq summary:after{content:"+";font-size:20px;line-height:1}
.cmsx-faq details[open] summary:after{content:"\\2212"}
.cmsx-faq p{margin:0 0 16px;font-size:14.5px;line-height:1.7;opacity:.85;white-space:pre-line}
.cmsx-q{padding:24px;text-align:left}.cmsx-q blockquote{margin:0;font-size:15.5px;line-height:1.7;white-space:pre-line}
.cmsx-q figcaption{margin-top:16px;display:flex;align-items:center;gap:12px;font-weight:600;font-size:14px}
.cmsx-q img{width:44px;height:44px;border-radius:50%;object-fit:cover;aspect-ratio:1/1}
.cmsx-chk{display:grid;gap:14px 28px;grid-template-columns:1fr;text-align:left}
@media(min-width:768px){.cmsx-chk[data-c=grid]{grid-template-columns:1fr 1fr}}
.cmsx-chk li{list-style:none;display:grid;grid-template-columns:28px 1fr;gap:10px}
.cmsx-chk li:before{content:"\\2713";width:24px;height:24px;border-radius:50%;background:var(--btnbg);color:var(--btnfg);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;margin-top:2px}
.cmsx-chk ul{margin:0;padding:0}
.cmsx-split{display:grid;gap:32px;grid-template-columns:1fr;align-items:center}
@media(min-width:900px){.cmsx-split[data-l=image-left],.cmsx-split[data-l=image-right]{grid-template-columns:1fr 1fr}.cmsx-split[data-l=image-right] .cmsx-media{order:2}}
.cmsx-media img{width:100%;border-radius:20px;object-fit:cover;display:block;max-height:520px}
.cmsx-split .cmsx-head{margin-bottom:0}
.cmsx-hero .cmsx-in{min-height:420px;display:flex;flex-direction:column;justify-content:center;padding-top:80px;padding-bottom:80px}
.cmsx-hero .cmsx-head{margin-bottom:0;max-width:820px}
.cmsx-hero .cmsx-h{font-size:clamp(2rem,5vw,3.4rem)}
.cmsx-cols{columns:1;column-gap:40px;text-align:left}@media(min-width:768px){.cmsx-cols{columns:2}}
.cmsx-ctab{border-radius:28px;padding:44px 28px;background:var(--fg);color:var(--bg)}
.cmsx-ctab .cmsx-btn{background:var(--bg);color:var(--fg)}
.cmsx-ctab .cmsx-head{margin-bottom:0}
`;

const ensureCss = () => {
  if (document.getElementById('cms-added-css')) return;
  const st = document.createElement('style'); st.id = 'cms-added-css'; st.textContent = CSS; document.head.appendChild(st);
};

const parse = (c: string): [number, number, number] | null => {
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec((c || '').trim()); if (!m) return null;
  let h = m[1]; if (h.length === 3) h = h.split('').map((x) => x + x).join('');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};
const lum = (c: [number, number, number]) => (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255;
const rgba = (c: [number, number, number], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
export const safeHref = (l: string): string => { const t = (l || '').trim(); return /^(\/|#|https?:\/\/|mailto:|tel:)/i.test(t) ? t : ''; };
const cssUrl = (u: string) => `url("${u.replace(/["\\\n\r]/g, (ch) => encodeURIComponent(ch))}")`;

type Kid = HTMLElement | null | false | undefined | '';
const h = (tag: string, cls = '', text?: string, kids: Kid[] = []): HTMLElement => {
  const e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text;
  kids.forEach((k) => k && e.appendChild(k)); return e;
};
const link = (e: HTMLAnchorElement, href: string) => { e.setAttribute('href', href); e.dataset.cmsNew = '1'; if (/^https?:/i.test(href)) { e.target = '_blank'; e.rel = 'noopener noreferrer'; } return e; };
const img = (src: string, alt: string): HTMLImageElement => { const i = document.createElement('img'); i.src = src; i.alt = alt; i.loading = 'lazy'; i.decoding = 'async'; return i; };

/** Builds the public HTML of a section created in the admin. Only textContent / attributes are used, so admin text can never inject markup. */
export const buildSection = (a: AddedSection, resolve: (r: string) => string): HTMLElement => {
  ensureCss();
  const t = tplOf(a.template);
  const bgc = parse(a.bg) || [255, 255, 255], fgc = parse(a.color) || [16, 35, 29];
  const dark = lum(bgc) < 0.45;
  const sec = document.createElement('section');
  sec.className = `cmsx cmsx-${t.kind}${a.layout === 'vertical' ? ' cmsx-v' : ''}`;
  sec.dataset.cmsAddedSection = a.id; sec.dataset.cmsKey = 'new:' + a.id; sec.setAttribute('data-align', a.align);
  sec.setAttribute('data-no-translate', '1');
  sec.setAttribute('aria-label', a.name || a.heading);
  const set = (k: string, v: string) => sec.style.setProperty(k, v);
  set('--bg', a.bg); set('--fg', a.color); set('--cols', String(a.columns || 3));
  set('--card', dark ? 'rgba(255,255,255,.08)' : lum(bgc) > 0.97 ? '#F5F8F5' : '#FFFFFF');
  set('--line', rgba(fgc, 0.14));
  set('--btnbg', dark ? '#FFFFFF' : '#124B3B'); set('--btnfg', dark ? '#124B3B' : '#FFFFFF');

  const bgSrc = a.bgImage ? resolve(a.bgImage) : (t.kind === 'hero' && a.layout === 'banner' && a.image ? resolve(a.image) : '');
  if (bgSrc) {
    const ov = h('div', 'cmsx-bg'); ov.style.backgroundImage = `linear-gradient(${rgba(bgc, t.kind === 'hero' ? 0.62 : 0.82)},${rgba(bgc, t.kind === 'hero' ? 0.62 : 0.82)}),${cssUrl(bgSrc)}`; sec.appendChild(ov);
  }

  const head = (opts: { skipBtn?: boolean } = {}) => {
    const kids: Kid[] = [
      a.label && h('p', 'cmsx-eyebrow', a.label),
      a.heading && h('h2', 'cmsx-h', a.heading),
      a.subtitle && h('p', 'cmsx-sub', a.subtitle),
      a.description && h('p', 'cmsx-desc', a.description),
    ];
    return h('div', 'cmsx-head', undefined, [...kids, !opts.skipBtn && button()]);
  };
  const button = (): Kid => {
    const href = safeHref(a.btnLink);
    if (!t.button || !a.btnVisible || !a.btnText.trim() || !href) return null;
    return h('div', 'cmsx-btnrow', undefined, [link(h('a', 'cmsx-btn', a.btnText) as HTMLAnchorElement, href)]);
  };
  const items = (a.items || []).filter((i) => i.title?.trim() || i.text?.trim() || i.image);
  const titleOf = (i: SectionItem, cls = 'cmsx-ct') => {
    const e = h('h3', cls); const href = safeHref(i.link || '');
    if (href) e.appendChild(link(h('a', '', i.title) as HTMLAnchorElement, href)); else e.textContent = i.title; return e;
  };
  const inner = h('div', 'cmsx-in'); sec.appendChild(inner);

  switch (t.kind) {
    case 'hero': {
      if (a.layout === 'split' && a.image) {
        const wrap = h('div', 'cmsx-split'); wrap.dataset.l = 'image-right';
        wrap.appendChild(head()); wrap.appendChild(h('div', 'cmsx-media', undefined, [img(resolve(a.image), a.alt)]));
        const hd = wrap.firstElementChild as HTMLElement; hd.style.maxWidth = 'none'; inner.appendChild(wrap); sec.classList.remove('cmsx-hero');
      } else inner.appendChild(head());
      break;
    }
    case 'text': {
      const hd = head({ skipBtn: false }); const d = hd.querySelector('.cmsx-desc') as HTMLElement | null;
      if (a.layout === 'two-column' && d) { hd.style.maxWidth = 'none'; d.classList.add('cmsx-cols'); d.style.opacity = '.85'; }
      inner.appendChild(hd); break;
    }
    case 'split': {
      const l = a.layout, hasImg = !!a.image && l !== 'text-only';
      if (hasImg && l === 'image-top') { inner.appendChild(h('div', 'cmsx-media', undefined, [img(resolve(a.image), a.alt)])); inner.lastElementChild!.setAttribute('style', 'margin-bottom:28px'); inner.appendChild(head()); }
      else if (hasImg) { const w = h('div', 'cmsx-split'); w.dataset.l = l; const hd = head(); w.append(hd, h('div', 'cmsx-media', undefined, [img(resolve(a.image), a.alt)])); inner.appendChild(w); }
      else inner.appendChild(head());
      break;
    }
    case 'cards': case 'gallery': case 'quotes': {
      inner.appendChild(head({ skipBtn: true }));
      if (items.length) {
        const list = t.kind !== 'gallery' && a.layout === 'list';
        const grid = h('div', list ? 'cmsx-list' : 'cmsx-grid'); if (t.kind === 'quotes' && a.layout === 'stacked') { grid.className = 'cmsx-list'; }
        items.forEach((i) => {
          const src = i.image ? resolve(i.image) : '';
          if (t.kind === 'gallery') {
            const href = safeHref(i.link || ''); const tile = document.createElement(href ? 'a' : 'div'); tile.className = 'cmsx-tile'; tile.dataset.r = a.layout;
            if (href) link(tile as HTMLAnchorElement, href);
            if (src) tile.appendChild(img(src, i.alt || i.title));
            tile.appendChild(h('div', 'cmsx-tc', undefined, [i.title && h('b', '', i.title), i.text && h('span', '', i.text)])); grid.appendChild(tile);
          } else if (t.kind === 'quotes') {
            const fig = h('figure', 'cmsx-card cmsx-q'); fig.style.margin = '0';
            fig.appendChild(h('blockquote', '', i.text));
            fig.appendChild(h('figcaption', '', undefined, [src && img(src, i.alt || i.title), i.title && h('span', '', i.title)])); grid.appendChild(fig);
          } else {
            grid.appendChild(h('article', 'cmsx-card', undefined, [src && img(src, i.alt || i.title), h('div', 'cmsx-cb', undefined, [i.title && titleOf(i), i.text && h('p', 'cmsx-cx', i.text)])]));
          }
        });
        inner.appendChild(grid);
      }
      const b = button(); if (b) { b.style.marginTop = '32px'; inner.appendChild(b); }
      break;
    }
    case 'stats': {
      inner.appendChild(head({ skipBtn: true }));
      if (items.length) { const g = h('div', 'cmsx-grid'); items.forEach((i) => { const s = h('div', 'cmsx-stat', undefined, [h('div', 'cmsx-sv', i.title), i.text && h('div', 'cmsx-sl', i.text)]); s.dataset.c = a.layout; g.appendChild(s); }); inner.appendChild(g); }
      break;
    }
    case 'steps': {
      inner.appendChild(head({ skipBtn: true }));
      if (items.length) { const g = h('div', a.layout === 'vertical' ? 'cmsx-list' : 'cmsx-grid'); items.forEach((i, n) => g.appendChild(h('div', 'cmsx-step', undefined, [h('span', 'cmsx-n', String(n + 1)), i.title && h('h3', 'cmsx-ct', i.title), i.text && h('p', 'cmsx-cx', i.text)]))); inner.appendChild(g); }
      const b = button(); if (b) { b.style.marginTop = '32px'; inner.appendChild(b); }
      break;
    }
    case 'faq': {
      inner.appendChild(head({ skipBtn: true }));
      if (items.length) { const g = h('div', 'cmsx-faq'); g.dataset.c = a.layout === 'two-column' ? 'two' : 'one'; items.forEach((i) => { const d = document.createElement('details'); d.appendChild(h('summary', '', i.title)); d.appendChild(h('p', '', i.text)); g.appendChild(d); }); inner.appendChild(g); }
      const b = button(); if (b) { b.style.marginTop = '32px'; inner.appendChild(b); }
      break;
    }
    case 'checklist': {
      const hasImg = !!a.image;
      const list = h('ul', 'cmsx-chk'); list.dataset.c = a.layout;
      items.forEach((i) => list.appendChild(h('li', '', undefined, [h('div', '', undefined, [i.title && h('strong', '', i.title), i.text && h('p', 'cmsx-cx', i.text)])])));
      if (hasImg) { const w = h('div', 'cmsx-split'); w.dataset.l = 'image-left'; const col = h('div', '', undefined, [head({ skipBtn: true }), list, button()]); w.append(h('div', 'cmsx-media', undefined, [img(resolve(a.image), a.alt)]), col); inner.appendChild(w); }
      else { inner.appendChild(head({ skipBtn: true })); inner.appendChild(list); const b = button(); if (b) { b.style.marginTop = '32px'; inner.appendChild(b); } }
      break;
    }
    case 'cta': {
      const hd = head(); if (a.layout === 'band') { const box = h('div', 'cmsx-ctab', undefined, [hd]); box.setAttribute('data-align', a.align); box.style.textAlign = a.align; hd.style.marginLeft = a.align === 'center' ? 'auto' : '0'; hd.style.marginRight = a.align === 'center' ? 'auto' : a.align === 'right' ? '0' : 'auto'; if (a.align === 'right') hd.style.marginLeft = 'auto'; inner.appendChild(box); } else inner.appendChild(hd);
      break;
    }
  }
  return sec;
};

const sigOf = (a: AddedSection, resolve: (r: string) => string) =>
  JSON.stringify(a) + '|' + [a.image, a.bgImage, ...(a.items || []).map((i) => i.image || '')].map((r) => (r ? resolve(r).length : 0)).join(',');

/** Inserts / updates / removes the admin-created sections of this page. Idempotent: nothing is touched when nothing changed. */
export const applyAddedSections = (main: HTMLElement, list: AddedSection[], resolve: (r: string) => string, originals: HTMLElement[]) => {
  const present = Array.from(main.querySelectorAll<HTMLElement>('[data-cms-added-section]'));
  present.forEach((e) => { if (!list.some((a) => a.id === e.dataset.cmsAddedSection)) e.remove(); });
  let prev: HTMLElement | null = originals[originals.length - 1] || null;
  list.forEach((a) => {
    let el = present.find((e) => e.dataset.cmsAddedSection === a.id && e.isConnected) || null;
    const sig = sigOf(a, resolve);
    if (!el || el.dataset.cmsSig !== sig) {
      const fresh = buildSection(a, resolve); fresh.dataset.cmsSig = sig;
      if (el) el.replaceWith(fresh);
      el = fresh;
    }
    if (!el.isConnected) { if (prev) prev.after(el); else main.appendChild(el); }
    else if (prev && el.previousElementSibling !== prev && !el.dataset.cmsOrd) prev.after(el);
    prev = el;
  });
};
