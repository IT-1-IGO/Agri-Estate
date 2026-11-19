import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import { CmsItem, logActivity, uid, useDoc } from './store';
import { CustomCard, CustomSection, SECTION_LABELS, SectionType, customDocName } from '../cms/custom';
import { Btn, Card, ConfirmDialog, EmptyState, Field, ImageField, Modal, PageHeader, inputCls, useToast } from './ui';

const blank = (type: SectionType): CustomSection => ({ id: uid(), type, heading: '', cards: type === 'cards' ? [] : undefined });
const FIELDS: Record<SectionType, string[]> = { hero: ['heading', 'subheading', 'image', 'buttonLabel', 'buttonLink'], text: ['heading', 'body'], imageText: ['heading', 'body', 'image', 'buttonLabel', 'buttonLink'], cards: ['heading', 'subheading'], cta: ['heading', 'body', 'buttonLabel', 'buttonLink'] };
const LABEL: Record<string, string> = { heading: 'Heading', subheading: 'Subheading', body: 'Paragraph', image: 'Image', buttonLabel: 'Button text', buttonLink: 'Button link' };

const CustomPageEditor: React.FC<{ page: CmsItem; onSaveMeta: (v: Partial<CmsItem>) => void }> = ({ page, onSaveMeta }) => {
  const name = customDocName(page.id);
  const { doc, saveDraft, publish } = useDoc(name);
  const toast = useToast();
  const initial = ((Object.keys(doc.draft || {}).length ? doc.draft : doc.published) as { sections?: CustomSection[] }).sections || [];
  const [sections, setSections] = useState<CustomSection[]>(initial);
  const [dirty, setDirty] = useState(false);
  const [edit, setEdit] = useState<CustomSection | null>(null);
  const [err, setErr] = useState('');
  const [del, setDel] = useState<CustomSection | null>(null);
  const [adding, setAdding] = useState(false);
  const [meta, setMeta] = useState({ name: String(page.name), seoTitle: String(page.seoTitle || ''), seoDescription: String(page.seoDescription || '') });
  useEffect(() => { const h = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } }; window.addEventListener('beforeunload', h); return () => window.removeEventListener('beforeunload', h); }, [dirty]);
  const upd = (next: CustomSection[]) => { setSections(next); setDirty(true); };
  const move = (i: number, d: -1 | 1) => { const n = [...sections]; const j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; upd(n); };
  const save = (kind: 'draft' | 'publish') => {
    const m = meta.name.trim(); if (!m) { toast('Page title is required.', 'err'); return; }
    try {
      if (kind === 'draft') saveDraft({ sections }); else publish({ sections });
      onSaveMeta({ name: m, seoTitle: meta.seoTitle, seoDescription: meta.seoDescription, ...(kind === 'publish' ? { status: 'published' } : {}) });
      setDirty(false); toast(kind === 'draft' ? 'Draft saved' : 'Published'); logActivity(kind === 'draft' ? 'Saved draft' : 'Published', `Page: ${m}`);
    } catch (e) { toast(e instanceof Error ? e.message : 'Could not save.', 'err'); }
  };
  const commit = () => {
    if (!edit) return;
    if (!edit.heading.trim()) { setErr('Heading is required.'); return; }
    const exists = sections.some((s) => s.id === edit.id);
    upd(exists ? sections.map((s) => (s.id === edit.id ? edit : s)) : [...sections, edit]); setEdit(null); setErr('');
  };
  const setF = (k: string, v: unknown) => edit && setEdit({ ...edit, [k]: v });
  const cards = edit?.cards || [];
  const setCard = (id: string, k: keyof CustomCard, v: string) => setF('cards', cards.map((c) => (c.id === id ? { ...c, [k]: v } : c)));
  return (
    <div>
      <PageHeader title={meta.name || 'Untitled page'} crumbs={['Pages', String(page.name)]} sub={`Public address: /p/${page.slug}`}
        actions={<>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${page.status === 'published' ? 'bg-[#E3F3E8] text-[#17663A]' : 'bg-[#FFF1D6] text-[#8A5A00]'}`}>{page.status === 'published' ? 'Published' : 'Draft'}{dirty ? ' · unsaved' : ''}</span>
          <Btn variant="outline" onClick={() => { save('draft'); window.open(`/p/${page.slug}?cms_preview=1`, '_blank'); }}><ExternalLink size={15} />Preview</Btn>
          <Btn variant="outline" onClick={() => save('draft')}>Save draft</Btn>
          <Btn onClick={() => save('publish')}>Publish</Btn>
        </>} />
      <Card className="mb-5 p-5"><div className="grid gap-4 sm:grid-cols-2">
        <Field label="Page title" htmlFor="cp-title"><input id="cp-title" className={inputCls} value={meta.name} onChange={(e) => { setMeta({ ...meta, name: e.target.value }); setDirty(true); }} /></Field>
        <Field label="SEO title" htmlFor="cp-seo"><input id="cp-seo" className={inputCls} value={meta.seoTitle} onChange={(e) => { setMeta({ ...meta, seoTitle: e.target.value }); setDirty(true); }} /></Field>
        <div className="sm:col-span-2"><Field label="SEO description" htmlFor="cp-seod"><textarea id="cp-seod" rows={2} className={inputCls} value={meta.seoDescription} onChange={(e) => { setMeta({ ...meta, seoDescription: e.target.value }); setDirty(true); }} /></Field></div>
      </div></Card>
      <div className="mb-3 flex items-center justify-between"><h2 className="text-base font-semibold normal-case tracking-normal">Sections</h2><Btn onClick={() => setAdding(true)}><Plus size={16} />Add New Section</Btn></div>
      {sections.length === 0 ? <Card><EmptyState title="No sections yet" text="Add a hero, text block, cards or call to action." /></Card> : (
        <div className="grid gap-3">{sections.map((s, i) => (
          <Card key={s.id} className={`flex flex-wrap items-center gap-2 px-4 py-3 ${s.hidden ? 'opacity-70' : ''}`}>
            <div className="min-w-0 flex-1"><p className="text-xs text-[#6B7F78]">{SECTION_LABELS[s.type]}{s.hidden ? ' · Hidden' : ''}</p><p className="truncate font-medium normal-case tracking-normal">{s.heading}</p></div>
            <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="rounded p-1.5 hover:bg-[#EEF3EF] disabled:opacity-30"><ArrowUp size={15} /></button>
            <button type="button" aria-label="Move down" disabled={i === sections.length - 1} onClick={() => move(i, 1)} className="rounded p-1.5 hover:bg-[#EEF3EF] disabled:opacity-30"><ArrowDown size={15} /></button>
            <button type="button" aria-label={s.hidden ? 'Show section' : 'Hide section'} onClick={() => upd(sections.map((x) => (x.id === s.id ? { ...x, hidden: !x.hidden } : x)))} className="rounded p-1.5 hover:bg-[#EEF3EF]">{s.hidden ? <Eye size={15} /> : <EyeOff size={15} />}</button>
            <button type="button" aria-label="Edit section" onClick={() => { setErr(''); setEdit({ ...s }); }} className="rounded p-1.5 text-[#124B3B] hover:bg-[#EEF3EF]"><Pencil size={15} /></button>
            <button type="button" aria-label="Delete section" onClick={() => setDel(s)} className="rounded p-1.5 text-[#B42318] hover:bg-[#FDECEA]"><Trash2 size={15} /></button>
          </Card>))}</div>)}
      {adding && <Modal title="Add section" onClose={() => setAdding(false)}><div className="grid gap-2">{(Object.keys(SECTION_LABELS) as SectionType[]).map((t) => <button key={t} type="button" onClick={() => { setAdding(false); setErr(''); setEdit(blank(t)); }} className="rounded-lg border border-[#E3E8E1] px-4 py-3 text-left text-sm font-medium hover:border-[#124B3B]">{SECTION_LABELS[t]}</button>)}</div></Modal>}
      {edit && (
        <Modal wide title={`${sections.some((s) => s.id === edit.id) ? 'Edit' : 'Add'} ${SECTION_LABELS[edit.type].toLowerCase()}`} onClose={() => setEdit(null)} footer={<><Btn variant="outline" onClick={() => setEdit(null)}>Cancel</Btn><Btn onClick={commit}>Done</Btn></>}>
          <div className="grid gap-4">
            {FIELDS[edit.type].map((f) => f === 'image' ? <div key={f}><ImageField value={edit.image || ''} onChange={(v) => setF('image', v)} /><div className="mt-2"><Field label="Image description (alt text)"><input className={inputCls} value={edit.alt || ''} onChange={(e) => setF('alt', e.target.value)} /></Field></div></div>
              : <Field key={f} label={LABEL[f]} error={f === 'heading' ? err : ''}>{f === 'body' || f === 'subheading' ? <textarea rows={4} className={inputCls} value={String((edit as unknown as Record<string, string>)[f] || '')} onChange={(e) => setF(f, e.target.value)} /> : <input className={inputCls} value={String((edit as unknown as Record<string, string>)[f] || '')} onChange={(e) => setF(f, e.target.value)} />}</Field>)}
            {edit.type === 'cards' && (
              <div><div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-semibold normal-case tracking-normal">Cards ({cards.length})</h3><Btn variant="outline" className="!py-1" onClick={() => setF('cards', [...cards, { id: uid(), title: '', text: '', image: '', alt: '' }])}><Plus size={14} />Add card</Btn></div>
                <div className="grid gap-3">{cards.map((c, i) => (
                  <div key={c.id} className="rounded-lg border border-[#E3E8E1] p-3"><div className="mb-2 flex justify-end gap-1">
                    <button type="button" aria-label="Move card up" disabled={i === 0} onClick={() => { const n = [...cards]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; setF('cards', n); }} className="rounded p-1 hover:bg-[#EEF3EF] disabled:opacity-30"><ArrowUp size={14} /></button>
                    <button type="button" aria-label="Move card down" disabled={i === cards.length - 1} onClick={() => { const n = [...cards]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; setF('cards', n); }} className="rounded p-1 hover:bg-[#EEF3EF] disabled:opacity-30"><ArrowDown size={14} /></button>
                    <button type="button" aria-label="Delete card" onClick={() => setF('cards', cards.filter((x) => x.id !== c.id))} className="rounded p-1 text-[#B42318] hover:bg-[#FDECEA]"><Trash2 size={14} /></button></div>
                    <div className="grid gap-3"><Field label="Card title"><input className={inputCls} value={c.title} onChange={(e) => setCard(c.id, 'title', e.target.value)} /></Field>
                      <Field label="Card text"><textarea rows={2} className={inputCls} value={c.text} onChange={(e) => setCard(c.id, 'text', e.target.value)} /></Field>
                      <ImageField value={c.image} onChange={(v) => setCard(c.id, 'image', v)} /><Field label="Image description"><input className={inputCls} value={c.alt} onChange={(e) => setCard(c.id, 'alt', e.target.value)} /></Field></div></div>))}</div></div>)}
          </div>
        </Modal>)}
      {del && <ConfirmDialog title="Delete section?" text={`“${del.heading}” will be removed from this page once you save.`} onCancel={() => setDel(null)} onConfirm={() => { upd(sections.filter((x) => x.id !== del.id)); setDel(null); }} />}
    </div>
  );
};
export default CustomPageEditor;
