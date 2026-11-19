import 'dotenv/config';
const B = 'http://127.0.0.1:' + (process.env.PORT || 4000);
let fail = 0; const ok = (c, m, x = '') => { console.log((c ? 'PASS ' : 'FAIL ') + m + (c ? '' : '  ' + x)); if (!c) fail++; };
const j = async (p, o = {}, tok) => { const r = await fetch(B + p, { method: o.method || (o.body ? 'POST' : 'GET'), headers: { 'Content-Type': 'application/json', ...(tok ? { Authorization: 'Bearer ' + tok } : {}) }, body: o.body ? JSON.stringify(o.body) : undefined }); const ct = r.headers.get('content-type') || ''; return { s: r.status, d: ct.includes('json') ? await r.json() : null, r }; };
const pub = (b) => j('/api/public/enquiries', { body: b });
const stamp = Date.now().toString().slice(-6);
const ph = (n) => '9' + String(800000000 + Number(stamp) * 10 + n).slice(0, 9);
const login = await j('/api/auth/login', { body: { username: process.env.SEED_ADMIN_USERNAME, password: process.env.SEED_ADMIN_PASSWORD } });
const T = login.d.token; ok(!!T, 'super admin login');

// every website form, shaped like the real call sites
const forms = [
  { f: 'Home – Share your land requirement', b: { source: 'buy_land', form_name: 'Home – Share your land requirement', website_page: '/', name: 'Home Buyer', phone: ph(1), email: 'home@example.com', preferred_location: 'Maduranthagam', preferred_area: '5 acres', budget: '50 lakhs', message: 'Need farm land', extra: { Project: 'Not sure yet', Intent: 'Buy land only' } } },
  { f: 'Sell Land form', b: { source: 'sell_land', form_name: 'Sell Land – Submit your land', website_page: '/sell-land', name: 'Seller One', phone: ph(2), location: 'Cheyyur', message: 'Selling 3 acres', preferred_area: '3 acres', extra: { 'Land type': 'Dry', 'Water source': 'Borewell' } } },
  { f: 'Property enquiry (LeadCaptureForm)', b: { source: 'property', form_name: 'Property Details – Schedule a visit', website_page: '/property/abc', name: 'Visit Person', phone: ph(3), property_title: 'Green Valley Estate', enquiry_type: 'Site Visit Request', message: 'Visit Sat', extra: { 'Preferred date': '2026-12-01' } } },
  { f: 'Callback request', b: { source: 'callback', form_name: 'Property Details – Request callback', website_page: '/property/abc', name: 'Call Me', phone: ph(4), property_title: 'Green Valley Estate' } },
  { f: 'Contact Us', b: { source: 'contact', form_name: 'Contact Us', website_page: '/contact', name: 'Contact Person', phone: ph(5), email: 'c@example.com', message: 'Subject: Hello\n\nHi' } },
  { f: 'Post requirement page', b: { source: 'buy_land', form_name: 'Post Requirement', website_page: '/post-requirement', name: 'Req Person', phone: ph(6), budget: '1 crore', preferred_location: 'ECR' } },
  { f: 'Services modal (valuation)', b: { source: 'services', form_name: 'Land Valuation – Request valuation', website_page: '/valuation', name: 'Valuer Lead', phone: ph(7), property_title: 'Survey No. 12/3', location: 'Madurai', extra: { 'Land type': 'Wet' } } },
  { f: 'Legal services modal', b: { source: 'services', form_name: 'Legal Services – Book consultation', website_page: '/services/legal', name: 'Legal Lead', phone: ph(8), email: 'l@example.com' } },
  { f: 'Project enquiry', b: { source: 'project', form_name: 'Projects – Enquire', website_page: '/projects', name: 'Proj Lead', phone: ph(9), interested_project: 'Maduranthagam Parcel 2' } },
  { f: 'Newsletter (email only)', b: { source: 'newsletter', form_name: 'Blog newsletter', website_page: '/blogs', name: 'Newsletter subscriber', email: `news${stamp}@example.com` } },
];
const codes = {};
for (const { f, b } of forms) {
  const r = await pub(b);
  ok(r.s === 201 && r.d.ok && /^ENQ-\d{5}$/.test(r.d.code), `${f}: saved, enquiry ID returned (${r.d?.code})`, JSON.stringify(r.d));
  codes[f] = r.d;
}
// everything is visible in the admin list with correct fields
const list = await j(`/api/enquiries?q=${stamp.slice(0, 0)}&pageSize=100`, {}, T);
const mine = list.d.data.filter((e) => forms.some((x) => x.b.name === e.name));
ok(mine.length === forms.length, `all ${forms.length} submissions appear in Enquiry Management (${mine.length})`);
const byName = (n) => mine.find((e) => e.name === n);
ok(mine.every((e) => e.status === 'new'), 'every new submission starts as status New');
const home = byName('Home Buyer');
ok(home.form_name === 'Home – Share your land requirement' && home.website_page === '/' && home.preferred_location === 'Maduranthagam' && home.preferred_area === '5 acres' && home.budget === '50 lakhs' && home.email === 'home@example.com' && home.enquiry_type === 'Buy Land', 'Home form: all submitted fields stored');
const det = (await j(`/api/enquiries/${home.id}`, {}, T)).d;
ok(det.form_data?.Project === 'Not sure yet' && det.form_data?.Intent === 'Buy land only', 'form-specific answers kept (form_data)');
ok(byName('Seller One').location === 'Cheyyur' && byName('Seller One').source === 'sell_land', 'Sell Land: location + source stored');
ok(byName('Visit Person').enquiry_type === 'Site Visit Request' && byName('Visit Person').property_title === 'Green Valley Estate', 'Property form: type + property stored');
ok(byName('Newsletter subscriber').phone === '' && byName('Newsletter subscriber').email.startsWith('news'), 'email-only form stored with empty phone (no invented data)');
ok(byName('Proj Lead').interested_project === 'Maduranthagam Parcel 2' && byName('Proj Lead').source === 'project', 'Project enquiry: project stored');
ok(!!home.created_at && !!home.updated_at, 'submission date/time + last updated stored');

