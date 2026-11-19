import { query } from './db.js';
import { can } from './auth.js';
import { resourceRouter } from './resource.js';
import { notifyUsers } from './notify.js';
import { upsertCustomer } from './customers.js';

const AREA = ['acres', 'cents', 'sqft'];
const mine = (alias = 't') => (req) => ({ sql: `(${alias}.assigned_to = ? OR ${alias}.created_by = ?)`, params: [req.user.id, req.user.id] });
const scopeOwn = (module) => (req) => (can(req, `${module}.view_all`) ? { sql: '', params: [] } : mine()(req));
const userJoin = (col, alias) => `LEFT JOIN users ${alias} ON ${alias}.id = t.${col}`;

const addPricePerAcre = (v, prev = {}) => {
  const price = v.price ?? prev.price; const area = v.total_area ?? prev.total_area; const unit = v.area_unit ?? prev.area_unit;
  if (v.price_per_acre == null && price && area && unit === 'acres') v.price_per_acre = Math.round((price / area) * 100) / 100;
};

// ---------- Properties ----------
export const properties = resourceRouter({
  module: 'properties', table: 'properties', prefix: 'PRP-',
  publishField: true,
  fields: [
    { name: 'name', label: 'Property name', type: 'string', required: true, max: 200 },
    { name: 'type', label: 'Property type', type: 'string', required: true, max: 80 },
    { name: 'description', type: 'text' },
    { name: 'state', type: 'string', max: 80 }, { name: 'district', type: 'string', required: true, max: 80 },
    { name: 'taluk', type: 'string', max: 80 }, { name: 'village', type: 'string', max: 80 },
    { name: 'address', type: 'text' }, { name: 'survey_number', label: 'Survey number', type: 'string', max: 80 },
    { name: 'total_area', label: 'Total land area', type: 'number', required: true },
    { name: 'area_unit', label: 'Area unit', type: 'enum', values: AREA, default: 'acres' },
    { name: 'price', label: 'Total price', type: 'number' }, { name: 'price_per_acre', label: 'Price per acre', type: 'number' },
    { name: 'map_url', label: 'Google Maps link', type: 'string', max: 500 },
    { name: 'latitude', type: 'lat' }, { name: 'longitude', type: 'lng' },
    { name: 'video_url', label: 'Video link', type: 'string', max: 500 },
    { name: 'features', type: 'json' },
    { name: 'landowner_id', label: 'Landowner', type: 'fk' }, { name: 'assigned_to', label: 'Assigned executive', type: 'fk' },
    { name: 'status', type: 'enum', values: ['available', 'reserved', 'sold'], default: 'available' },
    { name: 'featured', type: 'bool', default: 0 }, { name: 'website_visible', label: 'Website visibility', type: 'bool', default: 0 },
    { name: 'published', type: 'bool', default: 0 },
  ],
  select: 'lo.name AS landowner_name, ex.name AS assigned_name, (SELECT COUNT(*) FROM land_parcels lp WHERE lp.property_id=t.id AND lp.deleted_at IS NULL) AS parcel_count',
  joins: `LEFT JOIN landowners lo ON lo.id=t.landowner_id ${userJoin('assigned_to', 'ex')}`,
  search: ['t.name', 't.code', 't.district', 't.village', 't.survey_number', 't.taluk'],
  filters: ['status', 'type', 'district', 'featured', 'published', 'website_visible', 'assigned_to', 'landowner_id'],
  extraSort: ['parcel_count'],
  scope: (req) => (can(req, 'properties.view_all') ? { sql: '', params: [] } : { sql: '(t.assigned_to = ? OR t.created_by = ?)', params: [req.user.id, req.user.id] }),
  exportCols: ['code', 'name', 'type', 'state', 'district', 'taluk', 'village', 'survey_number', 'total_area', 'area_unit', 'price', 'price_per_acre', 'status', 'featured', 'published', 'landowner_name', 'assigned_name', 'created_at'],
  hooks: {
    beforeCreate: async (v) => { addPricePerAcre(v); },
    beforeUpdate: async (v, prev) => { addPricePerAcre(v, prev); },
    beforeDelete: async (prev) => { await query('UPDATE land_parcels SET deleted_at=NOW() WHERE property_id=? AND deleted_at IS NULL', [prev.id]); },
    decorate: async (row) => {
      row.images = await query('SELECT id, url, alt_text, sort_order, is_cover FROM property_images WHERE property_id=? ORDER BY is_cover DESC, sort_order, id', [row.id]);
      row.documents = await query('SELECT d.id, d.title, d.media_id, m.original_name, m.mime, m.size_bytes FROM property_documents d JOIN media_files m ON m.id=d.media_id WHERE d.property_id=? AND m.deleted_at IS NULL', [row.id]);
      row.parcels = await query('SELECT id, code, parcel_number, area, area_unit, price, status FROM land_parcels WHERE property_id=? AND deleted_at IS NULL ORDER BY id', [row.id]);
    },
  },
});

