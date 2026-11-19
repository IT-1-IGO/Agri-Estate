// LOCAL DEVELOPMENT ONLY: creates (or resets) a Super Admin  Admin / Admin@123  for the CRM login.
// Usage (from /server):  node scripts/create-dev-admin.mjs
// Refuses to run when NODE_ENV=production. Never use this password on a live server.
import bcrypt from 'bcryptjs';
import { pool, query } from '../src/db.js';

if (process.env.NODE_ENV === 'production') { console.error('Refusing to run in production.'); process.exit(1); }
const USERNAME = 'Admin', PASSWORD = 'Admin@123', EMAIL = 'admin@local.test';
try {
  const [role] = await query("SELECT id FROM roles WHERE name='super_admin'");
  if (!role) throw new Error('Roles not found. Run `npm run migrate` and `npm start` (or `npm run seed`) once first.');
  const hash = await bcrypt.hash(PASSWORD, 12);
  const [u] = await query('SELECT id FROM users WHERE username=? AND deleted_at IS NULL', [USERNAME]);
  if (u) {
    await query("UPDATE users SET password_hash=?, role_id=?, status='active', token_version=token_version+1 WHERE id=?", [hash, role.id, u.id]);
    console.log('Updated existing user "Admin" (password reset, Super Admin, active).');
  } else {
    await query('INSERT INTO users (name, username, email, password_hash, role_id, department) VALUES (?,?,?,?,?,?)',
      ['Admin', USERNAME, EMAIL, hash, role.id, 'Management']);
    console.log('Created user "Admin" as Super Admin.');
  }
  console.log('CRM login -> username: Admin   password: Admin@123');
} catch (e) { console.error('Failed:', e.message); process.exitCode = 1; }
finally { await pool.end(); }
