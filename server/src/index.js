import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { migrate } from './migrate.js';
import { syncPermissions } from './seed.js';
import { backfillCustomers } from './customers.js';
import { customers, leads, proposals, bookings, tasks, employees, loginHistory } from './erp.js';
import { reports, erpDashboard } from './reports.js';
import { authenticate } from './auth.js';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import rolesRoutes from './routes/roles.js';
import dashboard from './routes/dashboard.js';
import followups from './routes/followups.js';
import media, { UPLOAD_ROOT } from './routes/media.js';
import { settings, lookups, activity } from './routes/misc.js';
import publicRoutes from './routes/public.js';
import cms, { publicCms } from './routes/cms.js';
import notifications from './routes/notifications.js';
import { runReminders } from './notify.js';
import { properties, parcels, landowners, buyers, enquiries, siteVisits } from './resources.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  const origins = (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  app.use(cors({ origin: origins.length ? origins : false, credentials: false }));
  app.use(express.json({ limit: '8mb' }));
  app.use('/uploads/public', express.static(path.join(UPLOAD_ROOT, 'public'), { maxAge: '7d', index: false, dotfiles: 'deny' }));

  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.use('/api/public/cms', publicCms);
  app.use('/api/public', publicRoutes);
  app.use('/api/auth', authRoutes);

  const api = express.Router();
  api.use(authenticate);
  api.use('/dashboard', dashboard);
  api.use('/users', usersRoutes);
  api.use('/roles', rolesRoutes);
  api.use('/properties', properties);
  api.use('/parcels', parcels);
  api.use('/landowners', landowners);
  api.use('/buyers', buyers);
  api.use('/enquiries', enquiries);
  api.use('/site-visits', siteVisits);
  api.use('/customers', customers);
  api.use('/leads', leads);
  api.use('/proposals', proposals);
  api.use('/bookings', bookings);
  api.use('/tasks', tasks);
  api.use('/employees', employees);
  api.use('/reports', reports);
  api.use('/dashboard-erp', erpDashboard);
  api.use('/login-history', loginHistory);
  api.use('/media', media);
  api.use('/settings', settings);
  api.use('/activity', activity);
  api.use('/lookups', lookups);
  api.use('/cms', cms);
  api.use('/notifications', notifications);
  api.use('/', followups);
  app.use('/api', api);

  app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
  app.use((err, req, res, next) => { // eslint-disable-line
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' });
    console.error(err);
    res.status(err.status || 500).json({ error: err.status && err.status < 500 ? err.message : 'Something went wrong on the server' });
  });
  return app;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  await migrate();
  await syncPermissions();
  await backfillCustomers().then((n) => n && console.log(`linked ${n} existing enquiries to customer records`)).catch((e) => console.error('customer backfill failed', e.message));
  const port = Number(process.env.PORT) || 4000;
  createApp().listen(port, () => console.log(`IGO Agri Estate API listening on :${port}`));
  const sweep = () => runReminders().catch((e) => console.error('reminder sweep failed', e.message));
  sweep(); setInterval(sweep, 10 * 60 * 1000); // follow-up reminders and upcoming site visits
}
