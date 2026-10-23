import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Image as ImageIcon, Inbox, X } from 'lucide-react';
import { MEDIA_COL, MediaItem, getCollection, resolveMedia, uid, writeJson } from './store';

export const G = '#124B3B';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`rounded-xl border border-[#E3E8E1] bg-white shadow-sm ${className}`}>{children}</div>
);

export const PageHeader: React.FC<{ title: string; crumbs?: string[]; actions?: React.ReactNode; sub?: string }> = ({ title, crumbs = [], actions, sub }) => (
  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
    <div>
      <nav className="mb-1 text-xs text-[#6B7F78]" aria-label="Breadcrumb">
        <Link to="/admin" className="hover:underline">Admin</Link>
        {crumbs.map((c) => <span key={c}> / {c}</span>)}
      </nav>
      <h1 className="text-2xl font-semibold normal-case tracking-tight text-[#10231D]">{title}</h1>
      {sub && <p className="mt-1 text-sm text-[#5E726B]">{sub}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' | 'outline' };
export const Btn: React.FC<BtnProps> = ({ variant = 'primary', className = '', ...p }) => {
  const v = {
    primary: 'bg-[#124B3B] text-white hover:bg-[#0c3a2d]',
    outline: 'border border-[#C9D5CE] bg-white text-[#10231D] hover:bg-[#F2F6F3]',
    ghost: 'text-[#37534A] hover:bg-[#EEF3EF]',
    danger: 'bg-[#B42318] text-white hover:bg-[#912018]',
  }[variant];
  return <button type="button" {...p} className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium normal-case tracking-normal transition disabled:cursor-not-allowed disabled:opacity-50 ${v} ${className}`} />;
};

export const inputCls = 'w-full rounded-lg border border-[#C9D5CE] bg-white px-3 py-2 text-sm text-[#10231D] outline-none placeholder:text-[#93A39D] focus:border-[#124B3B] focus:ring-2 focus:ring-[#124B3B]/15';

export const Field: React.FC<{ label: string; error?: string; hint?: string; children: React.ReactNode; htmlFor?: string }> = ({ label, error, hint, children, htmlFor }) => (
  <div>
    <label htmlFor={htmlFor} className="mb-1 block text-[13px] font-medium normal-case tracking-normal text-[#2B4139]">{label}</label>
    {children}
    {hint && !error && <p className="mt-1 text-xs text-[#6B7F78]">{hint}</p>}
    {error && <p role="alert" className="mt-1 text-xs text-[#B42318]">{error}</p>}
  </div>
);

export const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  const published = (status ?? 'published') === 'published';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${published ? 'bg-[#E3F3E8] text-[#17663A]' : 'bg-[#FFF1D6] text-[#8A5A00]'}`}>
      {published ? 'Published' : 'Draft'}
    </span>
  );
};

export const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
  <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
    className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-[#124B3B]' : 'bg-[#C9D5CE]'}`}>
    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
  </button>
);

