import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from './api';
import { Badge, Card, Empty, fdate, label, money } from './ui';
import { useSession } from './session';

const Bars: React.FC<{ data: { k: string; v: number; v2?: number }[]; money?: boolean }> = ({ data, money: isMoney }) => {
  const max = Math.max(1, ...data.map((d) => d.v)); if (!data.length) return <Empty>No data yet</Empty>;
  return <div className="space-y-2">{data.map((d) => <div key={d.k} className="flex items-center gap-3 text-sm"><span className="w-28 shrink-0 truncate text-slate-600">{label(d.k)}</span>
    <div className="h-3 flex-1 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-[#1f5c3a]" style={{ width: `${(d.v / max) * 100}%` }} /></div><span className={isMoney ? 'w-24 text-right font-medium' : 'w-8 text-right font-medium'}>{isMoney ? money(d.v) : d.v}</span></div>)}</div>;
};

const DailyChart: React.FC<{ rows: { day: string; enquiries: number }[] }> = ({ rows }) => {
  const days = Array.from({ length: 30 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (29 - i)); return d.toISOString().slice(0, 10); });
  const byDay = new Map(rows.map((r) => [String(r.day).slice(0, 10), Number(r.enquiries)]));
  const data = days.map((d) => ({ d, v: byDay.get(d) || 0 })); const max = Math.max(1, ...data.map((x) => x.v));
  return (
    <div><div className="flex h-36 items-end gap-1" role="img" aria-label="Enquiries per day, last 30 days">{data.map((x) => <div key={x.d} title={`${x.d}: ${x.v}`} className="flex-1 rounded-t bg-[#1f5c3a]/80 hover:bg-[#1f5c3a]" style={{ height: `${Math.max(x.v ? 6 : 2, (x.v / max) * 100)}%`, opacity: x.v ? 1 : 0.25 }} />)}</div>
      <div className="mt-1 flex justify-between text-[11px] text-slate-400"><span>{data[0].d.slice(5)}</span><span>Peak: {max} / day</span><span>{data[29].d.slice(5)}</span></div></div>
  );
};