// validation + failure handling
let r = await pub({ source: 'contact', name: 'No Contact' }); ok(r.s === 422, 'no phone and no email is rejected (422)');
r = await pub({ source: 'contact', name: '', phone: ph(1) }); ok(r.s === 422 && r.d.fields.name, 'missing name is rejected with field error');
r = await pub({ source: 'contact', name: 'Bad', phone: '12345' }); ok(r.s === 422 && r.d.fields.phone, 'invalid phone is rejected');
r = await pub({ source: 'contact', name: 'Bad', phone: ph(1), email: 'nope' }); ok(r.s === 422 && r.d.fields.email, 'invalid email is rejected');
r = await pub({ source: 'contact', name: 'Bot', phone: ph(1), website: 'http://spam' }); ok(r.s === 201 && !r.d.code, 'honeypot submissions are dropped silently');
r = await pub({ source: 'hacker', name: 'X Y', phone: ph(30), status: 'converted', assigned_to: 1, priority: 'high' });
const hk = (await j(`/api/enquiries/${r.d.id}`, {}, T)).d; ok(hk.source === 'contact' && hk.status === 'new' && !hk.assigned_to && hk.priority === 'medium', 'public form cannot set status/assignment/priority; unknown source falls back to contact');

// duplicates
const again = await pub(forms[1].b); ok(again.s === 200 && again.d.duplicate && again.d.code === codes[forms[1].f].code, 'double submit of same form within 24h is attached to the original (no duplicate row)');
const d1 = (await j(`/api/enquiries/${byName('Seller One').id}`, {}, T)).d; ok(d1.repeat_count === 1 && d1.followups.some((f) => /Repeat enquiry/.test(f.notes)), 'original keeps history of the repeat submission');
const other = await pub({ source: 'contact', form_name: 'Contact Us', website_page: '/contact', name: 'Seller One', phone: forms[1].b.phone, message: 'Different enquiry' });
ok(other.s === 201 && other.d.code !== codes[forms[1].f].code && other.d.repeat === true, 'same customer, different form = new enquiry, linked as repeat customer');
const d2 = (await j(`/api/enquiries/${other.d.id}`, {}, T)).d; ok(d2.previous_enquiries.some((p) => p.code === codes[forms[1].f].code), 'detail shows earlier enquiries from the same customer');
const byMail = await pub({ source: 'consultation', form_name: 'Free consultation', name: 'Home Buyer', phone: ph(40), email: 'home@example.com' });
const d3 = (await j(`/api/enquiries/${byMail.d.id}`, {}, T)).d; ok(d3.previous_enquiries.some((p) => p.code === codes[forms[0].f].code), 'matching email links enquiries from a different phone number');

