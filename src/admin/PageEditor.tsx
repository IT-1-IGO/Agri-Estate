import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, ChevronDown, Copy, GripVertical, Plus, ChevronRight, ExternalLink, Eye, EyeOff, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { PAGES_SEED } from '../data/siteContent';
import { AddedCard, AddedSection, LiveValues, ScanBlock, ScanResult, ScanSection, livePageName } from '../cms/types';
import { tplOf } from '../cms/sectionTemplates';
import AddSectionModal from './AddSectionModal';
import AddCardModal from './AddCardModal';
import { CmsItem, logActivity, resolveMedia, uid, useCollection, useDoc } from './store';
import { useScan } from './useScan';
import { Btn, Card, ConfirmDialog, EmptyState, Field, ImageField, PageHeader, inputCls, useToast } from './ui';
import { FormFields } from './forms';
import CustomPageEditor from './CustomPageEditor';

const NOTES: Record<string, { text: string; links: [string, string][] }> = {
  '/services': { text: 'Service cards, descriptions, images and feature lists are managed with full add / delete / reorder in the Services module. Text, images and links below also work.', links: [['/admin/services', 'Open Services cards']] },
  '/careers': { text: 'Career categories, “why join” cards and job openings are managed with add / delete / reorder here. Text, images and links below also work.', links: [['/admin/careers', 'Cards & categories'], ['/admin/careers/openings', 'Job openings']] },
  '/projects': { text: 'Project listings come from the Projects module (add, edit, delete there).', links: [['/admin/projects', 'Open Projects']] },
  '/listings': { text: 'Land listings come from the Projects module.', links: [['/admin/projects', 'Open Projects']] },
  '/': { text: 'Homepage sections appear below in page order. Project cards on the homepage come from the Projects module.', links: [['/admin/projects', 'Open Projects']] },
};

type Setter = (fn: (v: LiveValues) => LiveValues) => void;

const BlockEditor: React.FC<{ block: ScanBlock; v: LiveValues; set: Setter; usage: Record<string, number>; idp: string }> = ({ block, v, set, usage, idp }) => {
  const empty = !block.texts.length && !block.images.length && !block.links.length;
  if (empty) return <p className="text-sm text-[#6B7F78]">Nothing editable here.</p>;
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4">
      {block.texts.map((t, i) => {
        const cur = v.text?.[t.key] ?? t.key;
        const long = t.key.length > 70 || cur.length > 70;
        const used = usage[t.key] || 1;
        return (
          <Field key={t.key} label={`${/^h[1-6]$/.test(t.tag) ? 'Heading' : t.tag === 'button' || t.tag === 'a' ? 'Button / link text' : 'Text'}${used > 1 ? ` (also used ${used - 1} more time${used > 2 ? 's' : ''} on this page)` : ''}`} htmlFor={`${idp}-t${i}`}>
            {long ? <textarea id={`${idp}-t${i}`} rows={3} className={inputCls} value={cur} onChange={(e) => set((x) => ({ ...x, text: pruneText(x.text, t.key, e.target.value) }))} />
              : <input id={`${idp}-t${i}`} className={inputCls} value={cur} onChange={(e) => set((x) => ({ ...x, text: pruneText(x.text, t.key, e.target.value) }))} />}
            {cur !== t.key && <button type="button" onClick={() => set((x) => ({ ...x, text: pruneText(x.text, t.key, t.key) }))} className="mt-1 text-xs text-[#124B3B] hover:underline">Reset to original</button>}
          </Field>
        );
      })}
      {block.images.map((im) => {
        const ov = v.img?.[im.id] || {};
        return (
          <div key={im.id} className="rounded-lg border border-[#E3E8E1] p-3">
            <ImageField label={im.bg ? 'Background image' : 'Image'} value={ov.src || ''} fallback={im.orig} onChange={(src) => set((x) => ({ ...x, img: pruneImg(x.img, im.id, { ...ov, src }) }))} />
            {!im.bg && <div className="mt-3"><Field label="Image description (alt text)"><input className={inputCls} value={ov.alt ?? im.origAlt} onChange={(e) => set((x) => ({ ...x, img: pruneImg(x.img, im.id, { ...ov, alt: e.target.value === im.origAlt ? undefined : e.target.value }) }))} /></Field></div>}
          </div>
        );
      })}
      {block.links.map((l, i) => (
        <Field key={l.id} label={`Link: ${l.label}`} htmlFor={`${idp}-l${i}`} hint={`Original: ${l.orig}`}>
          <input id={`${idp}-l${i}`} className={inputCls} value={v.link?.[l.id] ?? l.orig} onChange={(e) => set((x) => ({ ...x, link: pruneLink(x.link, l.id, e.target.value, l.orig) }))} />
        </Field>
      ))}
    </div>
  );
};

