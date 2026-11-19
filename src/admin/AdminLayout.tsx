import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Briefcase, Building2, ChevronDown, Compass, FileText, Globe, Image as ImageIcon, LayoutDashboard, LogOut, Menu, MessageSquare, Search, Settings, Wrench, X } from 'lucide-react';
import { adminName, endAdminSession, isAdminSession } from './auth';
import { ToastProvider } from './ui';
import { fetchLeads, LeadData } from '../lib/leadsService';

const NAV: { group: string; items: { to: string; label: string; Icon: React.ComponentType<{ size?: number }>; end?: boolean }[] }[] = [
  { group: 'Overview', items: [{ to: '/admin', label: 'Dashboard', Icon: LayoutDashboard, end: true }] },
  { group: 'Content', items: [
    { to: '/admin/pages', label: 'Pages', Icon: FileText },
    { to: '/admin/projects', label: 'Projects', Icon: Building2 },
    { to: '/admin/services', label: 'Services', Icon: Wrench },
    { to: '/admin/media', label: 'Media Library', Icon: ImageIcon },
  ] },
  { group: 'Manage', items: [
    { to: '/admin/enquiries', label: 'Enquiries', Icon: MessageSquare },
    { to: '/admin/applications', label: 'Career Applications', Icon: Briefcase },
    { to: '/admin/navigation', label: 'Navigation & Footer', Icon: Compass },
    { to: '/admin/settings', label: 'Website Settings', Icon: Settings },
  ] },
];
const ALL = NAV.flatMap((g) => g.items);

