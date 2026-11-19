import React from 'react';
import { Link, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useSession } from './session';
import { api } from './api';
import { cls } from './ui';

const NAV: { group: string; items: { to: string; label: string; perm: string }[] }[] = [
  { group: 'Overview', items: [{ to: '', label: 'Dashboard', perm: 'dashboard.view' }] },
  { group: 'Property Management', items: [{ to: 'properties', label: 'All Properties', perm: 'properties.view' }, { to: 'parcels', label: 'Land Inventory (Parcels)', perm: 'parcels.view' }, { to: 'landowners', label: 'Landowners', perm: 'landowners.view' }, { to: 'buyers', label: 'Buyers', perm: 'buyers.view' }] },
  { group: 'Enquiry & Leads', items: [{ to: 'enquiries', label: 'All Enquiries', perm: 'enquiries.view' }, { to: 'enquiries?status=new', label: 'New Enquiries', perm: 'enquiries.view' }, { to: 'leads', label: 'Lead Management', perm: 'leads.view' }, { to: 'followups', label: 'Follow-ups', perm: 'followups.view' }, { to: 'customers', label: 'Customers', perm: 'customers.view' }] },
  { group: 'Sales', items: [{ to: 'site-visits', label: 'Site Visits', perm: 'site_visits.view' }, { to: 'proposals', label: 'Proposals', perm: 'proposals.view' }, { to: 'bookings', label: 'Bookings & Payments', perm: 'bookings.view' }] },
  { group: 'Work', items: [{ to: 'tasks', label: 'Tasks', perm: 'tasks.view' }, { to: 'employees', label: 'Employees', perm: 'employees.view' }, { to: 'reports', label: 'Reports & Analytics', perm: 'reports.view' }] },
  { group: 'System', items: [{ to: 'media', label: 'Media Library', perm: 'media.view' }, { to: 'users', label: 'Admin Users', perm: 'users.view' }, { to: 'roles', label: 'Roles & Permissions', perm: 'roles.view' }, { to: 'activity', label: 'Activity & Login Logs', perm: 'activity.view' }, { to: 'settings', label: 'Settings', perm: 'settings.view' }] },
];

interface Note { id: number; title: string; body?: string; link?: string; read_at: string | null; created_at: string }
/** Bell with unread count; polls the notification feed (new enquiries, assignments, follow-up reminders, site visits, status updates). */
const Bell: React.FC = () => {
  const nav = useNavigate(); const [open, setOpen] = React.useState(false); const [items, setItems] = React.useState<Note[]>([]); const [unread, setUnread] = React.useState(0);
  const ref = React.useRef<HTMLDivElement>(null);
  const load = React.useCallback(() => api<{ data: Note[]; unread: number }>('/notifications').then((r) => { setItems(r.data); setUnread(r.unread); }).catch(() => {}), []);
  React.useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t); }, [load]);
  React.useEffect(() => { if (!open) return; const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, [open]);
  const go = async (n: Note) => { setOpen(false); if (!n.read_at) { await api(`/notifications/${n.id}/read`, { method: 'POST', body: {} }).catch(() => {}); load(); } if (n.link) nav(n.link); };
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => { setOpen(!open); if (!open) load(); }} aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} aria-expanded={open} className="relative rounded-lg border border-slate-300 px-2.5 py-1.5 hover:bg-slate-50">🔔{unread > 0 && <span className="absolute -right-1.5 -top-1.5 min-w-[18px] rounded-full bg-rose-600 px-1 text-center text-[11px] font-semibold leading-[18px] text-white">{unread > 99 ? '99+' : unread}</span>}</button>
      {open && <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5"><b className="text-sm">Notifications</b>{unread > 0 && <button className="text-xs text-[#1f5c3a] hover:underline" onClick={async () => { await api('/notifications/read-all', { method: 'POST', body: {} }); load(); }}>Mark all read</button>}</div>
        <ul className="max-h-96 overflow-y-auto">{items.map((n) => <li key={n.id}><button onClick={() => go(n)} className={cls('block w-full border-b border-slate-50 px-4 py-2.5 text-left text-sm hover:bg-slate-50', !n.read_at && 'bg-emerald-50/60')}><div className="font-medium">{n.title}</div>{n.body && <div className="text-xs text-slate-600">{n.body}</div>}<div className="mt-0.5 text-[11px] text-slate-400">{String(n.created_at).slice(0, 16).replace('T', ' ')}</div></button></li>)}
          {!items.length && <li className="px-4 py-8 text-center text-sm text-slate-500">No notifications yet.</li>}</ul></div>}
    </div>
  );
};

const Layout: React.FC = () => {
  const { me, loading, can, logout } = useSession(); const nav = useNavigate();
  const [open, setOpen] = React.useState(false);
  if (loading) return <div className="p-10 text-slate-500">Loading…</div>;
  if (!me) return <Navigate to="/admin/crm/login" replace />;
  return (
    <div className="min-h-screen bg-[#f3f6f4] text-slate-800">
      <aside className={cls('fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto bg-[#143d27] p-4 text-white transition lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="mb-6 px-2 text-lg font-bold">IGO Agri Estate<div className="text-xs font-normal text-white/60">Admin Panel</div></div>
        {NAV.map((g) => { const items = g.items.filter((i) => can(i.perm)); return items.length ? (
          <div key={g.group} className="mb-4"><div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-white/50">{g.group}</div>
            {items.map((i) => <NavLink key={i.to + i.label} to={`/admin/crm/${i.to}`} end={i.to === '' || i.to.includes('?')} onClick={() => setOpen(false)} className={({ isActive }) => cls('block rounded-lg px-3 py-2 text-sm', isActive && !i.to.includes('?') ? 'bg-white/15 font-medium' : 'text-white/80 hover:bg-white/10')}>{i.label}</NavLink>)}
          </div>) : null; })}
        <Link to="/admin" className="block rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/10">Website content (CMS) →</Link>
      </aside>
      <div className="min-w-0 lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
          <div className="ml-auto flex items-center gap-4 text-sm"><Bell /><span className="text-right"><b>{me.name}</b><br /><span className="text-xs text-slate-500">{me.role_label}</span></span>
            <button onClick={async () => { await logout(); nav('/admin/crm/login'); }} className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50">Logout</button></div>
        </header>
        <main className="min-w-0 max-w-full p-4 sm:p-6"><Outlet /></main>
      </div>
    </div>
  );
};
export default Layout;
