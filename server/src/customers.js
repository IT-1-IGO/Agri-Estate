import { query } from './db.js';

export const normPhone = (p) => { const d = String(p || '').replace(/\D/g, ''); return d.length > 10 ? d.slice(-10) : d; };
const normEmail = (e) => String(e || '').trim().toLowerCase();

/** Finds a customer by phone OR email (so the same person is never stored twice), otherwise creates one. Returns the customer id. */
export async function upsertCustomer({ name, phone, email, address, type = 'buyer', userId = null }) {
  const ph = normPhone(phone); const em = normEmail(email);
  if (!ph && !em) return null;
  const conds = []; const params = [];
  if (ph) { conds.push('phone = ?'); params.push(ph); }
  if (em) { conds.push('email = ?'); params.push(em); }
  const [found] = await query(`SELECT id, name, address, customer_type FROM customers WHERE deleted_at IS NULL AND (${conds.join(' OR ')}) ORDER BY id LIMIT 1`, params);
  if (found) {
    // fill gaps only; never overwrite what staff typed
    await query('UPDATE customers SET phone=COALESCE(NULLIF(phone,\'\'),?), email=COALESCE(NULLIF(email,\'\'),?), address=COALESCE(NULLIF(address,\'\'),?) WHERE id=?', [ph || null, em || null, address || null, found.id]);
    return found.id;
  }
  const ins = await query('INSERT INTO customers (name, phone, email, address, customer_type, created_by) VALUES (?,?,?,?,?,?)', [String(name || 'Customer').slice(0, 120), ph || null, em || null, address ? String(address).slice(0, 300) : null, type, userId]);
  await query("UPDATE customers SET code=CONCAT('CUS-', LPAD(id,5,'0')) WHERE id=?", [ins.insertId]);
  return ins.insertId;
}

/** Links an enquiry to its customer record (creating the customer when new). Safe to call repeatedly. */
export async function linkEnquiryCustomer(enquiryId, userId = null) {
  const [e] = await query('SELECT id, name, phone, email, address, source, customer_id FROM enquiries WHERE id=?', [enquiryId]);
  if (!e || e.customer_id) return e?.customer_id || null;
  const cid = await upsertCustomer({ name: e.name, phone: e.phone, email: e.email, address: e.address, type: e.source === 'sell_land' ? 'seller' : 'buyer', userId });
  if (cid) await query('UPDATE enquiries SET customer_id=? WHERE id=?', [cid, e.id]);
  return cid;
}

/** One-off + idempotent: attaches every existing enquiry to a customer. Existing enquiry data is never changed other than customer_id. */
export async function backfillCustomers() {
  const rows = await query('SELECT id FROM enquiries WHERE customer_id IS NULL AND deleted_at IS NULL ORDER BY id');
  for (const r of rows) await linkEnquiryCustomer(r.id);
  return rows.length;
}
