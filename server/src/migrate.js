import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './db.js';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations');

export async function migrate() {
  await pool.query('CREATE TABLE IF NOT EXISTS schema_migrations (name VARCHAR(120) PRIMARY KEY, applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)');
  const [done] = await pool.query('SELECT name FROM schema_migrations');
  const applied = new Set(done.map((r) => r.name));
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    const stmts = sql.split(/;\s*\n/).map((s) => s.trim()).filter((s) => s && !s.split('\n').every((l) => l.trim().startsWith('--')));
    for (const s of stmts) await pool.query(s);
    await pool.query('INSERT INTO schema_migrations (name) VALUES (?)', [file]);
    console.log('applied', file);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrate().then(() => { console.log('migrations up to date'); return pool.end(); }).catch((e) => { console.error(e); process.exit(1); });
}
