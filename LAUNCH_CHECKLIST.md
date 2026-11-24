# Launch Checklist – igoagriestate.com (2026-11-19)
[x] done & verified   [ ] you must do   [~] done in code, verify after redeploy

## 1 Website
[x] Deployed, home opens  [x] Home mobile OK  [ ] Mobile check other pages  [ ] Contact/address/social/legal details  [ ] Remove placeholder content  [ ] Owner content approval
## 2 Domain/DNS
[x] Domain -> 187.127.170.205  [ ] non-www redirects to www (test)  [ ] Auto-renew + expiry date (Hostinger)
## 3 Hosting
[x] Dokploy web + API  [x] Env/build args  [x] Production build  [ ] Restart policy  [ ] Server RAM/disk
## 4 Database
[x] MySQL created+seeded  [ ] Test add/edit/delete property  [ ] Automated backups  [ ] Test restore
## 5 Security
[x] HTTPS  [~] Security headers (nginx.conf)  [ ] Rotate DB password Igofamily@1234  [ ] Change superadmin password  [ ] HTTP->HTTPS test  [ ] Firewall: only 80/443/SSH  [ ] Close/protect Dokploy port 3000  [ ] Form spam/rate limit
## 6 Testing
[ ] Contact / Post Requirement / Sell Land forms + emails  [ ] Login/signup/logout  [ ] Listings search/filters  [ ] Admin + uploads  [ ] 404 page  [ ] Firefox/Safari/phone  [ ] Owner sign-off
## 7 Email/integrations
[ ] Business email  [ ] SPF/DKIM/DMARC  [ ] Supabase reachable  [ ] Production keys
## 8 SEO/Analytics
[x] Titles/descriptions  [x] Canonical  [x] sitemap/robots/llms  [x] Alt text  [x] Headings  [x] Schema  [x] 404 noindex  [~] 1200x630 share image  [ ] GA4 (send Measurement ID)  [ ] Search Console verify + submit sitemap
## 9 Performance
[x] Compression/caching  [x] Images/video compressed  [~] /projects instant render  [ ] PageSpeed mobile  [ ] Broken-link check
## 10 Backup/Monitoring
[ ] Off-server backups  [ ] Uptime + SSL monitoring  [ ] Disk/error alerts  [ ] Rollback steps (redeploy older Dokploy deployment)
## 11-12 Launch / After
[ ] Owner approval  [ ] Smoke test on public domain  [ ] Inform stakeholders  [ ] Record launch date/owner/contact  [ ] Daily monitoring first week