// ---------- Land parcels ----------
export const parcels = resourceRouter({
  module: 'parcels', table: 'land_parcels', prefix: 'PCL-',
  fields: [
    { name: 'property_id', label: 'Parent property', type: 'fk', required: true },
    { name: 'parcel_number', label: 'Parcel number', type: 'string', required: true, max: 40 },
    { name: 'survey_number', type: 'string', max: 80 },
    { name: 'area', label: 'Parcel area', type: 'number', required: true },
    { name: 'area_unit', type: 'enum', values: AREA, default: 'acres' },
    { name: 'price', type: 'number' }, { name: 'description', type: 'text' }, { name: 'boundary_details', label: 'Boundary details', type: 'text' },
    { name: 'status', type: 'enum', values: ['available', 'reserved', 'sold'], default: 'available' },
  ],
  select: 'p.name AS property_name, p.code AS property_code',
  joins: 'JOIN properties p ON p.id=t.property_id AND p.deleted_at IS NULL',
  search: ['t.parcel_number', 't.code', 't.survey_number', 'p.name'],
  filters: ['property_id', 'status'],
  scope: (req) => (can(req, 'properties.view_all') ? { sql: '', params: [] } : { sql: '(p.assigned_to = ? OR p.created_by = ?)', params: [req.user.id, req.user.id] }),
  exportCols: ['code', 'property_code', 'property_name', 'parcel_number', 'survey_number', 'area', 'area_unit', 'price', 'status', 'created_at'],
  hooks: {
    beforeCreate: async (v) => {
      const [p] = await query('SELECT id FROM properties WHERE id=? AND deleted_at IS NULL', [v.property_id]);
      if (!p) return { errors: { property_id: 'Parent property not found' } };
      const [d] = await query('SELECT id FROM land_parcels WHERE property_id=? AND parcel_number=? AND deleted_at IS NULL', [v.property_id, v.parcel_number]);
      if (d) return { errors: { parcel_number: 'This parcel number already exists for the property' } };
    },
    beforeUpdate: async (v, prev) => {
      if (v.property_id && v.property_id !== prev.property_id) return { errors: { property_id: 'A parcel cannot be moved to another property' } };
      if (v.parcel_number && v.parcel_number !== prev.parcel_number) {
        const [d] = await query('SELECT id FROM land_parcels WHERE property_id=? AND parcel_number=? AND deleted_at IS NULL AND id<>?', [prev.property_id, v.parcel_number, prev.id]);
        if (d) return { errors: { parcel_number: 'This parcel number already exists for the property' } };
      }
    },
  },
});

