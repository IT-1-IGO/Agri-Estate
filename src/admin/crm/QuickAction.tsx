import React, { useState } from 'react';
import { api } from './api';
import { Btn, inputCls, label, Modal } from './ui';

const STATUSES = ['new', 'assigned', 'contacted', 'followup_pending', 'interested', 'site_visit_scheduled', 'negotiation', 'converted', 'not_interested', 'closed'];

/** One-step "Assign lead" and "Update status" dialogs for the enquiry table. */
const QuickAction: React.FC<{ kind: 'assign' | 'status'; row: any; lookups: Record<string, { id: number; name: string }[]>; onClose: () => void; onDone: (msg: string) => void }> = ({ kind, row, lookups, onClose, onDone }) => {
  const [assigned, setAssigned] = useState<string>(row.assigned_to ? String(row.assigned_to) : '');
  const [manager, setManager] = useState<string>(row.manager_id ? String(row.manager_id) : '');
  const [status, setStatus] = useState<string>(row.status);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      const body = kind === 'assign' ? { assigned_to: assigned ? Number(assigned) : null, manager_id: manager ? Number(manager) : null } : { status };
      if (kind === 'assign' && !assigned) { setErr('Choose an employee to assign this lead to.'); setBusy(false); return; }
      await api(`/enquiries/${row.id}`, { method: 'PUT', body });
      onDone(kind === 'assign' ? `${row.code} assigned` : `${row.code} status updated`);
    } catch (x: any) { setErr(x.message); setBusy(false); }
  };
  return (
    <Modal title={`${kind === 'assign' ? 'Assign lead' : 'Update status'} — ${row.code}`} onClose={onClose}>
      <form onSubmit={save} className="space-y-4">
        <p className="text-sm text-slate-600">{row.name} · {row.phone || row.email}</p>
        {kind === 'assign' ? (<>
          <label className="block text-sm font-medium">Assigned executive<select className={inputCls + ' mt-1'} value={assigned} onChange={(e) => setAssigned(e.target.value)}><option value="">Select employee…</option>{(lookups.users || []).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
          <label className="block text-sm font-medium">Assigned manager (optional)<select className={inputCls + ' mt-1'} value={manager} onChange={(e) => setManager(e.target.value)}><option value="">None</option>{(lookups.users || []).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
          <p className="text-xs text-slate-500">The employee is notified and the assignment is recorded in the lead history.</p>
        </>) : (
          <label className="block text-sm font-medium">Lead status<select className={inputCls + ' mt-1'} value={status} onChange={(e) => setStatus(e.target.value)}>{STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select></label>
        )}
        {err && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{err}</p>}
        <div className="flex justify-end gap-3"><Btn type="button" onClick={onClose}>Cancel</Btn><Btn v="primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</Btn></div>
      </form>
    </Modal>
  );
};
export default QuickAction;
