import jwt from 'jsonwebtoken';
import { query } from './db.js';

const secret = () => {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 24) throw new Error('JWT_SECRET must be set to a long random string (24+ chars)');
  return s;
};

export const signToken = (user) => jwt.sign({ sub: user.id, tv: user.token_version }, secret(), { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });

export async function loadPermissions(user) {
  if (user.role_name === 'super_admin') return null; // null = everything
  const rows = await query(
    `SELECT CONCAT(p.module,'.',p.action) AS perm FROM role_permissions rp JOIN permissions p ON p.id=rp.permission_id WHERE rp.role_id=?`, [user.role_id]);
  const set = new Set(rows.map((r) => r.perm));
  const overrides = await query(
    `SELECT CONCAT(p.module,'.',p.action) AS perm, up.effect FROM user_permissions up JOIN permissions p ON p.id=up.permission_id WHERE up.user_id=?`, [user.id]);
  for (const o of overrides) o.effect === 'allow' ? set.add(o.perm) : set.delete(o.perm);
  return set;
}

export const can = (req, perm) => req.perms === null || req.perms.has(perm);

export async function authenticate(req, res, next) {
  try {
    const h = req.headers.authorization || '';
    if (!h.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' });
    let payload;
    try { payload = jwt.verify(h.slice(7), secret()); } catch { return res.status(401).json({ error: 'Session expired. Please sign in again.' }); }
    const [u] = await query(
      `SELECT u.id, u.code, u.name, u.username, u.email, u.role_id, u.status, u.token_version, u.department, r.name AS role_name, r.label AS role_label
       FROM users u JOIN roles r ON r.id=u.role_id WHERE u.id=? AND u.deleted_at IS NULL`, [payload.sub]);
    if (!u || u.status !== 'active' || u.token_version !== payload.tv) return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    req.user = u;
    req.perms = await loadPermissions(u);
    next();
  } catch (e) { next(e); }
}

export const requirePerm = (perm) => (req, res, next) =>
  can(req, perm) ? next() : res.status(403).json({ error: `You do not have permission (${perm})` });