// ---------- Landowners ----------
export const landowners = resourceRouter({
  module: 'landowners', table: 'landowners', prefix: 'LND-',
  fields: [
    { name: 'name', label: 'Full name', type: 'string', required: true, max: 120 },
    { name: 'phone', label: 'Phone number', type: 'phone', required: true }, { name: 'email', type: 'email' },
    { name: 'address', type: 'text' }, { name: 'district', type: 'string', max: 80 }, { name: 'taluk', type: 'string', max: 80 }, { name: 'village', type: 'string', max: 80 },
    { name: 'survey_number', type: 'string', max: 80 }, { name: 'total_area', type: 'number' }, { name: 'area_unit', type: 'enum', values: AREA, default: 'acres' },
    { name: 'expected_price', label: 'Expected selling price', type: 'number' }, { name: 'description', type: 'text' },
    { name: 'assigned_to', label: 'Assigned executive', type: 'fk' },
    { name: 'verification_status', label: 'Verification status', type: 'enum', values: ['new', 'documents_pending', 'under_verification', 'verified', 'rejected'], default: 'new' },
    { name: 'remarks', type: 'text' },
  ],
  select: 'ex.name AS assigned_name, (SELECT COUNT(*) FROM properties pr WHERE pr.landowner_id=t.id AND pr.deleted_at IS NULL) AS property_count',
  joins: userJoin('assigned_to', 'ex'),
  search: ['t.name', 't.code', 't.phone', 't.email', 't.district', 't.village', 't.survey_number'],
  filters: ['verification_status', 'district', 'assigned_to'],
  scope: scopeOwn('landowners'),
  exportCols: ['code', 'name', 'phone', 'email', 'district', 'taluk', 'village', 'survey_number', 'total_area', 'area_unit', 'expected_price', 'verification_status', 'assigned_name', 'created_at'],
  lockedOnUpdate: (req) => [...(can(req, 'landowners.approve') ? [] : ['verification_status'])],
  hooks: {
    beforeCreate: async (v, req) => { if (!can(req, 'landowners.approve')) v.verification_status = 'new'; if (!v.assigned_to) v.assigned_to = req.user.id; },
    decorate: async (row) => { row.properties = await query('SELECT id, code, name, status FROM properties WHERE landowner_id=? AND deleted_at IS NULL', [row.id]); row.history = await query("SELECT id, action, username, updated_value, created_at FROM activity_logs WHERE module='landowners' AND record_id=? ORDER BY id DESC LIMIT 30", [String(row.id)]); },
  },
});

// ---------- Buyers ----------
export const buyers = resourceRouter({
  module: 'buyers', table: 'buyers', prefix: 'BUY-',
  fields: [
    { name: 'name', label: 'Customer name', type: 'string', required: true, max: 120 },
    { name: 'phone', label: 'Phone number', type: 'phone', required: true }, { name: 'email', type: 'email' }, { name: 'address', type: 'text' },
    { name: 'preferred_location', type: 'string', max: 160 }, { name: 'property_id', label: 'Interested property', type: 'fk' },
    { name: 'land_type', label: 'Preferred land type', type: 'string', max: 80 }, { name: 'required_area', label: 'Required land area', type: 'number' },
    { name: 'min_budget', type: 'number' }, { name: 'max_budget', type: 'number' }, { name: 'purpose', label: 'Purchase purpose', type: 'string', max: 120 },
    { name: 'contact_method', label: 'Contact method', type: 'enum', values: ['phone', 'whatsapp', 'email', 'in_person'], default: 'phone' },
    { name: 'assigned_to', label: 'Assigned executive', type: 'fk' },
    { name: 'status', type: 'enum', values: ['new', 'contacted', 'interested', 'site_visit_scheduled', 'negotiation', 'converted', 'not_interested'], default: 'new' },
    { name: 'remarks', type: 'text' },
  ],
  select: 'ex.name AS assigned_name, pr.name AS property_name, (SELECT COUNT(*) FROM enquiries e WHERE e.buyer_id=t.id AND e.deleted_at IS NULL) AS enquiry_count',
  joins: `${userJoin('assigned_to', 'ex')} LEFT JOIN properties pr ON pr.id=t.property_id`,
  search: ['t.name', 't.code', 't.phone', 't.email', 't.preferred_location'],
  filters: ['status', 'assigned_to', 'property_id', 'land_type'],
  scope: scopeOwn('buyers'),
  exportCols: ['code', 'name', 'phone', 'email', 'preferred_location', 'property_name', 'land_type', 'required_area', 'min_budget', 'max_budget', 'purpose', 'status', 'assigned_name', 'created_at'],
  hooks: {
    beforeCreate: async (v, req) => {
      if (v.min_budget != null && v.max_budget != null && v.min_budget > v.max_budget) return { errors: { max_budget: 'Maximum budget must be at least the minimum budget' } };
      if (!v.assigned_to) v.assigned_to = req.user.id;
    },
    beforeUpdate: async (v, prev) => { const mn = v.min_budget ?? prev.min_budget; const mx = v.max_budget ?? prev.max_budget; if (mn != null && mx != null && mn > mx) return { errors: { max_budget: 'Maximum budget must be at least the minimum budget' } }; },
    decorate: async (row) => { row.enquiries = await query('SELECT id, code, status, created_at FROM enquiries WHERE buyer_id=? AND deleted_at IS NULL ORDER BY id DESC', [row.id]); },
  },
});

