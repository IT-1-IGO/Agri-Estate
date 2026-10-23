import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, ExternalLink, Pencil, Plus, Search, Trash2, Upload } from 'lucide-react';
import { useProperties } from '../hooks/useProperties';
import { LeadData, fetchLeads } from '../lib/leadsService';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { CATEGORY_SEED, LEGAL_SEED, NAV_SEED, PAGES_SEED, SOIL_SEED, WHY_SEED } from '../data/siteContent';
import CollectionManager from './CollectionManager';
import DocEditor from './DocEditor';
import { FieldDef } from './forms';
import { MEDIA_COL, MediaItem, getActivity, logActivity, mediaUsage, useCollection } from './store';
import { Btn, Card, ConfirmDialog, EmptyState, Modal, PageHeader, Pager, inputCls, saveMediaFile, useToast } from './ui';

const SERVICE_FIELDS: FieldDef[] = [
  { key: 'title', label: 'Title', required: true, max: 80 },
  { key: 'text', label: 'Description', type: 'textarea', required: true, max: 500 },
  { key: 'image', label: 'Image', type: 'image' },
  { key: 'alt', label: 'Image description (for accessibility)', max: 160 },
  { key: 'features', label: 'Feature list', type: 'lines', hint: 'One per line, written as “Title | short description”.' },
];
const SERVICE_COLS = [{ key: 'image', label: 'Image', image: true }, { key: 'title', label: 'Title' }, { key: 'text', label: 'Description' }];