export const EmptyState: React.FC<{ title: string; text?: string; action?: React.ReactNode }> = ({ title, text, action }) => (
  <div className="flex flex-col items-center px-6 py-14 text-center">
    <Inbox className="mb-3 text-[#93A39D]" size={34} aria-hidden="true" />
    <p className="font-medium text-[#10231D]">{title}</p>
    {text && <p className="mt-1 max-w-sm text-sm text-[#5E726B]">{text}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode; wide?: boolean; footer?: React.ReactNode }> = ({ title, onClose, children, wide, footer }) => {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/45 p-4 sm:py-10" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} rounded-xl bg-white shadow-xl`}>
        <div className="flex items-center justify-between border-b border-[#E3E8E1] px-5 py-3.5">
          <h2 className="text-base font-semibold normal-case tracking-normal text-[#10231D]">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 text-[#5E726B] hover:bg-[#EEF3EF]"><X size={18} /></button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-[#E3E8E1] px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
};

export const ConfirmDialog: React.FC<{ title: string; text: string; confirmLabel?: string; onConfirm: () => void; onCancel: () => void }> = ({ title, text, confirmLabel = 'Delete', onConfirm, onCancel }) => (
  <Modal title={title} onClose={onCancel} footer={<><Btn variant="outline" onClick={onCancel}>Cancel</Btn><Btn variant="danger" onClick={onConfirm}>{confirmLabel}</Btn></>}>
    <div className="flex gap-3"><AlertTriangle className="mt-0.5 shrink-0 text-[#B42318]" size={20} aria-hidden="true" /><p className="text-sm text-[#37534A]">{text}</p></div>
  </Modal>
);

/* ---------- toast ---------- */
type ToastKind = 'ok' | 'err';
const ToastCtx = createContext<(msg: string, kind?: ToastKind) => void>(() => {});
export const useToast = () => useContext(ToastCtx);
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [t, setT] = useState<{ id: string; msg: string; kind: ToastKind }[]>([]);
  const push = useCallback((msg: string, kind: ToastKind = 'ok') => {
    const id = uid();
    setT((x) => [...x, { id, msg, kind }]);
    setTimeout(() => setT((x) => x.filter((i) => i.id !== id)), 3500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex flex-col gap-2" aria-live="polite">
        {t.map((i) => (
          <div key={i.id} className={`pointer-events-auto flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-white shadow-lg ${i.kind === 'ok' ? 'bg-[#124B3B]' : 'bg-[#B42318]'}`}>
            {i.kind === 'ok' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}{i.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};

/* ---------- pagination ---------- */
export const Pager: React.FC<{ page: number; pages: number; total: number; onPage: (p: number) => void }> = ({ page, pages, total, onPage }) => (
  <div className="flex items-center justify-between border-t border-[#E3E8E1] px-4 py-3 text-sm text-[#5E726B]">
    <span>{total} item{total === 1 ? '' : 's'}</span>
    <div className="flex items-center gap-1">
      <Btn variant="outline" className="!px-2 !py-1" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page"><ChevronLeft size={16} /></Btn>
      <span className="px-2">Page {page} of {pages}</span>
      <Btn variant="outline" className="!px-2 !py-1" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page"><ChevronRight size={16} /></Btn>
    </div>
  </div>
);

/* ---------- image compression + field ---------- */
export const compressImage = (file: File, maxW = 1600, quality = 0.82): Promise<string> =>
  new Promise((resolve, reject) => {
    if (!/^image\//.test(file.type)) return reject(new Error('Please choose an image file.'));
    if (file.size > 8 * 1024 * 1024) return reject(new Error('Image is larger than 8 MB.'));
    const fr = new FileReader();
    fr.onerror = () => reject(new Error('Could not read the file.'));
    fr.onload = () => {
      const im = new Image();
      im.onerror = () => reject(new Error('Could not read the image.'));
      im.onload = () => {
        const s = Math.min(1, maxW / im.width);
        const c = document.createElement('canvas');
        c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
        c.getContext('2d')!.drawImage(im, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/webp', quality));
      };
      im.src = String(fr.result);
    };
    fr.readAsDataURL(file);
  });

export const saveMediaFile = async (file: File): Promise<MediaItem> => {
  const dataUrl = await compressImage(file);
  const list = getCollection<MediaItem>(MEDIA_COL, []);
  const item: MediaItem = { id: uid(), name: file.name, mime: 'image/webp', size: Math.round(dataUrl.length * 0.75), dataUrl, createdAt: new Date().toISOString(), order: -Date.now(), status: 'published', updatedAt: new Date().toISOString() };
  writeJson('col.' + MEDIA_COL, [item, ...list]);
  return item;
};

/** Value is "media:ID" or a URL/path. Offers upload, library pick, or a typed URL. */
export const ImageField: React.FC<{ value: string; onChange: (v: string) => void; label?: string; fallback?: string }> = ({ value, onChange, label = 'Image', fallback = '' }) => {
  const [picker, setPicker] = useState(false);
  const [err, setErr] = useState('');
  const file = useRef<HTMLInputElement>(null);
  const src = resolveMedia(value) || fallback;
  const upload = async (f?: File | null) => {
    if (!f) return;
    try { setErr(''); const m = await saveMediaFile(f); onChange('media:' + m.id); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Upload failed.'); }
  };
  return (
    <Field label={label} error={err}>
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#C9D5CE] bg-[#F2F6F3]">
          {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : <ImageIcon size={20} className="text-[#93A39D]" />}
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn variant="outline" onClick={() => file.current?.click()}>Upload</Btn>
          <Btn variant="outline" onClick={() => setPicker(true)}>Media library</Btn>
          {value && <Btn variant="ghost" onClick={() => onChange('')}>Remove</Btn>}
        </div>
        <input ref={file} type="file" accept="image/*" hidden onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
      </div>
      <input className={`${inputCls} mt-2`} placeholder="…or paste an image URL / site path (e.g. /images/hero.webp)" value={value.startsWith('media:') ? '' : value} onChange={(e) => onChange(e.target.value)} />
      {picker && (
        <Modal title="Choose from media library" wide onClose={() => setPicker(false)}>
          {(() => {
            const all = getCollection<MediaItem>(MEDIA_COL, []);
            return all.length === 0 ? <EmptyState title="No media yet" text="Upload an image first." /> : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {all.map((m) => (
                  <button key={m.id} type="button" onClick={() => { onChange('media:' + m.id); setPicker(false); }} className="overflow-hidden rounded-lg border border-[#C9D5CE] text-left hover:border-[#124B3B]">
                    <img src={m.dataUrl} alt={m.name} className="h-24 w-full object-cover" />
                    <span className="block truncate px-2 py-1 text-xs">{m.name}</span>
                  </button>
                ))}
              </div>
            );
          })()}
        </Modal>
      )}
    </Field>
  );
};