// ---------- Enquiries ----------
const ENQ_STATUS = ['new', 'assigned', 'contacted', 'followup_pending', 'interested', 'site_visit_scheduled', 'negotiation', 'converted', 'closed', 'not_interested'];
const CLOSED = ['converted', 'closed', 'not_interested'];

export const enquiryFields = [
  { name: 'source', type: 'enum', values: ['buy_land', 'sell_land', 'contact', 'property', 'consultation', 'manual', 'project', 'callback', 'popup', 'services', 'requirement', 'newsletter'], default: 'manual' },
  { name: 'enquiry_type', label: 'Enquiry type', type: 'string', max: 60 }, { name: 'form_name', label: 'Form name', type: 'string', max: 120 }, { name: 'website_page', label: 'Website page', type: 'string', max: 200 },
  { name: 'location', type: 'string', max: 160 }, { name: 'address', type: 'string', max: 300 }, { name: 'interested_project', label: 'Interested project', type: 'string', max: 200 },
  { name: 'preferred_area', label: 'Preferred land area', type: 'string', max: 80 }, { name: 'preferred_location', label: 'Preferred location', type: 'string', max: 160 },
  { name: 'manager_id', label: 'Assigned manager', type: 'fk' }, { name: 'internal_remarks', label: 'Internal remarks', type: 'text' }, { name: 'form_data', type: 'json' },
  { name: 'name', label: 'Customer name', type: 'string', required: true, max: 120 },
  { name: 'phone', label: 'Phone number', type: 'phone', required: true }, { name: 'email', type: 'email' },
  { name: 'message', type: 'text' }, { name: 'property_id', label: 'Interested property', type: 'fk' },
  { name: 'property_title', type: 'string', max: 200 }, { name: 'budget', type: 'string', max: 80 },
  { name: 'buyer_id', label: 'Buyer', type: 'fk' }, { name: 'assigned_to', label: 'Assigned employee', type: 'fk' },
  { name: 'priority', type: 'enum', values: ['low', 'medium', 'high'], default: 'medium' },
  { name: 'status', type: 'enum', values: ENQ_STATUS, default: 'new' },
  { name: 'next_followup_at', label: 'Next follow-up', type: 'datetime' }, { name: 'conversion_notes', type: 'text' },
];

/** Shared by the admin API and the public website form. Finds an open enquiry from the same phone+property. */
export async function findOpenDuplicate(conn, phone, propertyId, opts = {}) {
  const norm = String(phone || '').replace(/[\s-]/g, '').replace(/^(\+?91)/, '').slice(-10);
  const email = opts.email ? String(opts.email).trim().toLowerCase() : '';
  const who = []; const p = [];
  if (norm) { who.push("RIGHT(REPLACE(REPLACE(phone,' ',''),'-',''),10)=?"); p.push(norm); }
  if (email) { who.push('LOWER(email)=?'); p.push(email); }
  if (!who.length) return undefined;
  p.push(propertyId ?? null);
  let extra = '';
  if (opts.source) { extra += ' AND source=?'; p.push(opts.source); }
  if (opts.withinHours) { extra += ' AND created_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)'; p.push(opts.withinHours); }
  const rows = await (conn ? conn.query.bind(conn) : (s, pr) => query(s, pr).then((r) => [r]))(
    `SELECT id, code, status, assigned_to FROM enquiries WHERE deleted_at IS NULL AND status NOT IN ('converted','closed','not_interested')
     AND (${who.join(' OR ')}) AND (property_id <=> ?)${extra} ORDER BY id DESC LIMIT 1`, p);
  return rows[0][0];
}

