# Self-hosted Supabase for IGO Agri Estate

Official Supabase Docker stack (Postgres, Auth, REST API, Storage, Realtime, Studio).

## Run it on your Windows PC
1. Install Docker Desktop (enable WSL2) and Git for Windows. Give Docker at least 4 GB RAM.
2. Open PowerShell in this folder and run:
   `powershell -ExecutionPolicy Bypass -File .\install.ps1`
   It downloads the official config, generates fresh secrets into `supabase-project\.env`, pulls the images and starts everything.
3. Open http://localhost:8000 (Studio). Dashboard login is in `.env`.
4. Point the website at it, in the project's `.env`:
   `VITE_SUPABASE_URL=http://localhost:8000`
   `VITE_SUPABASE_ANON_KEY=<ANON_KEY from supabase-project\.env>`

Stop: `docker compose down` (inside supabase-project). Data lives in `supabase-project\volumes\db\data`.

## Move to the VPS later
Use an Ubuntu VPS with 4 GB+ RAM. Copy this folder, run `sh setup.sh` equivalents (or just install Docker and run the same compose), set `SITE_URL`, `API_EXTERNAL_URL`, `SUPABASE_PUBLIC_URL` in `.env` to your domain, put HTTPS in front (Caddy/Nginx), then move data with `pg_dump` / `psql`. Never reuse the local secrets in production.

## Notes
- Never commit `supabase-project/.env` or `volumes/`.
- The ERP backend (`server/`) still uses MySQL. Moving it to this Postgres is a separate migration.
