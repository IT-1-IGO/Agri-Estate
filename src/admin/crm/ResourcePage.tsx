import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api, ApiError, download } from './api';
import QuickAction from './QuickAction';
import { RESOURCES, Field } from './config';
import { useSession } from './session';
import { Badge, Btn, Card, Empty, fdate, inputCls, label, Modal, money } from './ui';
import EnquiryDetail from './EnquiryDetail';
import RecordDetail from './RecordDetail';

type Lookups = Record<string, { id: number; name: string; label?: string; [k: string]: any }[]>;
let lookupCache: Lookups | null = null;
export const useLookups = () => {
  const [l, setL] = useState<Lookups>(lookupCache || {});
  useEffect(() => { if (!lookupCache) api<Lookups>('/lookups').then((d) => { lookupCache = d; setL(d); }).catch(() => {}); }, []);
  return l;
};

const DEFAULTED = ['status', 'area_unit', 'priority', 'source', 'contact_method', 'verification_status', 'customer_type', 'lead_type', 'approval_status'];
const defaultValues = (fields: Field[]) => {
  const out: Record<string, any> = {};
  for (const f of fields) {
    if (f.type !== 'select' || !f.options || !DEFAULTED.includes(f.name)) continue;
    out[f.name] = f.name === 'priority' ? 'medium' : f.options[0];
  }
  return out;
};

const FormField: React.FC<{ f: Field; value: any; error?: string; onChange: (v: any) => void; lookups: Lookups; disabled?: boolean; values?: Record<string, any> }> = ({ f, value, error, onChange, lookups, disabled, values }) => {
  const v = value ?? '';
  let input: React.ReactNode;
  if (f.type === 'textarea') input = <textarea className={inputCls} disabled={disabled} rows={3} value={v} onChange={(e) => onChange(e.target.value)} />;
  else if (f.type === 'bool') input = <label className="flex items-center gap-2 py-2 text-sm"><input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} /> Yes</label>;
  else if (f.type === 'select') input = <select className={inputCls} disabled={disabled} value={v} onChange={(e) => onChange(e.target.value)}><option value="">Select…</option>{f.options!.map((o) => <option key={o} value={o}>{label(o)}</option>)}</select>;
  else if (f.type === 'lookup') input = <select className={inputCls} disabled={disabled} value={v} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}><option value="">— None —</option>{(lookups[f.lookup!] || []).filter((o) => !f.filterBy || !values?.[f.filterBy] || o[f.filterBy] === values[f.filterBy]).map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select>;
  else {
    const t = f.type === 'datetime' ? 'datetime-local' : f.type === 'number' ? 'number' : f.type || 'text';
    input = <input className={inputCls} disabled={disabled} type={t} step={f.type === 'number' ? 'any' : undefined} value={f.type === 'datetime' ? String(v).replace(' ', 'T').slice(0, 16) : f.type === 'date' ? String(v).slice(0, 10) : v} onChange={(e) => onChange(e.target.value)} />;
  }
  return <div className={f.wide ? 'sm:col-span-2' : ''}><label className="mb-1 block text-sm font-medium text-slate-700">{f.label}{f.required && <span className="text-rose-600"> *</span>}</label>{input}{error && <p className="mt-1 text-xs text-rose-600">{error}</p>}</div>;
};

