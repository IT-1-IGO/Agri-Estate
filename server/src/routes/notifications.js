import express from 'express';
import { query } from '../db.js';

const r = express.Router();
r.get('/', async (req, res, next) => {
  try {
    const rows = await query('SELECT id, title, body, link, read_at, created_at FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT 30', [req.user.id]);
    const [{ unread }] = await query('SELECT COUNT(*) AS unread FROM notifications WHERE user_id=? AND read_at IS NULL', [req.user.id]);
    res.json({ data: rows, unread });
  } catch (e) { next(e); }
});
r.post('/read-all', async (req, res, next) => { try { await query('UPDATE notifications SET read_at=NOW() WHERE user_id=? AND read_at IS NULL', [req.user.id]); res.json({ ok: true }); } catch (e) { next(e); } });
r.post('/:id(\\d+)/read', async (req, res, next) => { try { await query('UPDATE notifications SET read_at=NOW() WHERE id=? AND user_id=? AND read_at IS NULL', [req.params.id, req.user.id]); res.json({ ok: true }); } catch (e) { next(e); } });
export default r;
