import express from 'express';
import bcrypt from 'bcryptjs';
import { query, tx } from '../db.js';
import { requirePerm, can } from '../auth.js';
import { logActivity } from '../activity.js';
import { validate } from '../resource.js';
import { strongPassword } from './auth.js';
import { MODULES } from '../permissions.js';

const r = express.Router();
const fields = [
  { name: 'name', label: 'Employee name', type: 'string', required: true, max: 120 },
  { name: 'username', type: 'string', required: true, max: 60 },
  { name: 'email', type: 'email', required: true }, { name: 'phone', type: 'phone' },
  { name: 'role_id', label: 'Role', type: 'fk', required: true },
  { name: 'designation', type: 'string', max: 80 }, { name: 'department', type: 'string', max: 80 }, { name: 'manager_id', label: 'Assigned manager', type: 'fk' },
  { name: 'status', type: 'enum', values: ['active', 'inactive'], default: 'active' },
];
const SELECT = `SELECT u.id, u.code, u.name, u.username, u.email, u.phone, u.role_id, r.name AS role_name, r.label AS role_label, u.department, u.designation, u.manager_id, m.name AS manager_name,
  u.status, u.last_login_at, u.created_at FROM users u JOIN roles r ON r.id=u.role_id LEFT JOIN users m ON m.id=u.manager_id WHERE u.deleted_at IS NULL`;

async function roleOf(id) { const [x] = await query('SELECT id, name FROM roles WHERE id=?', [id]); return x; }
const isSuper = (req) => req.user.role_name === 'super_admin';

r.get('/', requirePerm('users.view'), async (req, res, next) => {
  try {
    const where = []; const params = [];
    if (req.query.role_id) { where.push('u.role_id=?'); params.push(req.query.role_id); }
    if (req.query.status) { where.push('u.status=?'); params.push(req.query.status); }
    if (req.query.q) { where.push('(u.name LIKE ? OR u.username LIKE ? OR u.email LIKE ?)'); params.push(...Array(3).fill(`%${req.query.q}%`)); }
    const page = Math.max(1, parseInt(req.query.page) || 1); const pageSize = Math.min(100, parseInt(req.query.pageSize) || 15);
    const w = where.length ? ' AND ' + where.join(' AND ') : '';
    const [{ total }] = await query(`SELECT COUNT(*) total FROM users u WHERE u.deleted_at IS NULL${w}`, params);
    const rows = await query(`${SELECT}${w} ORDER BY u.id DESC LIMIT ? OFFSET ?`, [...params, pageSize, (page - 1) * pageSize]);
    res.json({ data: rows, total, page, pageSize });
  } catch (e) { next(e); }
});

r.get('/:id(\\d+)', requirePerm('users.view'), async (req, res, next) => {
  try {
    const [u] = await query(`${SELECT} AND u.id=?`, [req.params.id]);
    if (!u) return res.status(404).json({ error: 'Not found' });
    u.permission_overrides = await query("SELECT CONCAT(p.module,'.',p.action) AS permission, up.effect FROM user_permissions up JOIN permissions p ON p.id=up.permission_id WHERE up.user_id=?", [u.id]);
    res.json(u);
  } catch (e) { next(e); }
});