// admin list features
const f1 = await j('/api/enquiries?source=sell_land&pageSize=100', {}, T); ok(f1.d.data.every((e) => e.source === 'sell_land') && f1.d.data.length >= 1, 'filter by source');
const f2 = await j('/api/enquiries?enquiry_type=Site%20Visit%20Request', {}, T); ok(f2.d.data.length >= 1 && f2.d.data.every((e) => e.enquiry_type === 'Site Visit Request'), 'filter by enquiry type');
const f3 = await j('/api/enquiries?q=' + ph(5), {}, T); ok(f3.d.data.length === 1 && f3.d.data[0].name === 'Contact Person', 'search by phone number');
const f4 = await j('/api/enquiries?q=Valuer', {}, T); ok(f4.d.data.length === 1, 'search by customer name');
const today = new Date().toISOString().slice(0, 10);
ok((await j(`/api/enquiries?from=${today}&to=${today}&pageSize=100`, {}, T)).d.total >= forms.length, 'filter by date range (today)');
ok((await j('/api/enquiries?from=2020-01-01&to=2020-01-02', {}, T)).d.total === 0, 'date filter excludes other days');
const pg = await j('/api/enquiries?pageSize=5&page=2', {}, T); ok(pg.d.data.length === 5 && pg.d.page === 2, 'pagination');

