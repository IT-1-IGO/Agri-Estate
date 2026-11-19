# IGO Agri Estate – Admin API (Node + Express + MySQL)

## Setup
1. Create a MySQL/MariaDB database and a user with access to it.
2. `cd server && cp .env.example .env` and fill in `DB_*`, a long random `JWT_SECRET`, `CORS_ORIGINS` (your website origin), `PUBLIC_BASE_URL`, and `SEED_ADMIN_*`.
3. `npm install && npm run migrate && npm run seed` (seed creates roles/permissions and the first Super Admin; if `SEED_ADMIN_PASSWORD` is unset a random one is printed once).
4. `npm start` (default port 4000). Put it behind HTTPS (Node host, VPS, Render, Railway…); Vercel static hosting cannot run it.
5. In the website project set `VITE_API_URL=https://your-api-host` and rebuild. Admin UI: `/admin/crm`.

## Security model
- bcrypt password hashes, JWT sessions (8h) invalidated on password/role change, login rate limiting.
- Every request reloads the user's role and permissions from the DB; `module.action` permissions (view/create/edit/delete/approve/publish/export, `view_all`) are enforced server-side. Executives only see records assigned to / created by them.
- Soft deletes + activity log (previous/updated values, IP) on all writes. Private PDFs are served only to signed-in admins.
- Website forms post to `POST /api/public/enquiries` (rate limited, honeypot `website`, whitelisted fields, duplicate detection by phone + property).

## Roles (editable in Roles & Permissions)
Super Admin, Admin, Manager, Executive, Marketing.

## Not yet built
Reports (Excel/PDF), website-CMS publishing from the DB, calendar view, property images/documents UI. Existing CMS at `/admin` still uses browser storage.
