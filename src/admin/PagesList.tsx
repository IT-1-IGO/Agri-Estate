import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Briefcase, Building2, Calculator, CheckCircle2, ClipboardList, Copy, ExternalLink, Eye, EyeOff, FilePenLine, FileText, GraduationCap, HelpCircle, Home, Info, Landmark, LayoutGrid, List, MapPin, MoreVertical, Phone, Plus, Receipt, Search, ShieldCheck, Trash2, Users, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PAGES_SEED } from '../data/siteContent';
import { livePageName } from '../cms/types';
import { customDocName } from '../cms/custom';
import { CmsItem, getDoc, logActivity, readJson, resolveMedia, subscribeCms, uid, useCollection, writeJson } from './store';
import { Btn, ConfirmDialog, EmptyState, Field, ImageField, Modal, inputCls, useToast } from './ui';
import { useScan } from './useScan';

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
const RESERVED = ['admin', 'p', 'api', 'login', 'signup', 'uploads'];

const DESC: Record<string, string> = {
  '/': 'Landing page: hero, services, projects, testimonials and enquiry sections.',
  '/about': 'Company story, mission, vision and values.',
  '/listings': 'Land listings, categories and enquiry section.',
  '/sell-land': 'Why sell with IGO, the selling process and the land submission form.',
  '/projects': 'Project listings and details.',
  '/services': 'Service listings and details.',
  '/leadership': 'Leadership team and organisation chart.',
  '/faq': 'Frequently asked questions.',
  '/careers': 'Careers, why join us and job openings.',
  '/contact': 'Contact details and enquiry form.',
  '/valuation': 'Land valuation page and request form.',
  '/tax-optimizer': 'Tax advisory page and consultation requests.',
  '/blogs': 'Blog articles.',
  '/knowledge-hub': 'Guides and learning resources.',
  '/policy': 'Privacy policy text.',
  '/post-requirement': 'Post your land requirement form.',
};
const CATEGORY: Record<string, string> = {
  '/': 'Main', '/about': 'Main', '/leadership': 'Main', '/careers': 'Main', '/contact': 'Main',
  '/listings': 'Land', '/sell-land': 'Land', '/projects': 'Land', '/post-requirement': 'Land',
  '/services': 'Services', '/valuation': 'Services', '/tax-optimizer': 'Services',
  '/blogs': 'Resources', '/knowledge-hub': 'Resources', '/faq': 'Resources', '/policy': 'Legal',
};
const COVER: Record<string, string> = {
  '/': '/images/hero-poster.jpg', '/about': '/images/about-hero-clean.webp', '/listings': '/images/featured/agricultural-land.webp', '/sell-land': '/images/sell-land-hero-clean.webp',
  '/projects': '/images/projects-hero-clean.webp', '/services': '/images/featured/farm-development.webp', '/leadership': '/images/team-legacy-landscape.webp', '/faq': '/images/why/why-growth.webp',
  '/careers': '/images/careers/hero.webp', '/contact': '/images/igo-group-map.png', '/valuation': '/images/services/valuation-page-hero-photo.jpg', '/tax-optimizer': '/images/services/tax-page-hero-photo.jpg',
  '/blogs': '/images/blog/farmland.png', '/knowledge-hub': '/images/featured/knowledge-seedling.webp', '/policy': '/images/services/legal-page-hero-photo.jpg', '/post-requirement': '/images/categories/agricultural-land.webp',
};
const ICONS: Record<string, LucideIcon> = { '/': Home, '/about': Info, '/listings': MapPin, '/sell-land': Landmark, '/projects': Building2, '/services': Wrench, '/leadership': Users, '/faq': HelpCircle, '/careers': Briefcase, '/contact': Phone, '/valuation': Calculator, '/tax-optimizer': Receipt, '/blogs': BookOpen, '/knowledge-hub': GraduationCap, '/policy': ShieldCheck, '/post-requirement': ClipboardList };

