import express from 'express';
import { query } from '../db.js';
import { requirePerm, can } from '../auth.js';
import { logActivity } from '../activity.js';

export const settings = express.Router();
const KEYS = ['company_name', 'company_phone', 'company_email', 'company_address', 'whatsapp_number', 'seo_title', 'seo_description', 'enquiry_notify_email'];
settings.get('/', requirePerm('settings.view'), async (req, res, next) => {
  try { const rows = await query('SELECT skey, svalue FROM settings'); res.json(Object.fromEntries(rows.map((x) => [x.skey, x.svalue]))); } catch (e) { next(e); }
});
settings.put('/', requirePerm('settings.edit'), async (req, res, next) => {
  try {
    const before = Object.fromEntries((await query('SELECT skey, svalue FROM settings')).map((x) => [x.skey, x.svalue]));
    const changed = {};
    for (const k of KEYS) if (k in (req.body || {})) {
      const v = String(req.body[k] ?? '').slice(0, 1000);
      if (k.endsWith('_email') && v && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return res.status(422).json({ error: 'Enter a valid email address', fields: { [k]: 'Invalid email' } });
      await query('INSERT INTO settings (skey, svalue) VALUES (?,?) ON DUPLICATE KEY UPDATE svalue=VALUES(svalue)', [k, v]); changed[k] = v;
    }
    await logActivity(req, 'settings', 'update', null, before, changed); res.json({ ok: true });
  } catch (e) { next(e); }
});

// Dropdown data for forms; only the lists the caller may use
export const lookups = express.Router();
lookups.get('/', async (req, res, next) => {
  try {
    const out = {};
    out.users = await query("SELECT id, name, role_id FROM users WHERE deleted_at IS NULL AND status='active' ORDER BY name");
    out.roles = can(req, 'users.view') || can(req, 'roles.view') ? await query('SELECT id, name, label FROM roles ORDER BY id') : [];
    out.properties = await query('SELECT id, code, name FROM properties WHERE deleted_at IS NULL ORDER BY name LIMIT 500');
    out.landowners = await query('SELECT id, code, name FROM landowners WHERE deleted_at IS NULL ORDER BY name LIMIT 500');
    out.enquiry_types = (await query("SELECT DISTINCT enquiry_type AS name FROM enquiries WHERE deleted_at IS NULL AND enquiry_type IS NOT NULL AND enquiry_type<>'' ORDER BY enquiry_type")).map((x, i) => ({ id: i + 1, name: x.name }));
    out.customers = await query('SELECT id, code, name FROM customers WHERE deleted_at IS NULL ORDER BY name LIMIT 1000');
    out.leads = await query('SELECT id, code, name FROM leads WHERE deleted_at IS NULL ORDER BY id DESC LIMIT 1000');
    out.parcels = await query("SELECT p.id, p.code, CONCAT(p.parcel_number, ' — ', pr.name) AS name, p.property_id, p.status FROM land_parcels p JOIN properties pr ON pr.id=p.property_id WHERE p.deleted_at IS NULL ORDER BY pr.name, p.parcel_number LIMIT 1000");
    out.proposals = await query("SELECT id, code, CONCAT(code, ' (', approval_status, ')') AS name, customer_id, lead_id, property_id, parcel_id, COALESCE(negotiated_price, quoted_price) AS price, advance_amount FROM proposals WHERE deleted_at IS NULL ORDER BY id DESC LIMIT 1000");
    out.buyers = await query('SELECT id, code, name FROM buyers WHERE deleted_at IS NULL ORDER BY name LIMIT 500');
    res.json(out);
  } catch (e) { next(e); }
});

// Activity logs
export const activity = express.Router();
activity.get('/', requirePerm('activity.view'), async (req, res, next) => {
  try {
    const w = []; const p = [];
    for (const k of ['module', 'action', 'user_id']) if (req.query[k]) { w.push(`${k}=?`); p.push(req.query[k]); }
    if (req.query.from) { w.push('created_at>=?'); p.push(req.query.from); }
    if (req.query.to) { w.push('created_at<=?'); p.push(`${req.query.to} 23:59:59`); }
    const where = w.length ? 'WHERE ' + w.join(' AND ') : '';
    const page = Math.max(1, parseInt(req.query.page) || 1); const pageSize = Math.min(100, parseInt(req.query.pageSize) || 25);
    const [{ total }] = await query(`SELECT COUNT(*) total FROM activity_logs ${where}`, p);
    const rows = await query(`SELECT id, user_id, username, module, action, record_id, previous_value, updated_value, ip_address, created_at FROM activity_logs ${where} ORDER BY id DESC LIMIT ? OFFSET ?`, [...p, pageSize, (page - 1) * pageSize]);
    res.json({ data: rows, total, page, pageSize });
  } catch (e) { next(e); }
});