/** Previous enquiries by the same customer (matching phone or email), newest first. */
export async function relatedEnquiries(id, phone, email) {
  const norm = String(phone || '').replace(/[\s-]/g, '').replace(/^(\+?91)/, '').slice(-10);
  const who = []; const p = [id];
  if (norm) { who.push("RIGHT(REPLACE(REPLACE(phone,' ',''),'-',''),10)=?"); p.push(norm); }
  if (email) { who.push('LOWER(email)=?'); p.push(String(email).toLowerCase()); }
  if (!who.length) return [];
  return query(`SELECT id, code, status, source, enquiry_type, created_at FROM enquiries WHERE deleted_at IS NULL AND id<>? AND (${who.join(' OR ')}) ORDER BY id DESC LIMIT 10`, p);
}

export async function recordRepeat(dupId, message, userId, context = '') {
  await query('UPDATE enquiries SET repeat_count=repeat_count+1, updated_at=NOW() WHERE id=?', [dupId]);
  await query("INSERT INTO followups (enquiry_id, user_id, type, notes) VALUES (?,?, 'note', ?)", [dupId, userId ?? null, `Repeat enquiry received${context ? ` (${context})` : ''}: ${message || '(no message)'}`.slice(0, 1000)]);
}

export const enquiries = resourceRouter({
  module: 'enquiries', table: 'enquiries', prefix: 'ENQ-',
  fields: enquiryFields,
  select: 'ex.name AS assigned_name, pr.name AS property_name, mg.name AS manager_name, ab.name AS assigned_by_name',
  joins: `${userJoin('assigned_to', 'ex')} ${userJoin('manager_id', 'mg')} ${userJoin('assigned_by', 'ab')} LEFT JOIN properties pr ON pr.id=t.property_id`,
  search: ['t.name', 't.code', 't.phone', 't.email', 't.property_title', 't.interested_project', 'pr.name'],
  filters: ['status', 'source', 'enquiry_type', 'priority', 'assigned_to', 'manager_id', 'property_id', 'buyer_id'],
  extraSort: ['next_followup_at'],
  scope: scopeOwn('enquiries'),
  exportCols: ['code', 'created_at', 'name', 'phone', 'email', 'location', 'address', 'enquiry_type', 'source', 'form_name', 'website_page', 'property_name', 'property_title', 'interested_project', 'message', 'budget', 'preferred_area', 'preferred_location', 'assigned_name', 'manager_name', 'priority', 'status', 'next_followup_at', 'internal_remarks', 'repeat_count', 'updated_at'],
  lockedOnUpdate: (req) => [...(can(req, 'enquiries.assign') ? [] : ['assigned_to', 'manager_id'])],
  hooks: {
    beforeCreate: async (v, req) => {
      if (!can(req, 'enquiries.assign')) v.assigned_to = req.user.id;
      const dup = await findOpenDuplicate(null, v.phone, v.property_id);
      if (v.assigned_to) { v.assigned_at = new Date().toISOString().slice(0, 19).replace('T', ' '); v.assigned_by = req.user?.id ?? null; }
      if (dup) {
        await recordRepeat(dup.id, v.message, req.user?.id);
        return { status: 200, response: { duplicate: true, id: dup.id, code: dup.code, message: `An open enquiry (${dup.code}) already exists for this customer. The new message was added to its history.` } };
      }
      if (v.assigned_to && v.status === 'new') v.status = 'assigned';
      const [prev] = await query("SELECT id FROM enquiries WHERE RIGHT(REPLACE(REPLACE(phone,' ',''),'-',''),10)=? AND deleted_at IS NULL ORDER BY id DESC LIMIT 1", [String(v.phone).replace(/^(\+?91)/, '').slice(-10)]);
      if (prev) v.repeat_of_id = prev.id;
    },
    afterCreate: async (conn, id, v, req) => {
      await conn.query('INSERT INTO enquiry_status_history (enquiry_id, from_status, to_status, user_id) VALUES (?,?,?,?)', [id, null, v.status, req.user?.id ?? null]);
      try { const cid = await upsertCustomer({ name: v.name, phone: v.phone, email: v.email, address: v.address, type: v.source === 'sell_land' ? 'seller' : 'buyer', userId: req.user?.id }); if (cid) await conn.query('UPDATE enquiries SET customer_id=? WHERE id=?', [cid, id]); } catch (e) { console.error('customer link failed', e.message); }
      if (v.assigned_to) await conn.query('INSERT INTO lead_assignments (enquiry_id, assigned_to, assigned_by) VALUES (?,?,?)', [id, v.assigned_to, req.user?.id ?? null]);
      if (v.assigned_to && v.assigned_to !== req.user?.id) await notifyUsers([v.assigned_to], 'New lead assigned to you', `${v.name} (${v.phone})`, `/admin/crm/enquiries?view=${id}`);
    },
    beforeUpdate: async (v, prev, req) => {
      if (v.status === 'new' && prev.assigned_to) v.status = 'assigned';
      if (v.assigned_to && v.assigned_to !== prev.assigned_to && (v.status ?? prev.status) === 'new') v.status = 'assigned';
      if (v.assigned_to && v.assigned_to !== prev.assigned_to) { v.assigned_at = new Date().toISOString().slice(0, 19).replace('T', ' '); v.assigned_by = req?.user?.id ?? null; }
    },
    afterUpdate: async (conn, id, v, prev, req) => {
      if (v.status && v.status !== prev.status) await conn.query('INSERT INTO enquiry_status_history (enquiry_id, from_status, to_status, user_id) VALUES (?,?,?,?)', [id, prev.status, v.status, req.user.id]);
      if (v.assigned_to && v.assigned_to !== prev.assigned_to) {
        await conn.query('INSERT INTO lead_assignments (enquiry_id, assigned_to, assigned_by) VALUES (?,?,?)', [id, v.assigned_to, req.user.id]);
        if (v.assigned_to !== req.user.id) await notifyUsers([v.assigned_to], `Lead ${prev.code} assigned to you`, `${prev.name} (${prev.phone})`, `/admin/crm/enquiries?view=${id}`);
      }
      if (v.status && v.status !== prev.status) {
        const who = [v.assigned_to ?? prev.assigned_to, v.manager_id ?? prev.manager_id].filter((u) => u && u !== req.user.id);
        await notifyUsers(who, `Lead ${prev.code}: ${String(prev.status).replace(/_/g, ' ')} → ${String(v.status).replace(/_/g, ' ')}`, `${prev.name} — updated by ${req.user.name || 'a team member'}`, `/admin/crm/enquiries?view=${id}`);
      }
    },
    decorate: async (row) => {
      row.followups = await query('SELECT f.id, f.type, f.notes, f.outcome, f.followup_date, f.done, f.created_at, u.name AS user_name FROM followups f LEFT JOIN users u ON u.id=f.user_id WHERE f.enquiry_id=? ORDER BY f.id DESC', [row.id]);
      row.status_history = await query('SELECT h.from_status, h.to_status, h.created_at, u.name AS user_name FROM enquiry_status_history h LEFT JOIN users u ON u.id=h.user_id WHERE h.enquiry_id=? ORDER BY h.id DESC', [row.id]);
      row.assignments = await query('SELECT a.created_at, t.name AS assigned_to_name, b.name AS assigned_by_name FROM lead_assignments a JOIN users t ON t.id=a.assigned_to LEFT JOIN users b ON b.id=a.assigned_by WHERE a.enquiry_id=? ORDER BY a.id DESC', [row.id]);
      row.site_visits = await query('SELECT id, code, visit_date, visit_time, status FROM site_visits WHERE enquiry_id=? AND deleted_at IS NULL ORDER BY visit_date DESC', [row.id]);
      row.previous_enquiries = await relatedEnquiries(row.id, row.phone, row.email);
      try { row.form_data = row.form_data ? JSON.parse(row.form_data) : null; } catch { row.form_data = null; }
    },
  },
});

