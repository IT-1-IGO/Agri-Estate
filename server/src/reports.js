import express from 'express';
import { query } from './db.js';
import { can, requirePerm } from './auth.js';
import { logActivity } from './activity.js';

const FMT = { day: '%Y-%m-%d', week: '%x-W%v', month: '%Y-%m' };
const rng = (col, q, params) => { let s = ''; if (q.from) { s += ` AND ${col} >= ?`; params.push(`${String(q.from).slice(0, 10)} 00:00:00`); } if (q.to) { s += ` AND ${col} <= ?`; params.push(`${String(q.to).slice(0, 10)} 23:59:59`); } return s; };
const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0);

export const REPORTS = {
  enquiries: { title: 'Enquiries (daily / weekly / monthly)', columns: [{ key: 'period', label: 'Period' }, { key: 'total', label: 'Enquiries' }, { key: 'buy_land', label: 'Buy land' }, { key: 'sell_land', label: 'Sell land' }, { key: 'other', label: 'Other' }, { key: 'converted', label: 'Converted' }],
    run: async (q) => { const p = []; const f = FMT[q.group] || FMT.day; const w = rng('created_at', q, p);
      return query(`SELECT DATE_FORMAT(created_at,'${f}') AS period, COUNT(*) total, SUM(source='buy_land') buy_land, SUM(source='sell_land') sell_land, SUM(source NOT IN ('buy_land','sell_land')) other, SUM(status='converted') converted FROM enquiries WHERE deleted_at IS NULL${w} GROUP BY period ORDER BY period`, p); } },
  buy_vs_sell: { title: 'Buy Land vs Sell Land enquiries', columns: [{ key: 'type', label: 'Type' }, { key: 'total', label: 'Enquiries' }, { key: 'converted', label: 'Converted' }, { key: 'rate', label: 'Conversion %' }],
    run: async (q) => { const p = []; const w = rng('created_at', q, p);
      const rows = await query(`SELECT CASE source WHEN 'buy_land' THEN 'Buy Land' WHEN 'sell_land' THEN 'Sell Land' ELSE 'Other' END AS type, COUNT(*) total, SUM(status='converted') converted FROM enquiries WHERE deleted_at IS NULL${w} GROUP BY type ORDER BY total DESC`, p);
      return rows.map((r) => ({ ...r, converted: Number(r.converted), rate: pct(Number(r.converted), r.total) })); } },
  lead_conversion: { title: 'Lead conversion funnel', columns: [{ key: 'stage', label: 'Stage' }, { key: 'count', label: 'Count' }, { key: 'rate', label: '% of enquiries' }],
    run: async (q) => { const p = []; const w = rng('created_at', q, p); const one = async (sql) => Number(Object.values((await query(sql, p))[0] || { v: 0 })[0] || 0);
      const enq = await one(`SELECT COUNT(*) FROM enquiries WHERE deleted_at IS NULL${w}`);
      const stages = [['Enquiries', enq], ['Leads', await one(`SELECT COUNT(*) FROM leads WHERE deleted_at IS NULL${w}`)], ['Qualified or beyond', await one(`SELECT COUNT(*) FROM leads WHERE deleted_at IS NULL AND status IN ('qualified','site_visit_scheduled','negotiation','won')${w}`)],
        ['Site visits', await one(`SELECT COUNT(*) FROM site_visits WHERE deleted_at IS NULL${w}`)], ['Proposals', await one(`SELECT COUNT(*) FROM proposals WHERE deleted_at IS NULL${w}`)],
        ['Bookings', await one(`SELECT COUNT(*) FROM bookings WHERE deleted_at IS NULL AND status<>'cancelled'${w}`)], ['Deals closed', await one(`SELECT COUNT(*) FROM bookings WHERE deleted_at IS NULL AND status='deal_closed'${w}`)]];
      return stages.map(([stage, count]) => ({ stage, count, rate: pct(count, enq) })); } },
  executive_performance: { title: 'Executive performance', columns: [{ key: 'name', label: 'Executive' }, { key: 'enquiries', label: 'Enquiries' }, { key: 'leads', label: 'Leads' }, { key: 'won', label: 'Won' }, { key: 'lost', label: 'Lost' }, { key: 'visits', label: 'Site visits done' }, { key: 'revenue', label: 'Revenue collected (₹)', money: true }, { key: 'rate', label: 'Win rate %' }],
    run: async (q) => { const p = []; const f = rng('l.created_at', q, p);
      const rows = await query(`SELECT u.id, u.name,
        (SELECT COUNT(*) FROM enquiries e WHERE e.assigned_to=u.id AND e.deleted_at IS NULL) enquiries,
        COUNT(l.id) leads, COALESCE(SUM(l.status='won'),0) won, COALESCE(SUM(l.status='lost'),0) lost,
        (SELECT COUNT(*) FROM site_visits v WHERE v.assigned_to=u.id AND v.deleted_at IS NULL AND v.status='completed') visits,
        COALESCE((SELECT SUM(pm.amount) FROM payments pm JOIN bookings b ON b.id=pm.booking_id JOIN leads l2 ON l2.id=b.lead_id WHERE l2.assigned_to=u.id AND b.deleted_at IS NULL),0) revenue
        FROM users u LEFT JOIN leads l ON l.assigned_to=u.id AND l.deleted_at IS NULL${f} WHERE u.deleted_at IS NULL AND u.status='active' GROUP BY u.id, u.name HAVING enquiries>0 OR leads>0 ORDER BY won DESC, leads DESC`, p);
      return rows.map((r) => ({ ...r, won: Number(r.won), lost: Number(r.lost), revenue: Number(r.revenue), rate: pct(Number(r.won), Number(r.won) + Number(r.lost)) })); } },
  property_enquiries: { title: 'Property-wise enquiries', columns: [{ key: 'name', label: 'Property' }, { key: 'enquiries', label: 'Enquiries' }, { key: 'leads', label: 'Leads' }, { key: 'visits', label: 'Site visits' }, { key: 'bookings', label: 'Bookings' }],
    run: async (q) => { const p = []; const w = rng('e.created_at', q, p);
      return query(`SELECT p.name, COUNT(DISTINCT e.id) enquiries, (SELECT COUNT(*) FROM leads l WHERE l.property_id=p.id AND l.deleted_at IS NULL) leads, (SELECT COUNT(*) FROM site_visits v WHERE v.property_id=p.id AND v.deleted_at IS NULL) visits, (SELECT COUNT(*) FROM bookings b WHERE b.property_id=p.id AND b.deleted_at IS NULL AND b.status<>'cancelled') bookings
        FROM properties p LEFT JOIN enquiries e ON e.property_id=p.id AND e.deleted_at IS NULL${w} WHERE p.deleted_at IS NULL GROUP BY p.id, p.name ORDER BY enquiries DESC, p.name LIMIT 200`, p); } },
  site_visits: { title: 'Site visits', columns: [{ key: 'period', label: 'Period' }, { key: 'total', label: 'Visits' }, { key: 'completed', label: 'Completed' }, { key: 'cancelled', label: 'Cancelled' }, { key: 'no_show', label: 'No-show' }, { key: 'upcoming', label: 'Upcoming' }],
    run: async (q) => { const p = []; const f = FMT[q.group] || FMT.month; const w = rng('visit_date', q, p);
      return query(`SELECT DATE_FORMAT(visit_date,'${f}') period, COUNT(*) total, SUM(status='completed') completed, SUM(status='cancelled') cancelled, SUM(status='no_show') no_show, SUM(status IN ('scheduled','confirmed','rescheduled') AND visit_date>=CURDATE()) upcoming FROM site_visits WHERE deleted_at IS NULL${w} GROUP BY period ORDER BY period`, p); } },
  bookings: { title: 'Bookings', columns: [{ key: 'code', label: 'Booking' }, { key: 'customer', label: 'Customer' }, { key: 'property', label: 'Property' }, { key: 'booking_date', label: 'Date' }, { key: 'total_amount', label: 'Total (₹)', money: true }, { key: 'paid_amount', label: 'Paid (₹)', money: true }, { key: 'payment_status', label: 'Payment' }, { key: 'status', label: 'Status' }],
    run: async (q) => { const p = []; const w = rng('b.booking_date', q, p);
      return query(`SELECT b.code, c.name customer, pr.name property, DATE_FORMAT(b.booking_date,'%Y-%m-%d') booking_date, b.total_amount, b.paid_amount, b.payment_status, b.status FROM bookings b LEFT JOIN customers c ON c.id=b.customer_id LEFT JOIN properties pr ON pr.id=b.property_id WHERE b.deleted_at IS NULL${w} ORDER BY b.booking_date DESC, b.id DESC`, p); } },
  revenue: { title: 'Sales revenue (payments received)', columns: [{ key: 'period', label: 'Period' }, { key: 'payments', label: 'Payments' }, { key: 'amount', label: 'Amount received (₹)', money: true }],
    run: async (q) => { const p = []; const f = FMT[q.group] || FMT.month; const w = rng('paid_on', q, p);
      return query(`SELECT DATE_FORMAT(paid_on,'${f}') period, COUNT(*) payments, SUM(amount) amount FROM payments WHERE 1=1${w} GROUP BY period ORDER BY period`, p); } },
  pending_payments: { title: 'Pending payments', columns: [{ key: 'code', label: 'Booking' }, { key: 'customer', label: 'Customer' }, { key: 'phone', label: 'Phone' }, { key: 'property', label: 'Property' }, { key: 'total_amount', label: 'Total (₹)', money: true }, { key: 'paid_amount', label: 'Paid (₹)', money: true }, { key: 'balance', label: 'Balance (₹)', money: true }, { key: 'days', label: 'Days since booking' }],
    run: async (q) => { const p = []; const w = rng('b.booking_date', q, p);
      return query(`SELECT b.code, c.name customer, c.phone, pr.name property, b.total_amount, b.paid_amount, (b.total_amount-b.paid_amount) balance, DATEDIFF(CURDATE(), b.booking_date) days FROM bookings b LEFT JOIN customers c ON c.id=b.customer_id LEFT JOIN properties pr ON pr.id=b.property_id WHERE b.deleted_at IS NULL AND b.status<>'cancelled' AND b.total_amount>b.paid_amount${w} ORDER BY balance DESC`, p); } },
  land_availability: { title: 'Available vs sold land', columns: [{ key: 'status', label: 'Status' }, { key: 'properties', label: 'Properties' }, { key: 'parcels', label: 'Parcels' }],
    run: async () => { const props = await query('SELECT status, COUNT(*) n FROM properties WHERE deleted_at IS NULL GROUP BY status'); const parcels = await query('SELECT status, COUNT(*) n FROM land_parcels WHERE deleted_at IS NULL GROUP BY status');
      return ['available', 'reserved', 'sold'].map((s) => ({ status: s, properties: Number(props.find((x) => x.status === s)?.n || 0), parcels: Number(parcels.find((x) => x.status === s)?.n || 0) })); } },
  lost_leads: { title: 'Lost lead report', columns: [{ key: 'reason', label: 'Reason' }, { key: 'count', label: 'Leads lost' }, { key: 'budget', label: 'Budget at stake (₹)', money: true }],
    run: async (q) => { const p = []; const w = rng('updated_at', q, p);
      return query(`SELECT COALESCE(NULLIF(lost_reason,''),'Not recorded') reason, COUNT(*) count, COALESCE(SUM(budget),0) budget FROM leads WHERE deleted_at IS NULL AND status='lost'${w} GROUP BY reason ORDER BY count DESC`, p); } },
};

