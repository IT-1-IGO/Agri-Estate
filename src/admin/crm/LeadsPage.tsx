import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from './api';
import { useSession } from './session';
import { Badge, Btn, inputCls, label, money } from './ui';
import ResourcePage from './ResourcePage';
import RecordDetail from './RecordDetail';

const COLS = ['new', 'contacted', 'qualified', 'site_visit_scheduled', 'negotiation', 'won', 'lost'];
const HEAD: Record<string, string> = { new: 'border-sky-400', contacted: 'border-sky-500', qualified: 'border-indigo-400', site_visit_scheduled: 'border-violet-400', negotiation: 'border-amber-400', won: 'border-emerald-500', lost: 'border-rose-400' };

const Board: React.FC = () => {
  const { can } = useSession(); const nav = useNavigate();
  const [b, setB] = useState<Record<string, { total: number; rows: any[] }> | null>(null); const [err, setErr] = useState(''); const [msg, setMsg] = useState('');
  const [open, setOpen] = useState<number | null>(null); const [drag, setDrag] = useState<any>(null); const [over, setOver] = useState(''); const [lost, setLost] = useState<{ lead: any; reason: string } | null>(null);
  const load = useCallback(() => api<any>('/leads/board').then(setB).catch((e) => setErr(e.message)), []);
  useEffect(() => { load(); }, [load]);
  const move = async (lead: any, status: string, reason?: string) => {
    setErr(''); setMsg('');
    try { await api(`/leads/${lead.id}`, { method: 'PUT', body: { status, ...(reason ? { lost_reason: reason } : {}) } }); setMsg(`${lead.code} moved to ${label(status)}`); await load(); } catch (e: any) { setErr(e.message); }
  };
  const drop = (status: string) => { setOver(''); const l = drag; setDrag(null); if (!l || l.status === status || !can('leads.edit')) return; if (status === 'lost') setLost({ lead: l, reason: '' }); else move(l, status); };
  if (!b) return <p className="text-slate-500">{err || 'Loading pipeline…'}</p>;
  return (
    <div>
      {msg && <p className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">{msg}</p>}{err && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{err}</p>}
      <div className="flex gap-3 overflow-x-auto pb-3">
        {COLS.map((c) => (
          <section key={c} onDragOver={(e) => { e.preventDefault(); setOver(c); }} onDragLeave={() => setOver('')} onDrop={() => drop(c)} aria-label={label(c)} className={`w-72 shrink-0 rounded-xl border-t-4 bg-slate-100/70 p-2 ${HEAD[c]} ${over === c ? 'ring-2 ring-[#1f5c3a]/40' : ''}`}>
            <h3 className="mb-2 flex items-center justify-between px-1 text-sm font-semibold">{label(c)}<span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-600">{b[c]?.total ?? 0}</span></h3>
            <div className="space-y-2">
              {(b[c]?.rows || []).map((l) => (
                <article key={l.id} draggable={can('leads.edit')} onDragStart={() => setDrag({ ...l, status: c })} onDragEnd={() => setDrag(null)} onClick={() => setOpen(l.id)} className="cursor-pointer rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm hover:border-[#1f5c3a]">
                  <div className="flex items-start justify-between gap-2"><b className="min-w-0 truncate">{l.name}</b><Badge v={l.priority} /></div>
                  <div className="mt-0.5 text-xs text-slate-500">{l.code} · {label(l.lead_type)}</div>
                  {l.property_name && <div className="mt-1 truncate text-xs text-slate-600">{l.property_name}</div>}
                  <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500"><span>{l.budget ? money(l.budget) : ''}</span><span>{l.assigned_name || 'Unassigned'}</span></div>
                  {l.next_followup_date && <div className={`mt-1 text-xs ${String(l.next_followup_date).slice(0, 10) <= new Date().toISOString().slice(0, 10) ? 'font-medium text-rose-600' : 'text-slate-500'}`}>Follow-up {String(l.next_followup_date).slice(0, 10)}</div>}
                  {can('leads.edit') && <label className="sr-only" htmlFor={`mv${l.id}`}>Move lead</label>}
                  {can('leads.edit') && <select id={`mv${l.id}`} className="mt-2 w-full rounded border border-slate-200 px-1.5 py-1 text-xs" value={c} onClick={(e) => e.stopPropagation()} onChange={(e) => { const s = e.target.value; if (s === 'lost') setLost({ lead: { ...l, status: c }, reason: '' }); else move({ ...l, status: c }, s); }}>{COLS.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select>}
                </article>
              ))}
              {!(b[c]?.rows || []).length && <p className="px-1 py-6 text-center text-xs text-slate-400">No leads</p>}
              {(b[c]?.total ?? 0) > (b[c]?.rows.length ?? 0) && <p className="px-1 text-center text-xs text-slate-500">Showing {b[c].rows.length} of {b[c].total} — use the list view for all.</p>}
            </div>
          </section>
        ))}
      </div>
      {lost && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" role="dialog" aria-label="Lost reason"><h3 className="text-lg font-semibold">Why was {lost.lead.name} lost?</h3>
        <input autoFocus className={inputCls + ' mt-3'} placeholder="e.g. Price too high, bought elsewhere" value={lost.reason} onChange={(e) => setLost({ ...lost, reason: e.target.value })} />
        <div className="mt-4 flex justify-end gap-2"><Btn onClick={() => setLost(null)}>Cancel</Btn><Btn v="primary" disabled={!lost.reason.trim()} onClick={() => { const x = lost; setLost(null); move(x.lead, 'lost', x.reason.trim()); }}>Mark lost</Btn></div></div></div>}
      {open && <RecordDetail kind="lead" id={open} onClose={() => { setOpen(null); load(); }} />}
    </div>
  );
};

const LeadsPage: React.FC = () => {
  const [sp, setSp] = useSearchParams(); const { can } = useSession(); const nav = useNavigate();
  const mode = sp.get('mode') === 'list' || sp.get('view') || sp.get('add') ? 'list' : 'board';
  const set = (m: string) => { const n = new URLSearchParams(sp); n.set('mode', m); setSp(n); };
  return (
    <div>
      {mode === 'board' && <div className="mb-4 flex flex-wrap items-center gap-3"><h1 className="mr-auto text-2xl font-bold">Lead Management</h1>
        {can('leads.create') && <Btn v="primary" onClick={() => nav('/admin/crm/leads?mode=list&add=1')}>+ Add Lead</Btn>}</div>}
      <div className="mb-4 inline-flex rounded-lg border border-slate-300 bg-white p-0.5 text-sm" role="tablist">
        {['board', 'list'].map((m) => <button key={m} role="tab" aria-selected={mode === m} onClick={() => set(m)} className={`rounded-md px-4 py-1.5 ${mode === m ? 'bg-[#1f5c3a] text-white' : 'text-slate-600 hover:bg-slate-50'}`}>{m === 'board' ? 'Pipeline board' : 'List view'}</button>)}</div>
      {mode === 'board' ? <Board /> : <ResourcePage rkey="leads" />}
    </div>
  );
};
export default LeadsPage;
