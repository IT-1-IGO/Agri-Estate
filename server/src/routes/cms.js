import express from 'express';
import { query } from '../db.js';
import { requirePerm, can } from '../auth.js';
import { logActivity } from '../activity.js';

const NAME = /^[A-Za-z0-9._-]{1,120}$/;
// Never exposed to website visitors
const PRIVATE_COLLECTIONS = new Set(['media', 'activity', 'enquiries', 'applications', 'leads']);
const parse = (s, fb) => { try { return s ? JSON.parse(s) : fb; } catch { return fb; } };

/** Public: only published documents and published collection items. */
export const publicCms = express.Router();
publicCms.get('/', async (req, res, next) => {
  try {
    const docs = {}; const collections = {};
    for (const r of await query('SELECT name, published_json, published_at FROM cms_docs WHERE published_json IS NOT NULL')) docs[r.name] = { published: parse(r.published_json, {}), publishedAt: r.published_at };
    for (const r of await query('SELECT name, data_json FROM cms_collections')) {
      if (PRIVATE_COLLECTIONS.has(r.name)) continue;
      const list = parse(r.data_json, []);
      collections[r.name] = Array.isArray(list) ? list.filter((i) => (i?.status ?? 'published') === 'published') : list;
    }
    res.set('Cache-Control', 'public, max-age=30');
    res.json({ docs, collections });
  } catch (e) { next(e); }
});

/** Admin: drafts included. */
const r = express.Router();
r.get('/', requirePerm('content.view'), async (req, res, next) => {
  try {
    const docs = {}; const collections = {};
    for (const x of await query('SELECT name, draft_json, published_json, updated_at, published_at FROM cms_docs'))
      docs[x.name] = { draft: parse(x.draft_json, {}), published: parse(x.published_json, {}), updatedAt: x.updated_at, publishedAt: x.published_at };
    for (const x of await query('SELECT name, data_json FROM cms_collections')) collections[x.name] = parse(x.data_json, []);
    res.json({ docs, collections });
  } catch (e) { next(e); }
});

r.put('/docs/:name', requirePerm('content.edit'), async (req, res, next) => {
  try {
    const { name } = req.params; if (!NAME.test(name)) return res.status(422).json({ error: 'Invalid document name' });
    const b = req.body || {};
    if (typeof b.draft !== 'object' || typeof b.published !== 'object' || !b.draft || !b.published) return res.status(422).json({ error: 'draft and published must be objects' });
    const [prev] = await query('SELECT draft_json, published_json FROM cms_docs WHERE name=?', [name]);
    const draft = JSON.stringify(b.draft); const published = JSON.stringify(b.published);
    const publishChanged = (prev?.published_json ?? '{}') !== published;
    if (publishChanged && !can(req, 'content.publish')) return res.status(403).json({ error: 'You do not have permission to publish (content.publish)' });
    await query(`INSERT INTO cms_docs (name, draft_json, published_json, published_at, updated_by) VALUES (?,?,?,?,?)
      ON DUPLICATE KEY UPDATE draft_json=VALUES(draft_json), published_json=VALUES(published_json), published_at=IF(?, NOW(), published_at), updated_by=VALUES(updated_by)`,
      [name, draft, published, publishChanged ? new Date() : null, req.user.id, publishChanged ? 1 : 0]);
    if (publishChanged) await query('INSERT INTO cms_versions (doc_name, snapshot_json, created_by) VALUES (?,?,?)', [name, published, req.user.id]);
    await logActivity(req, 'content', publishChanged ? 'publish' : 'save_draft', name, null, null);
    res.json({ ok: true, published: publishChanged });
  } catch (e) { next(e); }
});

r.put('/collections/:name', requirePerm('content.edit'), async (req, res, next) => {
  try {
    const { name } = req.params; if (!NAME.test(name) || PRIVATE_COLLECTIONS.has(name)) return res.status(422).json({ error: 'Invalid collection name' });
    if (!Array.isArray(req.body?.items)) return res.status(422).json({ error: 'items must be an array' });
    await query('INSERT INTO cms_collections (name, data_json, updated_by) VALUES (?,?,?) ON DUPLICATE KEY UPDATE data_json=VALUES(data_json), updated_by=VALUES(updated_by)', [name, JSON.stringify(req.body.items), req.user.id]);
    await logActivity(req, 'content', 'save_collection', name, null, { count: req.body.items.length });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

r.get('/versions/:name', requirePerm('content.view'), async (req, res, next) => {
  try { res.json({ data: await query('SELECT v.id, v.created_at, u.name AS user_name FROM cms_versions v LEFT JOIN users u ON u.id=v.created_by WHERE v.doc_name=? ORDER BY v.id DESC LIMIT 30', [req.params.name]) }); } catch (e) { next(e); }
});

r.post('/versions/:id(\\d+)/restore', requirePerm('content.publish'), async (req, res, next) => {
  try {
    const [v] = await query('SELECT doc_name, snapshot_json FROM cms_versions WHERE id=?', [req.params.id]);
    if (!v) return res.status(404).json({ error: 'Version not found' });
    await query('UPDATE cms_docs SET draft_json=?, published_json=?, published_at=NOW(), updated_by=? WHERE name=?', [v.snapshot_json, v.snapshot_json, req.user.id, v.doc_name]);
    await query('INSERT INTO cms_versions (doc_name, snapshot_json, created_by) VALUES (?,?,?)', [v.doc_name, v.snapshot_json, req.user.id]);
    await logActivity(req, 'content', 'restore_version', v.doc_name, null, { version: req.params.id });
    res.json({ ok: true, draft: parse(v.snapshot_json, {}) });
  } catch (e) { next(e); }
});
export default r;
