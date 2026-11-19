import React, { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError } from './api';
import { useSession } from './session';
import { Btn, Card, Empty } from './ui';

const Media: React.FC = () => {
  const { can } = useSession(); const [rows, setRows] = useState<any[]>([]); const [err, setErr] = useState(''); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false); const ref = useRef<HTMLInputElement>(null);
  const load = useCallback(() => api<{ data: any[] }>('/media').then((r) => setRows(r.data)).catch((e) => setErr(e.message)), []);
  useEffect(() => { load(); }, [load]);
  const up = async (files: FileList | null) => {
    if (!files?.length) return; setBusy(true); setErr(''); setMsg('');
    const fd = new FormData(); Array.from(files).forEach((f) => fd.append('files', f));
    try { await api('/media', { form: fd }); setMsg('Uploaded'); load(); } catch (x) { setErr((x as ApiError).message); } finally { setBusy(false); if (ref.current) ref.current.value = ''; }
  };
  const del = async (m: any) => { if (!window.confirm(`Delete ${m.original_name}?`)) return; try { await api(`/media/${m.id}`, { method: 'DELETE' }); load(); } catch (e: any) { setErr(e.message); } };
  return (
    <div><div className="mb-4 flex items-center"><h1 className="mr-auto text-2xl font-bold">Media Library</h1>{can('media.create') && <><input ref={ref} type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" hidden onChange={(e) => up(e.target.files)} /><Btn v="primary" disabled={busy} onClick={() => ref.current?.click()}>{busy ? 'Uploading…' : '+ Upload files'}</Btn></>}</div>
      {err && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{err}</p>}{msg && <p className="mb-3 text-sm text-emerald-700">{msg}</p>}
      <Card><p className="mb-3 text-xs text-slate-500">JPG, PNG, WEBP up to 10 MB are public. PDFs are stored privately and only open for signed-in admins.</p>
        {rows.length ? <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">{rows.map((m) => <div key={m.id} className="rounded-lg border border-slate-200 p-2 text-xs">
          {m.mime.startsWith('image/') ? <img src={m.url} alt={m.alt_text || m.original_name} className="mb-2 h-24 w-full rounded object-cover" /> : <div className="mb-2 flex h-24 items-center justify-center rounded bg-slate-100 text-slate-500">PDF</div>}
          <div className="truncate" title={m.original_name}>{m.original_name}</div>{can('media.delete') && <button className="mt-1 text-rose-600 hover:underline" onClick={() => del(m)}>Delete</button>}</div>)}</div> : <Empty>No files uploaded yet.</Empty>}</Card></div>
  );
};
export default Media;
