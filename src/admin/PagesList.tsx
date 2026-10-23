import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ExternalLink, Pencil, Plus, RotateCcw, Search, Send, Trash2 } from 'lucide-react';
import { PAGES_SEED } from '../data/siteContent';
import { livePageName } from '../cms/types';
import { customDocName } from '../cms/custom';
import { CmsItem, getDoc, logActivity, readJson, subscribeCms, uid, useCollection, writeJson } from './store';
import { Btn, Card, ConfirmDialog, EmptyState, Field, Modal, PageHeader, Pager, inputCls, useToast } from './ui';

const SIZE = 10;
const fmt = (d?: string) => (d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—');
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const PagesList: React.FC = () => {
  const nav = useNavigate(); const toast = useToast();
  const built = useCollection<CmsItem>('pages', PAGES_SEED);
  const custom = useCollection<CmsItem>('customPages', []);
  const [, tick] = useState(0);
  useEffect(() => subscribeCms(() => tick((n) => n + 1)), []);
  const [q, setQ] = useState(''); const [st, setSt] = useState('all'); const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false); const [nt, setNt] = useState(''); const [ns, setNs] = useState(''); const [err, setErr] = useState('');
  const [del, setDel] = useState<CmsItem | null>(null); const [discard, setDiscard] = useState<CmsItem | null>(null);

  const rows = useMemo(() => {
    const all = [...built.items.map((p) => ({ p, custom: false })), ...custom.items.map((p) => ({ p, custom: true }))].map(({ p, custom: c }) => {
      const d = getDoc(c ? customDocName(p.id) : livePageName(String(p.path)));
      const hasDraft = Object.keys(d.draft || {}).length > 0;
      const changed = JSON.stringify(d.draft || {}) !== JSON.stringify(d.published || {});
      const status = c ? (p.status === 'published' ? (changed ? 'Unpublished changes' : 'Published') : 'Draft')
        : !d.publishedAt ? (hasDraft ? 'Draft changes' : 'Live (original)') : changed ? 'Unpublished changes' : 'Published';
      return { p, c, status, changed, updated: d.updatedAt || (p.updatedAt as string | undefined) };
    });
    const s = q.trim().toLowerCase();
    return all.filter((r) => (!s || `${r.p.name} ${r.p.path}`.toLowerCase().includes(s)) && (st === 'all' || r.status === st));
  }, [built.items, custom.items, q, st]);
  const pages = Math.max(1, Math.ceil(rows.length / SIZE)); const cur = Math.min(page, pages);

  const publishDraft = (p: CmsItem, c: boolean) => {
    const name = c ? customDocName(p.id) : livePageName(String(p.path));
    const d = getDoc(name);
    try {
      const vals = Object.keys(d.draft || {}).length ? d.draft : d.published;
      writeJson('doc.' + name, { draft: vals, published: vals, updatedAt: new Date().toISOString(), publishedAt: new Date().toISOString() });
      if (c) custom.save(custom.items.map((x) => (x.id === p.id ? { ...x, status: 'published' } : x)));
      logActivity('Published', `Page: ${p.name}`); toast('Published');
    } catch (e) { toast(e instanceof Error ? e.message : 'Could not publish.', 'err'); }
  };
  const create = () => {
    const title = nt.trim(); const slug = slugify(ns || nt);
    if (!title) { setErr('Page title is required.'); return; }
    if (!slug) { setErr('Enter a valid address.'); return; }
    if (custom.items.some((x) => x.slug === slug) || built.items.some((x) => String(x.path) === '/' + slug)) { setErr('A page with this address already exists.'); return; }
    const item: CmsItem = { id: uid(), name: title, slug, path: `/p/${slug}`, status: 'draft', seoTitle: '', seoDescription: '', updatedAt: new Date().toISOString(), order: custom.items.length };
    custom.save([...custom.items, item]); logActivity('Created', `Page: ${title}`); setAdding(false); nav(`/admin/pages/${item.id}`);
  };
  const remove = () => {
    if (!del) return;
    custom.save(custom.items.filter((x) => x.id !== del.id));
    try { localStorage.removeItem('igo.cms.doc.' + customDocName(del.id)); } catch { /* ignore */ }
    logActivity('Deleted', `Page: ${del.name}`); toast('Page deleted'); setDel(null);
  };
  void readJson;
  return (
    <div>
      <PageHeader title="Pages" crumbs={['Pages']} sub="Every page of the website. Open a page to edit its sections, text, images, links and cards."
        actions={<Btn onClick={() => { setNt(''); setNs(''); setErr(''); setAdding(true); }}><Plus size={16} />Add new page</Btn>} />
      <Card>
        <div className="flex flex-wrap gap-3 border-b border-[#E3E8E1] p-4">
          <div className="relative min-w-[200px] flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#93A39D]" /><input aria-label="Search pages" className={`${inputCls} pl-9`} placeholder="Search pages…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></div>
          <select aria-label="Filter by status" className={`${inputCls} !w-auto`} value={st} onChange={(e) => { setSt(e.target.value); setPage(1); }}><option value="all">All statuses</option>{['Published', 'Unpublished changes', 'Draft changes', 'Draft', 'Live (original)'].map((s) => <option key={s}>{s}</option>)}</select>
        </div>
        {rows.length === 0 ? <EmptyState title="No pages found" /> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[#F5F8F5] text-xs uppercase tracking-wide text-[#5E726B]"><tr><th className="px-4 py-2.5">Page title</th><th className="px-4 py-2.5">URL slug</th><th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5">Last updated</th><th className="px-4 py-2.5 text-right">Actions</th></tr></thead>
            <tbody>{rows.slice((cur - 1) * SIZE, cur * SIZE).map(({ p, c, status, changed, updated }) => (
              <tr key={p.id} className="border-t border-[#EEF2EE] hover:bg-[#FAFCFA]">
                <td className="px-4 py-3 font-medium">{String(p.name)}{c && <span className="ml-2 rounded bg-[#EEF3EF] px-1.5 py-0.5 text-xs font-normal">Custom</span>}</td>
                <td className="px-4 py-3 text-[#5E726B]">{String(p.path)}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status === 'Published' ? 'bg-[#E3F3E8] text-[#17663A]' : status === 'Live (original)' ? 'bg-[#EEF3EF] text-[#37534A]' : 'bg-[#FFF1D6] text-[#8A5A00]'}`}>{status}</span></td>
                <td className="whitespace-nowrap px-4 py-3 text-[#5E726B]">{fmt(updated)}</td>
                <td className="px-4 py-3"><div className="flex justify-end gap-0.5">
                  <button type="button" aria-label="Edit" title="Edit" onClick={() => nav(`/admin/pages/${p.id}`)} className="rounded p-1.5 text-[#124B3B] hover:bg-[#EEF3EF]"><Pencil size={15} /></button>
                  <a href={`${p.path}?cms_preview=1`} target="_blank" rel="noreferrer" aria-label="Preview draft" title="Preview draft" className="rounded p-1.5 text-[#5E726B] hover:bg-[#EEF3EF]"><Eye size={15} /></a>
                  <a href={String(p.path)} target="_blank" rel="noreferrer" aria-label="View live page" title="View live page" className="rounded p-1.5 text-[#5E726B] hover:bg-[#EEF3EF]"><ExternalLink size={15} /></a>
                  <button type="button" aria-label="Publish" title="Publish" disabled={!changed && (!c || p.status === 'published')} onClick={() => publishDraft(p, c)} className="rounded p-1.5 text-[#5E726B] hover:bg-[#EEF3EF] disabled:opacity-30"><Send size={15} /></button>
                  <button type="button" aria-label="Discard draft" title="Discard draft changes" disabled={!changed} onClick={() => setDiscard(p)} className="rounded p-1.5 text-[#5E726B] hover:bg-[#EEF3EF] disabled:opacity-30"><RotateCcw size={15} /></button>
                  {c && <button type="button" aria-label="Delete" title="Delete page" onClick={() => setDel(p)} className="rounded p-1.5 text-[#B42318] hover:bg-[#FDECEA]"><Trash2 size={15} /></button>}
                </div></td></tr>))}</tbody></table></div>)}
        <Pager page={cur} pages={pages} total={rows.length} onPage={setPage} />
      </Card>
      {adding && <Modal title="Add new page" onClose={() => setAdding(false)} footer={<><Btn variant="outline" onClick={() => setAdding(false)}>Cancel</Btn><Btn onClick={create}>Create page</Btn></>}>
        <div className="grid gap-4"><Field label="Page title *" htmlFor="np-t" error={err}><input id="np-t" className={inputCls} value={nt} onChange={(e) => { setNt(e.target.value); setErr(''); }} autoFocus /></Field>
          <Field label="URL address" htmlFor="np-s" hint={`Will be available at /p/${slugify(ns || nt) || 'your-page'}`}><input id="np-s" className={inputCls} value={ns} onChange={(e) => { setNs(e.target.value); setErr(''); }} placeholder="auto from title" /></Field>
          <p className="text-xs text-[#6B7F78]">New pages are created as drafts and appear on the website only after you publish them. Add them to the menu in Navigation &amp; Footer.</p></div></Modal>}
      {del && <ConfirmDialog title="Delete page?" text={`“${del.name}” and all its sections will be permanently removed.`} onConfirm={remove} onCancel={() => setDel(null)} />}
      {discard && <ConfirmDialog title="Discard draft changes?" confirmLabel="Discard" text={`Unpublished edits to “${discard.name}” will be replaced with the published version.`} onCancel={() => setDiscard(null)}
        onConfirm={() => { const c = custom.items.some((x) => x.id === discard.id); const name = c ? customDocName(discard.id) : livePageName(String(discard.path)); const d = getDoc(name); writeJson('doc.' + name, { ...d, draft: { ...d.published } }); toast('Draft discarded'); setDiscard(null); }} />}
    </div>
  );
};
export default PagesList;
