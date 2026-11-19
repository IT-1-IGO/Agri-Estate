import React, { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import { useSession } from './session';
import { Badge, Card, Empty, fdate, inputCls } from './ui';
import EnquiryDetail from './EnquiryDetail';

const Followups: React.FC = () => {
  const { can } = useSession(); const [when, setWhen] = useState('overdue'); const [rows, setRows] = useState<any[]>([]); const [err, setErr] = useState(''); const [open, setOpen] = useState<number | null>(null);
  const load = useCallback(() => { const p = new URLSearchParams(when === 'done' ? { done: '1' } : when === 'all' ? {} : { done: '0', when }); api<{ data: any[] }>(`/followups?${p}`).then((r) => setRows(r.data)).catch((e) => setErr(e.message)); }, [when]);
  useEffect(() => { load(); }, [load]);
  const tick = async (id: number, done: boolean) => { await api(`/followups/${id}`, { method: 'PATCH', body: { done } }); load(); };
  return (
    <div><div className="mb-4 flex items-center gap-3"><h1 className="mr-auto text-2xl font-bold">Follow-ups</h1>
      <select className={inputCls + ' max-w-[10rem]'} value={when} onChange={(e) => setWhen(e.target.value)} aria-label="Filter"><option value="overdue">Overdue</option><option value="today">Today</option><option value="upcoming">Upcoming</option><option value="done">Completed</option><option value="all">All</option></select></div>
      <Card>{err && <p className="text-rose-700">{err}</p>}
        {rows.length ? <table className="w-full text-sm"><thead><tr className="border-b text-left text-xs uppercase text-slate-500"><th className="p-2">Due</th><th>Customer</th><th>Phone</th><th>Type</th><th>Notes</th><th>Done</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.id} className="border-b border-slate-100"><td className="p-2 whitespace-nowrap">{fdate(r.followup_date)}</td><td><button className="text-[#1f5c3a] hover:underline" onClick={() => setOpen(r.enquiry_id)}>{r.customer}</button> <span className="text-xs text-slate-500">{r.enquiry_code}</span></td><td>{r.phone}</td><td><Badge v={r.type} /></td><td className="max-w-xs truncate">{r.notes}</td>
            <td><input type="checkbox" checked={!!r.done} disabled={!can('followups.edit')} onChange={(e) => tick(r.id, e.target.checked)} aria-label="Mark done" /></td></tr>)}</tbody></table> : <Empty>No follow-ups in this view.</Empty>}</Card>
      {open && <EnquiryDetail id={open} onClose={() => { setOpen(null); load(); }} />}</div>
  );
};
export default Followups;
