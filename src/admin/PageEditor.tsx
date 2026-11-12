import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, ExternalLink, Eye, EyeOff, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { PAGES_SEED } from '../data/siteContent';
import { LiveValues, ScanBlock, ScanResult, livePageName } from '../cms/types';
import { CmsItem, logActivity, resolveMedia, useCollection, useDoc } from './store';
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
    <div className="grid gap-4">
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
const toggle = (arr: string[] | undefined, k: string, on: boolean) => { const s = new Set(arr || []); if (on) s.add(k); else s.delete(k); return Array.from(s); };

const SectionEditor: React.FC<{ scan: ScanResult; v: LiveValues; set: Setter; order: string[]; askDelete: (what: 'section' | 'card', key: string, label: string) => void }> = ({ scan, v, set, order, askDelete }) => {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const byKey = new Map(scan.sections.map((s) => [s.key, s]));
  const live = order.filter((k) => !(v.deletedSections || []).includes(k));
  const move = (k: string, d: -1 | 1) => set((x) => { const o = [...live]; const i = o.indexOf(k), j = i + d; if (j < 0 || j >= o.length) return x; [o[i], o[j]] = [o[j], o[i]]; return { ...x, sectionOrder: [...o, ...(x.deletedSections || [])] }; });
  const moveCard = (gk: string, keys: string[], k: string, d: -1 | 1) => set((x) => { const cur = (x.cardOrder?.[gk] || keys).filter((c) => keys.includes(c)); const full = [...cur, ...keys.filter((c) => !cur.includes(c))]; const i = full.indexOf(k), j = i + d; if (j < 0 || j >= full.length) return x; [full[i], full[j]] = [full[j], full[i]]; return { ...x, cardOrder: { ...(x.cardOrder || {}), [gk]: full } }; });
  return (
    <div className="grid gap-3">
      {live.map((k, idx) => {
        const s = byKey.get(k); if (!s) return null;
        const hidden = (v.hiddenSections || []).includes(k);
        const isOpen = !!open[k];
        return (
          <Card key={k} className={hidden ? 'opacity-70' : ''}>
            <div className="flex flex-wrap items-center gap-2 px-4 py-3">
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
              <div className="grid gap-5 border-t border-[#E3E8E1] p-4">
                <BlockEditor block={s.general} v={v} set={set} usage={scan.usage} idp={`s-${k}`} />
                {s.groups.map((g) => {
                  const keys = g.cards.map((c) => c.key);
                  const ord = (v.cardOrder?.[g.key] || keys).filter((c) => keys.includes(c));
                  const full = [...ord, ...keys.filter((c) => !ord.includes(c))];
                  const cards = full.map((ck) => g.cards.find((c) => c.key === ck)!).filter((c) => c && !(v.deletedCards || []).includes(c.key));
                  return (
                    <div key={g.key}>
                      <h3 className="mb-2 text-sm font-semibold normal-case tracking-normal text-[#2B4139]">Cards / items ({cards.length})</h3>
                      {!g.canReorder && <p className="mb-2 text-xs text-[#6B7F78]">These items are not laid out in a grid, so reordering is unavailable here; hide, delete and edit work.</p>}
                      <div className="grid gap-2">
                        {cards.map((c, ci) => {
                          const ch = (v.hiddenCards || []).includes(c.key); const co = !!open[c.key];
                          return (
                            <div key={c.key} className={`rounded-lg border border-[#E3E8E1] ${ch ? 'opacity-70' : ''}`}>
                              <div className="flex items-center gap-2 px-3 py-2">
                                <button type="button" onClick={() => setOpen({ ...open, [c.key]: !co })} className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm" aria-expanded={co}>{co ? <ChevronDown size={15} /> : <ChevronRight size={15} />}<span className="truncate">{c.label}</span>{ch && <span className="rounded-full bg-[#FFF1D6] px-2 py-0.5 text-xs text-[#8A5A00]">Hidden</span>}</button>
                                {g.canReorder && <><button type="button" aria-label="Move card up" disabled={ci === 0} onClick={() => moveCard(g.key, keys, c.key, -1)} className="rounded p-1 hover:bg-[#EEF3EF] disabled:opacity-30"><ArrowUp size={14} /></button>
                                  <button type="button" aria-label="Move card down" disabled={ci === cards.length - 1} onClick={() => moveCard(g.key, keys, c.key, 1)} className="rounded p-1 hover:bg-[#EEF3EF] disabled:opacity-30"><ArrowDown size={14} /></button></>}
                                <button type="button" aria-label={ch ? 'Show card' : 'Hide card'} onClick={() => set((x) => ({ ...x, hiddenCards: toggle(x.hiddenCards, c.key, !ch) }))} className="rounded p-1 hover:bg-[#EEF3EF]">{ch ? <Eye size={14} /> : <EyeOff size={14} />}</button>
                                <button type="button" aria-label="Delete card" onClick={() => askDelete('card', c.key, c.label)} className="rounded p-1 text-[#B42318] hover:bg-[#FDECEA]"><Trash2 size={14} /></button>
                              </div>
                              {co && <div className="border-t border-[#E3E8E1] p-3"><BlockEditor block={c.block} v={v} set={set} usage={scan.usage} idp={`c-${c.key}`} /></div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}
      {(v.deletedSections?.length || v.deletedCards?.length) ? (
        <Card className="p-4">
          <h3 className="mb-2 text-sm font-semibold normal-case tracking-normal">Deleted from this page</h3>
          <ul className="grid gap-1.5 text-sm">
            {(v.deletedSections || []).map((k) => <li key={k} className="flex items-center justify-between"><span>Section: {byKey.get(k)?.label || k}</span><Btn variant="outline" className="!py-1" onClick={() => set((x) => ({ ...x, deletedSections: toggle(x.deletedSections, k, false), sectionOrder: [...(x.sectionOrder || []).filter((o) => o !== k), k] }))}><RotateCcw size={13} />Restore</Btn></li>)}
            {(v.deletedCards || []).map((k) => <li key={k} className="flex items-center justify-between"><span>Card: {k.split('~')[1] || k}</span><Btn variant="outline" className="!py-1" onClick={() => set((x) => ({ ...x, deletedCards: toggle(x.deletedCards, k, false) }))}><RotateCcw size={13} />Restore</Btn></li>)}
          </ul>
        </Card>
      ) : null}
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
  const [seo, setSeo] = useState<Record<string, unknown>>({ seoTitle: page.seoTitle, seoDescription: page.seoDescription });
  const set: Setter = (fn) => { setV((x) => fn(x)); setDirty(true); };
  useEffect(() => { const h = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } }; window.addEventListener('beforeunload', h); return () => window.removeEventListener('beforeunload', h); }, [dirty]);

  const order = useMemo(() => {
    if (!result) return [] as string[];
    const keys = result.sections.map((s) => s.key);
    const o = (v.sectionOrder || []).filter((k) => keys.includes(k));
    return [...o, ...keys.filter((k) => !o.includes(k))];
  }, [result, v.sectionOrder]);

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
          {state === 'ready' && result && (result.sections.length || result.page.texts.length ? <SectionEditor scan={result} v={v} set={set} order={order} askDelete={(what, key, label) => setDel({ what, key, label })} /> : <Card><EmptyState title="No editable content found" text="This page has no text, images or links inside its main content." /></Card>)}
        </>
      )}
      {del && <ConfirmDialog title={`Delete ${del.what}?`} text={`“${del.label}” will be removed from the page once you publish. You can restore it from “Deleted from this page” until then and afterwards.`} onCancel={() => setDel(null)}
        onConfirm={() => { set((x) => del.what === 'section' ? { ...x, deletedSections: toggle(x.deletedSections, del.key, true) } : { ...x, deletedCards: toggle(x.deletedCards, del.key, true) }); setDel(null); }} />}
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
