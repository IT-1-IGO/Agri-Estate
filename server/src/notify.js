import { query } from './db.js';

/** Creates in-app notifications. `dedupeKey` makes repeated calls (e.g. reminder sweeps) harmless. */
export async function notifyUsers(userIds, title, body, link, dedupeKey = null) {
  const ids = [...new Set((userIds || []).filter(Boolean))];
  for (const uid of ids) {
    try {
      await query('INSERT IGNORE INTO notifications (user_id, title, body, link, dedupe_key) VALUES (?,?,?,?,?)', [uid, String(title).slice(0, 200), body ? String(body).slice(0, 500) : null, link || null, dedupeKey]);
    } catch (e) { console.error('notify failed', e.message); }
  }
}

/** Active users who hold a permission (super admins always do). */
export async function usersWithPerm(perm) {
  const [module, action] = perm.split('.');
  return (await query(
    `SELECT DISTINCT u.id FROM users u JOIN roles r ON r.id=u.role_id
     WHERE u.deleted_at IS NULL AND u.status='active' AND (r.name='super_admin' OR EXISTS (
       SELECT 1 FROM role_permissions rp JOIN permissions p ON p.id=rp.permission_id WHERE rp.role_id=u.role_id AND p.module=? AND p.action=?))`, [module, action])).map((x) => x.id);
}

/** Follow-up reminders and upcoming site visits (next 24h). Safe to run repeatedly. */
export async function runReminders() {
  const due = await query(
    `SELECT f.id, f.followup_date, e.id AS eid, e.code, e.name, COALESCE(e.assigned_to, f.user_id) AS uid
     FROM followups f JOIN enquiries e ON e.id=f.enquiry_id
     WHERE f.done=0 AND e.deleted_at IS NULL AND f.followup_date IS NOT NULL AND f.followup_date <= DATE_ADD(NOW(), INTERVAL 1 HOUR)
       AND e.status NOT IN ('converted','closed','not_interested')`);
  for (const d of due) await notifyUsers([d.uid], `Follow-up due: ${d.code}`, `${d.name} — follow-up was due ${String(d.followup_date).slice(0, 16)}`, `/admin/crm/enquiries?view=${d.eid}`, `fu-${d.id}`);
  const visits = await query(
    `SELECT v.id, v.code, v.buyer_name, v.visit_date, v.visit_time, v.assigned_to FROM site_visits v
     WHERE v.deleted_at IS NULL AND v.status IN ('scheduled','confirmed','rescheduled')
       AND TIMESTAMP(v.visit_date, COALESCE(v.visit_time,'09:00:00')) BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 24 HOUR)`);
  for (const v of visits) await notifyUsers([v.assigned_to], `Upcoming site visit: ${v.code}`, `${v.buyer_name} on ${String(v.visit_date).slice(0, 10)} ${String(v.visit_time || '').slice(0, 5)}`, '/admin/crm/site-visits', `sv-${v.id}`);
  // lead follow-ups due and overdue tasks (one reminder per day per record)
  const dueLeads = await query("SELECT id, code, name, assigned_to FROM leads WHERE deleted_at IS NULL AND status NOT IN ('won','lost') AND next_followup_date IS NOT NULL AND next_followup_date<=CURDATE() AND assigned_to IS NOT NULL");
  const day = new Date().toISOString().slice(0, 10);
  for (const l of dueLeads) await notifyUsers([l.assigned_to], `Lead follow-up due: ${l.code}`, l.name, `/admin/crm/leads?view=${l.id}`, `lead-fu-${l.id}-${day}`);
  const overdue = await query("SELECT id, code, title, assigned_to FROM tasks WHERE deleted_at IS NULL AND status IN ('pending','in_progress') AND due_date IS NOT NULL AND due_date<CURDATE() AND assigned_to IS NOT NULL");
  for (const t of overdue) await notifyUsers([t.assigned_to], `Task overdue: ${t.code}`, t.title, '/admin/crm/tasks', `task-overdue-${t.id}-${day}`);
  return { followups: due.length, visits: visits.length, leads: dueLeads.length, tasks: overdue.length };
}
