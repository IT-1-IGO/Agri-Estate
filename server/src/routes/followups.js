import express from 'express';
import { query } from '../db.js';
import { requirePerm, can } from '../auth.js';
import { logActivity } from '../activity.js';

const r = express.Router();
const TYPES = ['call', 'whatsapp', 'email', 'visit', 'note'];

r.get('/followups', requirePerm('followups.view'), async (req, res, next) => {
  try {
    const where = ['e.deleted_at IS NULL', 'f.followup_date IS NOT NULL']; const p = [];
    if (!can(req, 'enquiries.view_all')) { where.push('(e.assigned_to=? OR e.created_by=?)'); p.push(req.user.id, req.user.id); }
    if (req.query.done === '1' || req.query.done === '0') { where.push('f.done=?'); p.push(req.query.done); }
    if (req.query.when === 'overdue') where.push('f.done=0 AND f.followup_date < NOW()');
    if (req.query.when === 'today') where.push('DATE(f.followup_date)=CURDATE()');
    if (req.query.when === 'upcoming') where.push('f.followup_date >= NOW()');
    res.json({ data: await query(`SELECT f.id, f.enquiry_id, e.code AS enquiry_code, e.name AS customer, e.phone, f.type, f.notes, f.followup_date, f.done, u.name AS user_name
      FROM followups f JOIN enquiries e ON e.id=f.enquiry_id LEFT JOIN users u ON u.id=f.user_id WHERE ${where.join(' AND ')} ORDER BY f.done, f.followup_date LIMIT 300`, p) });
  } catch (e) { next(e); }
});

async function ownEnquiry(req, id) {
  const [e] = await query('SELECT id, assigned_to, created_by, status FROM enquiries WHERE id=? AND deleted_at IS NULL', [id]);
  if (!e) return null;
  if (!can(req, 'enquiries.view_all') && e.assigned_to !== req.user.id && e.created_by !== req.user.id) return null;
  return e;
}

r.post('/enquiries/:id(\\d+)/followups', requirePerm('followups.create'), async (req, res, next) => {
  try {
    const e = await ownEnquiry(req, req.params.id);
    if (!e) return res.status(404).json({ error: 'Enquiry not found' });
    const b = req.body || {};
    if (!TYPES.includes(b.type)) return res.status(422).json({ error: 'Choose a valid follow-up type', fields: { type: 'Invalid' } });
    const d = b.followup_date ? new Date(b.followup_date) : null;
    if (b.followup_date && isNaN(d)) return res.status(422).json({ error: 'Invalid follow-up date', fields: { followup_date: 'Invalid date' } });
    if (!b.notes && !d) return res.status(422).json({ error: 'Add notes or a follow-up date', fields: { notes: 'Required' } });
    const ins = await query('INSERT INTO followups (enquiry_id, user_id, type, notes, outcome, followup_date) VALUES (?,?,?,?,?,?)',
      [e.id, req.user.id, b.type, String(b.notes || '').slice(0, 2000) || null, String(b.outcome || '').slice(0, 160) || null, d ? d.toISOString().slice(0, 19).replace('T', ' ') : null]);
    if (d) await query('UPDATE enquiries SET next_followup_at=?, status=IF(status IN (\'new\',\'assigned\',\'contacted\'),\'followup_pending\',status) WHERE id=?', [d.toISOString().slice(0, 19).replace('T', ' '), e.id]);
    else if (e.status === 'new' || e.status === 'assigned') await query("UPDATE enquiries SET status='contacted' WHERE id=?", [e.id]);
    await logActivity(req, 'followups', 'create', ins.insertId, null, { enquiry_id: e.id, ...b });
    res.status(201).json({ id: ins.insertId });
  } catch (e) { next(e); }
});

r.patch('/followups/:id(\\d+)', requirePerm('followups.edit'), async (req, res, next) => {
  try {
    const [f] = await query('SELECT id, enquiry_id, done FROM followups WHERE id=?', [req.params.id]);
    if (!f || !(await ownEnquiry(req, f.enquiry_id))) return res.status(404).json({ error: 'Not found' });
    const done = req.body?.done ? 1 : 0;
    await query('UPDATE followups SET done=? WHERE id=?', [done, f.id]);
    if (done) await query('UPDATE enquiries e SET next_followup_at=(SELECT MIN(followup_date) FROM followups WHERE enquiry_id=e.id AND done=0 AND followup_date IS NOT NULL) WHERE e.id=?', [f.enquiry_id]);
    await logActivity(req, 'followups', done ? 'complete' : 'reopen', f.id, { done: f.done }, { done });
    res.json({ ok: true });
  } catch (e) { next(e); }
});
export default r;