const csvCell = (v) => { const s = v == null ? '' : String(v); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
export const reports = express.Router();
reports.get('/', requirePerm('reports.view'), (req, res) => res.json(Object.entries(REPORTS).map(([key, r]) => ({ key, title: r.title }))));
reports.get('/:name', requirePerm('reports.view'), async (req, res, next) => {
  try {
    const def = REPORTS[req.params.name]; if (!def) return res.status(404).json({ error: 'Unknown report' });
    const rows = (await def.run(req.query)).map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v instanceof Date ? v.toISOString().slice(0, 10) : typeof v === 'bigint' ? Number(v) : v])));
    const fmt = req.query.export;
    if (fmt === 'xlsx' || fmt === 'csv') {
      if (!can(req, 'reports.export')) return res.status(403).json({ error: 'You do not have permission to export' });
      await logActivity(req, 'reports', 'export', null, null, { report: req.params.name, format: fmt });
      const file = `${req.params.name}-${new Date().toISOString().slice(0, 10)}`;
      if (fmt === 'csv') { res.setHeader('Content-Type', 'text/csv; charset=utf-8'); res.setHeader('Content-Disposition', `attachment; filename="${file}.csv"`); return res.send('﻿' + [def.columns.map((c) => c.label).join(','), ...rows.map((r) => def.columns.map((c) => csvCell(r[c.key])).join(','))].join('\r\n')); }
      const { default: ExcelJS } = await import('exceljs'); const wb = new ExcelJS.Workbook(); const ws = wb.addWorksheet(def.title.slice(0, 30));
      ws.columns = def.columns.map((c) => ({ header: c.label, key: c.key, width: Math.max(14, c.label.length + 4) }));
      rows.forEach((r) => ws.addRow(r)); ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }; ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF143D27' } }; ws.views = [{ state: 'frozen', ySplit: 1 }];
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'); res.setHeader('Content-Disposition', `attachment; filename="${file}.xlsx"`);
      await wb.xlsx.write(res); return res.end();
    }
    res.json({ title: def.title, columns: def.columns, rows });
  } catch (e) { next(e); }
});

