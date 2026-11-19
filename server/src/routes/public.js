import express from 'express';
import rateLimit from 'express-rate-limit';
import { query, tx } from '../db.js';
import { validate } from '../resource.js';
import { enquiryFields, findOpenDuplicate, recordRepeat } from '../resources.js';
import { logActivity } from '../activity.js';
import { linkEnquiryCustomer } from '../customers.js';
import { notifyUsers, usersWithPerm } from '../notify.js';

const r = express.Router();
const limiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many submissions. Please try again later.' } });

const PUBLIC_COLS = 'id, code, name, type, description, state, district, taluk, village, total_area, area_unit, price, price_per_acre, map_url, latitude, longitude, video_url, features, status, featured';
const live = "deleted_at IS NULL AND published=1 AND website_visible=1";

r.get('/properties', async (req, res, next) => {
  try {
    const rows = await query(`SELECT ${PUBLIC_COLS} FROM properties WHERE ${live} ORDER BY featured DESC, id DESC LIMIT 200`);
    const imgs = rows.length ? await query('SELECT property_id, url, alt_text, is_cover FROM property_images WHERE property_id IN (?) ORDER BY is_cover DESC, sort_order, id', [rows.map((x) => x.id)]) : [];
    for (const p of rows) p.images = imgs.filter((i) => i.property_id === p.id).map(({ url, alt_text }) => ({ url, alt_text }));
    res.json({ data: rows });
  } catch (e) { next(e); }
});

r.get('/properties/:id(\\d+)', async (req, res, next) => {
  try {
    const [p] = await query(`SELECT ${PUBLIC_COLS} FROM properties WHERE id=? AND ${live}`, [req.params.id]);
    if (!p) return res.status(404).json({ error: 'Not found' });
    p.images = await query('SELECT url, alt_text FROM property_images WHERE property_id=? ORDER BY is_cover DESC, sort_order, id', [p.id]);
    p.parcels = await query("SELECT parcel_number, area, area_unit, price, status, description FROM land_parcels WHERE property_id=? AND deleted_at IS NULL ORDER BY parcel_number", [p.id]);
    p.documents = await query('SELECT d.title, m.url FROM property_documents d JOIN media_files m ON m.id=d.media_id WHERE d.property_id=? AND d.is_private=0 AND m.deleted_at IS NULL', [p.id]);
    res.json(p);
  } catch (e) { next(e); }
});

// Website forms -> CRM. Only whitelisted fields are accepted; assignment/status/etc. cannot be set from the public site.
const PUBLIC_FIELDS = ['source', 'name', 'phone', 'email', 'message', 'property_id', 'property_title', 'budget', 'enquiry_type', 'form_name', 'website_page', 'location', 'address', 'interested_project', 'preferred_area', 'preferred_location'];
const SOURCES = ['buy_land', 'sell_land', 'contact', 'property', 'consultation', 'project', 'callback', 'popup', 'services', 'requirement', 'newsletter'];
const TYPE_LABEL = { buy_land: 'Buy Land', sell_land: 'Sell Land', contact: 'Contact Us', property: 'Property Enquiry', consultation: 'Free Consultation', project: 'Project Enquiry', callback: 'Callback Request', popup: 'Popup Enquiry', services: 'Service Enquiry', requirement: 'Land Requirement', newsletter: 'Newsletter Request' };

/** Form-specific answers that have no column of their own are kept as JSON so nothing the customer typed is lost. */
const cleanExtra = (x) => {
  if (!x || typeof x !== 'object' || Array.isArray(x)) return null;
  const out = {};
  for (const [k, v] of Object.entries(x).slice(0, 40)) if (['string', 'number', 'boolean'].includes(typeof v) && String(v).trim() !== '') out[String(k).slice(0, 60)] = typeof v === 'string' ? v.trim().slice(0, 1500) : v;
  return Object.keys(out).length ? JSON.stringify(out) : null;
};

