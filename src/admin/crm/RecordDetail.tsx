import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from './api';
import { useSession } from './session';
import { Badge, Btn, fdate, inputCls, label, Modal, money } from './ui';

const LEAD_STATUS = ['new', 'contacted', 'qualified', 'site_visit_scheduled', 'negotiation', 'won', 'lost'];
const Row: React.FC<{ k: string; children: React.ReactNode }> = ({ k, children }) => (<div className="grid grid-cols-[140px_1fr] gap-2 py-1 text-sm"><dt className="text-slate-500">{k}</dt><dd className="min-w-0 break-words">{children || '—'}</dd></div>);
const Sec: React.FC<{ title: string; children: React.ReactNode; right?: React.ReactNode }> = ({ title, children, right }) => (<section className="rounded-xl border border-slate-200 p-4"><div className="mb-2 flex items-center justify-between"><h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h4>{right}</div>{children}</section>);
const None: React.FC<{ children?: React.ReactNode }> = ({ children }) => <p className="text-sm text-slate-400">{children || 'Nothing here yet.'}</p>;
const Mini: React.FC<{ rows: { key: string; to?: string; a: React.ReactNode; b?: React.ReactNode; c?: React.ReactNode }[] }> = ({ rows }) => (
  rows.length ? <ul className="divide-y divide-slate-100 text-sm">{rows.map((r) => <li key={r.key} className="flex items-center justify-between gap-3 py-1.5"><span className="min-w-0 truncate">{r.to ? <Link className="font-medium text-[#1f5c3a] hover:underline" to={r.to}>{r.a}</Link> : <b>{r.a}</b>}{r.b && <span className="ml-2 text-slate-500">{r.b}</span>}</span>{r.c}</li>)}</ul> : <None />
);
const dt = (s: any) => (s ? String(s).slice(0, 10) : '—');
const waLink = (p?: string) => (p ? `https://wa.me/91${String(p).replace(/\D/g, '').slice(-10)}` : '');

