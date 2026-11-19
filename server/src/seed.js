import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { pool, query } from './db.js';
import { migrate } from './migrate.js';
import { MODULES, ROLES, DEFAULT_ROLE_PERMISSIONS } from './permissions.js';

/** Idempotent: registers every module permission + role. Default grants are given only for permissions that did not exist before
 *  (a fresh install, or a newly added module), so edits made by the Super Admin are never overwritten or re-granted. */
export async function syncPermissions() {
  const known = new Set((await query('SELECT module, action FROM permissions')).map((p) => `${p.module}.${p.action}`));
  for (const [m, acts] of Object.entries(MODULES)) for (const a of acts) await query('INSERT IGNORE INTO permissions (module, action) VALUES (?,?)', [m, a]);
  const knownRoles = new Set((await query('SELECT name FROM roles')).map((r) => r.name));
  for (const r of ROLES) await query('INSERT IGNORE INTO roles (name, label) VALUES (?,?)', [r.name, r.label]);
  const roles = Object.fromEntries((await query('SELECT id, name FROM roles')).map((r) => [r.name, r.id]));
  const perms = Object.fromEntries((await query('SELECT id, module, action FROM permissions')).map((p) => [`${p.module}.${p.action}`, p.id]));
  for (const [role, list] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    if (!roles[role]) continue;
    const brandNewRole = !knownRoles.has(role);
    for (const p of list) if ((brandNewRole || !known.has(p)) && perms[p]) await query('INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?,?)', [roles[role], perms[p]]);
  }
  return roles;
}

export async function seed() {
  await migrate();
  const roles = await syncPermissions();
  const [{ n: userCount }] = await query('SELECT COUNT(*) n FROM users');
  if (userCount === 0) {
    const password = process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(9).toString('base64url');
    const username = process.env.SEED_ADMIN_USERNAME || 'superadmin';
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const hash = await bcrypt.hash(password, 12);
    const res = await query('INSERT INTO users (name, username, email, password_hash, role_id, department) VALUES (?,?,?,?,?,?)',
      [process.env.SEED_ADMIN_NAME || 'Super Admin', username, email, hash, roles.super_admin, 'Management']);
    await query("UPDATE users SET code=CONCAT('USR-', LPAD(id,4,'0')) WHERE id=?", [res.insertId]);
    console.log('\nFirst Super Admin created.');
    console.log(`  username: ${username}`);
    if (!process.env.SEED_ADMIN_PASSWORD) console.log(`  password: ${password}   <- shown once, change it after first login`);
    else console.log('  password: (the value of SEED_ADMIN_PASSWORD)');
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed().then(() => pool.end()).catch((e) => { console.error(e); process.exit(1); });
}
