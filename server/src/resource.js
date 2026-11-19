import express from 'express';
import { query, tx } from './db.js';
import { can, requirePerm } from './auth.js';
import { logActivity } from './activity.js';

const isBlank = (v) => v === undefined || v === null || v === '';

/** Validate + coerce one payload. Returns { values, errors }. partial=true skips required checks for missing keys. */
export function validate(fields, body, partial = false) {
  const values = {}; const errors = {};
  for (const f of fields) {
    if (partial && !(f.name in body)) continue;
    let v = body[f.name];
    if (isBlank(v)) {
      if (f.required && !(partial && !(f.name in body))) errors[f.name] = `${f.label || f.name} is required`;
      else values[f.name] = f.default !== undefined && !partial ? f.default : null;
      if (f.type === 'bool' && isBlank(v)) values[f.name] = f.default ?? 0;
      continue;
    }
    switch (f.type) {
      case 'string': case 'text': v = String(v).trim(); if (f.max && v.length > f.max) errors[f.name] = `${f.label || f.name} must be at most ${f.max} characters`; break;
      case 'phone': v = String(v).replace(/[\s-]/g, ''); if (!/^(\+?91)?[6-9]\d{9}$/.test(v)) errors[f.name] = 'Enter a valid 10-digit mobile number'; break;
      case 'email': v = String(v).trim().toLowerCase(); if (!/^\S+@\S+\.\S+$/.test(v)) errors[f.name] = 'Enter a valid email address'; break;
      case 'number': v = Number(v); if (!Number.isFinite(v) || v < 0) errors[f.name] = `${f.label || f.name} must be a positive number`; break;
      case 'lat': v = Number(v); if (!Number.isFinite(v) || v < -90 || v > 90) errors[f.name] = 'Invalid latitude'; break;
      case 'lng': v = Number(v); if (!Number.isFinite(v) || v < -180 || v > 180) errors[f.name] = 'Invalid longitude'; break;
      case 'fk': v = Number(v); if (!Number.isInteger(v) || v <= 0) errors[f.name] = 'Invalid reference'; break;
      case 'bool': v = v === true || v === 1 || v === '1' || v === 'true' ? 1 : 0; break;
      case 'enum': if (!f.values.includes(v)) errors[f.name] = `${f.label || f.name} must be one of: ${f.values.join(', ')}`; break;
      case 'date': v = String(v).slice(0, 10); if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(Date.parse(v))) errors[f.name] = 'Invalid date'; break;
      case 'time': v = String(v).slice(0, 8); if (!/^\d{2}:\d{2}(:\d{2})?$/.test(v)) errors[f.name] = 'Invalid time'; break;
      case 'datetime': v = String(v).replace('T', ' ').slice(0, 19); if (Number.isNaN(Date.parse(v.replace(' ', 'T')))) errors[f.name] = 'Invalid date/time'; break;
      case 'json': v = typeof v === 'string' ? v : JSON.stringify(v); break;
      default: break;
    }
    values[f.name] = v;
  }
  return { values, errors };
}

