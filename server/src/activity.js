import { query } from './db.js';

export async function logActivity(req, module, action, recordId, previous, updated) {
  try {
    const ip = (req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '').toString().split(',')[0].trim();
    await query('INSERT INTO activity_logs (user_id, username, module, action, record_id, previous_value, updated_value, ip_address) VALUES (?,?,?,?,?,?,?,?)', [
      req?.user?.id ?? null, req?.user?.username ?? null, module, action, recordId != null ? String(recordId) : null,
      previous == null ? null : JSON.stringify(previous).slice(0, 60000), updated == null ? null : JSON.stringify(updated).slice(0, 60000), ip.slice(0, 64),
    ]);
  } catch (e) { console.error('activity log failed', e.message); }
}
