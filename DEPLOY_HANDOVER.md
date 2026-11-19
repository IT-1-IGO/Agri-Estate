# Deployment handover - IGO Agri Estate (website + admin + CRM/ERP)

## What is in this project
| Part | Tech | Where it runs |
|---|---|---|
| Website + /admin + /admin/crm (front end) | React + Vite, static files | Vercel / Netlify / Nginx (static) |
| API (`server/`) | Node 18+ / Express | A server or VPS (NOT Vercel static) |
| Database | MySQL 8 (ERP, CRM, CMS data) | VPS or managed MySQL |
| Supabase (optional) | Careers + older features only | Cloud project or self-hosted (`supabase-selfhost/`) |

## Do NOT deploy / do not include in the zip
`node_modules/`, `dist/`, `.env`, `.env.local`, `server/.env`, `supabase-selfhost/supabase-project/` (contains secrets), `server/scripts/create-dev-admin.mjs` must NOT be run in production.

## Step 1 - Database (MySQL 8)
1. Create database `igo_agri_estate` (utf8mb4) and a user with a strong password.
2. Allow connections only from the API server.

## Step 2 - API server (`server/`)
1. Install Node 18+ and run: `cd server && npm ci --omit=dev`
2. Copy `.env.example` to `.env` and set:
   - `DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME`
   - `JWT_SECRET` = long random string (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)
   - `CORS_ORIGINS` = the live website URL(s), comma separated, e.g. `https://www.yourdomain.com`
   - `PUBLIC_BASE_URL` = public API URL, e.g. `https://api.yourdomain.com`
   - `UPLOAD_DIR` = a persistent folder (back it up)
   - `SEED_ADMIN_USERNAME`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` = a STRONG password (not Admin@123)
   - `NODE_ENV=production`
3. Create tables, roles and first Super Admin (once): `npm run seed`
4. Run with a process manager: `npm i -g pm2 && pm2 start src/index.js --name igo-api && pm2 save && pm2 startup`
   (starting also applies new migrations and syncs permissions automatically)
5. Put Nginx/Caddy in front with HTTPS, proxy `https://api.yourdomain.com` -> `http://127.0.0.1:4000`. Allow upload size (e.g. `client_max_body_size 20m`).
6. Check: `https://api.yourdomain.com/api/health` (or open the URL) should respond.

## Step 3 - Front end
1. Set the build variables on the host (Vercel: Project > Settings > Environment Variables):
   - `VITE_API_URL=https://api.yourdomain.com`   (required, baked in at build time)
   - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (cloud project values or your self-hosted Supabase URL + anon key)
2. Build: `npm ci && npm run build` -> publish the `dist/` folder.
3. Single-page-app rewrite: every path must serve `index.html` (Vercel uses `vercel.json`; on Nginx use `try_files $uri /index.html;`).
4. Redeploy whenever a `VITE_*` value changes.

## Step 4 - Supabase (only if used in production)
- Easiest: keep the existing cloud Supabase project and its keys in `VITE_SUPABASE_*`.
- Self-hosted: follow `supabase-selfhost/README.md` on an Ubuntu VPS (4 GB+ RAM), new secrets, domain + HTTPS, then run `database/careers_setup.sql` in its SQL editor.

## Step 5 - After going live (checklist)
- [ ] Open `/admin/login` and sign in with the seeded Super Admin (server login).
- [ ] Open `/admin/crm`: Customers, Leads, Bookings, Reports all load.
- [ ] Submit a test form on the website -> it appears in CRM > Enquiries.
- [ ] Create users/roles in CRM > Users & Roles; remove/disable any test accounts (`Admin / Admin@123` must not exist in production).
- [ ] HTTPS everywhere, DB not publicly reachable, daily MySQL backup + backup of `UPLOAD_DIR`.
- [ ] Confirm `CORS_ORIGINS` has the exact live domain (no trailing slash).

## Troubleshooting
- Login says cannot reach server -> `VITE_API_URL` wrong or not rebuilt, or API down.
- CORS error in browser -> add the site origin to `CORS_ORIGINS`, restart API.
- Blank page on refresh of /admin/... -> missing SPA rewrite.
- `npm start` exits silently on Windows was fixed in `server/src/index.js`; Linux is unaffected.
