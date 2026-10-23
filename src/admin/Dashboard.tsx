import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, FileText, Image as ImageIcon, MessageSquare, Sprout, Wrench, Briefcase } from 'lucide-react';
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
  const act = getActivity().slice(0, 6);
  const tiles = [
    { label: 'Website pages', value: pages.total, sub: `${pages.pub} published · ${pages.draft} draft`, to: '/admin/pages', Icon: FileText },
    { label: 'Projects', value: properties.length, sub: `${properties.filter((p) => p.status === 'Available').length} available`, to: '/admin/projects', Icon: Building2 },
    { label: 'Services', value: legal.total + soil.total, sub: `${legal.total} legal · ${soil.total} soil`, to: '/admin/services', Icon: Wrench },
    { label: 'Career categories', value: cats.total, sub: `${cats.pub} published`, to: '/admin/careers', Icon: Sprout },
    { label: 'Job openings', value: open.total, sub: `${open.pub} published · ${open.draft} draft`, to: '/admin/careers/openings', Icon: Briefcase },
    { label: 'Enquiries', value: leads ?? '…', sub: 'From website forms', to: '/admin/enquiries', Icon: MessageSquare },
    { label: 'Media files', value: media, sub: 'In media library', to: '/admin/media', Icon: ImageIcon },
  ];
  return (
    <div>
      <PageHeader title="Dashboard" sub="A live summary of the website content." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(({ label, value, sub, to, Icon }) => (
          <Link key={label} to={to} className="rounded-xl border border-[#E3E8E1] bg-white p-4 shadow-sm transition hover:border-[#124B3B]">
            <div className="flex items-center justify-between text-[#5E726B]"><span className="text-sm">{label}</span><Icon size={18} /></div>
            <p className="mt-2 text-3xl font-semibold text-[#10231D]">{value}</p><p className="mt-1 text-xs text-[#6B7F78]">{sub}</p>
          </Link>))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#E3E8E1] px-4 py-3"><h2 className="text-base font-semibold normal-case tracking-normal">Recent activity</h2><Link to="/admin/activity" className="text-sm text-[#124B3B] hover:underline">View all</Link></div>
          {act.length === 0 ? <EmptyState title="No changes yet" text="Edits you make in the admin panel will be listed here." /> : <ul className="divide-y divide-[#EEF2EE]">{act.map((a) => <li key={a.id} className="flex justify-between gap-2 px-4 py-2.5 text-sm"><span><b className="font-medium">{a.action}</b> — {a.target}</span><span className="shrink-0 text-xs text-[#6B7F78]">{new Date(a.at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span></li>)}</ul>}
        </Card>
        <Card className="p-4">
          <h2 className="mb-3 text-base font-semibold normal-case tracking-normal">Quick actions</h2>
          <div className="grid gap-2 text-sm">
            {[['/admin/new', 'Add a project'], ['/admin/careers/openings', 'Post a job opening'], ['/admin/media', 'Upload media'], ['/admin/pages', 'Edit a page']].map(([to, l]) => <Link key={to} to={to} className="rounded-lg border border-[#E3E8E1] px-3 py-2 hover:bg-[#F2F6F3]">{l}</Link>)}
          </div>
        </Card>
      </div>
    </div>
  );
};
export default Dashboard;