/** Reads one public page in a hidden frame just to count its sections, then reports back. */
const SectionCounter: React.FC<{ path: string; onDone: (n: number) => void }> = ({ path, onDone }) => {
  const { state, result } = useScan(path);
  useEffect(() => { if (state === 'ready' && result) onDone(result.sections.length); else if (state === 'error') onDone(0); }, [state, result]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
};

type State = 'Published' | 'Draft' | 'Hidden';
interface Row { p: CmsItem; c: boolean; state: State; changed: boolean; updated?: string; category: string; desc: string; cover: string; Icon: LucideIcon; sections: number | null; path: string }

const STATE_STYLE: Record<State, string> = {
  Published: 'bg-[#E3F3E8] text-[#17663A] ring-[#BFE3CB]', Draft: 'bg-[#FFF4DC] text-[#8A5A00] ring-[#F1D9A3]', Hidden: 'bg-[#ECEFEC] text-[#4A5D56] ring-[#D5DCD7]',
};
const StatePill: React.FC<{ s: State; onImage?: boolean }> = ({ s, onImage }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${STATE_STYLE[s]} ${onImage ? 'shadow-sm' : ''}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{s}</span>
);

const Stat: React.FC<{ label: string; value: number; hint: string; Icon: LucideIcon; tone: string }> = ({ label, value, hint, Icon, tone }) => (
  <div className="relative overflow-hidden rounded-2xl border border-[#E3E8E1] bg-white p-4 shadow-sm">
    <span className={`absolute inset-y-0 left-0 w-1 ${tone}`} aria-hidden="true" />
    <div className="flex items-center justify-between"><p className="text-xs font-medium uppercase tracking-wide text-[#5E726B]">{label}</p><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F1F6F2] text-[#124B3B]"><Icon size={16} /></span></div>
    <p className="mt-2 text-3xl font-semibold tabular-nums text-[#10231D]">{value}</p>
    <p className="mt-0.5 text-xs text-[#6B7F78]">{hint}</p>
  </div>
);

const Menu: React.FC<{ children: React.ReactNode; label: string }> = ({ children, label }) => {
  const [open, setOpen] = useState(false); const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const c = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', c); document.addEventListener('keydown', k);
    return () => { document.removeEventListener('mousedown', c); document.removeEventListener('keydown', k); };
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button type="button" aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#C9D5CE] bg-white text-[#37534A] hover:bg-[#F2F6F3]"><MoreVertical size={16} /></button>
      {open && <div role="menu" onClick={() => setOpen(false)} className="absolute bottom-full right-0 z-20 mb-1 w-56 overflow-hidden rounded-xl border border-[#E3E8E1] bg-white py-1 shadow-lg">{children}</div>}
    </div>
  );
};
const MI: React.FC<{ onClick?: () => void; href?: string; Icon: LucideIcon; danger?: boolean; disabled?: boolean; title?: string; children: React.ReactNode }> = ({ onClick, href, Icon, danger, disabled, title, children }) => {
  const cls = `flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm normal-case tracking-normal ${disabled ? 'cursor-not-allowed text-[#A2B0AA]' : danger ? 'text-[#B42318] hover:bg-[#FDECEA]' : 'text-[#10231D] hover:bg-[#F2F6F3]'}`;
  return href && !disabled ? <a role="menuitem" href={href} target="_blank" rel="noreferrer" className={cls}><Icon size={15} />{children}</a>
    : <button type="button" role="menuitem" disabled={disabled} title={title} onClick={onClick} className={cls}><Icon size={15} />{children}</button>;
};

interface Actions { edit: (r: Row) => void; duplicate: (r: Row) => void; toggleHide: (r: Row) => void; remove: (r: Row) => void; publish: (r: Row) => void; discard: (r: Row) => void }

