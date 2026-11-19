import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { query } from '../db.js';
import { requirePerm } from '../auth.js';
import { logActivity } from '../activity.js';

export const UPLOAD_ROOT = path.resolve(process.env.UPLOAD_DIR || './uploads');
const PUB = path.join(UPLOAD_ROOT, 'public'); const PRIV = path.join(UPLOAD_ROOT, 'private');
fs.mkdirSync(PUB, { recursive: true }); fs.mkdirSync(PRIV, { recursive: true });

const ALLOWED = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'application/pdf': '.pdf' };
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, f, cb) => cb(null, req.body?.private === '1' || f.mimetype === 'application/pdf' ? PRIV : PUB),
    filename: (req, f, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ALLOWED[f.mimetype] || ''}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
  fileFilter: (req, f, cb) => (ALLOWED[f.mimetype] ? cb(null, true) : cb(Object.assign(new Error('Only JPG, PNG, WEBP images and PDF documents are allowed'), { status: 422 }))),
});

const r = express.Router();
const base = () => (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '');

r.get('/', requirePerm('media.view'), async (req, res, next) => {
  try {
    const w = ['deleted_at IS NULL']; const p = [];
    if (req.query.category) { w.push('category=?'); p.push(req.query.category); }
    if (req.query.q) { w.push('original_name LIKE ?'); p.push(`%${req.query.q}%`); }
    res.json({ data: await query(`SELECT id, category, original_name, url, mime, size_bytes, alt_text, created_at FROM media_files WHERE ${w.join(' AND ')} ORDER BY id DESC LIMIT 200`, p) });
  } catch (e) { next(e); }
});

r.post('/', requirePerm('media.create'), (req, res, next) => upload.array('files', 10)(req, res, async (err) => {
  try {
    if (err) return res.status(err.status || (err.code === 'LIMIT_FILE_SIZE' ? 413 : 400)).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 10 MB)' : err.message });
    if (!req.files?.length) return res.status(422).json({ error: 'Choose at least one file' });
    const out = [];
    for (const f of req.files) {
      const isPriv = f.destination === PRIV;
      const url = isPriv ? `/api/media/file/${f.filename}` : `${base()}/uploads/public/${f.filename}`;
      const ins = await query('INSERT INTO media_files (category, original_name, stored_name, url, mime, size_bytes, alt_text, uploaded_by) VALUES (?,?,?,?,?,?,?,?)',
        [String(req.body.category || 'general').slice(0, 40), f.originalname.slice(0, 255), f.filename, url, f.mimetype, f.size, String(req.body.alt_text || '').slice(0, 255) || null, req.user.id]);
      out.push({ id: ins.insertId, url, original_name: f.originalname, mime: f.mimetype, size_bytes: f.size, private: isPriv });
      await logActivity(req, 'media', 'upload', ins.insertId, null, { name: f.originalname, size: f.size });
    }
    res.status(201).json({ data: out });
  } catch (e) { next(e); }
}));

// Private documents are only served to authenticated users (router is mounted behind authenticate)
r.get('/file/:name', requirePerm('media.view'), (req, res) => {
  const name = path.basename(req.params.name); const f = path.join(PRIV, name);
  fs.existsSync(f) ? res.sendFile(f) : res.status(404).json({ error: 'Not found' });
});

r.patch('/:id(\\d+)', requirePerm('media.create'), async (req, res, next) => {
  try {
    await query('UPDATE media_files SET alt_text=?, category=COALESCE(?,category) WHERE id=? AND deleted_at IS NULL', [String(req.body?.alt_text || '').slice(0, 255) || null, req.body?.category || null, req.params.id]);
    await logActivity(req, 'media', 'update', req.params.id, null, req.body); res.json({ ok: true });
  } catch (e) { next(e); }
});

r.delete('/:id(\\d+)', requirePerm('media.delete'), async (req, res, next) => {
  try {
    const [m] = await query('SELECT id, original_name FROM media_files WHERE id=? AND deleted_at IS NULL', [req.params.id]);
    if (!m) return res.status(404).json({ error: 'Not found' });
    await query('UPDATE media_files SET deleted_at=NOW() WHERE id=?', [m.id]); // soft delete; file kept on disk
    await logActivity(req, 'media', 'delete', m.id, m, null); res.json({ ok: true });
  } catch (e) { next(e); }
});
export default r;
