import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, FileText, Image as ImageIcon, MessageSquare, Sprout, Wrench, Briefcase, Plus, Upload, PenSquare, Users, ArrowUpRight, ClipboardList } from 'lucide-react';
import { useProperties } from '../hooks/useProperties';
import { fetchLeads } from '../lib/leadsService';
import { CATEGORY_SEED, LEGAL_SEED, PAGES_SEED, SOIL_SEED } from '../data/siteContent';
import { MEDIA_COL, getActivity, getCollection, subscribeCms } from './store';
import { Card, EmptyState, PageHeader } from './ui';

const countOf = (name: string, seed: Parameters<typeof getCollection>[1]) => {
  const l = getCollection(name, seed);
  const pub = l.filter((i) => (i.status ?? 'published') === 'published').length;
  return { total: l.length, pub, draft: l.length - pub };
};

const Dashboard: React.FC = () => {
  const { properties } = useProperties();
  const [leads, setLeads] = useState<number | null>(null);
  const [, tick] = useState(0);
  useEffect(() => { fetchLeads().then((l) => setLeads(l.length)).catch(() => setLeads(0)); return subscribeCms(() => tick((n) => n + 1)); }, []);
  const pages = countOf('pages', PAGES_SEED), legal = countOf('services.legal', LEGAL_SEED), soil = countOf('services.soil', SOIL_SEED);
  const open = countOf('careers.openings', []), cats = countOf('careers.categories', CATEGORY_SEED);
  const media = getCollection(MEDIA_COL, []).length;
  const avail = properties.filter((p) => p.status === 'Available').length;
  const totalDraft = pages.draft + legal.draft + soil.draft + open.draft + cats.draft;
  const bars = [
    { label: 'Pages', ...pages }, { label: 'Legal services', ...legal }, { label: 'Soil services', ...soil },
    { label: 'Career categories', ...cats }, { label: 'Job openings', ...open },
  ];
  const attention = [
    totalDraft > 0 && { t: `${totalDraft} item${totalDraft > 1 ? 's' : ''} still in draft`, to: '/admin/pages' },
    open.total === 0 && { t: 'No job openings posted yet', to: '/admin/careers/openings' },
    media === 0 && { t: 'Media library is empty', to: '/admin/media' },
    (leads ?? 0) > 0 && { t: `${leads} website enquir${leads === 1 ? 'y' : 'ies'} to review`, to: '/admin/crm/enquiries' },
  ].filter(Boolean) as { t: string; to: string }[];
  const TONE: Record<string, string> = { emerald: 'bg-emerald-50 text-emerald-700', sky: 'bg-sky-50 text-sky-700', amber: 'bg-amber-50 text-amber-700', lime: 'bg-lime-50 text-lime-700', violet: 'bg-violet-50 text-violet-700', rose: 'bg-rose-50 text-rose-700', teal: 'bg-teal-50 text-teal-700' };
  const act = getActivity().slice(0, 6);
  const tiles = [
    { label: 'Website pages', value: pages.total, sub: `${pages.pub} published · ${pages.draft} draft`, to: '/admin/pages', Icon: FileText, tone: 'emerald' },
    { label: 'Projects', value: properties.length, sub: `${properties.filter((p) => p.status === 'Available').length} available`, to: '/admin/projects', Icon: Building2, tone: 'sky' },
    { label: 'Services', value: legal.total + soil.total, sub: `${legal.total} legal · ${soil.total} soil`, to: '/admin/services', Icon: Wrench, tone: 'amber' },
    { label: 'Career categories', value: cats.total, sub: `${cats.pub} published`, to: '/admin/careers', Icon: Sprout, tone: 'lime' },
    { label: 'Job openings', value: open.total, sub: `${open.pub} published · ${open.draft} draft`, to: '/admin/careers/openings', Icon: Briefcase, tone: 'violet' },
    { label: 'Enquiries', value: leads ?? '…', sub: 'From website forms', to: '/admin/enquiries', Icon: MessageSquare, tone: 'rose' },
    { label: 'Media files', value: media, sub: 'In media library', to: '/admin/media', Icon: ImageIcon, tone: 'teal' },
  ];
  const quick = [
    { to: '/admin/new', l: 'Add a project', Icon: Plus }, { to: '/admin/pages', l: 'Edit a page', Icon: PenSquare },
    { to: '/admin/careers/openings', l: 'Post a job opening', Icon: Briefcase }, { to: '/admin/media', l: 'Upload media', Icon: Upload },
    { to: '/admin/crm', l: 'Open CRM & ERP', Icon: Users }, { to: '/admin/enquiries', l: 'View enquiries', Icon: ClipboardList },
  ];
  const max = Math.max(1, ...bars.map((b) => b.total));
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" sub="A live summary of your website content and activity." />

      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map(({ label, value, sub, to, Icon, tone }) => (
          <Link key={label} to={to} className="group rounded-2xl border border-[#E3E8E1] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#124B3B]/40 hover:shadow-md">
            <div className="flex items-start justify-between">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${TONE[tone]}`}><Icon size={20} /></span>
              <ArrowUpRight size={16} className="text-[#9AAAA4] transition group-hover:text-[#124B3B]" />
            </div>
            <p className="mt-4 text-sm font-medium text-[#5E726B]">{label}</p>
            <p className="mt-1 text-3xl font-semibold leading-none tracking-tight text-[#10231D]">{value}</p>
            <p className="mt-2 text-xs text-[#6B7F78]">{sub}</p>
          </Link>))}
        <div className="rounded-2xl border border-[#124B3B] bg-[#124B3B] p-5 text-white shadow-sm">
          <p className="text-sm font-medium text-white/80">Land availability</p>
          <p className="mt-3 text-3xl font-semibold leading-none">{properties.length ? Math.round((avail / properties.length) * 100) : 0}%</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-emerald-300" style={{ width: `${properties.length ? (avail / properties.length) * 100 : 0}%` }} /></div>
          <p className="mt-2 text-xs text-white/75">{avail} of {properties.length} projects available</p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="border-b border-[#E3E8E1] px-5 py-4"><h2 className="text-base font-semibold normal-case tracking-normal">Content status</h2><p className="text-xs text-[#6B7F78]">Published vs draft across the website</p></div>
          <div className="space-y-4 p-5">
            {bars.map((b) => (
              <div key={b.label}>
                <div className="mb-1.5 flex justify-between text-sm"><span className="font-medium text-[#10231D]">{b.label}</span><span className="text-xs text-[#6B7F78]">{b.pub} published · {b.draft} draft</span></div>
                <div className="flex h-2.5 overflow-hidden rounded-full bg-[#EEF2EE]" style={{ width: `${Math.max(8, (b.total / max) * 100)}%` }} role="img" aria-label={`${b.label}: ${b.pub} published, ${b.draft} draft`}>
                  <div className="bg-[#124B3B]" style={{ width: `${b.total ? (b.pub / b.total) * 100 : 0}%` }} /><div className="bg-amber-400" style={{ width: `${b.total ? (b.draft / b.total) * 100 : 0}%` }} />
                </div>
              </div>))}
            <div className="flex gap-4 pt-1 text-xs text-[#6B7F78]"><span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#124B3B]" />Published</span><span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-amber-400" />Draft</span></div>
          </div>
        </Card>
        <Card>
          <div className="border-b border-[#E3E8E1] px-5 py-4"><h2 className="text-base font-semibold normal-case tracking-normal">Needs attention</h2></div>
          {attention.length === 0 ? <EmptyState title="All caught up" text="Nothing needs your attention right now." /> :
            <ul className="divide-y divide-[#EEF2EE]">{attention.map((a) => <li key={a.t}><Link to={a.to} className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-[#F7FAF7]"><span className="flex items-center gap-2.5"><i className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />{a.t}</span><ArrowUpRight size={14} className="shrink-0 text-[#9AAAA4]" /></Link></li>)}</ul>}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#E3E8E1] px-5 py-4"><h2 className="text-base font-semibold normal-case tracking-normal">Recent activity</h2><Link to="/admin/activity" className="text-sm font-medium text-[#124B3B] hover:underline">View all</Link></div>
          {act.length === 0 ? <EmptyState title="No changes yet" text="Edits you make in the admin panel will be listed here." /> : <ul className="divide-y divide-[#EEF2EE]">{act.map((a) => <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm"><span className="flex min-w-0 items-center gap-3"><i className="h-2 w-2 shrink-0 rounded-full bg-[#124B3B]" /><span className="min-w-0 truncate"><b className="font-medium">{a.action}</b> — {a.target}</span></span><span className="shrink-0 text-xs text-[#6B7F78]">{new Date(a.at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span></li>)}</ul>}
        </Card>
        <Card>
          <div className="border-b border-[#E3E8E1] px-5 py-4"><h2 className="text-base font-semibold normal-case tracking-normal">Quick actions</h2></div>
          <div className="grid grid-cols-2 gap-3 p-4 text-sm">
            {quick.map(({ to, l, Icon }) => <Link key={to} to={to} className="flex flex-col items-start gap-2 rounded-xl border border-[#E3E8E1] p-3 font-medium text-[#10231D] transition hover:border-[#124B3B]/40 hover:bg-[#F2F6F3]"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#E8F1EC] text-[#124B3B]"><Icon size={16} /></span>{l}</Link>)}
          </div>
        </Card>
      </div>
    </div>
  );
};
export default Dashboard;