const RowMenu: React.FC<{ r: Row; a: Actions }> = ({ r, a }) => (
  <Menu label={`More actions for ${r.p.name}`}>
    <MI href={r.path} Icon={ExternalLink}>View live page</MI>
    <MI Icon={Copy} onClick={() => a.duplicate(r)}>Duplicate page</MI>
    <MI Icon={r.state === 'Hidden' ? Eye : EyeOff} disabled={r.path === '/'} title={r.path === '/' ? 'The home page cannot be hidden' : undefined} onClick={() => a.toggleHide(r)}>{r.state === 'Hidden' ? 'Show on website' : 'Hide from website'}</MI>
    {(r.changed || (r.c && r.state === 'Draft')) && <MI Icon={CheckCircle2} onClick={() => a.publish(r)}>Publish changes</MI>}
    {r.changed && <MI Icon={FilePenLine} onClick={() => a.discard(r)}>Discard draft changes</MI>}
    <div className="my-1 border-t border-[#EEF2EE]" />
    <MI Icon={Trash2} danger={r.c} disabled={!r.c} title={r.c ? undefined : 'Built-in pages cannot be deleted. Hide the page instead.'} onClick={() => a.remove(r)}>{r.c ? 'Delete page' : 'Delete (not available)'}</MI>
  </Menu>
);

const Thumb: React.FC<{ r: Row; className?: string }> = ({ r, className = '' }) => (
  r.cover ? <img src={r.cover} alt="" loading="lazy" className={`h-full w-full object-cover ${className}`} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} /> : null
);