const RecordDetail: React.FC<{ kind: 'customer' | 'lead' | 'proposal' | 'booking' | 'enquiry'; id: number; onClose: () => void }> = ({ kind, id, onClose }) => {
  const { can } = useSession();
  const path = { customer: '/customers', lead: '/leads', proposal: '/proposals', booking: '/bookings', enquiry: '/enquiries' }[kind];
  const [d, setD] = useState<any>(null); const [err, setErr] = useState(''); const [ok, setOk] = useState('');
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
  const load = useCallback(() => api(`${path}/${id}`).then(setD).catch((e: any) => setErr(e.message)), [path, id]);
  useEffect(() => { load(); api<any>('/lookups').then((l) => setUsers(l.users || [])).catch(() => {}); }, [load]);
  const put = async (body: Record<string, any>, msg: string) => { setErr(''); setOk(''); try { await api(`${path}/${id}`, { method: 'PUT', body }); setOk(msg); await load(); } catch (e: any) { setErr(e.message); } };

  // lead: notes / calls
  const [note, setNote] = useState({ kind: 'note', body: '', next: '' }); const [busy, setBusy] = useState(false);
  const addNote = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr(''); setOk('');
    try { await api(`/leads/${id}/activities`, { method: 'POST', body: { kind: note.kind, body: note.body, next_followup_date: note.next || undefined } }); setNote({ kind: 'note', body: '', next: '' }); setOk('Saved'); await load(); } catch (x: any) { setErr(x.message); } finally { setBusy(false); }
  };
  const [lostReason, setLostReason] = useState('');
  // booking: payments
  const [pay, setPay] = useState({ amount: '', paid_on: new Date().toISOString().slice(0, 10), mode: 'bank_transfer', reference: '', notes: '' });
  const addPay = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr(''); setOk('');
    try { await api(`/bookings/${id}/payments`, { method: 'POST', body: { ...pay, amount: Number(pay.amount) } }); setPay({ ...pay, amount: '', reference: '', notes: '' }); setOk('Payment recorded'); await load(); } catch (x: any) { setErr(x.message); } finally { setBusy(false); }
  };

  const title = d ? `${d.code || ''} — ${d.name || d.customer_name || ''}` : 'Loading…';
  return (
    <Modal title={title} onClose={onClose} wide>
      {!d && !err && <p className="text-slate-500">Loading…</p>}
      {err && !d && <p className="rounded-lg bg-rose-50 p-3 text-rose-700">{err}</p>}
      {d && <div className="space-y-4">
        {ok && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">{ok}</p>}
        {err && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{err}</p>}

        {kind === 'customer' && <>
          <div className="grid gap-4 md:grid-cols-2">
            <Sec title="Customer information" right={<Badge v={d.customer_type} />}>
              <dl><Row k="Name">{d.name}</Row><Row k="Phone">{d.phone && <span>{d.phone} · <a className="text-[#1f5c3a] hover:underline" href={`tel:${d.phone}`}>Call</a> · <a className="text-[#1f5c3a] hover:underline" href={waLink(d.phone)} target="_blank" rel="noreferrer">WhatsApp</a></span>}</Row><Row k="Email">{d.email}</Row><Row k="Address">{d.address}</Row><Row k="Customer since">{fdate(d.created_at)}</Row><Row k="Internal remarks">{d.remarks}</Row></dl>
            </Sec>
            <Sec title="Interested properties"><Mini rows={(d.interested_properties || []).map((p: any) => ({ key: p.id, a: p.name, b: p.code }))} /></Sec>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Sec title={`Enquiry history (${d.enquiries.length})`}><Mini rows={d.enquiries.map((e: any) => ({ key: e.id, to: `/admin/crm/enquiries?view=${e.id}`, a: e.code, b: label(e.enquiry_type || e.source), c: <Badge v={e.status} /> }))} /></Sec>
            <Sec title={`Lead history (${d.leads.length})`}><Mini rows={d.leads.map((l: any) => ({ key: l.id, to: `/admin/crm/leads?view=${l.id}`, a: l.code, b: label(l.lead_type), c: <Badge v={l.status} /> }))} /></Sec>
            <Sec title={`Site visit history (${d.site_visits.length})`}><Mini rows={d.site_visits.map((v: any) => ({ key: v.id, a: v.code, b: `${dt(v.visit_date)} ${v.property_name || ''}`, c: <Badge v={v.status} /> }))} /></Sec>
            <Sec title={`Proposals (${d.proposals.length})`}><Mini rows={d.proposals.map((p: any) => ({ key: p.id, to: `/admin/crm/proposals?view=${p.id}`, a: p.code, b: money(p.negotiated_price ?? p.quoted_price), c: <Badge v={p.approval_status} /> }))} /></Sec>
            <Sec title={`Booking history (${d.bookings.length})`}><Mini rows={d.bookings.map((b: any) => ({ key: b.id, to: `/admin/crm/bookings?view=${b.id}`, a: b.code, b: `${money(b.paid_amount)} of ${money(b.total_amount)}`, c: <Badge v={b.status} /> }))} /></Sec>
            <Sec title="Documents">{d.documents?.length ? <ul className="text-sm">{d.documents.map((x: any, i: number) => <li key={i}><a className="text-[#1f5c3a] hover:underline" href={x.url} target="_blank" rel="noreferrer">{x.name}</a></li>)}</ul> : <None>No agreements or proposal documents yet.</None>}</Sec>
          </div>
          {can('customers.edit') && <Sec title="Internal remarks"><RemarksEdit value={d.remarks || ''} onSave={(v) => put({ remarks: v }, 'Remarks saved')} /></Sec>}
        </>}

        {kind === 'lead' && <>
          <div className="grid gap-4 md:grid-cols-2">
            <Sec title="Lead details" right={<Badge v={d.status} />}>
              <dl><Row k="Customer">{d.customer_id ? <span>{d.name} <span className="text-slate-400">({d.customer_code})</span></span> : d.name}</Row><Row k="Contact">{[d.phone, d.email].filter(Boolean).join(' · ')}</Row><Row k="Lead type">{label(d.lead_type)}</Row><Row k="Interested property">{d.property_name}</Row><Row k="Budget">{money(d.budget)}</Row><Row k="Priority"><Badge v={d.priority} /></Row><Row k="Executive">{d.assigned_name}</Row><Row k="Next follow-up">{dt(d.next_followup_date)}</Row>{d.enquiry_code && <Row k="From enquiry"><Link className="text-[#1f5c3a] hover:underline" to={`/admin/crm/enquiries?view=${d.enquiry_id}`}>{d.enquiry_code}</Link></Row>}{d.status === 'lost' && <Row k="Lost reason">{d.lost_reason}</Row>}</dl>
              {d.phone && <p className="mt-2 text-sm"><a className="text-[#1f5c3a] hover:underline" href={`tel:${d.phone}`}>Call</a> · <a className="text-[#1f5c3a] hover:underline" href={waLink(d.phone)} target="_blank" rel="noreferrer">WhatsApp</a></p>}
            </Sec>
            <Sec title="Pipeline">
              {can('leads.edit') ? <div className="space-y-3">
                <div className="flex flex-wrap gap-1.5">{LEAD_STATUS.filter((s) => s !== 'lost').map((s) => <button key={s} disabled={d.status === s} onClick={() => put({ status: s }, `Moved to ${label(s)}`)} className={`rounded-full border px-3 py-1 text-xs ${d.status === s ? 'border-[#1f5c3a] bg-[#1f5c3a] text-white' : 'border-slate-300 hover:bg-slate-50'}`}>{label(s)}</button>)}</div>
                <div className="flex gap-2"><input className={inputCls} placeholder="Reason, if this lead is lost" value={lostReason} onChange={(e) => setLostReason(e.target.value)} /><Btn disabled={!lostReason.trim() || d.status === 'lost'} onClick={() => put({ status: 'lost', lost_reason: lostReason.trim() }, 'Marked as lost')}>Mark lost</Btn></div>
                {can('leads.assign') && <div className="flex items-center gap-2"><label className="text-sm text-slate-600" htmlFor="la">Assign to</label><select id="la" className={inputCls} value={d.assigned_to ?? ''} onChange={(e) => put({ assigned_to: e.target.value ? Number(e.target.value) : null }, 'Lead assigned')}><option value="">— Unassigned —</option>{users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>}
                <div className="flex items-center gap-2"><label className="text-sm text-slate-600" htmlFor="lp">Priority</label><select id="lp" className={inputCls} value={d.priority} onChange={(e) => put({ priority: e.target.value }, 'Priority updated')}>{['low', 'medium', 'high'].map((p) => <option key={p} value={p}>{label(p)}</option>)}</select></div>
              </div> : <None>You can view this lead but not change it.</None>}
            </Sec>
          </div>
          {can('leads.edit') && <Sec title="Add call note / follow-up">
            <form onSubmit={addNote} className="grid gap-2 sm:grid-cols-[140px_1fr_170px_auto]"><select className={inputCls} value={note.kind} onChange={(e) => setNote({ ...note, kind: e.target.value })} aria-label="Type"><option value="note">Note</option><option value="call">Call note</option><option value="followup">Follow-up</option></select>
              <input className={inputCls} required placeholder="What was discussed?" value={note.body} onChange={(e) => setNote({ ...note, body: e.target.value })} aria-label="Note" /><input className={inputCls} type="date" value={note.next} onChange={(e) => setNote({ ...note, next: e.target.value })} aria-label="Next follow-up date" title="Next follow-up date" /><Btn v="primary" disabled={busy}>{busy ? 'Saving…' : 'Add'}</Btn></form>
          </Sec>}
          <div className="grid gap-4 md:grid-cols-2">
            <Sec title="Follow-up history & timeline">{d.activities.length ? <ol className="space-y-2 border-l-2 border-slate-200 pl-4">{d.activities.map((a: any) => <li key={a.id} className="text-sm"><span className="text-xs text-slate-400">{fdate(a.created_at)} · {a.user_name || 'System'}</span><br />
              <b className="capitalize">{a.kind === 'status' ? `${label(a.from_status)} → ${label(a.to_status)}` : label(a.kind)}</b>{a.body ? <span className="text-slate-600"> — {a.body}</span> : null}</li>)}</ol> : <None />}</Sec>
            <div className="space-y-4">
              <Sec title={`Site visits (${d.site_visits.length})`}><Mini rows={d.site_visits.map((v: any) => ({ key: v.id, a: v.code, b: dt(v.visit_date), c: <Badge v={v.status} /> }))} /></Sec>
              <Sec title={`Proposals (${d.proposals.length})`}><Mini rows={d.proposals.map((p: any) => ({ key: p.id, to: `/admin/crm/proposals?view=${p.id}`, a: p.code, b: money(p.negotiated_price ?? p.quoted_price), c: <Badge v={p.approval_status} /> }))} /></Sec>
              <Sec title={`Bookings (${d.bookings.length})`}><Mini rows={d.bookings.map((b: any) => ({ key: b.id, to: `/admin/crm/bookings?view=${b.id}`, a: b.code, b: money(b.total_amount), c: <Badge v={b.status} /> }))} /></Sec>
              <Sec title={`Tasks (${d.tasks.length})`}><Mini rows={d.tasks.map((t: any) => ({ key: t.id, a: t.title, b: dt(t.due_date), c: <Badge v={t.status} /> }))} /></Sec>
            </div>
          </div>
        </>}

        {kind === 'proposal' && <>
          <div className="grid gap-4 md:grid-cols-2">
            <Sec title="Proposal" right={<Badge v={d.approval_status} />}>
              <dl><Row k="Customer">{d.customer_name}</Row><Row k="Property / parcel">{[d.property_name, d.parcel_number && `Parcel ${d.parcel_number}`].filter(Boolean).join(' · ')}</Row><Row k="Quoted price">{money(d.quoted_price)}</Row><Row k="Negotiated price">{money(d.negotiated_price)}</Row><Row k="Advance">{money(d.advance_amount)}</Row><Row k="Payment terms">{d.payment_terms}</Row><Row k="Valid until">{dt(d.valid_until)}{Number(d.expired) ? <span className="ml-2 text-rose-600">expired</span> : null}</Row><Row k="Document">{d.document_url && <a className="text-[#1f5c3a] hover:underline" href={d.document_url} target="_blank" rel="noreferrer">Open document</a>}</Row><Row k="Approved by">{d.approved_by_name && `${d.approved_by_name} · ${fdate(d.approved_at)}`}</Row><Row k="Remarks">{d.remarks}</Row></dl>
            </Sec>
            <Sec title="Actions">
              <div className="flex flex-wrap gap-2">
                {d.approval_status === 'draft' && can('proposals.edit') && <Btn v="primary" onClick={() => put({ approval_status: 'pending' }, 'Sent for approval')}>Submit for approval</Btn>}
                {d.approval_status === 'pending' && can('proposals.approve') && <><Btn v="primary" onClick={() => put({ approval_status: 'approved' }, 'Proposal approved')}>Approve</Btn><Btn v="danger" onClick={() => put({ approval_status: 'rejected' }, 'Proposal rejected')}>Reject</Btn></>}
                {d.approval_status === 'approved' && can('bookings.create') && !d.bookings.length && <Link to={`/admin/crm/bookings?fromProposal=${d.id}`} className="rounded-lg bg-[#1f5c3a] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#184a2f]">Create booking</Link>}
                {d.approval_status === 'pending' && !can('proposals.approve') && <None>Waiting for an approver.</None>}
              </div>
              <h5 className="mt-4 text-sm font-semibold text-slate-500">Bookings from this proposal</h5><Mini rows={d.bookings.map((b: any) => ({ key: b.id, to: `/admin/crm/bookings?view=${b.id}`, a: b.code, b: money(b.total_amount), c: <Badge v={b.status} /> }))} />
            </Sec>
          </div>
        </>}

        {kind === 'booking' && <>
          <div className="grid gap-4 md:grid-cols-2">
            <Sec title="Booking" right={<span className="flex gap-1.5"><Badge v={d.payment_status} /><Badge v={d.status} /></span>}>
              <dl><Row k="Customer">{d.customer_name}{d.customer_phone ? ` · ${d.customer_phone}` : ''}</Row><Row k="Property / parcel">{[d.property_name, d.parcel_number && `Parcel ${d.parcel_number}`].filter(Boolean).join(' · ')}</Row><Row k="Booking date">{dt(d.booking_date)}</Row><Row k="Proposal">{d.proposal_code}</Row><Row k="Total amount">{money(d.total_amount)}</Row><Row k="Booking amount">{money(d.booking_amount)}</Row><Row k="Paid">{money(d.paid_amount)}</Row><Row k="Balance"><b>{money(d.balance_amount)}</b></Row><Row k="Agreement">{d.agreement_url && <a className="text-[#1f5c3a] hover:underline" href={d.agreement_url} target="_blank" rel="noreferrer">Open agreement</a>}</Row><Row k="Remarks">{d.remarks}</Row></dl>
              {can('bookings.edit') && !['cancelled', 'deal_closed'].includes(d.status) && <div className="mt-3 flex flex-wrap gap-2">{d.status === 'booked' && <Btn onClick={() => put({ status: 'confirmed' }, 'Booking confirmed')}>Confirm booking</Btn>}<Btn v="primary" disabled={Number(d.balance_amount) > 0} title={Number(d.balance_amount) > 0 ? 'Collect the full balance first' : ''} onClick={() => put({ status: 'deal_closed' }, 'Deal closed — property marked as sold')}>Close deal</Btn><Btn v="danger" onClick={() => { if (window.confirm('Cancel this booking? The land will become available again.')) put({ status: 'cancelled' }, 'Booking cancelled'); }}>Cancel booking</Btn></div>}
            </Sec>
            <Sec title="Payment history">
              {d.payments.length ? <table className="w-full text-sm"><thead><tr className="text-left text-xs uppercase text-slate-500"><th className="py-1">Date</th><th>Amount</th><th>Mode</th><th>Ref</th><th>By</th></tr></thead><tbody>{d.payments.map((p: any) => <tr key={p.id} className="border-t border-slate-100"><td className="py-1.5">{dt(p.paid_on)}</td><td className="font-medium">{money(p.amount)}</td><td>{label(p.mode)}</td><td>{p.reference || '—'}</td><td>{p.received_by_name || '—'}</td></tr>)}</tbody></table> : <None>No payments recorded yet.</None>}
              {can('payments.create') && d.status !== 'cancelled' && Number(d.balance_amount) > 0 && <form onSubmit={addPay} className="mt-4 grid gap-2 sm:grid-cols-2"><h5 className="text-sm font-semibold text-slate-600 sm:col-span-2">Record a payment</h5>
                <input className={inputCls} type="number" step="any" min="0" required placeholder="Amount (₹)" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} aria-label="Amount" /><input className={inputCls} type="date" required value={pay.paid_on} onChange={(e) => setPay({ ...pay, paid_on: e.target.value })} aria-label="Payment date" />
                <select className={inputCls} value={pay.mode} onChange={(e) => setPay({ ...pay, mode: e.target.value })} aria-label="Mode">{['bank_transfer', 'upi', 'cash', 'cheque', 'card', 'other'].map((m) => <option key={m} value={m}>{label(m)}</option>)}</select><input className={inputCls} placeholder="Reference / UTR" value={pay.reference} onChange={(e) => setPay({ ...pay, reference: e.target.value })} aria-label="Reference" />
                <div className="sm:col-span-2"><Btn v="primary" disabled={busy}>{busy ? 'Saving…' : 'Record payment'}</Btn></div></form>}
            </Sec>
          </div>
        </>}
      </div>}
    </Modal>
  );
};

const RemarksEdit: React.FC<{ value: string; onSave: (v: string) => void }> = ({ value, onSave }) => {
  const [v, setV] = useState(value);
  return <div className="space-y-2"><textarea className={inputCls} rows={3} value={v} onChange={(e) => setV(e.target.value)} aria-label="Internal remarks" /><Btn disabled={v === value} onClick={() => onSave(v)}>Save remarks</Btn></div>;
};
export default RecordDetail;
