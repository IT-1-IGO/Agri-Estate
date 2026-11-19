import React, { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import { Btn, Card, Empty, fdate, inputCls, Modal } from './ui';

const LoginHistory: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]); const [total, setTotal] = useState(0); const [page, setPage] = useState(1); const [ok, setOk] = useState(''); const [err, setErr] = useState('');
  useEffect(() => { const p = new URLSearchParams({ page: String(page), pageSize: '25' }); if (ok) p.set('success', ok); api<any>(`/login-history?${p}`).then((r) => { setRows(r.data); setTotal(r.total); setErr(''); }).catch((e) => setErr(e.message)); }, [page, ok]);
  return (
    <div><div className="mb-4 flex items-center"><h1 className="mr-auto text-2xl font-bold">Login History</h1>
      <select className={inputCls + ' max-w-[12rem]'} value={ok} onChange={(e) => { setOk(e.target.value); setPage(1); }} aria-label="Result"><option value="">All attempts</option><option value="1">Successful</option><option value="0">Failed</option></select></div>
      <Card>{err && <p className="text-rose-700">{err}</p>}
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-xs uppercase text-slate-500"><th className="p-2">When</th><th>User</th><th>Username entered</th><th>Result</th><th>IP address</th><th>Device / browser</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.id} className="border-b border-slate-100"><td className="p-2 whitespace-nowrap">{fdate(r.created_at)}</td><td>{r.name || '—'}</td><td>{r.username || '—'}</td><td><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${r.success ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{r.success ? 'Success' : 'Failed'}</span></td><td>{r.ip_address || '—'}</td><td className="max-w-xs truncate text-xs text-slate-500" title={r.user_agent}>{r.user_agent || '—'}</td></tr>)}</tbody></table></div>
        {!rows.length && <Empty>No logins recorded yet.</Empty>}
        <div className="mt-4 flex items-center justify-end gap-2 text-sm"><Btn disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Btn>Page {page} of {Math.max(1, Math.ceil(total / 25))}<Btn disabled={page * 25 >= total} onClick={() => setPage(page + 1)}>Next</Btn></div></Card>
    </div>
  );
};

const ActivityLogs: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]); const [total, setTotal] = useState(0); const [page, setPage] = useState(1); const [module, setModule] = useState(''); const [err, setErr] = useState(''); const [view, setView] = useState<any>(null);
  const load = useCallback(() => { const p = new URLSearchParams({ page: String(page), pageSize: '25' }); if (module) p.set('module', module); api<any>(`/activity?${p}`).then((r) => { setRows(r.data); setTotal(r.total); }).catch((e) => setErr(e.message)); }, [page, module]);
  useEffect(() => { load(); }, [load]);
  return (
    <div><div className="mb-4 flex items-center"><h1 className="mr-auto text-2xl font-bold">Activity Logs</h1>
      <select className={inputCls + ' max-w-[12rem]'} value={module} onChange={(e) => { setModule(e.target.value); setPage(1); }} aria-label="Module"><option value="">All modules</option>{['auth', 'properties', 'parcels', 'landowners', 'buyers', 'enquiries', 'followups', 'site_visits', 'media', 'users', 'roles', 'settings'].map((m) => <option key={m}>{m}</option>)}</select></div>
      <Card>{err && <p className="text-rose-700">{err}</p>}
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-xs uppercase text-slate-500"><th className="p-2">When</th><th>User</th><th>Module</th><th>Action</th><th>Record</th><th>IP</th><th /></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.id} className="border-b border-slate-100"><td className="p-2 whitespace-nowrap">{fdate(r.created_at)}</td><td>{r.username || '—'}</td><td>{r.module}</td><td>{r.action}</td><td>{r.record_id || '—'}</td><td>{r.ip_address}</td><td>{(r.previous_value || r.updated_value) && <button className="text-[#1f5c3a] hover:underline" onClick={() => setView(r)}>Details</button>}</td></tr>)}</tbody></table></div>
        {!rows.length && <Empty>No activity recorded.</Empty>}
        <div className="mt-4 flex items-center justify-end gap-2 text-sm"><Btn disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Btn>Page {page} of {Math.max(1, Math.ceil(total / 25))}<Btn disabled={page * 25 >= total} onClick={() => setPage(page + 1)}>Next</Btn></div></Card>
      {view && <Modal title={`${view.module} · ${view.action}`} onClose={() => setView(null)}><h4 className="font-semibold">Previous value</h4><pre className="mb-3 max-h-60 overflow-auto rounded bg-slate-50 p-3 text-xs">{view.previous_value || '—'}</pre><h4 className="font-semibold">Updated value</h4><pre className="max-h-60 overflow-auto rounded bg-slate-50 p-3 text-xs">{view.updated_value || '—'}</pre></Modal>}
    </div>
  );
};
const Activity: React.FC = () => {
  const [tab, setTab] = useState<'activity' | 'logins'>('activity');
  return (
    <div>
      <div className="mb-4 inline-flex rounded-lg border border-slate-300 bg-white p-0.5 text-sm" role="tablist">
        {([['activity', 'Activity logs'], ['logins', 'Login history']] as const).map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`rounded-md px-4 py-1.5 ${tab === k ? 'bg-[#1f5c3a] text-white' : 'text-slate-600 hover:bg-slate-50'}`}>{l}</button>)}</div>
      {tab === 'activity' ? <ActivityLogs /> : <LoginHistory />}
    </div>
  );
};
export default Activity;