const AdminLayout: React.FC = () => {
  const loc = useLocation(); const nav = useNavigate();
  const [open, setOpen] = useState(false); const [menu, setMenu] = useState(false); const [bell, setBell] = useState(false);
  const [q, setQ] = useState(''); const [leads, setLeads] = useState<LeadData[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setOpen(false); }, [loc.pathname]);
  const [syncErr, setSyncErr] = useState('');
  useEffect(() => {
    const onSync = (e: Event) => { const d = (e as CustomEvent).detail as { ok: boolean; message: string }; setSyncErr(d.ok ? '' : d.message); };
    const onOut = () => nav('/admin/login', { replace: true });
    window.addEventListener('igo:cms-remote', onSync); window.addEventListener('crm-logout', onOut);
    return () => { window.removeEventListener('igo:cms-remote', onSync); window.removeEventListener('crm-logout', onOut); };
  }, [nav]);
  useEffect(() => { fetchLeads().then(setLeads).catch(() => undefined); }, []);
  useEffect(() => {
    const c = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) { setMenu(false); setBell(false); } };
    document.addEventListener('mousedown', c); return () => document.removeEventListener('mousedown', c);
  }, []);
  if (!isAdminSession()) return <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />;

  const hits = q.trim() ? ALL.filter((i) => i.label.toLowerCase().includes(q.trim().toLowerCase())) : [];
  const logout = () => { endAdminSession(); nav('/admin/login', { replace: true }); };
  const side = (
    <nav aria-label="Admin navigation" className="flex h-full flex-col overflow-y-auto bg-[#0E3A2E] px-3 py-4 text-[#CFE0D8]">
      <Link to="/admin" className="mb-5 flex items-center gap-2 px-2 text-white"><img src="/images/admin-logo.png" alt="IGO Agri Estate" className="h-12 w-auto rounded-md bg-white p-1" /></Link>
      {NAV.map((g) => (
        <div key={g.group} className="mb-4">
          <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-[#7FA391]">{g.group}</p>
          {g.items.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm normal-case tracking-normal transition ${isActive ? 'bg-white/15 font-medium text-white' : 'hover:bg-white/10'}`}>
              <Icon size={17} aria-hidden="true" />{label}</NavLink>))}
        </div>))}
    </nav>
  );
  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#F3F6F3] text-[#10231D]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{side}</aside>
        {open && <div className="fixed inset-0 z-40 lg:hidden"><div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} /><div className="relative h-full w-64">{side}</div></div>}
        <div className="lg:pl-64">
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[#E3E8E1] bg-white px-4 py-3 sm:px-6" ref={menuRef}>
            <button type="button" className="rounded p-1.5 lg:hidden" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
            <div className="relative max-w-md flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#93A39D]" aria-hidden="true" />
              <input aria-label="Search admin sections" placeholder="Search admin sections…" value={q} onChange={(e) => setQ(e.target.value)} className="w-full rounded-lg border border-[#DCE4DD] bg-[#F7FAF7] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#124B3B]" />
              {q.trim() && <ul className="absolute left-0 right-0 top-full mt-1 rounded-lg border border-[#E3E8E1] bg-white py-1 shadow-lg">{hits.length ? hits.map((h) => <li key={h.to}><Link to={h.to} onClick={() => setQ('')} className="block px-3 py-2 text-sm hover:bg-[#F2F6F3]">{h.label}</Link></li>) : <li className="px-3 py-2 text-sm text-[#6B7F78]">No match</li>}</ul>}
            </div>
            <div className="ml-auto flex items-center gap-1">
              <a href="/" target="_blank" rel="noreferrer" className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm normal-case tracking-normal text-[#37534A] hover:bg-[#EEF3EF] sm:inline-flex"><Globe size={15} />View website</a>
              <div className="relative">
                <button type="button" aria-label="Notifications" onClick={() => { setBell(!bell); setMenu(false); }} className="relative rounded-lg p-2 hover:bg-[#EEF3EF]"><Bell size={19} />{leads.length > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#B42318]" />}</button>
                {bell && <div className="absolute right-0 mt-2 w-72 rounded-xl border border-[#E3E8E1] bg-white p-2 shadow-lg">
                  <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-[#6B7F78]">Latest enquiries</p>
                  {leads.length === 0 ? <p className="px-2 py-3 text-sm text-[#6B7F78]">No new enquiries.</p> : leads.slice(0, 4).map((l, i) => <Link key={l.id || i} to="/admin/enquiries" onClick={() => setBell(false)} className="block rounded-lg px-2 py-2 text-sm hover:bg-[#F2F6F3]"><b className="font-medium">{l.name}</b><span className="block text-xs capitalize text-[#6B7F78]">{l.type} · {l.phone}</span></Link>)}
                  <Link to="/admin/enquiries" onClick={() => setBell(false)} className="block px-2 pt-1 text-sm text-[#124B3B] hover:underline">View all</Link></div>}
              </div>
              <div className="relative">
                <button type="button" aria-label="Profile menu" aria-expanded={menu} onClick={() => { setMenu(!menu); setBell(false); }} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[#EEF3EF]"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#124B3B] text-sm font-semibold text-white">{adminName[0]}</span><span className="hidden text-sm font-medium normal-case tracking-normal sm:inline">{adminName}</span><ChevronDown size={14} /></button>
                {menu && <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[#E3E8E1] bg-white py-1 shadow-lg">
                  <Link to="/admin/settings" onClick={() => setMenu(false)} className="block px-3 py-2 text-sm hover:bg-[#F2F6F3]">Settings</Link>
                  <a href="/" target="_blank" rel="noreferrer" className="block px-3 py-2 text-sm hover:bg-[#F2F6F3]">View website</a>
                  <button type="button" onClick={logout} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#B42318] hover:bg-[#FDECEA]"><LogOut size={15} />Log out</button></div>}
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{syncErr && <p role="alert" className="mb-4 rounded-lg border border-[#F2C9C4] bg-[#FDECEA] px-4 py-2.5 text-sm text-[#B42318]">Not saved to the server: {syncErr} Your change is kept in this browser and will be retried on your next save.</p>}<Outlet /></main>
        </div>
      </div>
    </ToastProvider>
  );
};
export default AdminLayout;