const pruneText = (m: Record<string, string> | undefined, k: string, val: string) => { const n = { ...(m || {}) }; if (val === k) delete n[k]; else n[k] = val; return n; };
const pruneLink = (m: Record<string, string> | undefined, k: string, val: string, orig: string) => { const n = { ...(m || {}) }; if (val === orig || !val.trim()) delete n[k]; else n[k] = val.trim(); return n; };
const pruneImg = (m: LiveValues['img'], k: string, val: { src?: string; alt?: string }) => { const n = { ...(m || {}) }; if (!val.src && !val.alt) delete n[k]; else n[k] = val; return n; };
/** Removes every edit that belongs to one section so it shows its original content again. */
const restoreSection = (x: LiveValues, s: ScanSection): LiveValues => {
  const blocks = [s.general, ...s.groups.flatMap((g) => g.cards.map((c) => c.block))];
  const cardKeys = new Set(s.groups.flatMap((g) => g.cards.map((c) => c.key)));
  const drop = <T,>(m: Record<string, T> | undefined, keys: string[]) => { if (!m) return m; const n = { ...m }; keys.forEach((k) => delete n[k]); return Object.keys(n).length ? n : undefined; };
  const cardOrder = { ...(x.cardOrder || {}) }; s.groups.forEach((g) => delete cardOrder[g.key]);
  return {
    ...x,
    text: drop(x.text, blocks.flatMap((b) => b.texts.map((t) => t.key))),
    img: drop(x.img, blocks.flatMap((b) => b.images.map((i) => i.id))),
    link: drop(x.link, blocks.flatMap((b) => b.links.map((l) => l.id))),
    hiddenSections: (x.hiddenSections || []).filter((k) => k !== s.key),
    deletedSections: (x.deletedSections || []).filter((k) => k !== s.key),
    hiddenCards: (x.hiddenCards || []).filter((k) => !cardKeys.has(k)),
    deletedCards: (x.deletedCards || []).filter((k) => !cardKeys.has(k)),
    cardOrder: Object.keys(cardOrder).length ? cardOrder : undefined,
    addedCards: (() => { const a = { ...(x.addedCards || {}) }; s.groups.forEach((g) => delete a[g.key]); return Object.keys(a).length ? a : undefined; })(),
  };
};
const toggle = (arr: string[] | undefined, k: string, on: boolean) => { const s = new Set(arr || []); if (on) s.add(k); else s.delete(k); return Array.from(s); };

const wordFor = (sectionLabel: string, g: ScanSection['groups'][number]): string => {
  const t = `${sectionLabel} ${g.cards.map((c) => c.label).join(' ')}`.toLowerCase();
  if (/faq|question/.test(t)) return 'FAQ';
  if (/testimonial|review|stories/.test(t)) return 'Testimonial';
  if (/why choose|why igo|benefit|feature|advantage|trust|assurance/.test(t)) return 'Feature';
  if (/project|propert|listing|estate|plot|farm types/.test(sectionLabel.toLowerCase())) return /service/.test(t) ? 'Service' : 'Project Card';
  if (/service|offer|solution/.test(t)) return 'Service';
  if (/step|process|journey|how it works/.test(t)) return 'Step';
  if (/blog|guide|article|resource|advice/.test(t)) return 'Article';
  return 'Item';
};
const effectiveOrder = (x: LiveValues, g: ScanSection['groups'][number], added: AddedCard[]): string[] => {
  const all = [...g.cards.map((c) => c.key), ...added.map((a) => 'added:' + a.id)];
  const ord = (x.cardOrder?.[g.key] || all).filter((k) => all.includes(k));
  return [...ord, ...all.filter((k) => !ord.includes(k))];
};

/** Display order of every main section on the page: built-in ones (from the scan) plus sections created in the admin ("new:<id>"). */
const computeOrder = (scanKeys: string[], x: LiveValues): string[] => {
  const keys = [...scanKeys, ...(x.addedSections || []).map((a) => 'new:' + a.id)];
  const o = (x.sectionOrder || []).filter((k) => keys.includes(k));
  return [...o, ...keys.filter((k) => !o.includes(k))];
};
/** Puts one section at a position (0-based, among sections that are not deleted). Leaves the order untouched when it is already there. */
const withPlacement = (scanKeys: string[], x: LiveValues, key: string, index: number): LiveValues => {
  const del = x.deletedSections || [];
  const all = computeOrder(scanKeys, x);
  const cur = all.filter((k) => !del.includes(k));
  if (cur[Math.min(Math.max(0, index), cur.length - 1)] === key) return x;
  const live = all.filter((k) => k !== key && !del.includes(k));
  live.splice(Math.min(Math.max(0, index), live.length), 0, key);
  return { ...x, sectionOrder: [...live, ...all.filter((k) => k !== key && del.includes(k))] };
};