r.post('/enquiries', limiter, async (req, res, next) => {
  try {
    const b = req.body || {};
    if (b.website) return res.status(201).json({ ok: true }); // honeypot field: bots fill it, humans never see it
    const hasPhone = String(b.phone ?? '').trim() !== ''; const hasEmail = String(b.email ?? '').trim() !== '';
    if (!hasPhone && !hasEmail) return res.status(422).json({ error: 'Please provide a phone number or email address', fields: { phone: 'Phone number is required' } });
    const allow = enquiryFields.filter((f) => PUBLIC_FIELDS.includes(f.name)).map((f) => (f.name === 'phone' ? { ...f, required: false } : f));
    const input = { ...b, source: SOURCES.includes(b.source) ? b.source : 'contact' };
    const { values, errors } = validate(allow, input);
    if (Object.keys(errors).length) return res.status(422).json({ error: 'Please check the highlighted fields', fields: errors });
    values.phone = values.phone || '';
    values.enquiry_type = values.enquiry_type || TYPE_LABEL[values.source];
    if (values.property_id && !(await query(`SELECT id FROM properties WHERE id=? AND ${live}`, [values.property_id])).length) values.property_id = null;
    const formData = cleanExtra(b.extra);
    const ctx = [values.form_name, values.website_page].filter(Boolean).join(' · ');
    // The same person sending the same kind of enquiry again within 24h while it is still open is logged on the existing record (accidental double submits);
    // anything else is stored as its own enquiry and linked to the customer's earlier ones.
    const dup = await findOpenDuplicate(null, values.phone, values.property_id, { email: values.email, source: values.source, withinHours: 24 });
    if (dup) {
      await recordRepeat(dup.id, values.message, null, ctx);
      await notifyUsers(dup.assigned_to ? [dup.assigned_to] : await usersWithPerm('enquiries.view_all'), `Repeat enquiry: ${dup.code}`, `${values.name} submitted again (${ctx || values.source})`, `/admin/crm/enquiries?view=${dup.id}`);
      return res.status(200).json({ ok: true, duplicate: true, code: dup.code, id: dup.id });
    }
    const [prev] = await query("SELECT id FROM enquiries WHERE deleted_at IS NULL AND (" + [values.phone && "RIGHT(REPLACE(REPLACE(phone,' ',''),'-',''),10)=?", values.email && 'LOWER(email)=?'].filter(Boolean).join(' OR ') + ') ORDER BY id DESC LIMIT 1',
      [values.phone && String(values.phone).replace(/[\s-]/g, '').slice(-10), values.email].filter(Boolean));
    const cols = PUBLIC_FIELDS;
    const id = await tx(async (conn) => {
      const [ins] = await conn.query(`INSERT INTO enquiries (${cols.join(',')}, form_data, status, priority, repeat_of_id) VALUES (${cols.map(() => '?').join(',')}, ?, 'new', 'medium', ?)`, [...cols.map((c) => values[c] ?? null), formData, prev?.id ?? null]);
      await conn.query("UPDATE enquiries SET code=CONCAT('ENQ-', LPAD(id,5,'0')) WHERE id=?", [ins.insertId]);
      await conn.query('INSERT INTO enquiry_status_history (enquiry_id, from_status, to_status) VALUES (?,?,?)', [ins.insertId, null, 'new']);
      return ins.insertId;
    });
    const code = 'ENQ-' + String(id).padStart(5, '0');
    try { await linkEnquiryCustomer(id); } catch (e) { console.error('customer link failed', e.message); } // never blocks the customer's submission
    await notifyUsers(await usersWithPerm('enquiries.view_all'), `New website enquiry ${code}`, `${values.name} — ${values.enquiry_type}${values.form_name ? ` (${values.form_name})` : ''}`, `/admin/crm/enquiries?view=${id}`);
    await logActivity({ headers: req.headers, socket: req.socket }, 'enquiries', 'website_submit', id, null, { source: values.source, form: values.form_name });
    res.status(201).json({ ok: true, id, code, repeat: !!prev });
  } catch (e) { next(e); }
});
export default r;