const csvCell = (v) => { const s = v == null ? '' : String(v); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

/**
 * cfg: { module, table, prefix, fields, search:[cols], filters:[cols], select, joins, scope(req)->{sql,params},
 *        hooks:{ beforeCreate, afterCreate, beforeUpdate, afterUpdate }, exportCols:[...], publishField }
 */
export function resourceRouter(cfg) {
  const r = express.Router();
  const sortable = new Set(['id', 'created_at', 'updated_at', ...cfg.fields.map((f) => f.name), ...(cfg.extraSort || [])]);
  const baseFrom = `FROM ${cfg.table} t ${cfg.joins || ''} WHERE t.deleted_at IS NULL`;
  const selectSql = `SELECT t.*${cfg.select ? ', ' + cfg.select : ''}`;

  const scoped = (req) => (cfg.scope ? cfg.scope(req) : { sql: '', params: [] });

  async function listQuery(req, forExport) {
    const q = req.query; const where = []; const params = [];
    const sc = scoped(req); if (sc.sql) { where.push(sc.sql); params.push(...sc.params); }
    for (const col of cfg.filters || []) {
      if (!isBlank(q[col])) { where.push(`t.${col} = ?`); params.push(q[col]); }
    }
    if (q.from) { where.push('t.created_at >= ?'); params.push(`${String(q.from).slice(0, 10)} 00:00:00`); }
    if (q.to) { where.push('t.created_at <= ?'); params.push(`${String(q.to).slice(0, 10)} 23:59:59`); }
    if (q.q && cfg.search?.length) {
      where.push('(' + cfg.search.map((c) => `${c.includes('.') ? c : 't.' + c} LIKE ?`).join(' OR ') + ')');
      for (let i = 0; i < cfg.search.length; i++) params.push(`%${String(q.q).trim()}%`);
    }
    const w = where.length ? ' AND ' + where.join(' AND ') : '';
    const sort = sortable.has(q.sort) ? q.sort : (cfg.defaultSort || 'created_at');
    const dir = String(q.order).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    const page = Math.max(1, parseInt(q.page) || 1);
    const pageSize = forExport ? 5000 : Math.min(100, Math.max(1, parseInt(q.pageSize) || 15));
    const [{ total }] = await query(`SELECT COUNT(*) AS total ${baseFrom}${w}`, params);
    const rows = await query(`${selectSql} ${baseFrom}${w} ORDER BY t.${sort} ${dir}, t.id DESC LIMIT ? OFFSET ?`, [...params, pageSize, (page - 1) * pageSize]);
    return { rows, total, page, pageSize };
  }

  r.get('/', requirePerm(`${cfg.module}.view`), async (req, res, next) => {
    try {
      if (req.query.export === 'csv' || req.query.export === 'xlsx') {
        if (!can(req, `${cfg.module}.export`)) return res.status(403).json({ error: 'You do not have permission to export' });
        const { rows } = await listQuery(req, true);
        const cols = cfg.exportCols || (rows[0] ? Object.keys(rows[0]).filter((k) => !['deleted_at'].includes(k)) : []);
        await logActivity(req, cfg.module, 'export', null, null, { rows: rows.length, format: req.query.export });
        if (req.query.export === 'xlsx') {
          const { default: ExcelJS } = await import('exceljs');
          const wb = new ExcelJS.Workbook(); const ws = wb.addWorksheet(cfg.module);
          const head = (c) => c.replace(/_/g, ' ').replace(/^./, (x) => x.toUpperCase());
          ws.columns = cols.map((c) => ({ header: head(c), key: c, width: Math.min(40, Math.max(12, head(c).length + 4)) }));
          rows.forEach((row) => ws.addRow(Object.fromEntries(cols.map((c) => [c, row[c] == null ? '' : row[c]]))));
          ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }; ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF143D27' } };
          ws.views = [{ state: 'frozen', ySplit: 1 }];
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader('Content-Disposition', `attachment; filename="${cfg.module}-${new Date().toISOString().slice(0, 10)}.xlsx"`);
          await wb.xlsx.write(res); return res.end();
        }
        const csv = [cols.join(','), ...rows.map((row) => cols.map((c) => csvCell(row[c])).join(','))].join('\r\n');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${cfg.module}-${new Date().toISOString().slice(0, 10)}.csv"`);
        return res.send('﻿' + csv);
      }
      const { rows, total, page, pageSize } = await listQuery(req, false);
      res.json({ data: rows, total, page, pageSize });
    } catch (e) { next(e); }
  });

  async function getOne(req, id) {
    const sc = scoped(req);
    const rows = await query(`${selectSql} ${baseFrom} AND t.id = ?${sc.sql ? ' AND ' + sc.sql : ''}`, [id, ...sc.params]);
    return rows[0];
  }

  r.get('/:id(\\d+)', requirePerm(`${cfg.module}.view`), async (req, res, next) => {
    try {
      const row = await getOne(req, req.params.id);
      if (!row) return res.status(404).json({ error: 'Not found' });
      if (cfg.hooks?.decorate) await cfg.hooks.decorate(row, req);
      res.json(row);
    } catch (e) { next(e); }
  });

  r.post('/', requirePerm(`${cfg.module}.create`), async (req, res, next) => {
    try {
      const { values, errors } = validate(cfg.fields, req.body || {});
      if (Object.keys(errors).length) return res.status(422).json({ error: 'Please correct the highlighted fields', fields: errors });
      if (cfg.hooks?.beforeCreate) { const extra = await cfg.hooks.beforeCreate(values, req); if (extra?.errors) return res.status(422).json({ error: extra.message || 'Invalid data', fields: extra.errors }); if (extra?.response) return res.status(extra.status || 200).json(extra.response); }
      if (cfg.publishField && !can(req, `${cfg.module}.publish`)) { delete values.published; delete values.website_visible; }
      const id = await tx(async (conn) => {
        const cols = Object.keys(values); if (req.user) { cols.push('created_by'); values.created_by = req.user.id; }
        const [ins] = await conn.query(`INSERT INTO ${cfg.table} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`, cols.map((c) => values[c]));
        if (cfg.prefix) await conn.query(`UPDATE ${cfg.table} SET code=CONCAT(?, LPAD(id,5,'0')) WHERE id=?`, [cfg.prefix, ins.insertId]);
        if (cfg.hooks?.afterCreate) await cfg.hooks.afterCreate(conn, ins.insertId, values, req);
        return ins.insertId;
      });
      const row = await getOne({ ...req, perms: null, user: req.user }, id);
      await logActivity(req, cfg.module, 'create', id, null, row);
      res.status(201).json(row);
    } catch (e) { next(e); }
  });

  r.put('/:id(\\d+)', requirePerm(`${cfg.module}.edit`), async (req, res, next) => {
    try {
      const prev = await getOne(req, req.params.id);
      if (!prev) return res.status(404).json({ error: 'Not found' });
      const { values, errors } = validate(cfg.fields, req.body || {}, true);
      if (Object.keys(errors).length) return res.status(422).json({ error: 'Please correct the highlighted fields', fields: errors });
      if (cfg.publishField && !can(req, `${cfg.module}.publish`)) { delete values.published; delete values.website_visible; }
      if (cfg.lockedOnUpdate) for (const k of cfg.lockedOnUpdate(req)) delete values[k];
      if (cfg.hooks?.beforeUpdate) { const extra = await cfg.hooks.beforeUpdate(values, prev, req); if (extra?.errors) return res.status(422).json({ error: extra.message || 'Invalid data', fields: extra.errors }); }
      const cols = Object.keys(values);
      if (cols.length) await tx(async (conn) => {
        await conn.query(`UPDATE ${cfg.table} SET ${cols.map((c) => `${c}=?`).join(',')} WHERE id=?`, [...cols.map((c) => values[c]), req.params.id]);
        if (cfg.hooks?.afterUpdate) await cfg.hooks.afterUpdate(conn, Number(req.params.id), values, prev, req);
      });
      const row = await getOne({ ...req, perms: null, user: req.user }, req.params.id);
      const changed = Object.fromEntries(cols.map((c) => [c, values[c]]));
      const before = Object.fromEntries(cols.map((c) => [c, prev[c]]));
      await logActivity(req, cfg.module, 'update', req.params.id, before, changed);
      res.json(row);
    } catch (e) { next(e); }
  });

  r.delete('/:id(\\d+)', requirePerm(`${cfg.module}.delete`), async (req, res, next) => {
    try {
      const prev = await getOne(req, req.params.id);
      if (!prev) return res.status(404).json({ error: 'Not found' });
      if (cfg.hooks?.beforeDelete) { const extra = await cfg.hooks.beforeDelete(prev, req); if (extra?.errors) return res.status(409).json({ error: extra.message }); }
      await query(`UPDATE ${cfg.table} SET deleted_at=NOW() WHERE id=?`, [req.params.id]); // soft delete
      await logActivity(req, cfg.module, 'delete', req.params.id, prev, null);
      res.json({ ok: true });
    } catch (e) { next(e); }
  });

  return r;
}