// Business overview dashboard (date filtered)
export const erpDashboard = express.Router();
erpDashboard.get('/', requirePerm('dashboard.view'), async (req, res, next) => {
  try {
    const own = (mod, a = 't') => (can(req, `${mod}.view_all`) ? ['', []] : [` AND (${a}.assigned_to=? OR ${a}.created_by=?)`, [req.user.id, req.user.id]]);
    const from = req.query.from ? `${String(req.query.from).slice(0, 10)} 00:00:00` : null; const to = req.query.to ? `${String(req.query.to).slice(0, 10)} 23:59:59` : null;
    const range = (col) => { const p = []; let s = ''; if (from) { s += ` AND ${col}>=?`; p.push(from); } if (to) { s += ` AND ${col}<=?`; p.push(to); } return [s, p]; };
    const one = async (sql, p = []) => Number(Object.values((await query(sql, p))[0] || { v: 0 })[0] || 0);
    const [es, ep] = own('enquiries'); const [ls, lp] = own('leads'); const [er, erp_] = range('t.created_at'); const [lr, lrp] = range('t.created_at');
    const tiles = {
      total_enquiries: await one(`SELECT COUNT(*) FROM enquiries t WHERE t.deleted_at IS NULL${es}${er}`, [...ep, ...erp_]),
      new_enquiries: await one(`SELECT COUNT(*) FROM enquiries t WHERE t.deleted_at IS NULL AND t.status='new'${es}${er}`, [...ep, ...erp_]),
      active_leads: await one(`SELECT COUNT(*) FROM leads t WHERE t.deleted_at IS NULL AND t.status NOT IN ('won','lost')${ls}`, lp),
      available_parcels: await one("SELECT COUNT(*) FROM land_parcels WHERE deleted_at IS NULL AND status='available'"),
      total_properties: await one('SELECT COUNT(*) FROM properties WHERE deleted_at IS NULL'),
      scheduled_visits: await one(`SELECT COUNT(*) FROM site_visits t WHERE t.deleted_at IS NULL AND t.status IN ('scheduled','confirmed','rescheduled') AND t.visit_date>=CURDATE()${can(req, 'site_visits.view_all') ? '' : ' AND (t.assigned_to=? OR t.created_by=?)'}`, can(req, 'site_visits.view_all') ? [] : [req.user.id, req.user.id]),
      confirmed_bookings: await one("SELECT COUNT(*) FROM bookings WHERE deleted_at IS NULL AND status IN ('confirmed','deal_closed')"),
      pending_followups: (await one(`SELECT COUNT(*) FROM leads t WHERE t.deleted_at IS NULL AND t.next_followup_date IS NOT NULL AND t.next_followup_date<=CURDATE() AND t.status NOT IN ('won','lost')${ls}`, lp))
        + (await one(`SELECT COUNT(*) FROM enquiries t WHERE t.deleted_at IS NULL AND t.next_followup_at IS NOT NULL AND t.next_followup_at<=NOW() AND t.status NOT IN ('converted','closed','not_interested')${es}`, ep)),
    };
    const stat = await query(`SELECT status, COUNT(*) n FROM leads t WHERE t.deleted_at IS NULL${ls}${lr} GROUP BY status`, [...lp, ...lrp]);
    const by = Object.fromEntries(stat.map((s) => [s.status, Number(s.n)])); const totalLeads = Object.values(by).reduce((a, b) => a + b, 0);
    const lead_conversion = { by_status: by, total: totalLeads, won: by.won || 0, lost: by.lost || 0, rate: totalLeads ? Math.round(((by.won || 0) / totalLeads) * 1000) / 10 : 0 };
    const sales = can(req, 'payments.view') || can(req, 'bookings.view') ? await query("SELECT DATE_FORMAT(paid_on,'%Y-%m') AS month, SUM(amount) AS amount, COUNT(*) AS payments FROM payments WHERE paid_on>=DATE_SUB(DATE_FORMAT(CURDATE(),'%Y-%m-01'), INTERVAL 5 MONTH) GROUP BY month ORDER BY month") : [];
    const recent_enquiries = await query(`SELECT t.id, t.code, t.name, t.source, t.status, t.created_at FROM enquiries t WHERE t.deleted_at IS NULL${es} ORDER BY t.id DESC LIMIT 6`, ep);
    const vs = can(req, 'site_visits.view_all') ? ['', []] : [' AND (t.assigned_to=? OR t.created_by=?)', [req.user.id, req.user.id]];
    const upcoming_visits = await query(`SELECT t.id, t.code, t.buyer_name, t.visit_date, t.visit_time, t.status, p.name AS property_name FROM site_visits t LEFT JOIN properties p ON p.id=t.property_id WHERE t.deleted_at IS NULL AND t.visit_date>=CURDATE() AND t.status IN ('scheduled','confirmed','rescheduled')${vs[0]} ORDER BY t.visit_date, t.visit_time LIMIT 6`, vs[1]);
    const recent_activities = can(req, 'activity.view') ? await query("SELECT username, module, action, record_id, created_at FROM activity_logs WHERE action NOT IN ('login_failed') ORDER BY id DESC LIMIT 8") : [];
    res.json({ tiles, lead_conversion, monthly_sales: sales, recent_enquiries, upcoming_visits, recent_activities });
  } catch (e) { next(e); }
});
