import React, { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from './api';
import { useSession } from './session';
import { Badge, Btn, Card, Empty, fdate, inputCls, Modal } from './ui';
import { useLookups } from './ResourcePage';

const Users: React.FC = () => {
  const { can } = useSession(); const lookups = useLookups();
  const [rows, setRows] = useState<any[]>([]); const [err, setErr] = useState(''); const [note, setNote] = useState('');
  const [form, setForm] = useState<any>(null); const [fErr, setFErr] = useState<Record<string, string>>({}); const [msg, setMsg] = useState('');
  const load = useCallback(() => api<{ data: any[] }>('/users?pageSize=100').then((r) => setRows(r.data)).catch((e) => setErr(e.message)), []);
  useEffect(() => { load(); }, [load]);
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setFErr({}); setMsg('');
    try { await api(form.id ? `/users/${form.id}` : '/users', { method: form.id ? 'PUT' : 'POST', body: form }); setForm(null); setNote('User saved'); load(); } catch (x) { setFErr((x as ApiError).fields || {}); setMsg((x as ApiError).message); }
  };
  const del = async (u: any) => { if (!window.confirm(`Delete user ${u.name}? They will no longer be able to sign in.`)) return; try { await api(`/users/${u.id}`, { method: 'DELETE' }); setNote('User deleted'); load(); } catch (e: any) { setErr(e.message); } };
  const F = (k: string, l: string, type = 'text') => <div><label className="mb-1 block text-sm font-medium">{l}</label><input className={inputCls} type={type} value={form[k] ?? ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} autoComplete="off" />{fErr[k] && <p className="mt-1 text-xs text-rose-600">{fErr[k]}</p>}</div>;
  return (
    <div><div className="mb-4 flex items-center"><h1 className="mr-auto text-2xl font-bold">Admin Users</h1>{can('users.create') && <Btn v="primary" onClick={() => { setFErr({}); setMsg(''); setForm({ status: 'active', role_id: lookups.roles?.find((r) => r.name === 'executive')?.id }); }}>+ Add user</Btn>}</div>
      {note && <p className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{note}</p>}{err && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{err}</p>}
      <Card><table className="w-full text-sm"><thead><tr className="border-b text-left text-xs uppercase text-slate-500"><th className="p-2">ID</th><th>Name</th><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Last login</th><th /></tr></thead>
        <tbody>{rows.map((u) => <tr key={u.id} className="border-b border-slate-100"><td className="p-2">{u.code}</td><td>{u.name}</td><td>{u.username}</td><td>{u.email}</td><td>{u.role_label}</td><td><Badge v={u.status === 'active' ? 'available' : 'closed'} /></td><td>{fdate(u.last_login_at)}</td>
          <td className="whitespace-nowrap text-right">{can('users.edit') && <button className="mr-3 text-[#1f5c3a] hover:underline" onClick={() => { setFErr({}); setMsg(''); setForm({ ...u }); }}>Edit</button>}{can('users.delete') && <button className="text-rose-600 hover:underline" onClick={() => del(u)}>Delete</button>}</td></tr>)}</tbody></table>{!rows.length && <Empty>No users</Empty>}</Card>
      {form && <Modal title={form.id ? 'Edit user' : 'Add user'} onClose={() => setForm(null)}><form onSubmit={save} className="grid gap-4 sm:grid-cols-2" noValidate>
        {F('name', 'Employee name')}{F('username', 'Username')}{F('email', 'Email', 'email')}{F('phone', 'Phone', 'tel')}
        <div><label className="mb-1 block text-sm font-medium">Role</label><select className={inputCls} value={form.role_id ?? ''} onChange={(e) => setForm({ ...form, role_id: Number(e.target.value) })}>{(lookups.roles || []).map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}</select>{fErr.role_id && <p className="text-xs text-rose-600">{fErr.role_id}</p>}</div>
        <div><label className="mb-1 block text-sm font-medium">Status</label><select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
        {F('department', 'Department')}{F('designation', 'Designation')}{F('password', form.id ? 'New password (leave blank to keep)' : 'Password', 'password')}{F('confirm_password', 'Confirm password', 'password')}
        {msg && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2" role="alert">{msg}</p>}
        <div className="flex justify-end gap-3 sm:col-span-2"><Btn type="button" onClick={() => setForm(null)}>Cancel</Btn><Btn v="primary">Save</Btn></div></form></Modal>}
    </div>
  );
};
export default Users;
