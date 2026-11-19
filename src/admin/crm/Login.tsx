import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSession } from './session';
import { inputCls, Btn } from './ui';

const Login: React.FC = () => {
  const { me, login } = useSession(); const nav = useNavigate();
  const [u, setU] = useState(''); const [p, setP] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  if (me) return <Navigate to="/admin/crm" replace />;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { await login(u, p); nav('/admin/crm', { replace: true }); } catch (x: any) { setErr(x.message); } finally { setBusy(false); }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f6f4] p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-[#1f5c3a]">IGO Agri Estate</h1><p className="mb-6 text-sm text-slate-500">Admin sign in</p>
        <label className="mb-1 block text-sm font-medium">Username or email</label><input className={inputCls + ' mb-4'} value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" autoFocus required />
        <label className="mb-1 block text-sm font-medium">Password</label><input className={inputCls + ' mb-4'} type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" required />
        {err && <p role="alert" className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{err}</p>}
        <Btn v="primary" className="w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Btn>
      </form>
    </div>
  );
};
export default Login;
