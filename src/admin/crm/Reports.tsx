import React, { useEffect, useState } from 'react';
import { api, download } from './api';
import { useSession } from './session';
import { Btn, Card, Empty, inputCls, money } from './ui';

const fmt = (c: any, v: any) => (v == null || v === '' ? '—' : c.money ? money(v) : String(v));
const Reports: React.FC = () => {
  const { can } = useSession();
  const [list, setList] = useState<{ key: string; title: string }[]>([]); const [key, setKey] = useState('enquiries');
  const [from, setFrom] = useState(''); const [to, setTo] = useState(''); const [group, setGroup] = useState('month');
  const [data, setData] = useState<any>(null); const [err, setErr] = useState(''); const [loading, setLoading] = useState(true);
  const qs = (extra: Record<string, string> = {}) => { const p = new URLSearchParams({ group, ...extra }); if (from) p.set('from', from); if (to) p.set('to', to); return p.toString(); };
  useEffect(() => { api<any[]>('/reports').then(setList).catch((e) => setErr(e.message)); }, []);
  useEffect(() => { setLoading(true); setErr(''); api(`/reports/${key}?${qs()}`).then(setData).catch((e) => { setErr(e.message); setData(null); }).finally(() => setLoading(false)); }, [key, from, to, group]); // eslint-disable-line react-hooks/exhaustive-deps
  const exp = async (f: 'xlsx' | 'csv') => { try { await download(`/reports/${key}?${qs({ export: f })}`, `${key}-${new Date().toISOString().slice(0, 10)}.${f}`); } catch (e: any) { setErr(e.message); } };
  const cols: any[] = data?.columns || []; const rows: any[] = data?.rows || [];
  const numCol = cols.find((c) => rows.some((r) => typeof r[c.key] === 'number' || (r[c.key] != null && r[c.key] !== '' && !isNaN(Number(r[c.key])))) && c !== cols[0] && !/rate|days/i.test(c.key));
  const max = numCol ? Math.max(1, ...rows.map((r) => Number(r[numCol.key]) || 0)) : 1;
  const grouped = ['enquiries', 'site_visits', 'revenue'].includes(key);
  return (
    <div>
      <style>{`@media print { aside, header, .no-print { display: none !important; } .lg\\:pl-64 { padding-left: 0 !important; } main { padding: 0 !important; } }`}</style>
      <div className="no-print mb-4 flex flex-wrap items-center gap-3"><h1 className="mr-auto text-2xl font-bold">Reports &amp; Analytics</h1>
        {can('reports.export') && <><Btn onClick={() => exp('xlsx')}>Export Excel</Btn><Btn onClick={() => exp('csv')}>Export CSV</Btn></>}<Btn onClick={() => window.print()}>Print / Save as PDF</Btn></div>
      <Card>
        <div className="no-print mb-4 flex flex-wrap items-end gap-3">
          <div><label className="mb-1 block text-xs text-slate-500" htmlFor="rp">Report</label><select id="rp" className={inputCls} value={key} onChange={(e) => setKey(e.target.value)}>{list.map((r) => <option key={r.key} value={r.key}>{r.title}</option>)}</select></div>
          <div><label className="mb-1 block text-xs text-slate-500" htmlFor="rf">From</label><input id="rf" type="date" className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)} /></div>
          <div><label className="mb-1 block text-xs text-slate-500" htmlFor="rt">To</label><input id="rt" type="date" className={inputCls} value={to} onChange={(e) => setTo(e.target.value)} /></div>
          {grouped && <div><label className="mb-1 block text-xs text-slate-500" htmlFor="rg">Group by</label><select id="rg" className={inputCls} value={group} onChange={(e) => setGroup(e.target.value)}><option value="day">Daily</option><option value="week">Weekly</option><option value="month">Monthly</option></select></div>}
          {(from || to) && <Btn onClick={() => { setFrom(''); setTo(''); }}>Clear dates</Btn>}
        </div>
        <h2 className="mb-3 text-lg font-semibold">{data?.title || list.find((r) => r.key === key)?.title}{(from || to) && <span className="ml-2 text-sm font-normal text-slate-500">{from || '…'} → {to || 'today'}</span>}</h2>
        {err && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{err}</p>}
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">{cols.map((c) => <th key={c.key} className="px-3 py-2 font-semibold">{c.label}</th>)}{numCol && <th className="no-print w-40 px-3 py-2" aria-label="Chart" />}</tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i} className="border-b border-slate-100">{cols.map((c) => <td key={c.key} className="px-3 py-2">{fmt(c, r[c.key])}</td>)}{numCol && <td className="no-print px-3 py-2"><div className="h-2.5 rounded-full bg-slate-100"><div className="h-2.5 rounded-full bg-[#1f5c3a]" style={{ width: `${((Number(r[numCol.key]) || 0) / max) * 100}%` }} /></div></td>}</tr>)}</tbody></table>
          {loading && <Empty>Loading…</Empty>}{!loading && !rows.length && !err && <Empty>No data for this report{from || to ? ' in the selected dates' : ' yet'}.</Empty>}</div>
        <p className="mt-3 text-xs text-slate-400">{rows.length} row{rows.length === 1 ? '' : 's'} · generated {new Date().toLocaleString()}</p>
      </Card>
    </div>
  );
};
export default Reports;
