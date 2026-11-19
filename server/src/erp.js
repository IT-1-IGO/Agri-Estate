import express from 'express';
import { query, tx } from './db.js';
import { can, requirePerm } from './auth.js';
import { resourceRouter, validate } from './resource.js';
import { logActivity } from './activity.js';
import { notifyUsers, usersWithPerm } from './notify.js';
import { upsertCustomer, linkEnquiryCustomer, normPhone } from './customers.js';

const userJoin = (col, alias) => `LEFT JOIN users ${alias} ON ${alias}.id = t.${col}`;
const mine = (req) => ({ sql: '(t.assigned_to = ? OR t.created_by = ?)', params: [req.user.id, req.user.id] });
const scopeOwn = (module) => (req) => (can(req, `${module}.view_all`) ? { sql: '', params: [] } : mine(req));
const money = (n) => Math.round(Number(n || 0) * 100) / 100;
const today = () => new Date().toISOString().slice(0, 10);
const fail = (res, status, message, fields) => res.status(status).json({ error: message, ...(fields ? { fields } : {}) });

// ============================================================ Customers
const customerScope = (req) => (can(req, 'customers.view_all') ? { sql: '', params: [] } : {
  sql: '(t.created_by = ? OR EXISTS (SELECT 1 FROM leads l WHERE l.customer_id=t.id AND l.deleted_at IS NULL AND l.assigned_to=?) OR EXISTS (SELECT 1 FROM enquiries e WHERE e.customer_id=t.id AND e.deleted_at IS NULL AND e.assigned_to=?))',
  params: [req.user.id, req.user.id, req.user.id] });

async function duplicateCustomer(v, excludeId = 0) {
  const ph = v.phone ? normPhone(v.phone) : ''; const em = v.email ? String(v.email).toLowerCase() : '';
  const conds = []; const p = [];
  if (ph) { conds.push('phone=?'); p.push(ph); } if (em) { conds.push('email=?'); p.push(em); }
  if (!conds.length) return null;
  const [d] = await query(`SELECT id, code, name FROM customers WHERE deleted_at IS NULL AND id<>? AND (${conds.join(' OR ')}) LIMIT 1`, [excludeId, ...p]);
  return d || null;
}

export const customers = resourceRouter({
  module: 'customers', table: 'customers', prefix: 'CUS-',
  fields: [
    { name: 'name', label: 'Full name', type: 'string', required: true, max: 120 }, { name: 'phone', label: 'Phone', type: 'phone' }, { name: 'email', label: 'Email', type: 'email' },
    { name: 'address', label: 'Address', type: 'string', max: 300 }, { name: 'customer_type', type: 'enum', values: ['buyer', 'seller', 'investor', 'other'], default: 'buyer' }, { name: 'remarks', type: 'text' },
  ],
  select: '(SELECT COUNT(*) FROM enquiries e WHERE e.customer_id=t.id AND e.deleted_at IS NULL) AS enquiry_count, (SELECT COUNT(*) FROM leads l WHERE l.customer_id=t.id AND l.deleted_at IS NULL) AS lead_count, (SELECT COUNT(*) FROM bookings b WHERE b.customer_id=t.id AND b.deleted_at IS NULL AND b.status<>\'cancelled\') AS booking_count',
  search: ['t.name', 't.phone', 't.email', 't.code'], filters: ['customer_type'], scope: customerScope,
  exportCols: ['code', 'name', 'phone', 'email', 'address', 'customer_type', 'enquiry_count', 'lead_count', 'booking_count', 'remarks', 'created_at'],
  hooks: {
    beforeCreate: async (v) => {
      if (!v.phone && !v.email) return { errors: { phone: 'Enter a phone number or an email' }, message: 'A phone number or an email is required' };
      if (v.phone) v.phone = normPhone(v.phone);
      const d = await duplicateCustomer(v);
      if (d) return { errors: { phone: `Already exists as ${d.code} (${d.name})` }, message: `This customer already exists as ${d.code} — ${d.name}` };
    },
    beforeUpdate: async (v, prev) => {
      if (v.phone) v.phone = normPhone(v.phone);
      const d = await duplicateCustomer({ phone: v.phone ?? prev.phone, email: v.email ?? prev.email }, prev.id);
      if (d) return { errors: { phone: `Already exists as ${d.code} (${d.name})` }, message: `Another customer already uses this phone/email: ${d.code} — ${d.name}` };
    },
    decorate: async (row) => {
      const id = row.id;
      row.enquiries = await query('SELECT id, code, source, enquiry_type, status, property_title, interested_project, created_at FROM enquiries WHERE customer_id=? AND deleted_at IS NULL ORDER BY id DESC', [id]);
      row.leads = await query('SELECT id, code, lead_type, status, budget, created_at FROM leads WHERE customer_id=? AND deleted_at IS NULL ORDER BY id DESC', [id]);
      row.site_visits = await query('SELECT v.id, v.code, v.visit_date, v.visit_time, v.status, p.name AS property_name FROM site_visits v LEFT JOIN properties p ON p.id=v.property_id WHERE v.customer_id=? AND v.deleted_at IS NULL ORDER BY v.visit_date DESC', [id]);
      row.bookings = await query('SELECT b.id, b.code, b.booking_date, b.total_amount, b.paid_amount, b.payment_status, b.status, p.name AS property_name FROM bookings b LEFT JOIN properties p ON p.id=b.property_id WHERE b.customer_id=? AND b.deleted_at IS NULL ORDER BY b.id DESC', [id]);
      row.proposals = await query('SELECT id, code, quoted_price, negotiated_price, approval_status, created_at FROM proposals WHERE customer_id=? AND deleted_at IS NULL ORDER BY id DESC', [id]);
      row.interested_properties = await query(`SELECT DISTINCT p.id, p.code, p.name FROM properties p WHERE p.deleted_at IS NULL AND (p.id IN (SELECT property_id FROM enquiries WHERE customer_id=? AND property_id IS NOT NULL) OR p.id IN (SELECT property_id FROM leads WHERE customer_id=? AND property_id IS NOT NULL) OR p.id IN (SELECT property_id FROM site_visits WHERE customer_id=? AND property_id IS NOT NULL))`, [id, id, id]);
      row.documents = (await query('SELECT agreement_url AS url, code FROM bookings WHERE customer_id=? AND deleted_at IS NULL AND agreement_url IS NOT NULL', [id])).map((d) => ({ name: `Agreement ${d.code}`, url: d.url }))
        .concat((await query('SELECT document_url AS url, code FROM proposals WHERE customer_id=? AND deleted_at IS NULL AND document_url IS NOT NULL', [id])).map((d) => ({ name: `Proposal ${d.code}`, url: d.url })));
    },
  },
});