const GridCard: React.FC<{ r: Row; a: Actions }> = ({ r, a }) => (
  <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#E3E8E1] bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#124B3B]/30 hover:shadow-lg">
    <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#124B3B] to-[#2E7A57]">
      <Thumb r={r} className="transition duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/10" />
      <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 text-[#124B3B] shadow"><r.Icon size={18} /></span>
      <span className="absolute right-3 top-3"><StatePill s={r.state} onImage /></span>
      {r.changed && <span className="absolute bottom-3 left-3 rounded-full bg-[#FFF4DC] px-2 py-0.5 text-[11px] font-semibold text-[#8A5A00]">Unpublished changes</span>}
    </div>
    <div className="flex flex-1 flex-col p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B8F7C]">{r.category}</p>
      <h3 className="mt-0.5 truncate text-lg font-semibold normal-case tracking-tight text-[#10231D]" title={String(r.p.name)}>{String(r.p.name)}</h3>
      <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-[#5E726B]">{r.desc}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[#EEF2EE] pt-3 text-xs text-[#5E726B]">
        <span className="font-medium text-[#37534A]">{r.c ? 'Custom page' : r.sections == null ? 'Counting sections…' : `${r.sections} section${r.sections === 1 ? '' : 's'}`}</span>
        <span aria-hidden="true">•</span><span>{r.updated ? `Updated ${fmtDate(r.updated)}` : 'Not edited yet'}</span>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button type="button" onClick={() => a.edit(r)} className="flex-1 rounded-lg bg-[#124B3B] px-3 py-2.5 text-sm font-semibold normal-case tracking-normal text-white transition hover:bg-[#0c3a2d]">Edit Visually →</button>
        <a href={`${r.path}?cms_preview=1`} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#C9D5CE] bg-white px-3 text-sm font-medium normal-case tracking-normal text-[#10231D] hover:bg-[#F2F6F3]"><Eye size={15} />Preview</a>
        <RowMenu r={r} a={a} />
      </div>
    </div>
  </article>
);

const ListRow: React.FC<{ r: Row; a: Actions }> = ({ r, a }) => (
  <article className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#E3E8E1] bg-white p-3 shadow-sm transition hover:border-[#124B3B]/30 hover:shadow-md">
    <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#124B3B] to-[#2E7A57]"><Thumb r={r} /><span className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-white/95 text-[#124B3B]"><r.Icon size={13} /></span></div>
    <div className="min-w-[160px] flex-1">
      <div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-base font-semibold normal-case tracking-tight">{String(r.p.name)}</h3><StatePill s={r.state} />{r.changed && <span className="rounded-full bg-[#FFF4DC] px-2 py-0.5 text-[11px] font-semibold text-[#8A5A00]">Unpublished changes</span>}</div>
      <p className="mt-0.5 line-clamp-1 text-sm text-[#5E726B]">{r.desc}</p>
      <p className="mt-0.5 text-xs text-[#6B7F78]">{r.category} · {r.c ? 'Custom page' : r.sections == null ? 'Counting sections…' : `${r.sections} section${r.sections === 1 ? '' : 's'}`} · {r.updated ? `Updated ${fmtDate(r.updated)}` : 'Not edited yet'} · {r.path}</p>
    </div>
    <div className="flex items-center gap-2">
      <a href={`${r.path}?cms_preview=1`} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#C9D5CE] bg-white px-3 text-sm font-medium normal-case tracking-normal hover:bg-[#F2F6F3]"><Eye size={15} />Preview</a>
      <button type="button" onClick={() => a.edit(r)} className="h-9 rounded-lg bg-[#124B3B] px-4 text-sm font-semibold normal-case tracking-normal text-white hover:bg-[#0c3a2d]">Edit Visually →</button>
      <RowMenu r={r} a={a} />
    </div>
  </article>
);

const PagesList: React.FC = () => {
  const nav = useNavigate(); const toast = useToast();
  const built = useCollection<CmsItem>('pages', PAGES_SEED);
  const custom = useCollection<CmsItem>('customPages', []);
  const [, tick] = useState(0);
  useEffect(() => subscribeCms(() => tick((n) => n + 1)), []);
  const [q, setQ] = useState(''); const [st, setSt] = useState('all'); const [cat, setCat] = useState('all'); const [sort, setSort] = useState<'recent' | 'name'>('recent');
  const [view, setView] = useState<'grid' | 'list'>(() => (readJson<string>('pages.view', 'grid') === 'list' ? 'list' : 'grid'));
  const [del, setDel] = useState<CmsItem | null>(null); const [discard, setDiscard] = useState<CmsItem | null>(null); const [adding, setAdding] = useState(false);

  const rows: Row[] = useMemo(() => [...built.items.map((p) => ({ p, c: false })), ...custom.items.map((p) => ({ p, c: true }))].map(({ p, c }) => {
    const path = String(p.path || `/p/${p.slug}`);
    const d = getDoc(c ? customDocName(p.id) : livePageName(path));
    const changed = Object.keys(d.draft || {}).length > 0 && JSON.stringify(d.draft || {}) !== JSON.stringify(d.published || {});
    const state: State = p.hidden ? 'Hidden' : c ? (p.status === 'published' ? 'Published' : 'Draft') : 'Published';
    const cover = resolveMedia(p.thumbnail) || COVER[path] || '';
    return { p, c, state, changed, path, updated: d.updatedAt || (p.updatedAt as string | undefined), category: String(p.category || CATEGORY[path] || (c ? 'Custom' : 'Other')),
      desc: String(p.description || DESC[path] || (c ? `Custom page at ${path}` : `Content of the ${p.name} page.`)), cover, Icon: ICONS[path] || FileText, sections: c ? null : readJson<number | null>('sections.' + path, null) } as Row;
  }), [built.items, custom.items]); // eslint-disable-line react-hooks/exhaustive-deps

  const stats = useMemo(() => ({ total: rows.length, published: rows.filter((r) => r.state === 'Published').length, draft: rows.filter((r) => r.state === 'Draft').length, hidden: rows.filter((r) => r.state === 'Hidden').length }), [rows]);
  const categories = useMemo(() => Array.from(new Set(rows.map((r) => r.category))).sort(), [rows]);
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = rows.filter((r) => (!s || `${r.p.name} ${r.path} ${r.desc}`.toLowerCase().includes(s)) && (st === 'all' || r.state === st) && (cat === 'all' || r.category === cat));
    return [...list].sort((a, b) => (sort === 'name' ? String(a.p.name).localeCompare(String(b.p.name)) : (Date.parse(b.updated || '') || 0) - (Date.parse(a.updated || '') || 0)));
  }, [rows, q, st, cat, sort]);

  const nextToScan = rows.filter((r) => !r.c).map((r) => r.path).find((pa) => readJson<number | null>('sections.' + pa, null) == null);
  const setViewMode = (v: 'grid' | 'list') => { setView(v); try { writeJson('pages.view', v); } catch { /* ignore */ } };
  const patch = (r: Row, change: Partial<CmsItem>) => {
    const col = r.c ? custom : built; const now = new Date().toISOString();
    col.save(col.items.map((x) => (x.id === r.p.id ? { ...x, ...change, updatedAt: now } : x)));
  };
  const taken = (slug: string) => RESERVED.includes(slug) || custom.items.some((x) => x.slug === slug) || built.items.some((x) => String(x.path) === '/' + slug);

  const actions: Actions = {
    edit: (r) => nav(`/admin/pages/${r.p.id}`),
    toggleHide: (r) => { patch(r, { hidden: r.state !== 'Hidden' }); logActivity(r.state === 'Hidden' ? 'Shown' : 'Hidden', `Page: ${r.p.name}`); toast(r.state === 'Hidden' ? `${r.p.name} is visible again` : `${r.p.name} is hidden from visitors`); },
    remove: (r) => setDel(r.p),
    discard: (r) => setDiscard(r.p),
    publish: (r) => {
      const name = r.c ? customDocName(r.p.id) : livePageName(r.path); const d = getDoc(name);
      try {
        const vals = Object.keys(d.draft || {}).length ? d.draft : d.published; const now = new Date().toISOString();
        writeJson('doc.' + name, { draft: vals, published: vals, updatedAt: now, publishedAt: now });
        if (r.c) patch(r, { status: 'published' });
        logActivity('Published', `Page: ${r.p.name}`); toast('Published — the website now shows these changes');
      } catch (e) { toast(e instanceof Error ? e.message : 'Could not publish.', 'err'); }
    },
    duplicate: (r) => {
      const baseSlug = `${slugify(r.c ? String(r.p.slug) : String(r.p.name))}-copy`; let slug = baseSlug, n = 2; while (taken(slug)) slug = `${baseSlug}-${n++}`;
      const now = new Date().toISOString(); const id = uid();
      const item: CmsItem = { id, name: `${r.p.name} (Copy)`, slug, path: `/p/${slug}`, status: 'draft', description: r.desc, category: r.category, thumbnail: r.p.thumbnail || '', seoTitle: r.p.seoTitle || '', seoDescription: r.p.seoDescription || '', updatedAt: now, order: custom.items.length };
      custom.save([...custom.items, item]);
      if (r.c) { const d = getDoc(customDocName(r.p.id)); const vals = Object.keys(d.draft || {}).length ? d.draft : d.published; writeJson('doc.' + customDocName(id), { draft: vals, published: {}, updatedAt: now }); }
      logActivity('Duplicated', `Page: ${r.p.name}`);
      toast(r.c ? 'Page duplicated as a draft' : 'Created a draft page with the same settings. Built-in sections come from the website code, so they are not copied.');
    },
  };

  const remove = () => {
    if (!del) return;
    custom.save(custom.items.filter((x) => x.id !== del.id));
    try { localStorage.removeItem('igo.cms.doc.' + customDocName(del.id)); } catch { /* ignore */ }
    logActivity('Deleted', `Page: ${del.name}`); toast('Page deleted'); setDel(null);
  };

  return (
    <div>
      {nextToScan && <SectionCounter key={nextToScan} path={nextToScan} onDone={(n) => { writeJson('sections.' + nextToScan, n); }} />}
      <header className="mb-5 rounded-2xl border border-[#E3E8E1] bg-gradient-to-br from-white via-white to-[#EEF5EF] p-5 shadow-sm sm:p-6">
        <nav aria-label="Breadcrumb" className="text-xs text-[#6B7F78]">Admin <span aria-hidden="true">/</span> Website Content <span aria-hidden="true">/</span> <span className="font-medium text-[#124B3B]">Pages</span></nav>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold normal-case tracking-tight text-[#10231D] sm:text-3xl">Pages Management</h1>
            <p className="mt-1 max-w-2xl text-sm text-[#5E726B]">Manage and customize all your website pages and their content from one place.</p>
            <p className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
              <span className="rounded-full bg-[#EEF3EF] px-3 py-1 text-[#37534A]">{stats.total} total</span>
              <span className="rounded-full bg-[#E3F3E8] px-3 py-1 text-[#17663A]">{stats.published} published</span>
              <span className="rounded-full bg-[#FFF4DC] px-3 py-1 text-[#8A5A00]">{stats.draft} draft</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-[#C9D5CE] bg-white px-3.5 py-2 text-sm font-medium normal-case tracking-normal hover:bg-[#F2F6F3]"><ExternalLink size={15} />Open Website</a>
            <Btn onClick={() => setAdding(true)}><Plus size={16} />Add New Page</Btn>
          </div>
        </div>
      </header>

      <section aria-label="Page statistics" className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total Pages" value={stats.total} hint="Pages managed here" Icon={FileText} tone="bg-[#124B3B]" />
        <Stat label="Published" value={stats.published} hint="Live for visitors" Icon={CheckCircle2} tone="bg-[#2E9E5B]" />
        <Stat label="Draft" value={stats.draft} hint="Not published yet" Icon={FilePenLine} tone="bg-[#D9A441]" />
        <Stat label="Hidden" value={stats.hidden} hint="Hidden from visitors" Icon={EyeOff} tone="bg-[#8A9A93]" />
      </section>

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-[#E3E8E1] bg-white p-3 shadow-sm">
        <div className="relative min-w-[200px] flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#93A39D]" /><input aria-label="Search pages" className={`${inputCls} pl-9`} placeholder="Search by page name…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select aria-label="Filter by status" className={`${inputCls} !w-auto`} value={st} onChange={(e) => setSt(e.target.value)}><option value="all">All statuses</option><option>Published</option><option>Draft</option><option>Hidden</option></select>
        <select aria-label="Filter by category" className={`${inputCls} !w-auto`} value={cat} onChange={(e) => setCat(e.target.value)}><option value="all">All categories</option>{categories.map((c) => <option key={c}>{c}</option>)}</select>
        <select aria-label="Sort pages" className={`${inputCls} !w-auto`} value={sort} onChange={(e) => setSort(e.target.value as 'recent' | 'name')}><option value="recent">Recently updated</option><option value="name">Page name (A–Z)</option></select>
        <div className="flex overflow-hidden rounded-lg border border-[#C9D5CE]" role="group" aria-label="View">
          <button type="button" aria-label="Grid view" aria-pressed={view === 'grid'} onClick={() => setViewMode('grid')} className={`flex h-9 w-10 items-center justify-center ${view === 'grid' ? 'bg-[#124B3B] text-white' : 'bg-white text-[#37534A] hover:bg-[#F2F6F3]'}`}><LayoutGrid size={16} /></button>
          <button type="button" aria-label="List view" aria-pressed={view === 'list'} onClick={() => setViewMode('list')} className={`flex h-9 w-10 items-center justify-center ${view === 'list' ? 'bg-[#124B3B] text-white' : 'bg-white text-[#37534A] hover:bg-[#F2F6F3]'}`}><List size={16} /></button>
        </div>
      </div>
      <p className="mb-3 text-sm text-[#5E726B]">Showing {shown.length} of {rows.length} pages</p>

      {shown.length === 0 ? <div className="rounded-2xl border border-[#E3E8E1] bg-white"><EmptyState title="No pages match your search" text="Try a different name, status or category." action={<Btn variant="outline" onClick={() => { setQ(''); setSt('all'); setCat('all'); }}>Clear filters</Btn>} /></div>
        : view === 'grid' ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{shown.map((r) => <GridCard key={String(r.p.id)} r={r} a={actions} />)}</div>
          : <div className="grid gap-3">{shown.map((r) => <ListRow key={String(r.p.id)} r={r} a={actions} />)}</div>}

      {adding && <AddPageModal categories={categories} taken={taken} onClose={() => setAdding(false)}
        onCreate={(item) => { custom.save([...custom.items, { ...item, order: custom.items.length }]); logActivity('Created', `Page: ${item.name}`); setAdding(false); toast(item.status === 'published' ? 'Page created' : 'Draft page created'); nav(`/admin/pages/${item.id}`); }} />}
      {del && <ConfirmDialog title="Delete page?" text={`“${del.name}” and all its sections will be permanently removed.`} onConfirm={remove} onCancel={() => setDel(null)} />}
      {discard && <ConfirmDialog title="Discard draft changes?" confirmLabel="Discard" text={`Unpublished edits to “${discard.name}” will be replaced with the published version.`} onCancel={() => setDiscard(null)}
        onConfirm={() => { const c = custom.items.some((x) => x.id === discard.id); const name = c ? customDocName(discard.id) : livePageName(String(discard.path)); const d = getDoc(name); writeJson('doc.' + name, { ...d, draft: { ...d.published } }); toast('Draft discarded'); setDiscard(null); }} />}
    </div>
  );
};

const AddPageModal: React.FC<{ categories: string[]; taken: (slug: string) => boolean; onClose: () => void; onCreate: (p: CmsItem) => void }> = ({ categories, taken, onClose, onCreate }) => {
  const [f, setF] = useState({ name: '', title: '', slug: '', description: '', category: 'Custom', thumbnail: '', seoTitle: '', seoDescription: '' });
  const [slugEdited, setSlugEdited] = useState(false); const [err, setErr] = useState<Record<string, string>>({});
  const set = (k: keyof typeof f, v: string) => { setF((x) => ({ ...x, [k]: v, ...(k === 'name' && !slugEdited ? { slug: slugify(v) } : {}) })); setErr((e) => ({ ...e, [k]: '' })); };
  const submit = (status: 'draft' | 'published') => {
    const e: Record<string, string> = {}; const slug = slugify(f.slug || f.name);
    if (!f.name.trim()) e.name = 'Page name is required.';
    if (!slug) e.slug = 'Enter a valid URL slug.'; else if (taken(slug)) e.slug = 'A page with this URL already exists.';
    if (Object.keys(e).length) { setErr(e); return; }
    onCreate({ id: uid(), name: f.name.trim(), title: f.title.trim() || f.name.trim(), slug, path: `/p/${slug}`, status, description: f.description.trim(), category: f.category.trim() || 'Custom', thumbnail: f.thumbnail, seoTitle: f.seoTitle.trim(), seoDescription: f.seoDescription.trim(), updatedAt: new Date().toISOString() });
  };
  const cats = Array.from(new Set(['Custom', ...categories]));
  return (
    <Modal title="Add New Page" wide onClose={onClose} footer={<><Btn variant="outline" onClick={onClose}>Cancel</Btn><Btn variant="outline" onClick={() => submit('draft')}>Save as Draft</Btn><Btn onClick={() => submit('published')}>Publish</Btn></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Page name *" htmlFor="np-n" error={err.name}><input id="np-n" className={inputCls} value={f.name} onChange={(e) => set('name', e.target.value)} autoFocus /></Field>
        <Field label="Page title" htmlFor="np-t" hint="Shown as the page heading. Defaults to the page name."><input id="np-t" className={inputCls} value={f.title} onChange={(e) => set('title', e.target.value)} /></Field>
        <Field label="URL slug *" htmlFor="np-s" error={err.slug} hint={`Will be available at /p/${slugify(f.slug || f.name) || 'your-page'}`}><input id="np-s" className={inputCls} value={f.slug} onChange={(e) => { setSlugEdited(true); set('slug', e.target.value); }} /></Field>
        <Field label="Page category" htmlFor="np-c"><input id="np-c" list="np-cats" className={inputCls} value={f.category} onChange={(e) => set('category', e.target.value)} /><datalist id="np-cats">{cats.map((c) => <option key={c} value={c} />)}</datalist></Field>
        <div className="sm:col-span-2"><Field label="Page description" htmlFor="np-d" hint="Shown on the page card."><textarea id="np-d" rows={2} className={inputCls} value={f.description} onChange={(e) => set('description', e.target.value)} /></Field></div>
        <div className="rounded-lg border border-[#E3E8E1] p-3 sm:col-span-2"><ImageField label="Page thumbnail" value={f.thumbnail} onChange={(v) => set('thumbnail', v)} /></div>
        <Field label="SEO title" htmlFor="np-st"><input id="np-st" className={inputCls} maxLength={70} value={f.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} /></Field>
        <Field label="Meta description" htmlFor="np-sd"><textarea id="np-sd" rows={2} maxLength={170} className={inputCls} value={f.seoDescription} onChange={(e) => set('seoDescription', e.target.value)} /></Field>
      </div>
      <p className="mt-4 text-xs text-[#6B7F78]">Save as Draft keeps the page private until you publish it. Add it to the menu in Navigation &amp; Footer.</p>
    </Modal>
  );
};
export default PagesList;
