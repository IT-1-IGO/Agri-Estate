import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from './api';
import { useSession } from './session';
import { Badge, Card, Empty, fdate, inputCls, label, Modal } from './ui';

const Stat: React.FC<{ k: string; v: any }> = ({ k, v }) => <div className="rounded-lg bg-slate-50 p-3 text-center"><div className="text-xl font-bold">{v}</div><div className="text-[11px] uppercase tracking-wide text-slate-500">{k}</div></div>;

const Employees: React.FC = () => {
  const { can } = useSession();
  const [rows, setRows] = useState<any[]>([]); const [q, setQ] = useState(''); const [st, setSt] = useState(''); const [err, setErr] = useState(''); const [loading, setLoading] = useState(true); const [sel, setSel] = useState<any>(null);
  useEffect(() => { const t = setTimeout(() => { const p = new URLSearchParams(); if (q) p.set('q', q); if (st) p.set('status', st); setLoading(true); api<{ data: any[] }>(`/employees?${p}`).then((r) => { setRows(r.data); setErr(''); }).catch((e) => setErr(e.message)).finally(() => setLoading(false)); }, 250); return () => clearTimeout(t); }, [q, st]);
  const open = (id: number) => api(`/employees/${id}`).then(setSel).catch((e) => setErr(e.message));
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3"><h1 className="mr-auto text-2xl font-bold">Employees</h1>{can('users.view') && <Link to="/admin/crm/users" className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm hover:bg-slate-50">Manage login accounts →</Link>}</div>
      {err && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{err}</p>}
      <Card>
        <div className="mb-4 flex flex-wrap gap-3"><input className={inputCls + ' max-w-xs'} placeholder="Search employees…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
          <select className={inputCls + ' max-w-[160px]'} value={st} onChange={(e) => setSt(e.target.value)} aria-label="Status"><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">{['ID', 'Employee', 'Designation', 'Department', 'Contact', 'Open leads', 'Won', 'Win rate', 'Open tasks', 'Overdue', 'Status', ''].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr></thead>
          <tbody>{rows.map((r) => <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50"><td className="px-3 py-2.5">{r.code}</td><td className="px-3 py-2.5"><b>{r.name}</b><div className="text-xs text-slate-500">{r.role_label}</div></td><td className="px-3 py-2.5">{r.designation || '—'}</td><td className="px-3 py-2.5">{r.department || '—'}</td>
            <td className="px-3 py-2.5 text-xs">{r.phone || '—'}<br />{r.email}</td><td className="px-3 py-2.5">{r.open_leads}</td><td className="px-3 py-2.5">{r.won_leads}</td><td className="px-3 py-2.5">{r.win_rate}%</td><td className="px-3 py-2.5">{r.tasks_open}</td><td className={`px-3 py-2.5 ${Number(r.tasks_overdue) ? 'font-semibold text-rose-600' : ''}`}>{r.tasks_overdue}</td><td className="px-3 py-2.5"><Badge v={r.status} /></td>
            <td className="px-3 py-2.5 text-right"><button className="text-[#1f5c3a] hover:underline" onClick={() => open(r.id)}>View</button></td></tr>)}</tbody></table>
          {loading && <Empty>Loading…</Empty>}{!loading && !rows.length && <Empty>No employees found.</Empty>}</div>
      </Card>
      {sel && <Modal title={`${sel.code} — ${sel.name}`} onClose={() => setSel(null)} wide><div className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-4 lg:grid-cols-8"><Stat k="Open leads" v={sel.open_leads} /><Stat k="Won" v={sel.won_leads} /><Stat k="Lost" v={sel.lost_leads} /><Stat k="Enquiries" v={sel.enquiries_assigned} /><Stat k="Properties" v={sel.properties_assigned} /><Stat k="Tasks open" v={sel.tasks_open} /><Stat k="Tasks done" v={sel.tasks_done} /><Stat k="Visits done" v={sel.visits_done} /></div>
        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-xl border border-slate-200 p-4 text-sm"><h4 className="mb-2 font-semibold uppercase tracking-wide text-slate-500 text-xs">Profile & login account</h4><dl className="space-y-1"><div>Designation: <b>{sel.designation || '—'}</b></div><div>Department: <b>{sel.department || '—'}</b></div><div>Role: <b>{sel.role_label}</b></div><div>Username: <b>{sel.username}</b></div><div>Reports to: <b>{sel.manager_name || '—'}</b></div><div>Status: <Badge v={sel.status} /></div><div>Last login: {fdate(sel.last_login_at)}</div></dl></section>
          <section className="rounded-xl border border-slate-200 p-4 text-sm"><h4 className="mb-2 font-semibold uppercase tracking-wide text-slate-500 text-xs">Recent logins</h4>{sel.logins.length ? <ul className="space-y-1">{sel.logins.map((l: any, i: number) => <li key={i} className="flex justify-between"><span>{fdate(l.created_at)}</span><span className="text-slate-500">{l.ip_address}</span><Badge v={l.success ? 'completed' : 'rejected'} /></li>)}</ul> : <p className="text-slate-400">No logins yet.</p>}</section>
          <section className="rounded-xl border border-slate-200 p-4 text-sm"><h4 className="mb-2 font-semibold uppercase tracking-wide text-slate-500 text-xs">Assigned leads</h4>{sel.leads.length ? <ul className="divide-y divide-slate-100">{sel.leads.map((l: any) => <li key={l.id} className="flex items-center justify-between py-1.5"><Link className="text-[#1f5c3a] hover:underline" to={`/admin/crm/leads?view=${l.id}`}>{l.code} · {l.name}</Link><Badge v={l.status} /></li>)}</ul> : <p className="text-slate-400">None.</p>}</section>
          <section className="rounded-xl border border-slate-200 p-4 text-sm"><h4 className="mb-2 font-semibold uppercase tracking-wide text-slate-500 text-xs">Task history</h4>{sel.tasks.length ? <ul className="divide-y divide-slate-100">{sel.tasks.map((t: any) => <li key={t.id} className="flex items-center justify-between py-1.5"><span>{t.title}<span className="ml-2 text-xs text-slate-500">{t.due_date ? String(t.due_date).slice(0, 10) : ''}</span></span><Badge v={t.status} /></li>)}</ul> : <p className="text-slate-400">None.</p>}</section>
          <section className="rounded-xl border border-slate-200 p-4 text-sm md:col-span-2"><h4 className="mb-2 font-semibold uppercase tracking-wide text-slate-500 text-xs">Assigned properties</h4>{sel.properties.length ? <div className="flex flex-wrap gap-2">{sel.properties.map((p: any) => <span key={p.id} className="rounded-full border border-slate-200 px-3 py-1">{p.name} · {label(p.status)}</span>)}</div> : <p className="text-slate-400">None.</p>}</section>
        </div></div></Modal>}
    </div>
  );
};
export default Employees;