// ============================================================ Leads
const LEAD_STATUS = ['new', 'contacted', 'qualified', 'site_visit_scheduled', 'negotiation', 'won', 'lost'];
const leadScope = scopeOwn('leads');
const addLeadActivity = (conn, leadId, kind, body, userId, from = null, to = null) =>
  conn.query('INSERT INTO lead_activities (lead_id, kind, from_status, to_status, body, user_id) VALUES (?,?,?,?,?,?)', [leadId, kind, from, to, body || null, userId || null]);

/** Keeps the linked enquiry in step when its lead is won/lost (with status history). */
async function syncEnquiryFromLead(conn, lead, userId) {
  if (!lead.enquiry_id || !['won', 'lost'].includes(lead.status)) return;
  const to = lead.status === 'won' ? 'converted' : 'closed';
  const [[e]] = await conn.query('SELECT id, status FROM enquiries WHERE id=? AND deleted_at IS NULL', [lead.enquiry_id]);
  if (!e || e.status === to) return;
  await conn.query('UPDATE enquiries SET status=? WHERE id=?', [to, e.id]);
  await conn.query('INSERT INTO enquiry_status_history (enquiry_id, from_status, to_status, user_id, note) VALUES (?,?,?,?,?)', [e.id, e.status, to, userId, `Lead ${lead.status}`]).catch(() => {});
}