// assignment, status, history, notifications
const users = (await j('/api/lookups', {}, T)).d.users;
const roles = (await j('/api/roles', {}, T)).d;
let exec = null;
if (!exec) {
  const rid = (roles.roles || roles.data || []).find((x) => x.name === 'executive').id;
  const cu = await j('/api/users', { body: { name: 'Test Exec', username: 'testexec' + stamp, email: `te${stamp}@example.com`, phone: ph(50), role_id: rid, password: 'Exec@12345678', confirm_password: 'Exec@12345678', status: 'active' } }, T);
  ok(cu.s === 201, 'created test executive user', JSON.stringify(cu.d)); exec = { id: cu.d.id, name: 'Test Exec' };
}
const target = byName('Contact Person');
const asg = await j(`/api/enquiries/${target.id}`, { method: 'PUT', body: { assigned_to: exec.id } }, T);
ok(asg.s === 200 && asg.d.assigned_to === exec.id && asg.d.status === 'assigned' && asg.d.assigned_by && asg.d.assigned_at, 'assign lead: employee saved, status → assigned, assigner + date recorded');
const dd = (await j(`/api/enquiries/${target.id}`, {}, T)).d; ok(dd.assignments.length === 1 && dd.assignments[0].assigned_by_name, 'assignment history recorded');
const execLogin = await j('/api/auth/login', { body: { username: 'testexec' + stamp, password: 'Exec@12345678' } });
const ET = execLogin.d?.token;
if (ET) {
  const nt = (await j('/api/notifications', {}, ET)).d; ok(nt.unread >= 1 && nt.data.some((n) => /assigned/i.test(n.title)), 'assigned employee is notified');
  const mineList = (await j('/api/enquiries?pageSize=100', {}, ET)).d; ok(mineList.data.every((e) => e.assigned_to === exec.id || e.created_by === exec.id) && mineList.data.some((e) => e.id === target.id), "employee's dashboard list shows only their assigned leads");
  const noAssign = await j(`/api/enquiries/${byName('Seller One').id}`, { method: 'PUT', body: { status: 'contacted' } }, ET); ok(noAssign.s === 404, 'employee cannot open leads that are not theirs');
  const st = await j(`/api/enquiries/${target.id}`, { method: 'PUT', body: { status: 'contacted' } }, ET); ok(st.s === 200 && st.d.status === 'contacted', 'employee updates status of own lead');
  const reasg = await j(`/api/enquiries/${target.id}`, { method: 'PUT', body: { assigned_to: 1 } }, ET); ok(reasg.d.assigned_to === exec.id, 'employee cannot re-assign leads (no assign permission)');
}
const sa = (await j('/api/notifications', {}, T)).d; ok(sa.data.some((n) => /New website enquiry/.test(n.title)), 'admins are notified of new website enquiries');
const walk = ['followup_pending', 'interested', 'site_visit_scheduled', 'negotiation', 'converted'];
for (const s of walk) await j(`/api/enquiries/${target.id}`, { method: 'PUT', body: { status: s } }, T);
const hist = (await j(`/api/enquiries/${target.id}`, {}, T)).d.status_history; ok(hist.length >= 7 && hist[0].to_status === 'converted' && hist[hist.length - 1].to_status === 'new', 'complete lead status history kept (' + hist.length + ' entries)');
const fu = await j(`/api/enquiries/${byName('Proj Lead').id}/followups`, { body: { type: 'call', notes: 'Called customer', followup_date: new Date(Date.now() - 3600e3).toISOString() } }, T); ok(fu.s === 201, 'add follow-up');
const { runReminders } = await import('./src/notify.js'); const rem = await runReminders(); await runReminders();
const n2 = (await j('/api/notifications', {}, T)).d; ok(rem.followups >= 1, 'reminder sweep finds due follow-ups');
ok(n2.data.filter((n) => /Follow-up due/.test(n.title)).length <= (await j('/api/notifications', {}, T)).d.data.filter((n) => /Follow-up due/.test(n.title)).length, 'reminders are not duplicated');
await j('/api/notifications/read-all', { method: 'POST', body: {} }, T); ok((await j('/api/notifications', {}, T)).d.unread === 0, 'mark all notifications read');

// dashboard
const dash = (await j('/api/dashboard', {}, T)).d;
const s = dash.stats; ok(s.enquiries >= forms.length && s.new_leads >= 1 && s.converted >= 1 && 'assigned' in s && 'interested' in s && 'site_visit_leads' in s && 'closed' in s && 'pending_followups' in s, 'dashboard stats come from real records', JSON.stringify(s));
ok(dash.daily.length >= 1 && dash.daily[dash.daily.length - 1].enquiries >= forms.length && dash.monthly.length >= 1 && dash.bySource.length >= 5 && dash.conversionBySource.some((x) => x.converted >= 1) && dash.performance.some((p) => p.converted >= 1), 'daily, monthly, source, conversion and executive charts have data');
// export
const x = await fetch(B + '/api/enquiries?export=xlsx', { headers: { Authorization: 'Bearer ' + T } }); const buf = Buffer.from(await x.arrayBuffer());
ok(x.status === 200 && /spreadsheetml/.test(x.headers.get('content-type')) && buf.slice(0, 2).toString() === 'PK' && buf.length > 3000, 'Excel (.xlsx) export downloads a real workbook (' + buf.length + ' bytes)');
if (ET) { const x2 = await fetch(B + '/api/enquiries?export=xlsx', { headers: { Authorization: 'Bearer ' + ET } }); ok(x2.status === 403, 'export blocked without export permission'); }
// delete / archive
const del = await j(`/api/enquiries/${byName('Call Me').id}`, { method: 'DELETE' }, T); ok(del.s === 200, 'delete (soft, archived) works'); ok(!(await j('/api/enquiries?q=Call%20Me', {}, T)).d.data.length, 'deleted enquiry leaves the list');
const unauth = await j('/api/enquiries'); ok(unauth.s === 401, 'enquiry data is not readable without sign-in');
console.log(fail ? `\n${fail} FAILED` : '\nALL PASSED'); process.exit(fail ? 1 : 0);
