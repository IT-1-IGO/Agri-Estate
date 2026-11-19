import React, { useEffect, useState } from 'react';
import { api } from './api';
import { useSession } from './session';
import { Btn, Card, label } from './ui';

const Roles: React.FC = () => {
  const { can } = useSession(); const [d, setD] = useState<any>(null); const [sel, setSel] = useState<number | null>(null); const [perms, setPerms] = useState<Set<string>>(new Set()); const [msg, setMsg] = useState(''); const [err, setErr] = useState('');
  useEffect(() => { api('/roles').then((r) => { setD(r); setSel(r.roles[1]?.id ?? r.roles[0].id); }).catch((e) => setErr(e.message)); }, []);
  const role = d?.roles.find((r: any) => r.id === sel);
  useEffect(() => { if (role) setPerms(new Set(role.permissions)); }, [sel, d]); // eslint-disable-line
  if (err) return <p className="text-rose-700">{err}</p>; if (!d) return <p>Loading…</p>;
  const locked = role.name === 'super_admin' || !can('roles.edit');
  const toggle = (p: string) => { const n = new Set(perms); n.has(p) ? n.delete(p) : n.add(p); setPerms(n); };
  const save = async () => { setMsg(''); setErr(''); try { await api(`/roles/${sel}/permissions`, { method: 'PUT', body: { permissions: [...perms] } }); setMsg('Permissions saved. Users with this role must sign in again to apply them.'); } catch (e: any) { setErr(e.message); } };
  return (
    <div><h1 className="mb-4 text-2xl font-bold">Roles & Permissions</h1>
      <div className="mb-4 flex flex-wrap gap-2">{d.roles.map((r: any) => <button key={r.id} onClick={() => setSel(r.id)} className={`rounded-full border px-4 py-1.5 text-sm ${r.id === sel ? 'border-[#1f5c3a] bg-[#1f5c3a] text-white' : 'border-slate-300 bg-white'}`}>{r.label}</button>)}</div>
      <Card>{role.name === 'super_admin' && <p className="mb-3 text-sm text-slate-500">Super Admin always has full access and cannot be edited.</p>}
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-xs uppercase text-slate-500"><th className="p-2">Module</th><th>Permissions</th></tr></thead>
          <tbody>{Object.entries<string[]>(d.modules).map(([m, acts]) => <tr key={m} className="border-b border-slate-100"><td className="p-2 font-medium">{label(m)}</td><td className="flex flex-wrap gap-x-5 gap-y-1 py-2">{acts.map((a) => <label key={a} className="flex items-center gap-1.5"><input type="checkbox" disabled={locked} checked={perms.has(`${m}.${a}`)} onChange={() => toggle(`${m}.${a}`)} />{label(a)}</label>)}</td></tr>)}</tbody></table></div>
        {msg && <p className="mt-3 text-sm text-emerald-700">{msg}</p>}{!locked && <div className="mt-4"><Btn v="primary" onClick={save}>Save permissions</Btn></div>}</Card></div>
  );
};
export default Roles;
