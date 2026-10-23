import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, ToggleLeft, ToggleRight, ExternalLink, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { CmsItem, logActivity, resolveMedia, uid, useCollection } from './store';
import { Btn, Card, ConfirmDialog, EmptyState, Modal, PageHeader, Pager, StatusBadge, inputCls, useToast } from './ui';
import { FieldDef, FormFields, Values, cleanValues, validate } from './forms';

export interface ColumnDef { key: string; label: string; image?: boolean; width?: string }
interface Props {
  name: string;           // collection name
  title: string;
  singular: string;
  crumbs?: string[];
  sub?: string;
  seed: CmsItem[];
  fields: FieldDef[];
  columns: ColumnDef[];
  filterKey?: string;     // optional select-field to filter by (e.g. category)
  previewPath?: string;   // public page that shows this content
  noStatus?: boolean;
  pageSize?: number;
  defaults?: Values;
}

const PAGE = 8;

const CollectionManager: React.FC<Props> = ({ name, title, singular, crumbs, sub, seed, fields, columns, filterKey, previewPath, noStatus, pageSize = PAGE, defaults = {} }) => {
  const { items, save } = useCollection<CmsItem>(name, seed);
  const toast = useToast();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [cat, setCat] = useState('all');
  const [page, setPage] = useState(1);
  const [edit, setEdit] = useState<{ id: string | null; values: Values } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [del, setDel] = useState<CmsItem | null>(null);
  const [view, setView] = useState<CmsItem | null>(null);

  const catField = fields.find((f) => f.key === filterKey);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter((i) => {
      if (status !== 'all' && (i.status ?? 'published') !== status) return false;
      if (filterKey && cat !== 'all' && String(i[filterKey] ?? '') !== cat) return false;
      if (!s) return true;
      return fields.some((f) => String(Array.isArray(i[f.key]) ? (i[f.key] as string[]).join(' ') : i[f.key] ?? '').toLowerCase().includes(s));
    });
  }, [items, q, status, cat, filterKey, fields]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const cur = Math.min(page, pages);
  const rows = filtered.slice((cur - 1) * pageSize, cur * pageSize);

  const persist = (next: CmsItem[], msg: string, action?: string, target?: string) => {
    try {
      save(next.map((x, idx) => ({ ...x, order: idx })));
      toast(msg);
      if (action) logActivity(action, target || title);
    } catch (e) { toast(e instanceof Error ? e.message : 'Could not save.', 'err'); }
  };

  const openNew = () => { setErrors({}); setEdit({ id: null, values: { status: 'published', ...defaults } }); };
  const openEdit = (i: CmsItem) => { setErrors({}); setEdit({ id: i.id, values: { ...i } }); };

  const submit = (publishState?: 'draft' | 'published') => {
    if (!edit) return;
    const e = validate(fields, edit.values);
    setErrors(e);
    if (Object.keys(e).length) return;
    const clean = cleanValues(fields, edit.values);
    const st = noStatus ? undefined : (publishState || (edit.values.status as 'draft' | 'published') || 'published');
    const now = new Date().toISOString();
    if (edit.id) {
      persist(items.map((i) => (i.id === edit.id ? { ...i, ...clean, status: st, updatedAt: now } : i)), `${singular} updated`, 'Updated', `${title}: ${String(clean[fields[0].key] ?? '')}`);
    } else {
      persist([...items, { ...clean, id: uid(), status: st, updatedAt: now, order: items.length } as CmsItem], `${singular} added`, 'Created', `${title}: ${String(clean[fields[0].key] ?? '')}`);
    }
    setEdit(null);
  };

  const move = (i: CmsItem, dir: -1 | 1) => {
    const idx = items.findIndex((x) => x.id === i.id), j = idx + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items]; [next[idx], next[j]] = [next[j], next[idx]];
    persist(next, 'Order updated');
  };
  const toggle = (i: CmsItem) => {
    const st = (i.status ?? 'published') === 'published' ? 'draft' : 'published';
    persist(items.map((x) => (x.id === i.id ? { ...x, status: st, updatedAt: new Date().toISOString() } : x)), st === 'published' ? 'Published' : 'Moved to draft', st === 'published' ? 'Published' : 'Unpublished', `${title}: ${String(i[fields[0].key] ?? '')}`);
  };
  const remove = () => {
    if (!del) return;
    persist(items.filter((x) => x.id !== del.id), `${singular} deleted`, 'Deleted', `${title}: ${String(del[fields[0].key] ?? '')}`);
    setDel(null);
  };

  const cell = (i: CmsItem, c: ColumnDef) => {
    const v = i[c.key];
    if (c.image) {
      const s = resolveMedia(v);
      return s ? <img src={s} alt="" className="h-10 w-14 rounded object-cover" /> : <span className="text-[#93A39D]">—</span>;
    }
    const t = Array.isArray(v) ? v.join(', ') : String(v ?? '');
    return <span className="line-clamp-2">{t || <span className="text-[#93A39D]">—</span>}</span>;
  };

  return (
    <div>
      <PageHeader title={title} crumbs={crumbs} sub={sub}
        actions={<>
          {previewPath && <a href={previewPath} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-[#C9D5CE] bg-white px-3.5 py-2 text-sm font-medium normal-case tracking-normal text-[#10231D] hover:bg-[#F2F6F3]"><ExternalLink size={15} />Preview</a>}
          <Btn onClick={openNew}><Plus size={16} />Add {singular}</Btn>
        </>} />
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-[#E3E8E1] p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#93A39D]" aria-hidden="true" />
            <input aria-label={`Search ${title}`} className={`${inputCls} pl-9`} placeholder={`Search ${title.toLowerCase()}…`} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          </div>
          {!noStatus && (
            <select aria-label="Filter by status" className={`${inputCls} !w-auto`} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="all">All statuses</option><option value="published">Published</option><option value="draft">Draft</option>
            </select>
          )}
          {catField?.options && (
            <select aria-label={`Filter by ${catField.label}`} className={`${inputCls} !w-auto max-w-[220px]`} value={cat} onChange={(e) => { setCat(e.target.value); setPage(1); }}>
              <option value="all">All {catField.label.toLowerCase()}</option>
              {catField.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          )}
        </div>
        {rows.length === 0 ? (
          <EmptyState title={items.length ? 'No matching items' : `No ${title.toLowerCase()} yet`} text={items.length ? 'Try a different search or filter.' : `Add your first ${singular.toLowerCase()}.`} action={!items.length && <Btn onClick={openNew}><Plus size={16} />Add {singular}</Btn>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-[#F5F8F5] text-xs uppercase tracking-wide text-[#5E726B]">
                <tr>
                  {columns.map((c) => <th key={c.key} className="px-4 py-2.5 font-medium">{c.label}</th>)}
                  {!noStatus && <th className="px-4 py-2.5 font-medium">Status</th>}
                  <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((i) => (
                  <tr key={i.id} className="border-t border-[#EEF2EE] align-middle hover:bg-[#FAFCFA]">
                    {columns.map((c) => <td key={c.key} className="px-4 py-3" style={{ maxWidth: c.width || 280 }}>{cell(i, c)}</td>)}
                    {!noStatus && <td className="px-4 py-3"><StatusBadge status={i.status} /></td>}
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-0.5">
                        <button type="button" title="Move up" aria-label="Move up" onClick={() => move(i, -1)} className="rounded p-1.5 text-[#5E726B] hover:bg-[#EEF3EF]"><ArrowUp size={15} /></button>
                        <button type="button" title="Move down" aria-label="Move down" onClick={() => move(i, 1)} className="rounded p-1.5 text-[#5E726B] hover:bg-[#EEF3EF]"><ArrowDown size={15} /></button>
                        {!noStatus && <button type="button" title={(i.status ?? 'published') === 'published' ? 'Unpublish' : 'Publish'} aria-label="Toggle publish" onClick={() => toggle(i)} className="rounded p-1.5 text-[#5E726B] hover:bg-[#EEF3EF]">{(i.status ?? 'published') === 'published' ? <ToggleRight size={17} className="text-[#17663A]" /> : <ToggleLeft size={17} />}</button>}
                        <button type="button" title="View" aria-label="View" onClick={() => setView(i)} className="rounded p-1.5 text-[#5E726B] hover:bg-[#EEF3EF]"><Eye size={15} /></button>
                        <button type="button" title="Edit" aria-label="Edit" onClick={() => openEdit(i)} className="rounded p-1.5 text-[#124B3B] hover:bg-[#EEF3EF]"><Pencil size={15} /></button>
                        <button type="button" title="Delete" aria-label="Delete" onClick={() => setDel(i)} className="rounded p-1.5 text-[#B42318] hover:bg-[#FDECEA]"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager page={cur} pages={pages} total={filtered.length} onPage={setPage} />
      </Card>

      {edit && (
        <Modal wide title={`${edit.id ? 'Edit' : 'Add'} ${singular}`} onClose={() => setEdit(null)}
          footer={<>
            <Btn variant="outline" onClick={() => setEdit(null)}>Cancel</Btn>
            {!noStatus && <Btn variant="outline" onClick={() => submit('draft')}>Save as draft</Btn>}
            <Btn onClick={() => submit(noStatus ? undefined : 'published')}>{noStatus ? 'Save' : 'Publish'}</Btn>
          </>}>
          <FormFields fields={fields} values={edit.values} errors={errors} idPrefix={`cm-${name}`} onChange={(k, v) => { setEdit({ ...edit, values: { ...edit.values, [k]: v } }); if (errors[k]) setErrors((x) => ({ ...x, [k]: '' })); }} />
        </Modal>
      )}
      {view && (
        <Modal wide title={`${singular} details`} onClose={() => setView(null)} footer={<Btn variant="outline" onClick={() => setView(null)}>Close</Btn>}>
          <dl className="grid gap-3 text-sm">
            {fields.map((f) => {
              const v = view[f.key];
              return (
                <div key={f.key}><dt className="text-xs font-medium uppercase tracking-wide text-[#6B7F78]">{f.label}</dt>
                  <dd className="mt-0.5 whitespace-pre-wrap text-[#10231D]">
                    {f.type === 'image' ? (resolveMedia(v) ? <img src={resolveMedia(v)} alt="" className="h-28 rounded-lg object-cover" /> : '—') : (Array.isArray(v) ? v.join('\n') : String(v ?? '') || '—')}
                  </dd></div>
              );
            })}
          </dl>
        </Modal>
      )}
      {del && <ConfirmDialog title={`Delete ${singular.toLowerCase()}?`} text={`“${String(del[fields[0].key] ?? '')}” will be permanently removed. This cannot be undone.`} onConfirm={remove} onCancel={() => setDel(null)} />}
    </div>
  );
};

export default CollectionManager;