r.post('/', requirePerm('users.create'), async (req, res, next) => {
  try {
    const { values, errors } = validate(fields, req.body || {});
    const b = req.body || {};
    if (!strongPassword(b.password)) errors.password = 'Password must be at least 8 characters and include a letter and a number';
    else if (b.password !== b.confirm_password) errors.confirm_password = 'Passwords do not match';
    if (Object.keys(errors).length) return res.status(422).json({ error: 'Please correct the highlighted fields', fields: errors });
    const role = await roleOf(values.role_id);
    if (!role) return res.status(422).json({ error: 'Invalid role', fields: { role_id: 'Invalid role' } });
    if (role.name === 'super_admin' && !isSuper(req)) return res.status(403).json({ error: 'Only a Super Admin can create another Super Admin' });
    if ((await query('SELECT id FROM users WHERE (username=? OR email=?) AND deleted_at IS NULL', [values.username, values.email])).length)
      return res.status(409).json({ error: 'Username or email already exists', fields: { username: 'Username or email already in use' } });
    const id = await tx(async (conn) => {
      const [ins] = await conn.query('INSERT INTO users (name, username, email, phone, role_id, department, designation, manager_id, status, password_hash) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [values.name, values.username, values.email, values.phone, values.role_id, values.department, values.designation, values.manager_id, values.status, await bcrypt.hash(b.password, 12)]);
      await conn.query("UPDATE users SET code=CONCAT('USR-', LPAD(id,4,'0')) WHERE id=?", [ins.insertId]);
      return ins.insertId;
    });
    await logActivity(req, 'users', 'create', id, null, { ...values, role: role.name });
    res.status(201).json((await query(`${SELECT} AND u.id=?`, [id]))[0]);
  } catch (e) { next(e); }
});

r.put('/:id(\\d+)', requirePerm('users.edit'), async (req, res, next) => {
  try {
    const [prev] = await query(`${SELECT} AND u.id=?`, [req.params.id]);
    if (!prev) return res.status(404).json({ error: 'Not found' });
    if (prev.role_name === 'super_admin' && !isSuper(req)) return res.status(403).json({ error: 'Only a Super Admin can modify a Super Admin' });
    const { values, errors } = validate(fields, req.body || {}, true);
    const b = req.body || {};
    if (b.password) {
      if (!strongPassword(b.password)) errors.password = 'Password must be at least 8 characters and include a letter and a number';
      else if (b.password !== b.confirm_password) errors.confirm_password = 'Passwords do not match';
    }
    if (Object.keys(errors).length) return res.status(422).json({ error: 'Please correct the highlighted fields', fields: errors });
    if (values.role_id) {
      const role = await roleOf(values.role_id); if (!role) return res.status(422).json({ error: 'Invalid role' });
      if (role.name === 'super_admin' && !isSuper(req)) return res.status(403).json({ error: 'Only a Super Admin can assign the Super Admin role' });
    }
    if (Number(req.params.id) === req.user.id && (values.status === 'inactive' || (values.role_id && values.role_id !== prev.role_id))) return res.status(409).json({ error: 'You cannot deactivate or change the role of your own account' });
    if (prev.role_name === 'super_admin' && (values.status === 'inactive' || (values.role_id && values.role_id !== prev.role_id))) {
      const [{ n }] = await query("SELECT COUNT(*) n FROM users u JOIN roles r ON r.id=u.role_id WHERE r.name='super_admin' AND u.status='active' AND u.deleted_at IS NULL"); if (n <= 1) return res.status(409).json({ error: 'At least one active Super Admin is required' });
    }
    if ((values.username || values.email) && (await query('SELECT id FROM users WHERE (username=? OR email=?) AND id<>? AND deleted_at IS NULL', [values.username ?? '', values.email ?? '', req.params.id])).length)
      return res.status(409).json({ error: 'Username or email already exists' });
    const cols = Object.keys(values); const sets = cols.map((c) => `${c}=?`); const params = cols.map((c) => values[c]);
    if (b.password) { sets.push('password_hash=?', 'token_version=token_version+1'); params.push(await bcrypt.hash(b.password, 12)); }
    if (values.status === 'inactive' || (values.role_id && values.role_id !== prev.role_id)) sets.push('token_version=token_version+1');
    if (sets.length) await query(`UPDATE users SET ${sets.join(',')} WHERE id=?`, [...params, req.params.id]);
    await logActivity(req, 'users', b.password ? 'update_password' : 'update', req.params.id, Object.fromEntries(cols.map((c) => [c, prev[c]])), values);
    res.json((await query(`${SELECT} AND u.id=?`, [req.params.id]))[0]);
  } catch (e) { next(e); }
});

r.delete('/:id(\\d+)', requirePerm('users.delete'), async (req, res, next) => {
  try {
    if (Number(req.params.id) === req.user.id) return res.status(409).json({ error: 'You cannot delete your own account' });
    const [prev] = await query(`${SELECT} AND u.id=?`, [req.params.id]);
    if (!prev) return res.status(404).json({ error: 'Not found' });
    if (prev.role_name === 'super_admin') return res.status(403).json({ error: 'A Super Admin account cannot be deleted' });
    await query("UPDATE users SET deleted_at=NOW(), status='inactive', token_version=token_version+1, username=CONCAT(username,'#del',id), email=CONCAT(email,'#del',id) WHERE id=?", [req.params.id]);
    await logActivity(req, 'users', 'delete', req.params.id, prev, null);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// Per-user permission overrides (Super Admin only)
r.put('/:id(\\d+)/permissions', requirePerm('roles.edit'), async (req, res, next) => {
  try {
    const [u] = await query('SELECT id, role_id FROM users WHERE id=? AND deleted_at IS NULL', [req.params.id]);
    if (!u) return res.status(404).json({ error: 'Not found' });
    const overrides = Array.isArray(req.body?.overrides) ? req.body.overrides : [];
    const perms = Object.fromEntries((await query('SELECT id, module, action FROM permissions')).map((p) => [`${p.module}.${p.action}`, p.id]));
    const before = await query("SELECT CONCAT(p.module,'.',p.action) AS permission, up.effect FROM user_permissions up JOIN permissions p ON p.id=up.permission_id WHERE up.user_id=?", [u.id]);
    await tx(async (conn) => {
      await conn.query('DELETE FROM user_permissions WHERE user_id=?', [u.id]);
      for (const o of overrides) if (perms[o.permission] && ['allow', 'deny'].includes(o.effect)) await conn.query('INSERT INTO user_permissions (user_id, permission_id, effect) VALUES (?,?,?)', [u.id, perms[o.permission], o.effect]);
      await conn.query('UPDATE users SET token_version=token_version+1 WHERE id=?', [u.id]);
    });
    await logActivity(req, 'users', 'permissions_changed', u.id, before, overrides);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default r;