const leadCore = resourceRouter({
  module: 'leads', table: 'leads', prefix: 'LD-', defaultSort: 'created_at',
  fields: [
    { name: 'customer_id', label: 'Customer', type: 'fk' }, { name: 'enquiry_id', label: 'Enquiry', type: 'fk' },
    { name: 'name', label: 'Customer name', type: 'string', required: true, max: 120 }, { name: 'phone', label: 'Phone', type: 'phone' }, { name: 'email', label: 'Email', type: 'email' },
    { name: 'lead_type', type: 'enum', values: ['buyer', 'seller'], default: 'buyer' }, { name: 'property_id', label: 'Interested property', type: 'fk' },
    { name: 'budget', label: 'Budget', type: 'number' }, { name: 'priority', type: 'enum', values: ['low', 'medium', 'high'], default: 'medium' },
    { name: 'assigned_to', label: 'Assigned executive', type: 'fk' }, { name: 'next_followup_date', label: 'Next follow-up', type: 'date' },
    { name: 'status', type: 'enum', values: LEAD_STATUS, default: 'new' }, { name: 'lost_reason', label: 'Lost reason', type: 'string', max: 300 }, { name: 'notes', type: 'text' },
  ],
  select: 'ex.name AS assigned_name, pr.name AS property_name, cu.code AS customer_code, en.code AS enquiry_code',
  joins: `${userJoin('assigned_to', 'ex')} LEFT JOIN properties pr ON pr.id=t.property_id LEFT JOIN customers cu ON cu.id=t.customer_id LEFT JOIN enquiries en ON en.id=t.enquiry_id`,
  search: ['t.name', 't.phone', 't.email', 't.code'], filters: ['status', 'lead_type', 'priority', 'assigned_to', 'property_id'],
  scope: leadScope, extraSort: ['next_followup_date'],
  lockedOnUpdate: (req) => (can(req, 'leads.assign') ? [] : ['assigned_to']),
  exportCols: ['code', 'name', 'phone', 'email', 'lead_type', 'property_name', 'budget', 'priority', 'assigned_name', 'next_followup_date', 'status', 'lost_reason', 'enquiry_code', 'created_at'],
  hooks: {
    beforeCreate: async (v, req) => {
      if (!v.phone && !v.email) return { errors: { phone: 'Enter a phone number or an email' }, message: 'A phone number or an email is required' };
      if (v.status === 'lost' && !v.lost_reason) return { errors: { lost_reason: 'Enter the reason this lead was lost' }, message: 'Enter the lost reason' };
      if (v.enquiry_id) {
        const [d] = await query('SELECT id, code FROM leads WHERE enquiry_id=? AND deleted_at IS NULL', [v.enquiry_id]);
        if (d) return { errors: { enquiry_id: `Already converted as ${d.code}` }, message: `This enquiry is already a lead (${d.code})` };
      }
      if (!v.customer_id) v.customer_id = await upsertCustomer({ name: v.name, phone: v.phone, email: v.email, type: v.lead_type === 'seller' ? 'seller' : 'buyer', userId: req.user.id });
      if (v.phone) v.phone = normPhone(v.phone);
      if (!v.assigned_to || !can(req, 'leads.assign')) v.assigned_to = v.assigned_to && can(req, 'leads.assign') ? v.assigned_to : req.user.id;
    },
    afterCreate: async (conn, id, v, req) => {
      await addLeadActivity(conn, id, 'created', v.enquiry_id ? 'Converted from enquiry' : 'Lead created', req.user.id, null, v.status);
      if (v.enquiry_id) await conn.query('UPDATE enquiries SET lead_id=? WHERE id=?', [id, v.enquiry_id]);
      if (v.assigned_to && v.assigned_to !== req.user.id) await notifyUsers([v.assigned_to], 'New lead assigned', `${v.name} has been assigned to you`, `/admin/crm/leads?view=${id}`);
    },
    beforeUpdate: async (v, prev, req) => {
      const status = v.status ?? prev.status; const reason = 'lost_reason' in v ? v.lost_reason : prev.lost_reason;
      if (status === 'lost' && !reason) return { errors: { lost_reason: 'Enter the reason this lead was lost' }, message: 'Enter the lost reason' };
      if (v.phone) v.phone = normPhone(v.phone);
      if (status !== 'lost' && 'status' in v) v.lost_reason = null;
    },
    afterUpdate: async (conn, id, v, prev, req) => {
      if (v.status && v.status !== prev.status) {
        await addLeadActivity(conn, id, 'status', v.lost_reason || null, req.user.id, prev.status, v.status);
        await syncEnquiryFromLead(conn, { ...prev, ...v, id }, req.user.id);
        if (prev.assigned_to && prev.assigned_to !== req.user.id) await notifyUsers([prev.assigned_to], `Lead ${prev.code} is now ${v.status.replace(/_/g, ' ')}`, prev.name, `/admin/crm/leads?view=${id}`);
      }
      if ('assigned_to' in v && v.assigned_to !== prev.assigned_to) {
        const [[u]] = await conn.query('SELECT name FROM users WHERE id=?', [v.assigned_to]);
        await addLeadActivity(conn, id, 'assigned', `Assigned to ${u?.name || 'nobody'}`, req.user.id);
        if (v.assigned_to && v.assigned_to !== req.user.id) await notifyUsers([v.assigned_to], 'New lead assigned', `${prev.name} has been assigned to you`, `/admin/crm/leads?view=${id}`);
      }
    },
    decorate: async (row, req) => {
      row.activities = await query('SELECT a.id, a.kind, a.from_status, a.to_status, a.body, a.created_at, u.name AS user_name FROM lead_activities a LEFT JOIN users u ON u.id=a.user_id WHERE a.lead_id=? ORDER BY a.id DESC', [row.id]);
      row.tasks = await query('SELECT id, code, title, due_date, status FROM tasks WHERE lead_id=? AND deleted_at IS NULL ORDER BY due_date', [row.id]);
      row.site_visits = await query('SELECT id, code, visit_date, visit_time, status FROM site_visits WHERE lead_id=? AND deleted_at IS NULL ORDER BY visit_date DESC', [row.id]);
      row.proposals = await query('SELECT id, code, quoted_price, negotiated_price, approval_status FROM proposals WHERE lead_id=? AND deleted_at IS NULL ORDER BY id DESC', [row.id]);
      row.bookings = await query('SELECT id, code, total_amount, paid_amount, status FROM bookings WHERE lead_id=? AND deleted_at IS NULL ORDER BY id DESC', [row.id]);
    },
  },
});

export const leads = express.Router();
leads.get('/board', requirePerm('leads.view'), async (req, res, next) => {
  try {
    const sc = leadScope(req); const out = {};
    for (const s of LEAD_STATUS) {
      const w = `t.deleted_at IS NULL AND t.status=?${sc.sql ? ' AND ' + sc.sql : ''}`;
      const [{ total }] = await query(`SELECT COUNT(*) total FROM leads t WHERE ${w}`, [s, ...sc.params]);
      const rows = await query(`SELECT t.id, t.code, t.name, t.phone, t.priority, t.budget, t.lead_type, t.next_followup_date, t.assigned_to, ex.name AS assigned_name, pr.name AS property_name FROM leads t LEFT JOIN users ex ON ex.id=t.assigned_to LEFT JOIN properties pr ON pr.id=t.property_id WHERE ${w} ORDER BY t.updated_at DESC LIMIT 50`, [s, ...sc.params]);
      out[s] = { total, rows };
    }
    res.json(out);
  } catch (e) { next(e); }
});