/* ---------------- services / land & soil ---------------- */
export const ServicesScreen = () => {
  const [tab, setTab] = useState<'legal' | 'soil'>('legal');
  return (
    <div>
      <div className="mb-4 flex gap-2 border-b border-[#E3E8E1]">
        {([['legal', 'Legal & documentation'], ['soil', 'Land & Soil Intelligence']] as const).map(([k, l]) => <button key={k} type="button" onClick={() => setTab(k)} className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium normal-case tracking-normal ${tab === k ? 'border-[#124B3B] text-[#124B3B]' : 'border-transparent text-[#5E726B]'}`}>{l}</button>)}
        <Link to="/admin/pages" className="ml-auto self-center pb-1 text-sm text-[#124B3B] hover:underline">Edit other Services page content in Pages →</Link>
      </div>
      {tab === 'legal'
        ? <CollectionManager key="l" name="services.legal" title="Services" singular="Service" crumbs={['Services']} seed={LEGAL_SEED} fields={SERVICE_FIELDS} columns={SERVICE_COLS} previewPath="/services" sub="Legal & documentation service cards shown on the Services page." />
        : <CollectionManager key="s" name="services.soil" title="Land & Soil Intelligence" singular="Soil service" crumbs={['Services', 'Land & Soil Intelligence']} seed={SOIL_SEED} fields={SERVICE_FIELDS} columns={SERVICE_COLS} previewPath="/services" sub="Soil Intelligence cards shown on the Services page." />}
    </div>
  );
};

/* ---------------- careers ---------------- */
export const CareersContentScreen = () => (
  <div className="grid gap-8">
    <DocEditor name="careers" title="Careers Page" crumbs={['Careers', 'Page content']} previewPath="/careers"
      sections={[
        { title: 'Hero', hint: 'Leave blank to keep the current text.', fields: [
          { key: 'heroTitle', label: 'Headline', max: 120 },
          { key: 'heroText', label: 'Intro text', type: 'textarea', max: 300 },
          { key: 'heroImage', label: 'Hero image', type: 'image' },
        ] },
        { title: 'Section headings', fields: [
          { key: 'whyTitle', label: '“Why join” heading', max: 100 },
          { key: 'categoriesTitle', label: 'Categories heading', max: 100 },
          { key: 'openingsTitle', label: 'Current openings heading', max: 100, placeholder: 'Current Openings' },
        ] },
      ]} />
    <CollectionManager name="careers.why" title="Why Join Us cards" singular="Card" crumbs={['Careers', 'Why join']} seed={WHY_SEED}
      fields={[{ key: 'title', label: 'Title', required: true, max: 70 }, { key: 'text', label: 'Text', type: 'textarea', required: true, max: 300 }, { key: 'image', label: 'Image', type: 'image' }, { key: 'alt', label: 'Image description', max: 160 }]}
      columns={[{ key: 'image', label: 'Image', image: true }, { key: 'title', label: 'Title' }, { key: 'text', label: 'Text' }]} />
    <CollectionManager name="careers.categories" title="Career categories" singular="Category" crumbs={['Careers', 'Categories']} seed={CATEGORY_SEED}
      fields={[{ key: 'title', label: 'Title', required: true, max: 70 }, { key: 'text', label: 'Text', type: 'textarea', required: true, max: 300 }, { key: 'roles', label: 'Example roles', max: 200 }, { key: 'image', label: 'Image', type: 'image' }, { key: 'alt', label: 'Image description', max: 160 }]}
      columns={[{ key: 'image', label: 'Image', image: true }, { key: 'title', label: 'Title' }, { key: 'roles', label: 'Roles' }]} />
  </div>
);

export const OpeningsScreen = () => (
  <CollectionManager name="careers.openings" title="Job Openings" singular="Opening" crumbs={['Careers', 'Openings']} seed={[]} previewPath="/careers" filterKey="department"
    sub="Published openings appear in a “Current Openings” section on the Careers page. The section stays hidden while there are none."
    fields={[
      { key: 'title', label: 'Job title', required: true, max: 80 },
      { key: 'department', label: 'Department', type: 'select', options: ['Agriculture & Land Assessment', 'Legal Documentation & Land Records', 'Land Development & Project Operations', 'Marketing & Digital Media', 'Sales & Business Development', 'Customer Experience & Administration'], required: true },
      { key: 'location', label: 'Location', required: true, max: 80 },
      { key: 'type', label: 'Employment type', type: 'select', options: ['Full-time', 'Part-time', 'Internship', 'Contract'] },
      { key: 'experience', label: 'Experience required', max: 40, placeholder: 'e.g. 1-3 years' },
      { key: 'description', label: 'Description', type: 'textarea', required: true, max: 800 },
      { key: 'closing', label: 'Closing date', type: 'date' },
    ]}
    defaults={{ type: 'Full-time', department: 'Agriculture & Land Assessment' }}
    columns={[{ key: 'title', label: 'Title' }, { key: 'department', label: 'Department' }, { key: 'location', label: 'Location' }, { key: 'type', label: 'Type' }]} />
);

export const ApplicationsScreen = () => (
  <div>
    <PageHeader title="Career Applications" crumbs={['Career Applications']} />
    <Card><EmptyState title="Applications are stored in your database"
      text={isSupabaseConfigured
        ? 'Resumes are saved privately in Supabase (table career_applications, bucket “resumes”). Viewing them here needs a secure server-side login, which is added when the database is connected. Until then, open them in the Supabase dashboard.'
        : 'Nothing to show yet. Applications are saved to the database once Supabase is configured and database/careers_setup.sql has been run. Viewing them here needs the secure login added with the database.'} /></Card>
  </div>
);

/* ---------------- navigation & footer ---------------- */
export const NavigationScreen = () => (
  <div className="grid gap-8">
    <CollectionManager name="nav" title="Navigation & Footer" singular="Menu link" crumbs={['Navigation & Footer']} seed={NAV_SEED}
      sub="Menu links in the website header. Drafts are hidden from the menu."
      fields={[{ key: 'label', label: 'Label', required: true, max: 30 }, { key: 'to', label: 'Link', required: true, placeholder: '/about', hint: 'A site path starting with /, e.g. /about' }]}
      columns={[{ key: 'label', label: 'Label' }, { key: 'to', label: 'Link' }]} pageSize={12} />
    <DocEditor name="footer" title="Footer details" crumbs={['Navigation & Footer', 'Footer']}
      notice="Footer text is stored here; the public footer does not read it yet."
      sections={[{ title: 'Footer', fields: [
        { key: 'about', label: 'Short company description', type: 'textarea', max: 300 },
        { key: 'copyright', label: 'Copyright line', max: 120 },
        { key: 'links', label: 'Extra footer links', type: 'lines', hint: 'One per line: “Label | /path”.' },
      ] }]} />
  </div>
);

/* ---------------- settings & SEO ---------------- */
export const SettingsScreen = () => (
  <DocEditor name="settings" title="Website Settings" crumbs={['Website Settings']}
    notice="These are stored in this browser. Contact details and social links are not yet read by the public site; page-level SEO (Website Pages) is."
    sections={[
      { title: 'Site identity', fields: [
        { key: 'siteName', label: 'Site name', max: 60 },
        { key: 'logo', label: 'Logo', type: 'image' },
        { key: 'favicon', label: 'Favicon', type: 'image' },
      ] },
      { title: 'Contact details', fields: [
        { key: 'phone', label: 'Phone', max: 30 }, { key: 'email', label: 'Email', max: 80 }, { key: 'address', label: 'Address', type: 'textarea', max: 250 },
      ] },
      { title: 'Social links', fields: [
        { key: 'facebook', label: 'Facebook URL' }, { key: 'instagram', label: 'Instagram URL' }, { key: 'linkedin', label: 'LinkedIn URL' }, { key: 'youtube', label: 'YouTube URL' },
      ] },
      { title: 'Default SEO', fields: [
        { key: 'seoTitle', label: 'Default title', max: 70 }, { key: 'seoDescription', label: 'Default description', type: 'textarea', max: 170 }, { key: 'ogImage', label: 'Default share image', type: 'image' },
      ] },
    ]} />
);

/* ---------------- projects (existing property store) ---------------- */
export const ProjectsScreen = () => {
  const { properties, deleteProperty } = useProperties();
  const toast = useToast();
  const [q, setQ] = useState(''); const [st, setSt] = useState('all'); const [page, setPage] = useState(1);
  const [del, setDel] = useState<{ id: string; title: string } | null>(null);
  const list = useMemo(() => properties.filter((p) => (st === 'all' || p.status === st) && (!q.trim() || `${p.title} ${p.location} ${p.type || ''}`.toLowerCase().includes(q.trim().toLowerCase()))), [properties, q, st]);
  const pages = Math.max(1, Math.ceil(list.length / 8)); const cur = Math.min(page, pages);
  return (
    <div>
      <PageHeader title="Projects" crumbs={['Projects']} sub="Estates and projects shown on the Buy Land and Projects pages. Add and edit uses the existing property form."
        actions={<Link to="/admin/new" className="inline-flex items-center gap-1.5 rounded-lg bg-[#124B3B] px-3.5 py-2 text-sm font-medium normal-case tracking-normal text-white hover:bg-[#0c3a2d]"><Plus size={16} />Add Project</Link>} />
      <Card>
        <div className="flex flex-wrap gap-3 border-b border-[#E3E8E1] p-4">
          <div className="relative min-w-[200px] flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#93A39D]" /><input aria-label="Search projects" className={`${inputCls} pl-9`} placeholder="Search projects…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></div>
          <select aria-label="Filter by status" className={`${inputCls} !w-auto`} value={st} onChange={(e) => { setSt(e.target.value); setPage(1); }}><option value="all">All statuses</option><option>Available</option><option>Reserved</option><option>Sold</option></select>
        </div>
        {list.length === 0 ? <EmptyState title="No projects found" /> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-[#F5F8F5] text-xs uppercase tracking-wide text-[#5E726B]"><tr><th className="px-4 py-2.5">Project</th><th className="px-4 py-2.5">Location</th><th className="px-4 py-2.5">Size</th><th className="px-4 py-2.5">Price</th><th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5 text-right">Actions</th></tr></thead>
            <tbody>{list.slice((cur - 1) * 8, cur * 8).map((p) => (
              <tr key={p.id} className="border-t border-[#EEF2EE] hover:bg-[#FAFCFA]">
                <td className="px-4 py-3"><div className="flex items-center gap-3">{p.image && <img src={p.image} alt="" className="h-10 w-14 rounded object-cover" />}<span className="font-medium">{p.title}</span></div></td>
                <td className="px-4 py-3">{p.location}</td><td className="px-4 py-3">{p.size}</td><td className="px-4 py-3">{p.price}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-[#EEF3EF] px-2.5 py-0.5 text-xs font-medium">{p.status}</span></td>
                <td className="px-4 py-3"><div className="flex justify-end gap-0.5">
                  <Link to={`/properties/${p.id}`} target="_blank" aria-label="View on website" title="View on website" className="rounded p-1.5 text-[#5E726B] hover:bg-[#EEF3EF]"><ExternalLink size={15} /></Link>
                  <Link to={`/admin/edit/${p.id}`} aria-label="Edit" title="Edit" className="rounded p-1.5 text-[#124B3B] hover:bg-[#EEF3EF]"><Pencil size={15} /></Link>
                  <button type="button" aria-label="Delete" title="Delete" onClick={() => setDel({ id: p.id, title: p.title })} className="rounded p-1.5 text-[#B42318] hover:bg-[#FDECEA]"><Trash2 size={15} /></button>
                </div></td></tr>))}</tbody></table></div>)}
        <Pager page={cur} pages={pages} total={list.length} onPage={setPage} />
      </Card>
      {del && <ConfirmDialog title="Delete project?" text={`“${del.title}” will be removed from the website. This cannot be undone.`} onCancel={() => setDel(null)}
        onConfirm={async () => { try { await deleteProperty(del.id); logActivity('Deleted', `Project: ${del.title}`); toast('Project deleted'); } catch { toast('Could not delete project.', 'err'); } setDel(null); }} />}
    </div>
  );
};

/* ---------------- enquiries ---------------- */
const csv = (rows: LeadData[]) => {
  const cols = ['created_at', 'name', 'phone', 'email', 'type', 'property_title', 'location', 'budget', 'notes'] as const;
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
};
export const EnquiriesScreen = () => {
  const [leads, setLeads] = useState<LeadData[] | null>(null);
  const [q, setQ] = useState(''); const [type, setType] = useState('all'); const [page, setPage] = useState(1); const [view, setView] = useState<LeadData | null>(null);
  useEffect(() => { fetchLeads().then(setLeads).catch(() => setLeads([])); }, []);
  const list = (leads || []).filter((l) => (type === 'all' || l.type === type) && (!q.trim() || `${l.name} ${l.phone} ${l.email || ''} ${l.property_title || ''}`.toLowerCase().includes(q.trim().toLowerCase())));
  const pages = Math.max(1, Math.ceil(list.length / 10)); const cur = Math.min(page, pages);
  const fmt = (d?: string) => (d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—');
  return (
    <div>
      <PageHeader title="Enquiries" crumbs={['Enquiries']} sub="Leads from the contact, requirement, visit and offer forms."
        actions={<Btn variant="outline" disabled={!list.length} onClick={() => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv(list)], { type: 'text/csv' })); a.download = 'enquiries.csv'; a.click(); }}><Download size={15} />Export CSV</Btn>} />
      <Card>
        <div className="flex flex-wrap gap-3 border-b border-[#E3E8E1] p-4">
          <div className="relative min-w-[200px] flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#93A39D]" /><input aria-label="Search enquiries" className={`${inputCls} pl-9`} placeholder="Search name, phone, email…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></div>
          <select aria-label="Filter by type" className={`${inputCls} !w-auto`} value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}><option value="all">All types</option>{['contact', 'requirement', 'visit', 'offer', 'callback'].map((t) => <option key={t} value={t}>{t}</option>)}</select>
        </div>
        {leads === null ? <p className="p-8 text-center text-sm text-[#5E726B]">Loading…</p> : list.length === 0 ? <EmptyState title="No enquiries yet" text="New enquiries from the website will appear here." /> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-[#F5F8F5] text-xs uppercase tracking-wide text-[#5E726B]"><tr><th className="px-4 py-2.5">Date</th><th className="px-4 py-2.5">Name</th><th className="px-4 py-2.5">Phone</th><th className="px-4 py-2.5">Type</th><th className="px-4 py-2.5">Regarding</th><th className="px-4 py-2.5" /></tr></thead>
            <tbody>{list.slice((cur - 1) * 10, cur * 10).map((l, i) => (
              <tr key={l.id || i} className="border-t border-[#EEF2EE] hover:bg-[#FAFCFA]"><td className="whitespace-nowrap px-4 py-3">{fmt(l.created_at)}</td><td className="px-4 py-3 font-medium">{l.name}</td><td className="px-4 py-3">{l.phone}</td><td className="px-4 py-3 capitalize">{l.type}</td><td className="px-4 py-3">{l.property_title || l.location || '—'}</td>
                <td className="px-4 py-3 text-right"><Btn variant="ghost" className="!py-1" onClick={() => setView(l)}>View</Btn></td></tr>))}</tbody></table></div>)}
        <Pager page={cur} pages={pages} total={list.length} onPage={setPage} />
      </Card>
      {view && <Modal title="Enquiry details" onClose={() => setView(null)} footer={<Btn variant="outline" onClick={() => setView(null)}>Close</Btn>}>
        <dl className="grid gap-2 text-sm">{Object.entries(view).filter(([, v]) => v !== undefined && v !== null && v !== '').map(([k, v]) => (<div key={k} className="grid grid-cols-[140px_1fr] gap-2"><dt className="text-[#6B7F78]">{k.replace(/_/g, ' ')}</dt><dd className="break-words">{k === 'created_at' ? fmt(String(v)) : String(v)}</dd></div>))}</dl></Modal>}
    </div>
  );
};

/* ---------------- media library ---------------- */
export const MediaScreen = () => {
  const { items, save } = useCollection<MediaItem>(MEDIA_COL, []);
  const toast = useToast();
  const [q, setQ] = useState(''); const [del, setDel] = useState<MediaItem | null>(null); const [busy, setBusy] = useState(false);
  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return; setBusy(true);
    let ok = 0;
    for (const f of Array.from(files)) { try { await saveMediaFile(f); ok++; } catch (e) { toast(`${f.name}: ${e instanceof Error ? e.message : 'failed'}`, 'err'); } }
    setBusy(false); if (ok) { toast(`${ok} image${ok > 1 ? 's' : ''} uploaded`); logActivity('Uploaded', `${ok} media file(s)`); }
  };
  const shown = items.filter((m) => !q.trim() || m.name.toLowerCase().includes(q.trim().toLowerCase()));
  const used = del ? mediaUsage(del.id) : 0;
  return (
    <div>
      <PageHeader title="Media Library" crumbs={['Media Library']} sub="Images are resized and stored in this browser. Use them from any image field."
        actions={<label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#124B3B] px-3.5 py-2 text-sm font-medium normal-case tracking-normal text-white hover:bg-[#0c3a2d]"><Upload size={16} />{busy ? 'Uploading…' : 'Upload images'}<input type="file" accept="image/*" multiple hidden onChange={(e) => { onFiles(e.target.files); e.target.value = ''; }} /></label>} />
      <Card>
        <div className="border-b border-[#E3E8E1] p-4"><input aria-label="Search media" className={inputCls} placeholder="Search by file name…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        {shown.length === 0 ? <EmptyState title="No media yet" text="Upload images to use them across the site." /> : (
          <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 lg:grid-cols-5">
            {shown.map((m) => (
              <div key={m.id} className="overflow-hidden rounded-lg border border-[#E3E8E1]">
                <img src={m.dataUrl} alt={m.name} className="h-28 w-full object-cover" />
                <div className="p-2 text-xs"><p className="truncate font-medium">{m.name}</p><p className="text-[#6B7F78]">{Math.round(m.size / 1024)} KB</p>
                  <button type="button" onClick={() => setDel(m)} className="mt-1 text-[#B42318] hover:underline">Delete</button></div>
              </div>))}
          </div>)}
      </Card>
      {del && <ConfirmDialog title="Delete image?" text={used > 0 ? `“${del.name}” is used in ${used} place${used > 1 ? 's' : ''}. Those spots will lose the image if you delete it.` : `“${del.name}” will be removed from the library.`}
        onCancel={() => setDel(null)} onConfirm={() => { save(items.filter((x) => x.id !== del.id)); logActivity('Deleted', `Media: ${del.name}`); toast('Image deleted'); setDel(null); }} />}
    </div>
  );
};

/* ---------------- activity ---------------- */
export const ActivityScreen = () => {
  const list = getActivity();
  return (
    <div><PageHeader title="Activity Log" crumbs={['Activity']} sub="Recent changes made in this admin panel (this browser)." />
      <Card>{list.length === 0 ? <EmptyState title="No activity yet" /> : <ul className="divide-y divide-[#EEF2EE]">{list.map((a) => (
        <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"><span><b className="font-medium">{a.action}</b> — {a.target}</span><span className="text-xs text-[#6B7F78]">{new Date(a.at).toLocaleString('en-IN')}</span></li>))}</ul>}</Card></div>
  );
};