const ResourcePage: React.FC<{ rkey: string }> = ({ rkey }) => {
  const cfg = RESOURCES[rkey]; const { can } = useSession(); const lookups = useLookups();
  const [sp, setSp] = useSearchParams();
  const [rows, setRows] = useState<any[]>([]); const [total, setTotal] = useState(0); const [page, setPage] = useState(1);
  const [q, setQ] = useState(''); const [loading, setLoading] = useState(true); const [err, setErr] = useState('');
  const [form, setForm] = useState<{ id?: number; values: Record<string, any> } | null>(null);
  const [fErr, setFErr] = useState<Record<string, string>>({}); const [fMsg, setFMsg] = useState(''); const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<number | null>(null); const [notice, setNotice] = useState('');
  const pageSize = 15;
  const [quick, setQuick] = useState<{ kind: 'assign' | 'status'; row: any } | null>(null); const [detailFocus, setDetailFocus] = useState(false);
  const df = sp.get('from') || '', dt = sp.get('to') || '', sortKey = sp.get('sort') || cfg.sorts?.[0]?.value || '';
  const filters = useMemo(() => Object.fromEntries((cfg.filters || []).map((f) => [f.name, sp.get(f.name) || ''])), [cfg, sp]);

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    const p = new URLSearchParams({ page: String(page), pageSize: String(pageSize) }); if (q) p.set('q', q);
    Object.entries(filters).forEach(([k, v]) => v && p.set(k, v as string));
    if (df) p.set('from', df); if (dt) p.set('to', dt);
    const so = cfg.sorts?.find((x) => x.value === sortKey); if (so) { p.set('sort', so.sort); p.set('order', so.order); }
    try { const r = await api<{ data: any[]; total: number }>(`${cfg.path}?${p}`); setRows(r.data); setTotal(r.total); } catch (e: any) { setErr(e.message); } finally { setLoading(false); }
  }, [cfg, page, q, filters, df, dt, sortKey]);
  useEffect(() => { const t = setTimeout(load, q ? 300 : 0); return () => clearTimeout(t); }, [load, q]);
  useEffect(() => { setPage(1); setQ(''); }, [rkey]);
  useEffect(() => { const v = Number(sp.get('view')); if (cfg.detail && v) { setDetail(v); const n = new URLSearchParams(sp); n.delete('view'); setSp(n, { replace: true }); } }, [sp, cfg.detail, setSp]);

  const open = async (id?: number) => {
    setFErr({}); setFMsg('');
    if (!id) return setForm({ values: defaultValues(cfg.fields) });
    try { setForm({ id, values: await api(`${cfg.path}/${id}`) }); } catch (e: any) { setErr(e.message); }
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form) return; setSaving(true); setFErr({}); setFMsg('');
    const body: Record<string, any> = {}; cfg.fields.forEach((f) => { const v = form.values[f.name]; body[f.name] = f.type === 'bool' ? !!v : v === '' ? null : v; });
    try {
      const r: any = await api(form.id ? `${cfg.path}/${form.id}` : cfg.path, { method: form.id ? 'PUT' : 'POST', body });
      setForm(null); setNotice(r?.duplicate ? r.message : `${cfg.singular} ${form.id ? 'updated' : 'created'} successfully`); load();
    } catch (x) { const a = x as ApiError; setFErr(a.fields || {}); setFMsg(a.message); } finally { setSaving(false); }
  };
  const del = async (r: any) => {
    if (!window.confirm(`Delete ${cfg.singular.toLowerCase()} "${r.name || r.code || r.buyer_name}"? It will be moved out of all lists (soft delete) and the action is logged.`)) return;
    try { await api(`${cfg.path}/${r.id}`, { method: 'DELETE' }); setNotice(`${cfg.singular} deleted`); load(); } catch (e: any) { setErr(e.message); }
  };
  const exp = async (fmt: 'csv' | 'xlsx' = 'csv') => {
    const p = new URLSearchParams({ export: fmt }); if (q) p.set('q', q);
    Object.entries(filters).forEach(([k, v]) => v && p.set(k, v as string)); if (df) p.set('from', df); if (dt) p.set('to', dt);
    try { await download(`${cfg.path}?${p}`, `${cfg.key}-${new Date().toISOString().slice(0, 10)}.${fmt}`); } catch (e: any) { setErr(e.message); }
  };

  const nav = useNavigate();
  const quickPatch = async (r: any, patch: Record<string, any>, lbl: string) => {
    try { await api(`${cfg.path}/${r.id}`, { method: 'PUT', body: patch }); setNotice(`${cfg.singular} ${r.code || ''}: ${lbl} done`); load(); } catch (e: any) { setErr(e.message); }
  };
  const convertToLead = async (r: any) => {
    try { const x = await api<{ id: number; code: string; existed: boolean }>('/leads/convert', { method: 'POST', body: { enquiry_id: r.id } }); setNotice(x.existed ? `Already a lead (${x.code})` : `Converted to lead ${x.code}`); load(); } catch (e: any) { setErr(e.message); }
  };
  useEffect(() => { if (sp.get('add') === '1' && can(cfg.perm.create)) { open(); const n = new URLSearchParams(sp); n.delete('add'); setSp(n, { replace: true }); } }, [sp]); // eslint-disable-line react-hooks/exhaustive-deps
  // "Create booking" from an approved proposal
  useEffect(() => {
    const pid = Number(sp.get('fromProposal'));
    if (rkey !== 'bookings' || !pid || !lookups.proposals) return;
    const item = lookups.proposals.find((o) => o.id === pid); const f = cfg.fields.find((x) => x.name === 'proposal_id');
    if (item && f?.fill) { const v: Record<string, any> = { ...defaultValues(cfg.fields), proposal_id: pid, booking_date: new Date().toISOString().slice(0, 10) }; for (const [to, from] of Object.entries(f.fill)) if (item[from] != null) v[to] = item[from]; setForm({ values: v }); }
    const n = new URLSearchParams(sp); n.delete('fromProposal'); setSp(n, { replace: true });
  }, [sp, rkey, lookups.proposals, cfg, setSp]);

  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-2xl font-bold">{cfg.title}</h1>
        {cfg.perm.export && can(cfg.perm.export) && <><Btn onClick={() => exp('xlsx')}>Export Excel</Btn><Btn onClick={() => exp('csv')}>Export CSV</Btn></>}
        {can(cfg.perm.create) && <Btn v="primary" onClick={() => open()}>+ Add {cfg.singular}</Btn>}
      </div>
      <Card>
        <div className="mb-4 flex flex-wrap gap-3">
          <input className={inputCls + ' max-w-xs'} placeholder="Search…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} aria-label="Search" />
          {(cfg.filters || []).map((f) => {
            const opts: { v: string; l: string }[] = f.lookup ? (lookups[f.lookup] || []).map((o) => ({ v: String(o.id), l: o.name })) : f.optionsFrom ? ((lookups as any)[f.optionsFrom] || []).map((o: any) => ({ v: o.name, l: o.name })) : (f.options || []).map((o) => ({ v: o, l: label(o) }));
            return <select key={f.name} className={inputCls + ' max-w-[11rem]'} value={filters[f.name]} aria-label={f.label} onChange={(e) => { const n = new URLSearchParams(sp); e.target.value ? n.set(f.name, e.target.value) : n.delete(f.name); setSp(n); setPage(1); }}><option value="">{f.options && !f.optionsFrom ? `${f.label.replace(/^All /, '')}: All` : f.label}</option>{opts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}</select>;
          })}
          {cfg.dateFilter && <><label className="flex items-center gap-1.5 text-xs text-slate-500">From<input type="date" className={inputCls + ' w-auto'} value={df} aria-label="From date" onChange={(e) => { const n = new URLSearchParams(sp); e.target.value ? n.set('from', e.target.value) : n.delete('from'); setSp(n); setPage(1); }} /></label>
            <label className="flex items-center gap-1.5 text-xs text-slate-500">To<input type="date" className={inputCls + ' w-auto'} value={dt} aria-label="To date" onChange={(e) => { const n = new URLSearchParams(sp); e.target.value ? n.set('to', e.target.value) : n.delete('to'); setSp(n); setPage(1); }} /></label></>}
          {cfg.sorts && <select className={inputCls + ' max-w-[13rem]'} value={sortKey} aria-label="Sort" onChange={(e) => { const n = new URLSearchParams(sp); n.set('sort', e.target.value); setSp(n); setPage(1); }}>{cfg.sorts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>}
          {(Object.values(filters).some(Boolean) || df || dt || q) && <Btn onClick={() => { setSp(new URLSearchParams()); setQ(''); setPage(1); }}>Clear</Btn>}
        </div>
        {notice && <p className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">{notice}</p>}
        {err && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{err}</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">{cfg.cols.map((c) => <th key={c.key} className="px-3 py-2 font-semibold">{c.label}</th>)}<th className="sticky right-0 bg-white px-3 py-2 text-right shadow-[-6px_0_6px_-6px_rgba(0,0,0,.15)]">{cfg.enquiryActions ? 'Actions' : ''}</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="group border-b border-slate-100 hover:bg-slate-50">
                  {cfg.cols.map((c) => <td key={c.key} className="px-3 py-2.5">{c.get ? (c.get(r) || '—') : c.badge ? <Badge v={typeof r[c.key] === 'number' ? (r[c.key] ? 'Yes' : 'No') : r[c.key]} /> : c.money ? money(r[c.key]) : c.date ? fdate(r[c.key]) : (r[c.key] ?? '—') + (c.key === 'total_area' || c.key === 'area' ? ` ${r.area_unit || ''}` : '')}</td>)}
                  <td className="sticky right-0 whitespace-nowrap bg-white px-3 py-2.5 text-right shadow-[-6px_0_6px_-6px_rgba(0,0,0,.15)] group-hover:bg-slate-50">
                    {cfg.detail && <button className="mr-3 text-[#1f5c3a] hover:underline" onClick={() => { setDetailFocus(false); setDetail(r.id); }}>View</button>}
                    {can(cfg.perm.edit) && <button className="mr-3 text-[#1f5c3a] hover:underline" onClick={() => open(r.id)}>Edit</button>}
                    {cfg.rowQuick?.filter((a) => can(a.perm) && a.when(r)).map((a) => <button key={a.label} className={`mr-3 hover:underline ${a.tone === 'danger' ? 'text-rose-600' : 'text-[#1f5c3a]'}`} onClick={() => quickPatch(r, a.patch, a.label)}>{a.label}</button>)}
                    {cfg.enquiryActions && can('leads.create') && (r.lead_id ? <button className="mr-3 text-slate-500 hover:underline" onClick={() => nav(`/admin/crm/leads?view=${r.lead_id}`)}>Lead ✓</button> : <button className="mr-3 text-[#1f5c3a] hover:underline" onClick={() => convertToLead(r)}>Convert to lead</button>)}
                    {cfg.enquiryActions && can('enquiries.assign') && <button className="mr-3 text-[#1f5c3a] hover:underline" onClick={() => setQuick({ kind: 'assign', row: r })}>Assign</button>}
                    {cfg.enquiryActions && can('followups.create') && <button className="mr-3 text-[#1f5c3a] hover:underline" onClick={() => { setDetailFocus(true); setDetail(r.id); }}>Follow-up</button>}
                    {cfg.enquiryActions && can(cfg.perm.edit) && <button className="mr-3 text-[#1f5c3a] hover:underline" onClick={() => setQuick({ kind: 'status', row: r })}>Status</button>}
                    {can(cfg.perm.delete) && <button className="text-rose-600 hover:underline" onClick={() => del(r)}>Delete</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <Empty>Loading…</Empty>}
          {!loading && !rows.length && !err && <Empty>No {cfg.title.toLowerCase()} found{q || Object.values(filters).some(Boolean) ? ' for these filters' : ' yet'}.</Empty>}
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600"><span>{total} record{total === 1 ? '' : 's'}</span>
          <span className="flex items-center gap-2"><Btn disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Btn>Page {page} of {pages}<Btn disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</Btn></span></div>
      </Card>
      {form && (
        <Modal title={`${form.id ? 'Edit' : 'Add'} ${cfg.singular}`} onClose={() => setForm(null)} wide>
          <form onSubmit={save} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">{cfg.fields.map((f) => <FormField key={f.name} f={f} value={form.values[f.name]} values={form.values} disabled={!!form.id && !!f.lockOnEdit} error={fErr[f.name]} lookups={lookups} onChange={(v) => setForm((cur) => { if (!cur) return cur; const next = { ...cur.values, [f.name]: v }; if (f.fill && v) { const item = (lookups[f.lookup!] || []).find((o) => o.id === v); if (item) for (const [to, from] of Object.entries(f.fill)) if (item[from] != null) next[to] = item[from]; } if (f.name === 'property_id') next.parcel_id = null; return { ...cur, values: next }; })} />)}</div>
            {fMsg && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{fMsg}</p>}
            <div className="mt-6 flex justify-end gap-3"><Btn type="button" onClick={() => setForm(null)}>Cancel</Btn><Btn v="primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Btn></div>
          </form>
        </Modal>
      )}
      {detail && (cfg.detailKind && cfg.detailKind !== 'enquiry' ? <RecordDetail kind={cfg.detailKind} id={detail} onClose={() => { setDetail(null); load(); }} /> : <EnquiryDetail id={detail} focusFollowup={detailFocus} onClose={() => { setDetail(null); load(); }} />)}
      {quick && <QuickAction kind={quick.kind} row={quick.row} lookups={lookups} onClose={() => setQuick(null)} onDone={(m) => { setQuick(null); setNotice(m); load(); }} />}
    </div>
  );
};
export default ResourcePage;