const SectionEditor: React.FC<{ scan: ScanResult; v: LiveValues; set: Setter; order: string[]; dirty: boolean; onSave: () => void; onPreview: () => void; askRestore: (s: ScanSection) => void; askDelete: (what: 'section' | 'card', key: string, label: string) => void }> = ({ scan, v, set, order, dirty, onSave, onPreview, askRestore, askDelete }) => {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [drag, setDrag] = useState<string | null>(null);
  const [modal, setModal] = useState<{ g: ScanSection['groups'][number]; initial?: AddedCard; pos?: number; hidden?: boolean } | null>(null);
  const [delAdded, setDelAdded] = useState<{ g: ScanSection['groups'][number]; a: AddedCard; label: string } | null>(null);
  const saveAdded = (g: ScanSection['groups'][number], card: AddedCard, hidden: boolean, pos: number, isEdit: boolean) => set((x) => {
    const cur = x.addedCards?.[g.key] || []; const list = isEdit ? cur.map((a) => (a.id === card.id ? card : a)) : [...cur, card];
    const key = 'added:' + card.id; let cardOrder = x.cardOrder;
    if (g.canReorder) { const ord = effectiveOrder(x, g, list).filter((k) => k !== key); ord.splice(Math.max(0, pos - 1), 0, key); cardOrder = { ...(x.cardOrder || {}), [g.key]: ord }; }
    return { ...x, addedCards: { ...(x.addedCards || {}), [g.key]: list }, hiddenCards: toggle(x.hiddenCards, key, hidden), cardOrder };
  });
  const removeAdded = (g: ScanSection['groups'][number], a: AddedCard) => set((x) => {
    const key = 'added:' + a.id; const list = (x.addedCards?.[g.key] || []).filter((c) => c.id !== a.id);
    const addedCards = { ...(x.addedCards || {}) }; if (list.length) addedCards[g.key] = list; else delete addedCards[g.key];
    const cardOrder = x.cardOrder?.[g.key] ? { ...x.cardOrder, [g.key]: x.cardOrder[g.key].filter((k) => k !== key) } : x.cardOrder;
    return { ...x, addedCards: Object.keys(addedCards).length ? addedCards : undefined, hiddenCards: toggle(x.hiddenCards, key, false), cardOrder };
  });
  const dupCard = (g: ScanSection['groups'][number], r: { key: string; c?: ScanSection['groups'][number]['cards'][number]; a?: AddedCard }) => set((x) => {
    const card: AddedCard = r.c
      ? { id: uid(), tpl: r.c.key, texts: Object.fromEntries(r.c.block.texts.map((t) => [t.key, x.text?.[t.key] ?? t.key])),
          img: Object.fromEntries(r.c.block.images.map((im) => [im.orig, { src: x.img?.[im.id]?.src || im.orig, alt: x.img?.[im.id]?.alt ?? im.origAlt }])),
          link: Object.fromEntries(r.c.block.links.map((l) => [l.orig, x.link?.[l.id] ?? l.orig])) }
      : { ...JSON.parse(JSON.stringify(r.a)), id: uid() };
    const list = [...(x.addedCards?.[g.key] || []), card]; const key = 'added:' + card.id;
    let cardOrder = x.cardOrder;
    if (g.canReorder) { const ord = effectiveOrder(x, g, list).filter((k) => k !== key); ord.splice(ord.indexOf(r.key) + 1, 0, key); cardOrder = { ...(x.cardOrder || {}), [g.key]: ord }; }
    return { ...x, addedCards: { ...(x.addedCards || {}), [g.key]: list }, cardOrder };
  });
  const dropOn = (g: ScanSection['groups'][number], allKeys: string[], from: string, to: string) => set((x) => {
    const added = x.addedCards?.[g.key] || []; const ord = effectiveOrder(x, g, added).filter((k) => allKeys.includes(k) && k !== from);
    ord.splice(Math.max(0, ord.indexOf(to)), 0, from); return { ...x, cardOrder: { ...(x.cardOrder || {}), [g.key]: ord } };
  });
  const byKey = new Map(scan.sections.map((s) => [s.key, s]));
  const live = order.filter((k) => !(v.deletedSections || []).includes(k));
  const scanKeys = scan.sections.map((s) => s.key);
  const [secModal, setSecModal] = useState<{ initial?: AddedSection; pos?: number; hidden?: boolean } | null>(null);
  const [delSec, setDelSec] = useState<AddedSection | null>(null);
  const [dragSec, setDragSec] = useState<string | null>(null);
  const saveSection = (sec: AddedSection, hid: boolean, pos: number, isEdit: boolean) => set((x) => {
    const cur = x.addedSections || []; const list = isEdit ? cur.map((a) => (a.id === sec.id ? sec : a)) : [...cur, sec]; const key = 'new:' + sec.id;
    return withPlacement(scanKeys, { ...x, addedSections: list, hiddenSections: toggle(x.hiddenSections, key, hid) }, key, pos - 1);
  });
  const removeSection = (a: AddedSection) => set((x) => {
    const key = 'new:' + a.id; const list = (x.addedSections || []).filter((s) => s.id !== a.id);
    return { ...x, addedSections: list.length ? list : undefined, hiddenSections: toggle(x.hiddenSections, key, false), deletedSections: toggle(x.deletedSections, key, false), sectionOrder: x.sectionOrder?.filter((k) => k !== key) };
  });
  const dupSection = (a: AddedSection) => set((x) => {
    const copy: AddedSection = { ...JSON.parse(JSON.stringify(a)), id: uid(), name: `${a.name} (copy)`, items: a.items.map((i) => ({ ...i, id: uid() })) };
    const del = x.deletedSections || []; const at = computeOrder(scanKeys, x).filter((k) => !del.includes(k)).indexOf('new:' + a.id);
    return withPlacement(scanKeys, { ...x, addedSections: [...(x.addedSections || []), copy], hiddenSections: (x.hiddenSections || []).includes('new:' + a.id) ? toggle(x.hiddenSections, 'new:' + copy.id, true) : x.hiddenSections }, 'new:' + copy.id, at + 1);
  });
  const dropSection = (from: string, to: string) => set((x) => {
    const del = x.deletedSections || []; const all = computeOrder(scanKeys, x); const arr = all.filter((k) => !del.includes(k));
    const fi = arr.indexOf(from), ti = arr.indexOf(to); if (fi < 0 || ti < 0 || fi === ti) return x;
    arr.splice(fi, 1); arr.splice(ti, 0, from); return { ...x, sectionOrder: [...arr, ...all.filter((k) => del.includes(k))] };
  });
  const grip = (k: string) => (
    <span draggable onDragStart={(e) => { e.dataTransfer.setData('text/plain', k); e.dataTransfer.effectAllowed = 'move'; setDragSec(k); }} onDragEnd={() => setDragSec(null)}
      className="cursor-grab rounded p-1 text-[#93A39D] hover:bg-[#EEF3EF]" title="Drag to reorder section" aria-label="Drag to reorder section"><GripVertical size={15} /></span>
  );
  const dropProps = (k: string) => ({ onDragOver: (e: React.DragEvent) => { if (dragSec) e.preventDefault(); }, onDrop: (e: React.DragEvent) => { if (!dragSec) return; e.preventDefault(); if (dragSec !== k) dropSection(dragSec, k); setDragSec(null); } });
  const renderAdded = (a: AddedSection, k: string, idx: number) => {
    const hidden = (v.hiddenSections || []).includes(k); const isOpen = open[k] !== false; const tpl = tplOf(a.template);
    const layoutLabel = tpl.layouts.find((l) => l.id === a.layout)?.label || a.layout;
    return (
      <div key={k} {...dropProps(k)} className={`${isOpen ? 'md:col-span-2 ' : ''}${dragSec === k ? 'opacity-40' : ''}`}>
        <Card className={`border-[#9CC9AE] ${hidden ? 'opacity-70' : ''}`}>
          <div className="flex flex-wrap items-center gap-2 px-4 py-3">
            {grip(k)}
            <button type="button" onClick={() => setOpen({ ...open, [k]: !isOpen })} className="flex min-w-0 flex-1 items-center gap-2 text-left" aria-expanded={isOpen}>
              <span className="rounded bg-[#EEF3EF] px-1.5 py-0.5 text-xs text-[#37534A]">{idx + 1}</span>
              <span className="truncate font-medium normal-case tracking-normal">{a.name || a.heading}</span>
              <span className="rounded-full bg-[#DDF0E3] px-2 py-0.5 text-xs text-[#17663A]">New section</span>
              {a.status === 'draft' && <span className="rounded-full bg-[#FFF1D6] px-2 py-0.5 text-xs text-[#8A5A00]">Draft</span>}
              {hidden && <span className="rounded-full bg-[#FFF1D6] px-2 py-0.5 text-xs text-[#8A5A00]">Hidden</span>}
            </button>
            <div className="flex items-center gap-0.5">
              <button type="button" aria-label="Edit section" title="Edit section" onClick={() => setSecModal({ initial: a, pos: idx + 1, hidden })} className="rounded p-1.5 text-[#124B3B] hover:bg-[#EEF3EF]"><Pencil size={15} /></button>
              <button type="button" aria-label="Move section up" title="Move up" disabled={idx === 0} onClick={() => move(k, -1)} className="rounded p-1.5 hover:bg-[#EEF3EF] disabled:opacity-30"><ArrowUp size={15} /></button>
              <button type="button" aria-label="Move section down" title="Move down" disabled={idx === live.length - 1} onClick={() => move(k, 1)} className="rounded p-1.5 hover:bg-[#EEF3EF] disabled:opacity-30"><ArrowDown size={15} /></button>
              <button type="button" aria-label="Duplicate section" title="Duplicate" onClick={() => dupSection(a)} className="rounded p-1.5 hover:bg-[#EEF3EF]"><Copy size={15} /></button>
              <button type="button" aria-label={hidden ? 'Show section' : 'Hide section'} title={hidden ? 'Show on website' : 'Hide from website'} onClick={() => set((x) => ({ ...x, hiddenSections: toggle(x.hiddenSections, k, !hidden) }))} className="rounded p-1.5 hover:bg-[#EEF3EF]">{hidden ? <Eye size={15} /> : <EyeOff size={15} />}</button>
              <button type="button" aria-label="Delete section" title="Delete section" onClick={() => setDelSec(a)} className="rounded p-1.5 text-[#B42318] hover:bg-[#FDECEA]"><Trash2 size={15} /></button>
            </div>
          </div>
          {isOpen && (
            <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-4 border-t border-[#E3E8E1] p-4 md:p-5">
              <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-1.5 text-sm">
                <dt className="text-[#6B7F78]">Heading</dt><dd className="font-medium">{a.heading}</dd>
                <dt className="text-[#6B7F78]">Template</dt><dd>{tpl.name} · {layoutLabel}</dd>
                {tpl.item && <><dt className="text-[#6B7F78]">{tpl.item.plural}</dt><dd>{a.items.length}</dd></>}
                <dt className="text-[#6B7F78]">Status</dt><dd>{a.status === 'published' ? 'Published with the page' : 'Draft (not shown to visitors)'}{hidden ? ' · hidden' : ''}</dd>
              </dl>
              <div className="-mx-4 -mb-4 flex flex-wrap items-center gap-2 border-t border-[#E3E8E1] bg-[#FAFCFA] px-4 py-3">
                <Btn disabled={!dirty} onClick={onSave}>Save changes</Btn>
                <Btn variant="outline" onClick={() => setSecModal({ initial: a, pos: idx + 1, hidden })}>Edit</Btn>
                <Btn variant="outline" onClick={onPreview}>Preview</Btn>
                <Btn variant="outline" onClick={() => set((x) => ({ ...x, hiddenSections: toggle(x.hiddenSections, k, !hidden) }))}>{hidden ? 'Show' : 'Hide'}</Btn>
                <Btn variant="outline" onClick={() => dupSection(a)}>Duplicate</Btn>
                <Btn variant="outline" className="ml-auto !border-[#F2C9C4] !text-[#B42318] hover:!bg-[#FDECEA]" onClick={() => setDelSec(a)}>Delete</Btn>
              </div>
            </div>)}
        </Card>
      </div>
    );
  };
  const move = (k: string, d: -1 | 1) => set((x) => { const o = [...live]; const i = o.indexOf(k), j = i + d; if (j < 0 || j >= o.length) return x; [o[i], o[j]] = [o[j], o[i]]; return { ...x, sectionOrder: [...o, ...(x.deletedSections || [])] }; });
  const moveCard = (gk: string, keys: string[], k: string, d: -1 | 1) => set((x) => { const cur = (x.cardOrder?.[gk] || keys).filter((c) => keys.includes(c)); const full = [...cur, ...keys.filter((c) => !cur.includes(c))]; const i = full.indexOf(k), j = i + d; if (j < 0 || j >= full.length) return x; [full[i], full[j]] = [full[j], full[i]]; return { ...x, cardOrder: { ...(x.cardOrder || {}), [gk]: full } }; });
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-wrap items-center justify-between gap-3 md:col-span-2">
        <h2 className="text-base font-semibold normal-case tracking-normal text-[#10231D]">Page sections ({live.length})</h2>
        <Btn onClick={() => setSecModal({})}><Plus size={16} />Add New Section</Btn>
      </div>
      {live.map((k, idx) => {
        if (k.startsWith('new:')) { const a = (v.addedSections || []).find((x) => 'new:' + x.id === k); return a ? renderAdded(a, k, idx) : null; }
        const s = byKey.get(k); if (!s) return null;
        const hidden = (v.hiddenSections || []).includes(k);
        const isOpen = open[k] !== false;
        return (
          <div key={k} {...dropProps(k)} className={`${isOpen ? 'md:col-span-2 ' : ''}${dragSec === k ? 'opacity-40' : ''}`}>
          <Card className={hidden ? 'opacity-70' : ''}>
            <div className="flex flex-wrap items-center gap-2 px-4 py-3">
              {grip(k)}
              <button type="button" onClick={() => setOpen({ ...open, [k]: !isOpen })} className="flex min-w-0 flex-1 items-center gap-2 text-left" aria-expanded={isOpen}>
                <span className="rounded bg-[#EEF3EF] px-1.5 py-0.5 text-xs text-[#37534A]">{idx + 1}</span>
                <span className="truncate font-medium normal-case tracking-normal">{s.label}</span>
                {hidden && <span className="rounded-full bg-[#FFF1D6] px-2 py-0.5 text-xs text-[#8A5A00]">Hidden</span>}
              </button>
              <div className="flex items-center gap-0.5">
                <button type="button" aria-label={isOpen ? 'Close editor' : 'Edit section'} title={isOpen ? 'Close editor' : 'Edit section'} aria-expanded={isOpen} onClick={() => setOpen({ ...open, [k]: !isOpen })} className={`rounded p-1.5 text-[#124B3B] hover:bg-[#EEF3EF] ${isOpen ? 'bg-[#EEF3EF]' : ''}`}><Pencil size={15} /></button>
                <button type="button" aria-label="Move section up" title="Move up" disabled={idx === 0} onClick={() => move(k, -1)} className="rounded p-1.5 hover:bg-[#EEF3EF] disabled:opacity-30"><ArrowUp size={15} /></button>
                <button type="button" aria-label="Move section down" title="Move down" disabled={idx === live.length - 1} onClick={() => move(k, 1)} className="rounded p-1.5 hover:bg-[#EEF3EF] disabled:opacity-30"><ArrowDown size={15} /></button>
                <button type="button" aria-label={hidden ? 'Show section' : 'Hide section'} title={hidden ? 'Show on website' : 'Hide from website'} onClick={() => set((x) => ({ ...x, hiddenSections: toggle(x.hiddenSections, k, !hidden) }))} className="rounded p-1.5 hover:bg-[#EEF3EF]">{hidden ? <Eye size={15} /> : <EyeOff size={15} />}</button>
                <button type="button" aria-label="Delete section" title="Delete section" onClick={() => askDelete('section', k, s.label)} className="rounded p-1.5 text-[#B42318] hover:bg-[#FDECEA]"><Trash2 size={15} /></button>
              </div>
            </div>
            {isOpen && (
              <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-5 border-t border-[#E3E8E1] p-4 md:p-5">
                <Field label="Visibility" htmlFor={`vis-${k}`}>
                  <select id={`vis-${k}`} className={inputCls} value={hidden ? 'hidden' : 'visible'} onChange={(e) => set((x) => ({ ...x, hiddenSections: toggle(x.hiddenSections, k, e.target.value === 'hidden') }))}>
                    <option value="visible">Visible</option><option value="hidden">Hidden</option>
                  </select>
                </Field>
                <BlockEditor block={s.general} v={v} set={set} usage={scan.usage} idp={`s-${k}`} />
                {s.groups.map((g) => {
                  const added = v.addedCards?.[g.key] || [];
                  const allKeys = [...g.cards.map((c) => c.key), ...added.map((a) => 'added:' + a.id)];
                  const full = effectiveOrder(v, g, added);
                  type Row = { key: string; c?: ScanSection['groups'][number]['cards'][number]; a?: AddedCard };
                  const rows: Row[] = full.map((key) => (key.startsWith('added:') ? { key, a: added.find((x) => 'added:' + x.id === key) } : { key, c: g.cards.find((c) => c.key === key) }))
                    .filter((r) => (r.a || r.c) && !(v.deletedCards || []).includes(r.key));
                  const word = wordFor(s.label, g);
                  const labelOf = (r: Row) => r.c ? r.c.label : (Object.values(r.a!.texts).find((t) => t.trim()) || `New ${word.toLowerCase()}`);
                  return (
                    <div key={g.key}>
                      <h3 className="mb-2 text-sm font-semibold normal-case tracking-normal text-[#2B4139]">Cards / items ({rows.length})</h3>
                      {!g.canReorder && <p className="mb-2 text-xs text-[#6B7F78]">These items are not laid out in a grid, so reordering is unavailable here; hide, delete, duplicate and edit work.</p>}
                      <div className="grid gap-2">
                        {rows.map((r, ci) => {
                          const ch = (v.hiddenCards || []).includes(r.key); const co = !!open[r.key]; const isNew = !!r.a;
                          return (
                            <div key={r.key} draggable={g.canReorder} onDragStart={() => setDrag(r.key)} onDragOver={(e) => { if (g.canReorder && drag) e.preventDefault(); }}
                              onDrop={(e) => { e.preventDefault(); if (drag && drag !== r.key) dropOn(g, allKeys, drag, r.key); setDrag(null); }} onDragEnd={() => setDrag(null)}
                              className={`rounded-lg border ${isNew ? 'border-[#9CC9AE] bg-[#F6FBF7]' : 'border-[#E3E8E1]'} ${ch ? 'opacity-70' : ''} ${drag === r.key ? 'opacity-40' : ''}`}>
                              <div className="flex flex-wrap items-center gap-1.5 px-3 py-2">
                                {g.canReorder && <span className="cursor-grab text-[#93A39D]" title="Drag to reorder" aria-hidden="true"><GripVertical size={15} /></span>}
                                <button type="button" onClick={() => (isNew ? setModal({ g, initial: r.a, pos: ci + 1, hidden: ch }) : setOpen({ ...open, [r.key]: !co }))} className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm" aria-expanded={isNew ? undefined : co}>{isNew ? <Pencil size={14} /> : co ? <ChevronDown size={15} /> : <ChevronRight size={15} />}<span className="truncate">{labelOf(r)}</span>{isNew && <span className="rounded-full bg-[#DDF0E3] px-2 py-0.5 text-xs text-[#17663A]">Added</span>}{ch && <span className="rounded-full bg-[#FFF1D6] px-2 py-0.5 text-xs text-[#8A5A00]">Hidden</span>}</button>
                                {g.canReorder && <><button type="button" aria-label="Move card up" disabled={ci === 0} onClick={() => moveCard(g.key, allKeys, r.key, -1)} className="rounded p-1 hover:bg-[#EEF3EF] disabled:opacity-30"><ArrowUp size={14} /></button>
                                  <button type="button" aria-label="Move card down" disabled={ci === rows.length - 1} onClick={() => moveCard(g.key, allKeys, r.key, 1)} className="rounded p-1 hover:bg-[#EEF3EF] disabled:opacity-30"><ArrowDown size={14} /></button></>}
                                <button type="button" aria-label="Duplicate card" title="Duplicate" onClick={() => dupCard(g, r)} className="rounded p-1 hover:bg-[#EEF3EF]"><Copy size={14} /></button>
                                <button type="button" aria-label={ch ? 'Show card' : 'Hide card'} title={ch ? 'Show' : 'Hide'} onClick={() => set((x) => ({ ...x, hiddenCards: toggle(x.hiddenCards, r.key, !ch) }))} className="rounded p-1 hover:bg-[#EEF3EF]">{ch ? <Eye size={14} /> : <EyeOff size={14} />}</button>
                                <button type="button" aria-label="Delete card" title="Delete" onClick={() => (isNew ? setDelAdded({ g, a: r.a!, label: labelOf(r) }) : askDelete('card', r.key, labelOf(r)))} className="rounded p-1 text-[#B42318] hover:bg-[#FDECEA]"><Trash2 size={14} /></button>
                              </div>
                              {!isNew && co && r.c && <div className="border-t border-[#E3E8E1] p-3"><BlockEditor block={r.c.block} v={v} set={set} usage={scan.usage} idp={`c-${r.key}`} /></div>}
                            </div>
                          );
                        })}
                      </div>
                      <button type="button" onClick={() => setModal({ g })} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#124B3B] px-3 py-2 text-sm font-medium normal-case tracking-normal text-[#124B3B] hover:bg-[#EEF7F1]"><Plus size={15} />Add {word}</button>
                    </div>
                  );
                })}
                <div className="-mx-4 -mb-4 flex flex-wrap items-center gap-2 border-t border-[#E3E8E1] bg-[#FAFCFA] px-4 py-3">
                  <Btn disabled={!dirty} onClick={onSave}>Save changes</Btn>
                  <Btn variant="outline" onClick={onPreview}>Preview</Btn>
                  <Btn variant="outline" onClick={() => askRestore(s)}>Restore default</Btn>
                  <Btn variant="outline" onClick={() => set((x) => ({ ...x, hiddenSections: toggle(x.hiddenSections, k, !hidden) }))}>{hidden ? 'Show' : 'Hide'}</Btn>
                  <Btn variant="outline" className="ml-auto !border-[#F2C9C4] !text-[#B42318] hover:!bg-[#FDECEA]" onClick={() => askDelete('section', k, s.label)}>Delete</Btn>
                </div>
              </div>
            )}
          </Card>
          </div>
        );
      })}
      <div className="md:col-span-2"><button type="button" onClick={() => setSecModal({})} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#124B3B] px-4 py-3 text-sm font-semibold normal-case tracking-normal text-[#124B3B] hover:bg-[#EEF7F1]"><Plus size={16} />Add New Section</button></div>
      {(v.deletedSections?.length || v.deletedCards?.length) ? (
        <Card className="p-4">
          <h3 className="mb-2 text-sm font-semibold normal-case tracking-normal">Deleted from this page</h3>
          <ul className="grid gap-1.5 text-sm">
            {(v.deletedSections || []).map((k) => <li key={k} className="flex items-center justify-between"><span>Section: {byKey.get(k)?.label || k}</span><Btn variant="outline" className="!py-1" onClick={() => set((x) => ({ ...x, deletedSections: toggle(x.deletedSections, k, false), sectionOrder: [...(x.sectionOrder || []).filter((o) => o !== k), k] }))}><RotateCcw size={13} />Restore</Btn></li>)}
            {(v.deletedCards || []).map((k) => <li key={k} className="flex items-center justify-between"><span>Card: {k.split('~')[1] || k}</span><Btn variant="outline" className="!py-1" onClick={() => set((x) => ({ ...x, deletedCards: toggle(x.deletedCards, k, false) }))}><RotateCcw size={13} />Restore</Btn></li>)}
          </ul>
        </Card>
      ) : null}
      {modal && <AddCardModal key={modal.initial?.id || 'new'} group={modal.g} word={wordFor(scan.sections.find((sc) => sc.groups.some((gg) => gg.key === modal.g.key))?.label || '', modal.g)} initial={modal.initial} initialHidden={modal.hidden} initialPos={modal.pos}
        total={effectiveOrder(v, modal.g, v.addedCards?.[modal.g.key] || []).length} canReorder={modal.g.canReorder} onClose={() => setModal(null)}
        onSave={(card, hidden, pos) => { saveAdded(modal.g, card, hidden, pos, !!modal.initial); setModal(null); }} />}
      {secModal && <AddSectionModal key={secModal.initial?.id || 'new'} initial={secModal.initial} initialHidden={secModal.hidden} initialPos={secModal.pos} total={live.length}
        onClose={() => setSecModal(null)} onSave={(sec, hid, pos) => { saveSection(sec, hid, pos, !!secModal.initial); setSecModal(null); }} />}
      {delSec && <ConfirmDialog title="Delete this section?" text={`“${delSec.name || delSec.heading}” and its content will be removed from this page. Other sections are not affected.`} onCancel={() => setDelSec(null)} onConfirm={() => { removeSection(delSec); setDelSec(null); }} />}
      {delAdded && <ConfirmDialog title="Delete this item?" text={`“${delAdded.label}” will be removed from this section. Other items and the section itself are not affected.`} onCancel={() => setDelAdded(null)} onConfirm={() => { removeAdded(delAdded.g, delAdded.a); setDelAdded(null); }} />}
      <BlockCard title="Content outside sections" block={scan.page} v={v} set={set} usage={scan.usage} />
    </div>
  );
};

const BlockCard: React.FC<{ title: string; block: ScanBlock; v: LiveValues; set: Setter; usage: Record<string, number> }> = ({ title, block, v, set, usage }) => {
  const [o, setO] = useState(false);
  if (!block.texts.length && !block.images.length && !block.links.length) return null;
  return (<Card><button type="button" className="flex w-full items-center gap-2 px-4 py-3 text-left font-medium normal-case tracking-normal" onClick={() => setO(!o)}>{o ? <ChevronDown size={18} /> : <ChevronRight size={18} />}{title}</button>{o && <div className="border-t border-[#E3E8E1] p-4"><BlockEditor block={block} v={v} set={set} usage={usage} idp="page" /></div>}</Card>);
};

const BuiltInEditor: React.FC<{ page: CmsItem; saveSeo: (v: Record<string, unknown>) => void }> = ({ page, saveSeo }) => {
  const path = String(page.path);
  const name = livePageName(path);
  const { doc, saveDraft, publish } = useDoc(name);
  const toast = useToast();
  const { state, result, rescan } = useScan(path);
  const [v, setV] = useState<LiveValues>(() => ({ ...(Object.keys(doc.draft || {}).length ? doc.draft : doc.published) } as LiveValues));
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState<'content' | 'seo'>('content');
  const [del, setDel] = useState<{ what: 'section' | 'card'; key: string; label: string } | null>(null);
  const [reset, setReset] = useState(false);
  const [restore, setRestore] = useState<ScanSection | null>(null);
  const [seo, setSeo] = useState<Record<string, unknown>>({ seoTitle: page.seoTitle, seoDescription: page.seoDescription });
  const set: Setter = (fn) => { setV((x) => fn(x)); setDirty(true); };
  useEffect(() => { const h = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } }; window.addEventListener('beforeunload', h); return () => window.removeEventListener('beforeunload', h); }, [dirty]);

  const order = useMemo(() => (result ? computeOrder(result.sections.map((x) => x.key), v) : ([] as string[])), [result, v.sectionOrder, v.addedSections]); // eslint-disable-line react-hooks/exhaustive-deps

  const same = JSON.stringify(v) === JSON.stringify(doc.published || {});
  const status = !doc.publishedAt ? (Object.keys(v).length ? 'Draft' : 'Original (no edits)') : same ? 'Published' : 'Unpublished changes';
  const persist = (kind: 'draft' | 'publish') => {
    const clean = JSON.parse(JSON.stringify({ ...v, sectionOrder: v.sectionOrder?.length ? order : undefined }));
    try { if (kind === 'draft') saveDraft(clean); else publish(clean); setDirty(false); toast(kind === 'draft' ? 'Draft saved' : 'Published — the website now shows these changes'); logActivity(kind === 'draft' ? 'Saved draft' : 'Published', `Page: ${page.name}`); }
    catch (e) { toast(e instanceof Error ? e.message : 'Could not save.', 'err'); }
  };
  const note = NOTES[path];
  return (
    <div>
      <PageHeader title={String(page.name)} crumbs={['Pages', String(page.name)]} sub={`Public address: ${path}`}
        actions={<>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${status === 'Published' ? 'bg-[#E3F3E8] text-[#17663A]' : status.startsWith('Original') ? 'bg-[#EEF3EF] text-[#37534A]' : 'bg-[#FFF1D6] text-[#8A5A00]'}`}>{status}{dirty ? ' · unsaved' : ''}</span>
          <a href={path} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-[#C9D5CE] bg-white px-3.5 py-2 text-sm font-medium normal-case tracking-normal hover:bg-[#F2F6F3]"><ExternalLink size={15} />View live</a>
          <Btn variant="outline" onClick={() => { persist('draft'); window.open(`${path}?cms_preview=1`, '_blank'); }}><Eye size={15} />Preview</Btn>
          <Btn variant="outline" onClick={() => persist('draft')}>Save draft</Btn>
          <Btn onClick={() => persist('publish')}>Publish</Btn>
        </>} />
      <div className="mb-4 flex gap-2 border-b border-[#E3E8E1]">
        {(['content', 'seo'] as const).map((t) => <button key={t} type="button" onClick={() => setTab(t)} className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium normal-case tracking-normal ${tab === t ? 'border-[#124B3B] text-[#124B3B]' : 'border-transparent text-[#5E726B]'}`}>{t === 'content' ? 'Page content' : 'SEO'}</button>)}
        <div className="ml-auto flex items-center gap-2 pb-1"><Btn variant="ghost" className="!py-1" onClick={() => setReset(true)} disabled={!Object.keys(v).length}><RotateCcw size={14} />Reset page to original</Btn></div>
      </div>
      {tab === 'seo' ? (
        <Card className="p-5"><FormFields idPrefix="seo" fields={[{ key: 'seoTitle', label: 'SEO title', max: 70, hint: 'Leave blank to keep the page default.' }, { key: 'seoDescription', label: 'SEO description', type: 'textarea', max: 170 }]} values={seo} onChange={(k, val) => setSeo({ ...seo, [k]: val })} />
          <div className="mt-4 flex justify-end"><Btn onClick={() => { saveSeo(seo); toast('SEO saved'); }}>Save SEO</Btn></div></Card>
      ) : (
        <>
          {note && <p className="mb-4 rounded-lg border border-[#D5E0D1] bg-[#F1F7EC] px-4 py-2.5 text-sm text-[#2B4139]">{note.text} {note.links.map(([to, l]) => <Link key={to} to={to} className="ml-2 font-medium text-[#124B3B] underline">{l}</Link>)}</p>}
          <p className="mb-3 text-sm text-[#5E726B]">Showing the real content of the public page, section by section. Changes apply to the live page after you click Publish.</p>
          {state === 'loading' && <Card><p className="p-10 text-center text-sm text-[#5E726B]">Reading the page content…</p></Card>}
          {state === 'error' && <Card><EmptyState title="Could not read this page" text="The page did not finish loading in the background." action={<Btn onClick={rescan}>Try again</Btn>} /></Card>}
          {state === 'ready' && result && <SectionEditor scan={result} v={v} set={set} order={order} dirty={dirty} onSave={() => persist('draft')} onPreview={() => { persist('draft'); window.open(`${path}?cms_preview=1`, '_blank'); }} askRestore={setRestore} askDelete={(what, key, label) => setDel({ what, key, label })} />}
        </>
      )}
      {del && <ConfirmDialog title={`Delete ${del.what}?`} text={`“${del.label}” will be removed from the page once you publish. You can restore it from “Deleted from this page” until then and afterwards.`} onCancel={() => setDel(null)}
        onConfirm={() => { set((x) => del.what === 'section' ? { ...x, deletedSections: toggle(x.deletedSections, del.key, true) } : { ...x, deletedCards: toggle(x.deletedCards, del.key, true) }); setDel(null); }} />}
      {restore && <ConfirmDialog title="Restore default?" confirmLabel="Restore" text={`“${restore.label}” will go back to its original content (text, images, links, cards, visibility). Items you added to this section are removed. Other sections are not changed. Click Save changes afterwards to keep it.`} onCancel={() => setRestore(null)}
        onConfirm={() => { const sec = restore; set((x) => restoreSection(x, sec)); setRestore(null); toast('Section restored — click Save changes to keep it'); }} />}
      {reset && <ConfirmDialog title="Reset page to original?" confirmLabel="Reset" text="All edits to this page (draft and published) will be removed and the page returns to its built-in content." onCancel={() => setReset(false)}
        onConfirm={() => { try { publish({}); setV({}); setDirty(false); toast('Page reset to original'); logActivity('Reset', `Page: ${page.name}`); } catch { toast('Could not reset.', 'err'); } setReset(false); }} />}
    </div>
  );
};

const PageEditor: React.FC = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const pages = useCollection<CmsItem>('pages', PAGES_SEED);
  const custom = useCollection<CmsItem>('customPages', []);
  const page = pages.items.find((p) => p.id === id);
  const cp = custom.items.find((p) => p.id === id);
  if (cp) return <CustomPageEditor page={cp} onSaveMeta={(next: Partial<CmsItem>) => custom.save(custom.items.map((x) => (x.id === cp.id ? { ...x, ...next, updatedAt: new Date().toISOString() } : x)))} />;
  if (!page) return <Card><EmptyState title="Page not found" action={<Btn onClick={() => nav('/admin/pages')}>Back to pages</Btn>} /></Card>;
  return <BuiltInEditor key={page.id} page={page} saveSeo={(v) => pages.save(pages.items.map((x) => (x.id === page.id ? { ...x, ...v, updatedAt: new Date().toISOString() } : x)))} />;
};
export default PageEditor;
export { resolveMedia };
