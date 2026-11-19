import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from './api';
import { useSession } from './session';
import { Badge, Btn, fdate, inputCls, label, Modal } from './ui';

const STATUSES = ['new', 'assigned', 'contacted', 'followup_pending', 'interested', 'site_visit_scheduled', 'negotiation', 'converted', 'not_interested', 'closed'];
type TL = { at: string; kind: string; text: string; by?: string; tone: string };

const Row: React.FC<{ k: string; children: React.ReactNode }> = ({ k, children }) => (<div className="grid grid-cols-[130px_1fr] gap-2 py-1 text-sm"><dt className="text-slate-500">{k}</dt><dd className="min-w-0 break-words text-slate-800">{children || '—'}</dd></div>);
const Sec: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (<section className="rounded-xl border border-slate-200 p-4"><h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#1f5c3a]">{title}</h4>{children}</section>);

const EnquiryDetail: React.FC<{ id: number; onClose: () => void; focusFollowup?: boolean }> = ({ id, onClose, focusFollowup }) => {
  const { can } = useSession();
  const [e, setE] = useState<any>(null); const [err, setErr] = useState(''); const [ok, setOk] = useState('');
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
  const [lm, setLm] = useState<any>(null); const [saving, setSaving] = useState(false);
  const [f, setF] = useState({ type: 'call', notes: '', followup_date: '' }); const [busy, setBusy] = useState(false);
  const fuRef = useRef<HTMLDivElement>(null);
  const load = useCallback(() => api(`/enquiries/${id}`).then((d: any) => { setE(d); setLm({ status: d.status, priority: d.priority, assigned_to: d.assigned_to ?? '', manager_id: d.manager_id ?? '', next_followup_at: d.next_followup_at ? String(d.next_followup_at).replace(' ', 'T').slice(0, 16) : '', internal_remarks: d.internal_remarks || '', conversion_notes: d.conversion_notes || '' }); }).catch((x) => setErr(x.message)), [id]);
  useEffect(() => { load(); api<any>('/lookups').then((l) => setUsers(l.users || [])).catch(() => {}); }, [load]);
  useEffect(() => { if (e && focusFollowup) fuRef.current?.scrollIntoView({ block: 'center' }); }, [e, focusFollowup]);
  const canEdit = can('enquiries.edit'), canAssign = can('enquiries.assign');

  const saveLm = async (ev: React.FormEvent) => {
    ev.preventDefault(); setSaving(true); setErr(''); setOk('');
    const body: Record<string, any> = { status: lm.status, priority: lm.priority, next_followup_at: lm.next_followup_at || null, internal_remarks: lm.internal_remarks || null, conversion_notes: lm.conversion_notes || null };
    if (canAssign) { body.assigned_to = lm.assigned_to ? Number(lm.assigned_to) : null; body.manager_id = lm.manager_id ? Number(lm.manager_id) : null; }
    try { await api(`/enquiries/${id}`, { method: 'PUT', body }); setOk('Lead updated'); await load(); } catch (x: any) { setErr(x.message); } finally { setSaving(false); }
  };
  const add = async (ev: React.FormEvent) => {
    ev.preventDefault(); setBusy(true); setErr('');
    try { await api(`/enquiries/${id}/followups`, { body: { ...f, followup_date: f.followup_date || null } }); setF({ type: 'call', notes: '', followup_date: '' }); setOk('Follow-up added'); await load(); } catch (x: any) { setErr(x.message); } finally { setBusy(false); }
  };
  const toggle = async (fid: number, done: boolean) => { await api(`/followups/${fid}`, { method: 'PATCH', body: { done } }); load(); };

  const timeline = useMemo<TL[]>(() => {
    if (!e) return [];
    const t: TL[] = [{ at: String(e.created_at), kind: 'Enquiry received', text: `Received${e.form_name ? ` via “${e.form_name}”` : ''}${e.website_page ? ` on ${e.website_page}` : ''}`, tone: 'bg-sky-500' }];
    (e.assignments || []).forEach((a: any) => t.push({ at: String(a.created_at), kind: 'Lead assigned', text: `Assigned to ${a.assigned_to_name}${a.assigned_by_name ? ` by ${a.assigned_by_name}` : ''}`, tone: 'bg-violet-500' }));
    (e.status_history || []).filter((h: any) => h.from_status).forEach((h: any) => t.push({ at: String(h.created_at), kind: h.to_status === 'converted' ? 'Converted' : h.to_status === 'site_visit_scheduled' ? 'Site visit scheduled' : 'Status changed', text: `${label(h.from_status)} → ${label(h.to_status)}`, by: h.user_name, tone: h.to_status === 'converted' ? 'bg-emerald-600' : 'bg-amber-500' }));
    (e.followups || []).forEach((x: any) => t.push({ at: String(x.created_at), kind: /^Repeat enquiry/.test(x.notes || '') ? 'Repeat enquiry' : `Follow-up (${x.type})`, text: [x.notes, x.followup_date && `Next: ${fdate(x.followup_date)}`].filter(Boolean).join(' — '), by: x.user_name, tone: 'bg-slate-500' }));
    (e.site_visits || []).forEach((v: any) => t.push({ at: `${String(v.visit_date).slice(0, 10)} 00:00:00`, kind: 'Site visit', text: `${v.code} on ${String(v.visit_date).slice(0, 10)} (${label(v.status)})`, tone: 'bg-teal-600' }));
    return t.sort((a, b) => (a.at < b.at ? 1 : -1));
  }, [e]);

  const prev: any[] = e?.previous_enquiries || [];
  return (
    <Modal title={e ? `${e.code} — ${e.name}` : 'Enquiry'} onClose={onClose} wide>
      {err && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{err}</p>}
      {ok && <p className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">{ok}</p>}
      {!e ? <p className="text-slate-500">Loading…</p> : (
        <div className="space-y-4">
          {(prev.length > 0 || e.repeat_count > 0) && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900" role="note">
              <b>Duplicate / repeat customer.</b> {prev.length > 0 && <>This customer has {prev.length} other enquir{prev.length === 1 ? 'y' : 'ies'}: {prev.slice(0, 5).map((p) => `${p.code} (${label(p.status)})`).join(', ')}. </>}{e.repeat_count > 0 && <>{e.repeat_count} further submission(s) of this same enquiry were added to its history.</>}
            </p>)}
          <div className="grid gap-4 lg:grid-cols-2">
            <Sec title="Customer information"><dl>
              <Row k="Name">{e.name}</Row><Row k="Phone">{e.phone && <a className="text-[#1f5c3a] hover:underline" href={`tel:${e.phone}`}>{e.phone}</a>}</Row>
              <Row k="Email">{e.email && <a className="text-[#1f5c3a] hover:underline" href={`mailto:${e.email}`}>{e.email}</a>}</Row><Row k="Location">{e.location}</Row><Row k="Address">{e.address}</Row>
            </dl></Sec>
            <Sec title="Enquiry information"><dl>
              <Row k="Enquiry ID">{e.code}</Row><Row k="Enquiry type">{e.enquiry_type || label(e.source)}</Row><Row k="Source">{label(e.source)}</Row><Row k="Form name">{e.form_name}</Row><Row k="Website page">{e.website_page}</Row>
              <Row k="Property">{e.property_name || e.property_title}</Row><Row k="Project">{e.interested_project}</Row><Row k="Budget">{e.budget}</Row><Row k="Land area">{e.preferred_area}</Row><Row k="Preferred location">{e.preferred_location}</Row>
              <Row k="Submitted">{fdate(e.created_at)}</Row><Row k="Last updated">{fdate(e.updated_at)}</Row>
            </dl></Sec>
          </div>
          <Sec title="Customer message"><p className="whitespace-pre-wrap text-sm">{e.message || 'No message'}</p>
            {e.form_data && <dl className="mt-3 border-t border-slate-100 pt-2">{Object.entries(e.form_data).map(([k, v]) => <Row key={k} k={k}>{String(v)}</Row>)}</dl>}</Sec>

          <Sec title="Lead management">
            {can('leads.create') && <div className="mb-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">{e.lead_id ? <span>This enquiry is a lead · <Link className="font-medium text-[#1f5c3a] hover:underline" to={`/admin/crm/leads?view=${e.lead_id}`}>Open lead</Link></span> : <span className="text-slate-600">Ready to work this enquiry as a sales lead?</span>}{!e.lead_id && <Btn disabled={saving} onClick={async () => { setSaving(true); setErr(''); setOk(''); try { const x = await api<any>('/leads/convert', { method: 'POST', body: { enquiry_id: id } }); setOk(`Converted to lead ${x.code}`); await load(); } catch (z: any) { setErr(z.message); } finally { setSaving(false); } }}>Convert to lead</Btn>}</div>}
            <div className="mb-3 flex flex-wrap items-center gap-2 text-sm"><span className="text-slate-500">Current status</span><Badge v={e.status} /><Badge v={e.priority} />{e.assigned_name && <span className="text-slate-500">· {e.assigned_name}{e.assigned_by_name ? ` (assigned by ${e.assigned_by_name}${e.assigned_at ? `, ${fdate(e.assigned_at)}` : ''})` : ''}</span>}</div>
            {lm && <form onSubmit={saveLm} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm font-medium">Status<select className={inputCls + ' mt-1'} disabled={!canEdit} value={lm.status} onChange={(x) => setLm({ ...lm, status: x.target.value })}>{STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select></label>
              <label className="text-sm font-medium">Priority<select className={inputCls + ' mt-1'} disabled={!canEdit} value={lm.priority} onChange={(x) => setLm({ ...lm, priority: x.target.value })}>{['low', 'medium', 'high'].map((s) => <option key={s} value={s}>{label(s)}</option>)}</select></label>
              <label className="text-sm font-medium">Next follow-up<input type="datetime-local" className={inputCls + ' mt-1'} disabled={!canEdit} value={lm.next_followup_at} onChange={(x) => setLm({ ...lm, next_followup_at: x.target.value })} /></label>
              <label className="text-sm font-medium">Assigned executive<select className={inputCls + ' mt-1'} disabled={!canAssign} value={lm.assigned_to} onChange={(x) => setLm({ ...lm, assigned_to: x.target.value })}><option value="">Unassigned</option>{users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
              <label className="text-sm font-medium">Assigned manager<select className={inputCls + ' mt-1'} disabled={!canAssign} value={lm.manager_id} onChange={(x) => setLm({ ...lm, manager_id: x.target.value })}><option value="">None</option>{users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
              <label className="text-sm font-medium sm:col-span-2 lg:col-span-3">Internal notes<textarea rows={2} className={inputCls + ' mt-1'} disabled={!canEdit} value={lm.internal_remarks} onChange={(x) => setLm({ ...lm, internal_remarks: x.target.value })} placeholder="Visible to staff only" /></label>
              {lm.status === 'converted' && <label className="text-sm font-medium sm:col-span-2 lg:col-span-3">Conversion details<textarea rows={2} className={inputCls + ' mt-1'} disabled={!canEdit} value={lm.conversion_notes} onChange={(x) => setLm({ ...lm, conversion_notes: x.target.value })} placeholder="Property, price, booking details…" /></label>}
              {canEdit && <div className="sm:col-span-2 lg:col-span-3"><Btn v="primary" disabled={saving}>{saving ? 'Saving…' : 'Save lead changes'}</Btn></div>}
            </form>}
          </Sec>

          <div className="grid gap-4 lg:grid-cols-2">
            <Sec title="Activity timeline">
              <ol className="space-y-3 border-l border-slate-200 pl-4">{timeline.map((t, i) => (
                <li key={i} className="relative text-sm"><span className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ${t.tone}`} /><div className="font-medium">{t.kind}</div>
                  <div className="whitespace-pre-wrap text-slate-600">{t.text}</div><div className="text-xs text-slate-400">{fdate(t.at)}{t.by ? ` · ${t.by}` : ''}</div></li>))}</ol>
            </Sec>
            <div ref={fuRef}><Sec title="Follow-ups">
              {can('followups.create') && (
                <form onSubmit={add} className="mb-4 space-y-2 rounded-lg border border-slate-200 p-3">
                  <div className="flex gap-2"><select className={inputCls} value={f.type} onChange={(x) => setF({ ...f, type: x.target.value })}>{['call', 'whatsapp', 'email', 'visit', 'note'].map((t) => <option key={t}>{t}</option>)}</select>
                    <input className={inputCls} type="datetime-local" value={f.followup_date} onChange={(x) => setF({ ...f, followup_date: x.target.value })} title="Next follow-up" /></div>
                  <textarea className={inputCls} rows={2} placeholder="Notes / outcome" value={f.notes} onChange={(x) => setF({ ...f, notes: x.target.value })} />
                  <Btn v="primary" disabled={busy}>{busy ? 'Saving…' : 'Add follow-up'}</Btn>
                </form>)}
              <ul className="space-y-2 text-sm">{(e.followups || []).map((x: any) => (
                <li key={x.id} className="rounded-lg border border-slate-200 p-2.5"><div className="flex justify-between text-xs text-slate-500"><span>{x.type} · {x.user_name || 'System'} · {fdate(x.created_at)}</span>
                  {x.followup_date && <label className="flex items-center gap-1"><input type="checkbox" checked={!!x.done} disabled={!can('followups.edit')} onChange={(ev) => toggle(x.id, ev.target.checked)} /> due {fdate(x.followup_date)}</label>}</div>{x.notes && <p className="mt-1 whitespace-pre-wrap">{x.notes}</p>}</li>))}
                {!e.followups?.length && <li className="text-slate-500">No follow-ups yet.</li>}</ul>
            </Sec></div>
          </div>
          {prev.length > 0 && <Sec title="Other enquiries from this customer"><ul className="space-y-1 text-sm">{prev.map((p) => <li key={p.id}>{p.code} — {p.enquiry_type || label(p.source)} · <Badge v={p.status} /> <span className="text-slate-400">{fdate(p.created_at)}</span></li>)}</ul></Sec>}
        </div>)}
    </Modal>
  );
};
export default EnquiryDetail;
