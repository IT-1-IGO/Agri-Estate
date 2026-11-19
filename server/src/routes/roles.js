import express from 'express';
import { query, tx } from '../db.js';
import { requirePerm } from '../auth.js';
import { logActivity } from '../activity.js';
import { MODULES } from '../permissions.js';

const r = express.Router();

r.get('/', requirePerm('roles.view'), async (req, res, next) => {
  try {
    const roles = await query('SELECT id, name, label FROM roles ORDER BY id');
    const grants = await query("SELECT rp.role_id, CONCAT(p.module,'.',p.action) AS perm FROM role_permissions rp JOIN permissions p ON p.id=rp.permission_id");
    const byRole = {}; for (const g of grants) (byRole[g.role_id] ||= []).push(g.perm);
    res.json({ modules: MODULES, roles: roles.map((x) => ({ ...x, permissions: x.name === 'super_admin' ? Object.entries(MODULES).flatMap(([m, a]) => a.map((z) => `${m}.${z}`)) : byRole[x.id] || [] })) });
  } catch (e) { next(e); }
});

r.put('/:id(\\d+)/permissions', requirePerm('roles.edit'), async (req, res, next) => {
  try {
    const [role] = await query('SELECT id, name FROM roles WHERE id=?', [req.params.id]);
    if (!role) return res.status(404).json({ error: 'Not found' });
    if (role.name === 'super_admin') return res.status(409).json({ error: 'Super Admin always has full access and cannot be changed' });
    const wanted = new Set(Array.isArray(req.body?.permissions) ? req.body.permissions : []);
    const perms = await query('SELECT id, module, action FROM permissions');
    const before = (await query("SELECT CONCAT(p.module,'.',p.action) AS perm FROM role_permissions rp JOIN permissions p ON p.id=rp.permission_id WHERE rp.role_id=?", [role.id])).map((x) => x.perm);
    await tx(async (conn) => {
      await conn.query('DELETE FROM role_permissions WHERE role_id=?', [role.id]);
      for (const p of perms) if (wanted.has(`${p.module}.${p.action}`)) await conn.query('INSERT INTO role_permissions (role_id, permission_id) VALUES (?,?)', [role.id, p.id]);
      await conn.query('UPDATE users SET token_version=token_version+1 WHERE role_id=?', [role.id]); // force re-login so new rights apply
    });
    await logActivity(req, 'roles', 'permissions_changed', role.id, before, [...wanted]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default r;