const Overview: React.FC = () => {
  const { can } = useSession();
  const [from, setFrom] = useState(''); const [to, setTo] = useState(''); const [o, setO] = useState<any>(null); const [err, setErr] = useState('');
  useEffect(() => { const p = new URLSearchParams(); if (from) p.set('from', from); if (to) p.set('to', to); api(`/dashboard-erp?${p}`).then((r) => { setO(r); setErr(''); }).catch((e) => setErr(e.message)); }, [from, to]);
  const quick = [['+ New enquiry', 'enquiries?add=1', 'enquiries.create'], ['+ New lead', 'leads?mode=list&add=1', 'leads.create'], ['+ Customer', 'customers?add=1', 'customers.create'], ['+ Site visit', 'site-visits?add=1', 'site_visits.create'], ['+ Proposal', 'proposals?add=1', 'proposals.create'], ['+ Booking', 'bookings?add=1', 'bookings.create'], ['+ Task', 'tasks?add=1', 'tasks.create']].filter((q) => can(q[2]));
  if (err) return <p className="rounded-lg bg-rose-50 p-3 text-rose-700">{err}</p>;
  if (!o) return <p className="text-slate-500">Loading overview…</p>;
  const t = o.tiles; const lc = o.lead_conversion;
  const tiles: [string, any, string][] = [['Total enquiries', t.total_enquiries, 'enquiries'], ['New enquiries', t.new_enquiries, 'enquiries?status=new'], ['Active leads', t.active_leads, 'leads?mode=list'], ['Available parcels', t.available_parcels, 'parcels?status=available'], ['Total properties', t.total_properties, 'properties'], ['Scheduled site visits', t.scheduled_visits, 'site-visits'], ['Confirmed bookings', t.confirmed_bookings, 'bookings'], ['Pending follow-ups', t.pending_followups, 'followups']];
  const sales = (o.monthly_sales || []).map((m: any) => ({ k: m.month, v: Number(m.amount) }));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3"><h2 className="mr-auto text-lg font-semibold">Business overview</h2>
        <div><label className="mb-1 block text-xs text-slate-500" htmlFor="df">From</label><input id="df" type="date" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><label className="mb-1 block text-xs text-slate-500" htmlFor="dt">To</label><input id="dt" type="date" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        {(from || to) && <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50" onClick={() => { setFrom(''); setTo(''); }}>Clear</button>}</div>
      {!!quick.length && <div className="flex flex-wrap gap-2" aria-label="Quick actions">{quick.map((q) => <Link key={q[0]} to={`/admin/crm/${q[1]}`} className="rounded-full border border-[#1f5c3a]/30 bg-white px-3.5 py-1.5 text-sm font-medium text-[#1f5c3a] hover:bg-[#1f5c3a] hover:text-white">{q[0]}</Link>)}</div>}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{tiles.map(([k, v, to2]) => <Link key={k} to={`/admin/crm/${to2}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#1f5c3a]"><div className="text-[11px] uppercase tracking-wide text-slate-500">{k}</div><div className="mt-1 text-2xl font-bold">{v}</div></Link>)}</div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Monthly sales overview (payments received)">{sales.length ? <Bars data={sales.map((x: any) => ({ k: x.k, v: x.v }))} money /> : <Empty>No payments recorded yet</Empty>}</Card>
        <Card title="Lead conversion"><div className="mb-3 flex items-end gap-4"><div><div className="text-3xl font-bold">{lc.rate}%</div><div className="text-xs text-slate-500">won of {lc.total} leads</div></div><div className="text-sm text-slate-600">Won <b>{lc.won}</b> · Lost <b>{lc.lost}</b></div></div>
          <Bars data={Object.entries(lc.by_status || {}).map(([k, v]) => ({ k, v: Number(v) }))} /></Card>
        <Card title="Recent activity">{o.recent_activities.length ? <ul className="space-y-1.5 text-sm">{o.recent_activities.map((a: any, i: number) => <li key={i} className="flex justify-between gap-2"><span className="min-w-0 truncate"><b>{a.username || 'System'}</b> {label(a.action)} · {label(a.module)}</span><span className="shrink-0 text-xs text-slate-400">{fdate(a.created_at)}</span></li>)}</ul> : <Empty>{can('activity.view') ? 'No activity yet' : 'Not available for your role'}</Empty>}</Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Recent enquiries" right={<Link className="text-sm text-[#1f5c3a]" to="/admin/crm/enquiries">View all</Link>}>{o.recent_enquiries.length ? <ul className="divide-y divide-slate-100 text-sm">{o.recent_enquiries.map((e: any) => <li key={e.id} className="flex items-center justify-between py-2"><Link className="min-w-0 truncate font-medium text-[#1f5c3a] hover:underline" to={`/admin/crm/enquiries?view=${e.id}`}>{e.code} · {e.name}</Link><Badge v={e.status} /></li>)}</ul> : <Empty>No enquiries in this period</Empty>}</Card>
        <Card title="Upcoming site visits" right={<Link className="text-sm text-[#1f5c3a]" to="/admin/crm/site-visits">View all</Link>}>{o.upcoming_visits.length ? <ul className="divide-y divide-slate-100 text-sm">{o.upcoming_visits.map((v: any) => <li key={v.id} className="flex items-center justify-between py-2"><span className="min-w-0 truncate"><b>{v.buyer_name}</b> <span className="text-slate-500">{v.property_name || ''}</span></span><span className="shrink-0 text-xs text-slate-500">{String(v.visit_date).slice(0, 10)} {String(v.visit_time || '').slice(0, 5)}</span></li>)}</ul> : <Empty>No upcoming visits</Empty>}</Card>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [d, setD] = useState<any>(null); const [err, setErr] = useState('');
  useEffect(() => { api('/dashboard').then(setD).catch((e) => setErr(e.message)); }, []);
  if (err) return <p className="rounded-lg bg-rose-50 p-3 text-rose-700">{err}</p>;
  if (!d) return <p className="text-slate-500">Loading dashboard…</p>;
  const s = d.stats;
  const tiles = [['Total properties', s.properties], ['Available', s.available], ['Reserved', s.reserved], ['Sold', s.sold], ['Landowners', s.landowners], ['Buyers', s.buyers], ['Total enquiries', s.enquiries], ['New leads', s.new_leads],
    ['Upcoming site visits', s.upcoming_visits], ['Pending follow-ups', s.pending_followups], ['Converted', s.converted], ['Conversion rate', `${s.conversion_rate}%`]];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <Overview />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">{tiles.map(([t, v]) => <Card key={String(t)}><div className="text-xs uppercase tracking-wide text-slate-500">{t}</div><div className="mt-1 text-2xl font-bold text-[#1f5c3a]">{v}</div></Card>)}</div>
      <div>
        <h2 className="mb-3 text-lg font-semibold">Enquiries &amp; leads</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">{([['Total enquiries', s.enquiries], ['New', s.new_leads], ['Assigned', s.assigned], ['Pending follow-ups', s.pending_followups], ['Interested', s.interested], ['Site visits', s.site_visit_leads], ['Converted', s.converted], ['Closed', s.closed]] as [string, any][]).map(([t, v]) => (
          <Link key={t} to="/admin/crm/enquiries" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#1f5c3a]"><div className="text-[11px] uppercase tracking-wide text-slate-500">{t}</div><div className="mt-1 text-2xl font-bold text-[#1f5c3a]">{v ?? 0}</div></Link>))}</div>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <Card title="Daily enquiries — last 30 days"><DailyChart rows={d.daily || []} /></Card>
          <Card title="Lead conversion by source">{(d.conversionBySource || []).length ? <table className="w-full text-sm"><thead><tr className="text-left text-xs uppercase text-slate-500"><th className="py-1">Source</th><th>Enquiries</th><th>Converted</th><th>Rate</th></tr></thead>
            <tbody>{d.conversionBySource.map((c: any) => <tr key={c.source} className="border-t border-slate-100"><td className="py-2">{label(c.source)}</td><td>{c.total}</td><td>{c.converted}</td><td>{c.total ? Math.round((c.converted / c.total) * 1000) / 10 : 0}%</td></tr>)}</tbody></table> : <Empty>No data yet</Empty>}</Card>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Enquiries — last 6 months"><Bars data={d.monthly.map((m: any) => ({ k: m.month, v: m.enquiries }))} /></Card>
        <Card title="Enquiries by source"><Bars data={d.bySource.map((m: any) => ({ k: m.source, v: m.count }))} /></Card>
        <Card title="Leads by status"><Bars data={d.byStatus.map((m: any) => ({ k: m.status, v: m.count }))} /></Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Recent enquiries" right={<Link className="text-sm text-[#1f5c3a]" to="/admin/crm/enquiries">View all</Link>}>
          {d.recentEnquiries.length ? <ul className="divide-y divide-slate-100 text-sm">{d.recentEnquiries.map((e: any) => <li key={e.id} className="flex items-center justify-between py-2"><span><b>{e.name}</b> <span className="text-slate-500">{e.phone}</span><br /><span className="text-xs text-slate-500">{e.code} · {fdate(e.created_at)}</span></span><Badge v={e.status} /></li>)}</ul> : <Empty>No enquiries yet</Empty>}</Card>
        <Card title="Upcoming site visits" right={<Link className="text-sm text-[#1f5c3a]" to="/admin/crm/site-visits">View all</Link>}>
          {d.upcomingVisits.length ? <ul className="divide-y divide-slate-100 text-sm">{d.upcomingVisits.map((v: any) => <li key={v.id} className="flex items-center justify-between py-2"><span><b>{v.buyer_name}</b><br /><span className="text-xs text-slate-500">{String(v.visit_date).slice(0, 10)} {v.visit_time || ''} · {v.property_name || 'No property'}</span></span><Badge v={v.status} /></li>)}</ul> : <Empty>No upcoming visits</Empty>}</Card>
        <Card title="Recently added properties">
          {d.recentProperties.length ? <ul className="divide-y divide-slate-100 text-sm">{d.recentProperties.map((p: any) => <li key={p.id} className="flex items-center justify-between py-2"><span><b>{p.name}</b><br /><span className="text-xs text-slate-500">{p.code} · {p.district} · {money(p.price)}</span></span><Badge v={p.status} /></li>)}</ul> : <Empty>No properties yet</Empty>}</Card>
        {!!d.performance.length && <Card title="Executive-wise lead performance"><table className="w-full text-sm"><thead><tr className="text-left text-xs uppercase text-slate-500"><th className="py-1">Employee</th><th>Leads</th><th>In progress</th><th>Converted</th><th>Rate</th></tr></thead>
          <tbody>{d.performance.map((p: any) => <tr key={p.id} className="border-t border-slate-100"><td className="py-2">{p.name}</td><td>{p.leads}</td><td>{p.in_progress ?? 0}</td><td>{p.converted}</td><td>{p.leads ? Math.round((p.converted / p.leads) * 1000) / 10 : 0}%</td></tr>)}</tbody></table></Card>}
      </div>
    </div>
  );
};
export default Dashboard;