/** Enquiry -> Lead. Idempotent: converting twice returns the existing lead. */
leads.post('/convert', requirePerm('leads.create'), async (req, res, next) => {
  try {
    const id = Number(req.body?.enquiry_id); if (!id) return fail(res, 422, 'Choose an enquiry to convert');
    const [e] = await query(`SELECT * FROM enquiries WHERE id=? AND deleted_at IS NULL`, [id]);
    if (!e) return fail(res, 404, 'Enquiry not found');
    if (!can(req, 'enquiries.view_all') && e.assigned_to !== req.user.id && e.created_by !== req.user.id) return fail(res, 403, 'You can only convert enquiries assigned to you');
    if (e.lead_id) { const [l] = await query('SELECT id, code FROM leads WHERE id=? AND deleted_at IS NULL', [e.lead_id]); if (l) return res.json({ ...l, existed: true }); }
    const customerId = e.customer_id || await linkEnquiryCustomer(e.id, req.user.id);
    const budget = e.budget ? Number(String(e.budget).replace(/[^\d.]/g, '')) || null : null;
    const assigned = e.assigned_to || req.user.id;
    const leadId = await tx(async (conn) => {
      const [ins] = await conn.query('INSERT INTO leads (customer_id, enquiry_id, name, phone, email, lead_type, property_id, budget, priority, assigned_to, next_followup_date, notes, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [customerId, e.id, e.name, normPhone(e.phone) || null, e.email || null, e.source === 'sell_land' ? 'seller' : 'buyer', e.property_id || null, budget, e.priority, assigned, e.next_followup_at ? String(e.next_followup_at).slice(0, 10) : null, e.message || null, req.user.id]);
      await conn.query("UPDATE leads SET code=CONCAT('LD-', LPAD(id,5,'0')) WHERE id=?", [ins.insertId]);
      await conn.query('UPDATE enquiries SET lead_id=?, customer_id=COALESCE(customer_id,?) WHERE id=?', [ins.insertId, customerId, e.id]);
      await addLeadActivity(conn, ins.insertId, 'created', `Converted from enquiry ${e.code}`, req.user.id, null, 'new');
      return ins.insertId;
    });
    if (assigned !== req.user.id) await notifyUsers([assigned], 'New lead assigned', `${e.name} (from ${e.code})`, `/admin/crm/leads?view=${leadId}`);
    const [l] = await query('SELECT id, code FROM leads WHERE id=?', [leadId]);
    await logActivity(req, 'leads', 'convert', leadId, null, { enquiry: e.code });
    res.status(201).json({ ...l, existed: false });
  } catch (err) { next(err); }
});

// call notes / notes / follow-ups on a lead
leads.post('/:id(\\d+)/activities', requirePerm('leads.edit'), async (req, res, next) => {
  try {
    const sc = leadScope(req);
    const [lead] = await query(`SELECT t.id, t.code, t.name, t.assigned_to FROM leads t WHERE t.deleted_at IS NULL AND t.id=?${sc.sql ? ' AND ' + sc.sql : ''}`, [req.params.id, ...sc.params]);
    if (!lead) return fail(res, 404, 'Not found');
    const kind = ['note', 'call', 'followup'].includes(req.body?.kind) ? req.body.kind : 'note';
    const body = String(req.body?.body || '').trim().slice(0, 2000);
    if (!body) return fail(res, 422, 'Enter some text', { body: 'Required' });
    let next_date = null;
    if (req.body?.next_followup_date) { const { values, errors } = validate([{ name: 'd', type: 'date' }], { d: req.body.next_followup_date }); if (errors.d) return fail(res, 422, 'Invalid follow-up date', { next_followup_date: errors.d }); next_date = values.d; }
    await tx(async (conn) => {
      await addLeadActivity(conn, lead.id, kind, body, req.user.id);
      if (next_date) { await conn.query('UPDATE leads SET next_followup_date=? WHERE id=?', [next_date, lead.id]); await addLeadActivity(conn, lead.id, 'followup', `Next follow-up set for ${next_date}`, req.user.id); }
    });
    await logActivity(req, 'leads', kind, lead.id, null, { body });
    res.status(201).json({ ok: true });
  } catch (e) { next(e); }
});
leads.use(leadCore);

// ============================================================ Proposals
const proposalScope = (req) => (can(req, 'proposals.view_all') ? { sql: '', params: [] } : {
  sql: '(t.created_by = ? OR EXISTS (SELECT 1 FROM leads l WHERE l.id=t.lead_id AND l.assigned_to=?))', params: [req.user.id, req.user.id] });
async function checkPropertyParcel(v, prev = {}) {
  const pid = v.property_id ?? prev.property_id; const parcel = v.parcel_id ?? prev.parcel_id;
  if (parcel) { const [p] = await query('SELECT id, property_id FROM land_parcels WHERE id=? AND deleted_at IS NULL', [parcel]); if (!p) return { errors: { parcel_id: 'Parcel not found' }, message: 'Parcel not found' }; if (pid && p.property_id !== pid) return { errors: { parcel_id: 'This parcel does not belong to the selected property' }, message: 'This parcel does not belong to the selected property' }; if (!pid) v.property_id = p.property_id; }
  return null;
}
const approverNotice = async (id, code, who) => notifyUsers(await usersWithPerm('proposals.approve'), `Proposal ${code} awaiting approval`, who || '', `/admin/crm/proposals?view=${id}`);

export const proposals = resourceRouter({
  module: 'proposals', table: 'proposals', prefix: 'PRO-',
  fields: [
    { name: 'customer_id', label: 'Customer', type: 'fk', required: true }, { name: 'lead_id', label: 'Lead', type: 'fk' }, { name: 'property_id', label: 'Property', type: 'fk' }, { name: 'parcel_id', label: 'Parcel', type: 'fk' },
    { name: 'quoted_price', label: 'Quoted price', type: 'number', required: true }, { name: 'negotiated_price', label: 'Negotiated price', type: 'number' }, { name: 'advance_amount', label: 'Advance amount', type: 'number' },
    { name: 'payment_terms', type: 'text' }, { name: 'valid_until', label: 'Valid until', type: 'date' }, { name: 'document_url', label: 'Proposal document URL', type: 'string', max: 500 },
    { name: 'approval_status', type: 'enum', values: ['draft', 'pending', 'approved', 'rejected'], default: 'draft' }, { name: 'remarks', type: 'text' },
  ],
  select: 'cu.name AS customer_name, cu.phone AS customer_phone, pr.name AS property_name, pc.parcel_number, ap.name AS approved_by_name, (t.valid_until IS NOT NULL AND t.valid_until < CURDATE()) AS expired',
  joins: `LEFT JOIN customers cu ON cu.id=t.customer_id LEFT JOIN properties pr ON pr.id=t.property_id LEFT JOIN land_parcels pc ON pc.id=t.parcel_id LEFT JOIN users ap ON ap.id=t.approved_by`,
  search: ['cu.name', 'cu.phone', 't.code', 'pr.name'], filters: ['approval_status', 'customer_id', 'property_id'], scope: proposalScope,
  exportCols: ['code', 'customer_name', 'property_name', 'parcel_number', 'quoted_price', 'negotiated_price', 'advance_amount', 'valid_until', 'approval_status', 'approved_by_name', 'created_at'],
  hooks: {
    beforeCreate: async (v, req) => {
      if (['approved', 'rejected'].includes(v.approval_status) && !can(req, 'proposals.approve')) return { errors: { approval_status: 'You cannot approve proposals' }, message: 'You do not have permission to approve proposals' };
      if (v.approval_status === 'approved') { v.approved_by = req.user.id; v.approved_at = new Date().toISOString().slice(0, 19).replace('T', ' '); }
      return checkPropertyParcel(v);
    },
    afterCreate: async (conn, id, v) => { if (v.approval_status === 'pending') { const [[c]] = await conn.query('SELECT code FROM proposals WHERE id=?', [id]); await approverNotice(id, c.code); } },
    beforeUpdate: async (v, prev, req) => {
      if (prev.approval_status === 'approved' && ('quoted_price' in v || 'negotiated_price' in v) && !can(req, 'proposals.approve')) return { errors: { quoted_price: 'Approved prices can only be changed by an approver' }, message: 'An approved proposal can only be changed by an approver' };
      if (v.approval_status && v.approval_status !== prev.approval_status) {
        if (['approved', 'rejected'].includes(v.approval_status)) {
          if (!can(req, 'proposals.approve')) return { errors: { approval_status: 'You cannot approve or reject proposals' }, message: 'You do not have permission to approve proposals' };
          v.approved_by = req.user.id; v.approved_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
        } else { v.approved_by = null; v.approved_at = null; }
      }
      return checkPropertyParcel(v, prev);
    },
    afterUpdate: async (conn, id, v, prev, req) => {
      if (!v.approval_status || v.approval_status === prev.approval_status) return;
      if (v.approval_status === 'pending') await approverNotice(id, prev.code);
      if (['approved', 'rejected'].includes(v.approval_status) && prev.created_by && prev.created_by !== req.user.id) await notifyUsers([prev.created_by], `Proposal ${prev.code} ${v.approval_status}`, null, `/admin/crm/proposals?view=${id}`);
    },
    decorate: async (row) => { row.bookings = await query('SELECT id, code, status, total_amount, paid_amount FROM bookings WHERE proposal_id=? AND deleted_at IS NULL', [row.id]); },
  },
});

// ============================================================ Bookings & payments
const bookingScope = (req) => (can(req, 'bookings.view_all') ? { sql: '', params: [] } : {
  sql: '(t.created_by = ? OR EXISTS (SELECT 1 FROM leads l WHERE l.id=t.lead_id AND l.assigned_to=?))', params: [req.user.id, req.user.id] });
const ACTIVE_BOOKING = ['booked', 'confirmed'];

/** Reserved while booked/confirmed, sold when the deal is closed, available again if cancelled. Parcel status rolls up to the property. */
async function applyAvailability(conn, b) {
  const target = b.status === 'deal_closed' ? 'sold' : b.status === 'cancelled' ? 'available' : 'reserved';
  if (b.parcel_id) {
    await conn.query('UPDATE land_parcels SET status=? WHERE id=?', [target, b.parcel_id]);
    const [[c]] = await conn.query("SELECT COUNT(*) n, SUM(status='sold') sold, SUM(status='available') av FROM land_parcels WHERE property_id=? AND deleted_at IS NULL", [b.property_id]);
    const ps = Number(c.n) && Number(c.sold) === Number(c.n) ? 'sold' : Number(c.av) === Number(c.n) ? 'available' : 'reserved';
    await conn.query('UPDATE properties SET status=? WHERE id=?', [ps, b.property_id]);
  } else await conn.query('UPDATE properties SET status=? WHERE id=?', [target, b.property_id]);
}
async function recalcPayments(conn, bookingId) {
  const [[s]] = await conn.query('SELECT COALESCE(SUM(amount),0) paid FROM payments WHERE booking_id=?', [bookingId]);
  const [[b]] = await conn.query('SELECT total_amount FROM bookings WHERE id=?', [bookingId]);
  const paid = money(s.paid); const total = money(b.total_amount);
  const ps = paid <= 0 ? 'pending' : total > 0 && paid >= total ? 'paid' : 'partial';
  await conn.query('UPDATE bookings SET paid_amount=?, payment_status=? WHERE id=?', [paid, ps, bookingId]);
  return { paid, total, payment_status: ps };
}

const bookingCore = resourceRouter({
  module: 'bookings', table: 'bookings', prefix: 'BKG-', defaultSort: 'booking_date',
  fields: [
    { name: 'customer_id', label: 'Customer', type: 'fk', required: true }, { name: 'lead_id', label: 'Lead', type: 'fk' }, { name: 'proposal_id', label: 'Proposal', type: 'fk' },
    { name: 'property_id', label: 'Property', type: 'fk' }, { name: 'parcel_id', label: 'Parcel', type: 'fk' }, { name: 'booking_date', label: 'Booking date', type: 'date', required: true },
    { name: 'total_amount', label: 'Total amount', type: 'number', required: true }, { name: 'booking_amount', label: 'Booking amount', type: 'number', default: 0 },
    { name: 'agreement_url', label: 'Agreement document URL', type: 'string', max: 500 }, { name: 'status', type: 'enum', values: ['booked', 'confirmed', 'deal_closed', 'cancelled'], default: 'booked' }, { name: 'remarks', type: 'text' },
  ],
  select: 'cu.name AS customer_name, cu.phone AS customer_phone, pr.name AS property_name, pc.parcel_number, pp.code AS proposal_code, (t.total_amount - t.paid_amount) AS balance_amount',
  joins: `LEFT JOIN customers cu ON cu.id=t.customer_id LEFT JOIN properties pr ON pr.id=t.property_id LEFT JOIN land_parcels pc ON pc.id=t.parcel_id LEFT JOIN proposals pp ON pp.id=t.proposal_id`,
  search: ['cu.name', 'cu.phone', 't.code', 'pr.name'], filters: ['status', 'payment_status', 'customer_id', 'property_id'], scope: bookingScope,
  lockedOnUpdate: () => ['property_id', 'parcel_id', 'customer_id', 'proposal_id', 'lead_id', 'booking_date'],
  exportCols: ['code', 'customer_name', 'customer_phone', 'property_name', 'parcel_number', 'booking_date', 'total_amount', 'booking_amount', 'paid_amount', 'balance_amount', 'payment_status', 'status', 'created_at'],
  hooks: {
    beforeCreate: async (v) => {
      if (!['booked', 'confirmed'].includes(v.status || 'booked')) return { errors: { status: 'A new booking starts as Booked or Confirmed' }, message: 'A new booking must start as Booked or Confirmed' };
      const bad = await checkPropertyParcel(v); if (bad) return bad;
      if (!v.property_id) return { errors: { property_id: 'Choose a property or parcel' }, message: 'Choose the property (or parcel) being booked' };
      const [prop] = await query('SELECT id, status FROM properties WHERE id=? AND deleted_at IS NULL', [v.property_id]);
      if (!prop) return { errors: { property_id: 'Property not found' }, message: 'Property not found' };
      if (v.parcel_id) {
        const [pc] = await query('SELECT status FROM land_parcels WHERE id=?', [v.parcel_id]);
        if (pc.status !== 'available') return { errors: { parcel_id: `This parcel is already ${pc.status}` }, message: `This parcel is already ${pc.status} and cannot be booked` };
        const [d] = await query("SELECT code FROM bookings WHERE parcel_id=? AND deleted_at IS NULL AND status<>'cancelled'", [v.parcel_id]);
        if (d) return { errors: { parcel_id: `Already booked (${d.code})` }, message: `This parcel already has an active booking (${d.code})` };
      } else {
        if (prop.status !== 'available') return { errors: { property_id: `This property is already ${prop.status}` }, message: `This property is already ${prop.status} and cannot be booked` };
        const [d] = await query("SELECT code FROM bookings WHERE property_id=? AND parcel_id IS NULL AND deleted_at IS NULL AND status<>'cancelled'", [v.property_id]);
        if (d) return { errors: { property_id: `Already booked (${d.code})` }, message: `This property already has an active booking (${d.code})` };
      }
      if (v.proposal_id) {
        const [pp] = await query('SELECT approval_status FROM proposals WHERE id=? AND deleted_at IS NULL', [v.proposal_id]);
        if (!pp) return { errors: { proposal_id: 'Proposal not found' }, message: 'Proposal not found' };
        if (pp.approval_status !== 'approved') return { errors: { proposal_id: 'Proposal is not approved yet' }, message: 'Only an approved proposal can be turned into a booking' };
      }
      if (v.booking_amount != null && v.total_amount != null && Number(v.booking_amount) > Number(v.total_amount)) return { errors: { booking_amount: 'Cannot exceed the total amount' }, message: 'The booking amount cannot exceed the total amount' };
    },
    afterCreate: async (conn, id, v, req) => {
      await applyAvailability(conn, { ...v, status: v.status || 'booked' });
      if (v.lead_id) {
        await conn.query("UPDATE leads SET status='negotiation' WHERE id=? AND status IN ('new','contacted','qualified','site_visit_scheduled')", [v.lead_id]);
        await addLeadActivity(conn, v.lead_id, 'note', 'Booking created', req.user.id);
      }
      const [[c]] = await conn.query('SELECT code FROM bookings WHERE id=?', [id]);
      await notifyUsers([req.user.id, ...(await usersWithPerm('bookings.view_all'))], `Booking ${c.code} created`, null, `/admin/crm/bookings?view=${id}`);
    },
    beforeUpdate: async (v, prev) => {
      if (['cancelled', 'deal_closed'].includes(prev.status)) {
        for (const k of Object.keys(v)) if (!['agreement_url', 'remarks'].includes(k)) delete v[k];
        return null;
      }
      const total = v.total_amount ?? prev.total_amount;
      if (v.total_amount != null && Number(v.total_amount) < Number(prev.paid_amount)) return { errors: { total_amount: 'Cannot be below the amount already paid' }, message: `Total cannot be less than the ${prev.paid_amount} already paid` };
      if (v.status === 'deal_closed' && Number(prev.paid_amount) < Number(total)) return { errors: { status: 'Collect the full balance before closing the deal' }, message: 'Collect the full balance before closing the deal' };
      if (v.status && !['booked', 'confirmed', 'deal_closed', 'cancelled'].includes(v.status)) return { errors: { status: 'Invalid status' }, message: 'Invalid status' };
    },
    afterUpdate: async (conn, id, v, prev, req) => {
      if (v.total_amount != null) await recalcPayments(conn, id);
      if (!v.status || v.status === prev.status) return;
      await applyAvailability(conn, { ...prev, status: v.status });
      if (v.status === 'deal_closed' && prev.lead_id) {
        await conn.query("UPDATE leads SET status='won' WHERE id=?", [prev.lead_id]);
        await addLeadActivity(conn, prev.lead_id, 'status', `Deal closed (${prev.code})`, req.user.id, null, 'won');
        const [[l]] = await conn.query('SELECT id, enquiry_id, status FROM leads WHERE id=?', [prev.lead_id]); await syncEnquiryFromLead(conn, l, req.user.id);
      }
      if (v.status === 'confirmed') await notifyUsers([prev.created_by, ...(await usersWithPerm('bookings.view_all'))], `Booking ${prev.code} confirmed`, null, `/admin/crm/bookings?view=${id}`);
    },
    decorate: async (row) => {
      row.payments = await query('SELECT p.id, p.amount, p.paid_on, p.mode, p.reference, p.notes, p.created_at, u.name AS received_by_name FROM payments p LEFT JOIN users u ON u.id=p.received_by WHERE p.booking_id=? ORDER BY p.paid_on DESC, p.id DESC', [row.id]);
    },
  },
});

export const bookings = express.Router();
bookings.post('/:id(\\d+)/payments', requirePerm('payments.create'), async (req, res, next) => {
  try {
    const sc = bookingScope(req);
    const [b] = await query(`SELECT t.* FROM bookings t WHERE t.deleted_at IS NULL AND t.id=?${sc.sql ? ' AND ' + sc.sql : ''}`, [req.params.id, ...sc.params]);
    if (!b) return fail(res, 404, 'Not found');
    if (b.status === 'cancelled') return fail(res, 409, 'This booking is cancelled — payments cannot be added');
    const { values, errors } = validate([
      { name: 'amount', label: 'Amount', type: 'number', required: true }, { name: 'paid_on', label: 'Payment date', type: 'date', required: true },
      { name: 'mode', type: 'enum', values: ['cash', 'bank_transfer', 'cheque', 'upi', 'card', 'other'], default: 'bank_transfer' }, { name: 'reference', type: 'string', max: 120 }, { name: 'notes', type: 'string', max: 300 },
    ], req.body || {});
    if (!errors.amount && !(values.amount > 0)) errors.amount = 'Enter an amount greater than zero';
    if (Object.keys(errors).length) return fail(res, 422, 'Please correct the highlighted fields', errors);
    const balance = money(b.total_amount) - money(b.paid_amount);
    if (b.total_amount > 0 && values.amount > balance + 0.005) return fail(res, 422, `The payment exceeds the balance of ${balance}`, { amount: `Cannot exceed the balance (${balance})` });
    const result = await tx(async (conn) => {
      await conn.query('INSERT INTO payments (booking_id, amount, paid_on, mode, reference, notes, received_by) VALUES (?,?,?,?,?,?,?)', [b.id, values.amount, values.paid_on, values.mode, values.reference, values.notes, req.user.id]);
      return recalcPayments(conn, b.id);
    });
    await notifyUsers([b.created_by, ...(await usersWithPerm('bookings.view_all'))], `Payment received for ${b.code}`, `₹${values.amount} via ${String(values.mode).replace('_', ' ')}`, `/admin/crm/bookings?view=${b.id}`);
    await logActivity(req, 'payments', 'create', b.id, null, values);
    res.status(201).json({ ok: true, ...result, balance: money(result.total - result.paid) });
  } catch (e) { next(e); }
});
bookings.use(bookingCore);

// ============================================================ Tasks
export const tasks = resourceRouter({
  module: 'tasks', table: 'tasks', prefix: 'TSK-', defaultSort: 'due_date',
  fields: [
    { name: 'title', label: 'Task', type: 'string', required: true, max: 200 }, { name: 'description', type: 'text' }, { name: 'assigned_to', label: 'Assigned to', type: 'fk' },
    { name: 'lead_id', label: 'Related lead', type: 'fk' }, { name: 'customer_id', label: 'Related customer', type: 'fk' }, { name: 'due_date', label: 'Due date', type: 'date' },
    { name: 'priority', type: 'enum', values: ['low', 'medium', 'high'], default: 'medium' }, { name: 'status', type: 'enum', values: ['pending', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
  ],
  select: "ex.name AS assigned_name, ld.code AS lead_code, cu.name AS customer_name, (t.due_date IS NOT NULL AND t.due_date < CURDATE() AND t.status IN ('pending','in_progress')) AS overdue",
  joins: `${userJoin('assigned_to', 'ex')} LEFT JOIN leads ld ON ld.id=t.lead_id LEFT JOIN customers cu ON cu.id=t.customer_id`,
  search: ['t.title', 't.code', 'ex.name', 'cu.name'], filters: ['status', 'priority', 'assigned_to', 'due_date'], scope: scopeOwn('tasks'), extraSort: ['due_date'],
  lockedOnUpdate: (req) => (can(req, 'tasks.view_all') ? [] : ['assigned_to']),
  exportCols: ['code', 'title', 'assigned_name', 'lead_code', 'customer_name', 'due_date', 'priority', 'status', 'completed_at', 'created_at'],
  hooks: {
    beforeCreate: async (v, req) => { if (!v.assigned_to) v.assigned_to = req.user.id; if (v.status === 'completed') v.completed_at = new Date().toISOString().slice(0, 19).replace('T', ' '); },
    afterCreate: async (conn, id, v, req) => { if (v.assigned_to && v.assigned_to !== req.user.id) await notifyUsers([v.assigned_to], 'New task assigned', v.title, '/admin/crm/tasks'); },
    beforeUpdate: async (v, prev) => { if (v.status && v.status !== prev.status) v.completed_at = v.status === 'completed' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null; },
    afterUpdate: async (conn, id, v, prev, req) => { if ('assigned_to' in v && v.assigned_to && v.assigned_to !== prev.assigned_to && v.assigned_to !== req.user.id) await notifyUsers([v.assigned_to], 'Task assigned to you', prev.title, '/admin/crm/tasks'); },
  },
});

// ============================================================ Employees (performance view over the users table)
const EMP_SELECT = `SELECT u.id, u.code, u.name, u.username, u.email, u.phone, u.designation, u.department, u.status, u.last_login_at, r.label AS role_label, m.name AS manager_name,
  (SELECT COUNT(*) FROM leads l WHERE l.assigned_to=u.id AND l.deleted_at IS NULL AND l.status NOT IN ('won','lost')) AS open_leads,
  (SELECT COUNT(*) FROM leads l WHERE l.assigned_to=u.id AND l.deleted_at IS NULL AND l.status='won') AS won_leads,
  (SELECT COUNT(*) FROM leads l WHERE l.assigned_to=u.id AND l.deleted_at IS NULL AND l.status='lost') AS lost_leads,
  (SELECT COUNT(*) FROM enquiries e WHERE e.assigned_to=u.id AND e.deleted_at IS NULL) AS enquiries_assigned,
  (SELECT COUNT(*) FROM properties p WHERE p.assigned_to=u.id AND p.deleted_at IS NULL) AS properties_assigned,
  (SELECT COUNT(*) FROM tasks k WHERE k.assigned_to=u.id AND k.deleted_at IS NULL AND k.status IN ('pending','in_progress')) AS tasks_open,
  (SELECT COUNT(*) FROM tasks k WHERE k.assigned_to=u.id AND k.deleted_at IS NULL AND k.status='completed') AS tasks_done,
  (SELECT COUNT(*) FROM tasks k WHERE k.assigned_to=u.id AND k.deleted_at IS NULL AND k.status IN ('pending','in_progress') AND k.due_date < CURDATE()) AS tasks_overdue,
  (SELECT COUNT(*) FROM site_visits v WHERE v.assigned_to=u.id AND v.deleted_at IS NULL AND v.status='completed') AS visits_done
  FROM users u JOIN roles r ON r.id=u.role_id LEFT JOIN users m ON m.id=u.manager_id WHERE u.deleted_at IS NULL`;
export const employees = express.Router();
employees.get('/', requirePerm('employees.view'), async (req, res, next) => {
  try {
    const w = []; const p = [];
    if (!can(req, 'employees.view_all')) { w.push('u.id=?'); p.push(req.user.id); }
    if (req.query.status) { w.push('u.status=?'); p.push(req.query.status); }
    if (req.query.q) { w.push('(u.name LIKE ? OR u.username LIKE ? OR u.email LIKE ? OR u.code LIKE ?)'); for (let i = 0; i < 4; i++) p.push(`%${req.query.q}%`); }
    const rows = await query(`${EMP_SELECT}${w.length ? ' AND ' + w.join(' AND ') : ''} ORDER BY u.name`, p);
    for (const r of rows) { const d = Number(r.won_leads) + Number(r.lost_leads); r.win_rate = d ? Math.round((Number(r.won_leads) / d) * 1000) / 10 : 0; }
    res.json({ data: rows, total: rows.length });
  } catch (e) { next(e); }
});
employees.get('/:id(\\d+)', requirePerm('employees.view'), async (req, res, next) => {
  try {
    if (!can(req, 'employees.view_all') && Number(req.params.id) !== req.user.id) return fail(res, 403, 'You can only view your own profile');
    const [u] = await query(`${EMP_SELECT} AND u.id=?`, [req.params.id]);
    if (!u) return fail(res, 404, 'Not found');
    u.leads = await query("SELECT id, code, name, status, priority, next_followup_date FROM leads WHERE assigned_to=? AND deleted_at IS NULL ORDER BY updated_at DESC LIMIT 15", [u.id]);
    u.tasks = await query('SELECT id, code, title, status, due_date, priority FROM tasks WHERE assigned_to=? AND deleted_at IS NULL ORDER BY (status IN (\'completed\',\'cancelled\')), due_date LIMIT 20', [u.id]);
    u.properties = await query('SELECT id, code, name, status FROM properties WHERE assigned_to=? AND deleted_at IS NULL ORDER BY name LIMIT 20', [u.id]);
    u.logins = await query('SELECT success, ip_address, created_at FROM login_history WHERE user_id=? ORDER BY id DESC LIMIT 10', [u.id]);
    res.json(u);
  } catch (e) { next(e); }
});

// ============================================================ Login history
export const loginHistory = express.Router();
loginHistory.get('/', requirePerm('activity.view'), async (req, res, next) => {
  try {
    const w = []; const p = [];
    if (req.query.user_id) { w.push('l.user_id=?'); p.push(req.query.user_id); }
    if (req.query.success === '0' || req.query.success === '1') { w.push('l.success=?'); p.push(req.query.success); }
    if (req.query.from) { w.push('l.created_at>=?'); p.push(req.query.from); }
    if (req.query.to) { w.push('l.created_at<=?'); p.push(`${req.query.to} 23:59:59`); }
    const where = w.length ? 'WHERE ' + w.join(' AND ') : '';
    const page = Math.max(1, parseInt(req.query.page) || 1); const pageSize = Math.min(100, parseInt(req.query.pageSize) || 25);
    const [{ total }] = await query(`SELECT COUNT(*) total FROM login_history l ${where}`, p);
    const rows = await query(`SELECT l.id, l.user_id, l.username, l.success, l.ip_address, l.user_agent, l.created_at, u.name FROM login_history l LEFT JOIN users u ON u.id=l.user_id ${where} ORDER BY l.id DESC LIMIT ? OFFSET ?`, [...p, pageSize, (page - 1) * pageSize]);
    res.json({ data: rows, total, page, pageSize });
  } catch (e) { next(e); }
});