// ---------- Site visits ----------
export const siteVisits = resourceRouter({
  module: 'site_visits', table: 'site_visits', prefix: 'VST-', defaultSort: 'visit_date',
  fields: [
    { name: 'enquiry_id', label: 'Enquiry', type: 'fk' }, { name: 'buyer_id', label: 'Buyer', type: 'fk' },
    { name: 'buyer_name', label: 'Buyer name', type: 'string', required: true, max: 120 }, { name: 'buyer_phone', label: 'Buyer phone', type: 'phone', required: true },
    { name: 'property_id', label: 'Selected property', type: 'fk', required: true }, { name: 'parcel_id', label: 'Selected parcel', type: 'fk' },
    { name: 'visit_date', label: 'Visit date', type: 'date', required: true }, { name: 'visit_time', label: 'Visit time', type: 'time' },
    { name: 'assigned_to', label: 'Assigned executive', type: 'fk' }, { name: 'meeting_location', label: 'Meeting location', type: 'string', max: 255 },
    { name: 'status', type: 'enum', values: ['scheduled', 'confirmed', 'rescheduled', 'completed', 'cancelled', 'no_show'], default: 'scheduled' },
    { name: 'customer_id', label: 'Customer', type: 'fk' }, { name: 'lead_id', label: 'Lead', type: 'fk' }, { name: 'transport_details', label: 'Transport details', type: 'string', max: 300 }, { name: 'photos', label: 'Visit photos', type: 'json' },
    { name: 'feedback', label: 'Customer feedback', type: 'text' }, { name: 'followup_date', label: 'Follow-up date', type: 'date' }, { name: 'remarks', type: 'text' },
  ],
  select: 'ex.name AS assigned_name, pr.name AS property_name, pc.parcel_number',
  joins: `${userJoin('assigned_to', 'ex')} LEFT JOIN properties pr ON pr.id=t.property_id LEFT JOIN land_parcels pc ON pc.id=t.parcel_id`,
  search: ['t.buyer_name', 't.buyer_phone', 't.code', 'pr.name'],
  filters: ['status', 'assigned_to', 'property_id', 'visit_date'],
  scope: scopeOwn('site_visits'),
  exportCols: ['code', 'visit_date', 'visit_time', 'buyer_name', 'buyer_phone', 'property_name', 'parcel_number', 'meeting_location', 'assigned_name', 'status', 'followup_date', 'feedback'],
  hooks: {
    beforeCreate: async (v, req) => {
      if (v.parcel_id) { const [p] = await query('SELECT id FROM land_parcels WHERE id=? AND property_id=? AND deleted_at IS NULL', [v.parcel_id, v.property_id]); if (!p) return { errors: { parcel_id: 'This parcel does not belong to the selected property' } }; }
      if (!v.assigned_to) v.assigned_to = req.user.id;
    },
    afterCreate: async (conn, id, v, req) => {
      try {
        let cid = v.customer_id || null; let lid = v.lead_id || null;
        if (v.enquiry_id) { const [[en]] = await conn.query('SELECT customer_id, lead_id FROM enquiries WHERE id=?', [v.enquiry_id]); cid = cid || en?.customer_id || null; lid = lid || en?.lead_id || null; }
        if (!cid) cid = await upsertCustomer({ name: v.buyer_name, phone: v.buyer_phone, userId: req.user.id });
        await conn.query('UPDATE site_visits SET customer_id=?, lead_id=? WHERE id=?', [cid, lid, id]);
        if (lid) {
          await conn.query("UPDATE leads SET status='site_visit_scheduled' WHERE id=? AND status IN ('new','contacted','qualified')", [lid]);
          await conn.query("INSERT INTO lead_activities (lead_id, kind, body, user_id) VALUES (?, 'note', 'Site visit scheduled', ?)", [lid, req.user.id]);
        }
      } catch (e) { console.error('site visit link failed', e.message); }
      if (v.enquiry_id) {
        const [[e]] = await conn.query('SELECT id, status FROM enquiries WHERE id=? AND deleted_at IS NULL', [v.enquiry_id]);
        if (e && !CLOSED.includes(e.status) && e.status !== 'site_visit_scheduled') {
          await conn.query("UPDATE enquiries SET status='site_visit_scheduled' WHERE id=?", [e.id]);
          await conn.query('INSERT INTO enquiry_status_history (enquiry_id, from_status, to_status, user_id) VALUES (?,?,?,?)', [e.id, e.status, 'site_visit_scheduled', req.user.id]);
        }
      }
    },
  },
});
