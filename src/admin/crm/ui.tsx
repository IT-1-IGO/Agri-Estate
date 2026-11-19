import React from 'react';

export const cls = (...a: (string | false | undefined)[]) => a.filter(Boolean).join(' ');
export const label = (s: any) => (s == null || s === '' ? '—' : typeof s === 'boolean' ? (s ? 'Yes' : 'No') : String(s).replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()));
const TONE: Record<string, string> = {
  contacted: 'bg-sky-100 text-sky-800', qualified: 'bg-indigo-100 text-indigo-800', negotiation: 'bg-amber-100 text-amber-800', won: 'bg-emerald-100 text-emerald-800', lost: 'bg-rose-100 text-rose-800', approved: 'bg-emerald-100 text-emerald-800', pending: 'bg-amber-100 text-amber-800', draft: 'bg-slate-100 text-slate-600',
  booked: 'bg-sky-100 text-sky-800', confirmed: 'bg-indigo-100 text-indigo-800', deal_closed: 'bg-emerald-100 text-emerald-800', paid: 'bg-emerald-100 text-emerald-800', partial: 'bg-amber-100 text-amber-800', in_progress: 'bg-sky-100 text-sky-800', buyer: 'bg-sky-100 text-sky-800', seller: 'bg-amber-100 text-amber-800', investor: 'bg-indigo-100 text-indigo-800',
  new: 'bg-sky-100 text-sky-800', available: 'bg-emerald-100 text-emerald-800', verified: 'bg-emerald-100 text-emerald-800', converted: 'bg-emerald-100 text-emerald-800', completed: 'bg-emerald-100 text-emerald-800', Yes: 'bg-emerald-100 text-emerald-800', high: 'bg-rose-100 text-rose-800',
  reserved: 'bg-amber-100 text-amber-800', followup_pending: 'bg-amber-100 text-amber-800', documents_pending: 'bg-amber-100 text-amber-800', medium: 'bg-amber-100 text-amber-800', scheduled: 'bg-sky-100 text-sky-800',
  sold: 'bg-slate-200 text-slate-700', closed: 'bg-slate-200 text-slate-700', low: 'bg-slate-100 text-slate-600', No: 'bg-slate-100 text-slate-600', rejected: 'bg-rose-100 text-rose-800', not_interested: 'bg-rose-100 text-rose-800', cancelled: 'bg-rose-100 text-rose-800', no_show: 'bg-rose-100 text-rose-800',
};
export const Badge: React.FC<{ v: any }> = ({ v }) => <span className={cls('inline-block rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap', TONE[String(v)] || 'bg-violet-100 text-violet-800')}>{label(v)}</span>;

export const Btn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { v?: 'primary' | 'ghost' | 'danger' }> = ({ v = 'ghost', className, ...p }) => (
  <button {...p} className={cls('rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:opacity-50', v === 'primary' && 'bg-[#1f5c3a] text-white hover:bg-[#184a2f]', v === 'ghost' && 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50', v === 'danger' && 'bg-rose-600 text-white hover:bg-rose-700', className)} />
);
export const Card: React.FC<{ title?: string; children: React.ReactNode; className?: string; right?: React.ReactNode }> = ({ title, children, className, right }) => (
  <section className={cls('rounded-xl border border-slate-200 bg-white p-5 shadow-sm', className)}>
    {(title || right) && <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-slate-800">{title}</h3>{right}</div>}{children}
  </section>
);
export const inputCls = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#1f5c3a] focus:outline-none focus:ring-2 focus:ring-[#1f5c3a]/20';
export const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }> = ({ title, onClose, children, wide }) => (
  <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className={cls('my-8 w-full rounded-2xl bg-white shadow-xl', wide ? 'max-w-4xl' : 'max-w-2xl')}>
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4"><h2 className="text-lg font-semibold">{title}</h2><button onClick={onClose} aria-label="Close" className="text-2xl leading-none text-slate-400 hover:text-slate-700">×</button></div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);
export const Empty: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="py-12 text-center text-sm text-slate-500">{children}</div>;
export const money = (n: any) => (n == null || n === '' ? '—' : '₹' + Number(n).toLocaleString('en-IN'));
export const fdate = (s: any) => (s ? String(s).slice(0, 16).replace('T', ' ') : '—');
