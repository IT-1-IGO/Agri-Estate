import express from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { query } from '../db.js';
import { authenticate, signToken, loadPermissions } from '../auth.js';
import { logActivity } from '../activity.js';
import { MODULES } from '../permissions.js';

const r = express.Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 15, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many sign-in attempts. Try again in a few minutes.' } });

const loginLog = (req, userId, username, success) => query('INSERT INTO login_history (user_id, username, success, ip_address, user_agent) VALUES (?,?,?,?,?)', [userId, username, success, String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim().slice(0, 64), String(req.headers['user-agent'] || '').slice(0, 255)]).catch(() => {});

export const strongPassword = (p) => typeof p === 'string' && p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);

r.post('/login', limiter, async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'Enter your username and password' });
    const [u] = await query(
      `SELECT u.*, r.name AS role_name, r.label AS role_label FROM users u JOIN roles r ON r.id=u.role_id
       WHERE (u.username=? OR u.email=?) AND u.deleted_at IS NULL`, [String(username).trim(), String(username).trim().toLowerCase()]);
    const ok = u && await bcrypt.compare(String(password), u.password_hash);
    if (!ok || u.status !== 'active') {
      await loginLog(req, u?.id ?? null, String(username).slice(0, 160), 0);
      await logActivity({ headers: req.headers, socket: req.socket, user: u ? { id: u.id, username: u.username } : null }, 'auth', 'login_failed', u?.id ?? null, null, { username: String(username).slice(0, 60) });
      return res.status(401).json({ error: !ok ? 'Incorrect username or password' : 'This account is inactive. Contact your administrator.' });
    }
    await query('UPDATE users SET last_login_at=NOW() WHERE id=?', [u.id]);
    await loginLog(req, u.id, u.username, 1);
    await logActivity({ headers: req.headers, socket: req.socket, user: u }, 'auth', 'login', u.id, null, null);
    res.json({ token: signToken(u), user: await publicUser(u) });
  } catch (e) { next(e); }
});

async function publicUser(u) {
  const perms = await loadPermissions(u);
  const list = perms === null ? Object.entries(MODULES).flatMap(([m, a]) => a.map((x) => `${m}.${x}`)) : [...perms];
  return { id: u.id, code: u.code, name: u.name, username: u.username, email: u.email, role: u.role_name, role_label: u.role_label, department: u.department, permissions: list };
}

r.get('/me', authenticate, async (req, res, next) => { try { res.json(await publicUser(req.user)); } catch (e) { next(e); } });

r.post('/logout', authenticate, async (req, res) => { await logActivity(req, 'auth', 'logout', req.user.id, null, null); res.json({ ok: true }); });

r.post('/change-password', authenticate, async (req, res, next) => {
  try {
    const { current_password, new_password, confirm_password } = req.body || {};
    const [u] = await query('SELECT password_hash FROM users WHERE id=?', [req.user.id]);
    if (!(await bcrypt.compare(String(current_password || ''), u.password_hash))) return res.status(422).json({ error: 'Current password is incorrect', fields: { current_password: 'Incorrect password' } });
    if (!strongPassword(new_password)) return res.status(422).json({ error: 'Password must be at least 8 characters and include a letter and a number', fields: { new_password: 'Too weak' } });
    if (new_password !== confirm_password) return res.status(422).json({ error: 'Passwords do not match', fields: { confirm_password: 'Does not match' } });
    await query('UPDATE users SET password_hash=?, token_version=token_version+1 WHERE id=?', [await bcrypt.hash(new_password, 12), req.user.id]);
    await logActivity(req, 'auth', 'password_changed', req.user.id, null, null);
    res.json({ ok: true, relogin: true });
  } catch (e) { next(e); }
});

export default r;
