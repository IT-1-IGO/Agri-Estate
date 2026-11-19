import express from 'express';
import { query } from '../db.js';
import { requirePerm, can } from '../auth.js';

const r = express.Router();
r.get('/', requirePerm('dashboard.view'), async (req, res, next) => {
  try {
    const own = (a = 't') => (can(req, 'enquiries.view_all') ? ['', []] : [` AND (${a}.assigned_to=? OR ${a}.created_by=?)`, [req.user.id, req.user.id]]);
    const [es, ep] = own();
    const one = async (sql, p = []) => Object.values((await query(sql, p))[0] || { v: 0 })[0] ?? 0;
    const [cs, cp] = can(req, 'properties.view_all') ? ['', []] : [' AND (t.assigned_to=? OR t.created_by=?)', [req.user.id, req.user.id]];
    const stats = {
      properties: await one(`SELECT COUNT(*) FROM properties t WHERE deleted_at IS NULL${cs}`, cp),
      available: await one(`SELECT COUNT(*) FROM properties t WHERE deleted_at IS NULL AND status='available'${cs}`, cp),
      reserved: await one(`SELECT COUNT(*) FROM properties t WHERE deleted_at IS NULL AND status='reserved'${cs}`, cp),
      sold: await one(`SELECT COUNT(*) FROM properties t WHERE deleted_at IS NULL AND status='sold'${cs}`, cp),
      landowners: await one('SELECT COUNT(*) FROM landowners WHERE deleted_at IS NULL'),
      buyers: await one('SELECT COUNT(*) FROM buyers WHERE deleted_at IS NULL'),
      enquiries: await one(`SELECT COUNT(*) FROM enquiries t WHERE deleted_at IS NULL${es}`, ep),
      new_leads: await one(`SELECT COUNT(*) FROM enquiries t WHERE deleted_at IS NULL AND status='new'${es}`, ep),
      converted: await one(`SELECT COUNT(*) FROM enquiries t WHERE deleted_at IS NULL AND status='converted'${es}`, ep),
      upcoming_visits: await one(`SELECT COUNT(*) FROM site_visits t WHERE deleted_at IS NULL AND visit_date>=CURDATE() AND status IN ('scheduled','confirmed','rescheduled')${can(req, 'site_visits.view_all') ? '' : ' AND (t.assigned_to=? OR t.created_by=?)'}`, can(req, 'site_visits.view_all') ? [] : [req.user.id, req.user.id]),
      assigned: await one(`SELECT COUNT(*) FROM enquiries t WHERE deleted_at IS NULL AND status='assigned'${es}`, ep),
      interested: await one(`SELECT COUNT(*) FROM enquiries t WHERE deleted_at IS NULL AND status='interested'${es}`, ep),
      site_visit_leads: await one(`SELECT COUNT(*) FROM enquiries t WHERE deleted_at IS NULL AND status='site_visit_scheduled'${es}`, ep),
      closed: await one(`SELECT COUNT(*) FROM enquiries t WHERE deleted_at IS NULL AND status IN ('closed','not_interested')${es}`, ep),
      pending_followups: await one(`SELECT COUNT(*) FROM enquiries t WHERE deleted_at IS NULL AND next_followup_at IS NOT NULL AND next_followup_at<=NOW() AND status NOT IN ('converted','closed','not_interested')${es}`, ep),
    };
    stats.conversion_rate = stats.enquiries ? Math.round((stats.converted / stats.enquiries) * 1000) / 10 : 0;
    const monthly = await query(`SELECT DATE_FORMAT(created_at,'%Y-%m') AS month, COUNT(*) AS enquiries, SUM(status='converted') AS converted FROM enquiries t
      WHERE deleted_at IS NULL AND created_at >= DATE_SUB(DATE_FORMAT(CURDATE(),'%Y-%m-01'), INTERVAL 5 MONTH)${es} GROUP BY month ORDER BY month`, ep);
    const daily = await query(`SELECT DATE(created_at) AS day, COUNT(*) AS enquiries FROM enquiries t WHERE deleted_at IS NULL AND created_at >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)${es} GROUP BY day ORDER BY day`, ep);
    const conversionBySource = await query(`SELECT source, COUNT(*) AS total, SUM(status='converted') AS converted FROM enquiries t WHERE deleted_at IS NULL${es} GROUP BY source ORDER BY total DESC`, ep);
    const bySource = await query(`SELECT source, COUNT(*) AS count FROM enquiries t WHERE deleted_at IS NULL${es} GROUP BY source ORDER BY count DESC`, ep);
    const byStatus = await query(`SELECT status, COUNT(*) AS count FROM enquiries t WHERE deleted_at IS NULL${es} GROUP BY status`, ep);
    const recentEnquiries = await query(`SELECT t.id, t.code, t.name, t.phone, t.status, t.source, t.property_title, t.created_at FROM enquiries t WHERE deleted_at IS NULL${es} ORDER BY t.id DESC LIMIT 6`, ep);
    const recentProperties = await query(`SELECT t.id, t.code, t.name, t.status, t.district, t.price, t.created_at FROM properties t WHERE deleted_at IS NULL${cs} ORDER BY t.id DESC LIMIT 6`, cp);
    const visitsWhere = can(req, 'site_visits.view_all') ? '' : ' AND (t.assigned_to=? OR t.created_by=?)';
    const upcomingVisits = await query(`SELECT t.id, t.code, t.buyer_name, t.visit_date, t.visit_time, t.status, p.name AS property_name FROM site_visits t LEFT JOIN properties p ON p.id=t.property_id
      WHERE t.deleted_at IS NULL AND t.visit_date>=CURDATE() AND t.status IN ('scheduled','confirmed','rescheduled')${visitsWhere} ORDER BY t.visit_date, t.visit_time LIMIT 6`, can(req, 'site_visits.view_all') ? [] : [req.user.id, req.user.id]);
    const performance = can(req, 'enquiries.view_all') ? await query(`SELECT u.id, u.name, COUNT(e.id) AS leads, SUM(e.status='converted') AS converted, SUM(e.status IN ('contacted','followup_pending','interested','site_visit_scheduled','negotiation')) AS in_progress FROM users u LEFT JOIN enquiries e ON e.assigned_to=u.id AND e.deleted_at IS NULL
      WHERE u.deleted_at IS NULL AND u.status='active' GROUP BY u.id, u.name HAVING leads>0 ORDER BY converted DESC, leads DESC LIMIT 8`) : [];
    res.json({ stats, daily, conversionBySource, monthly, bySource, byStatus, recentEnquiries, recentProperties, upcomingVisits, performance });
  } catch (e) { next(e); }
});
export default r;
