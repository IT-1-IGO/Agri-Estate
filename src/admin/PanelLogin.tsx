import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { isAdminSession, markServerSession, serverAuthRequired, startAdminSession, verifyAdmin } from './auth';
import { api, setToken } from './crm/api';
import { inputCls } from './ui';

const PanelLogin: React.FC = () => {
  const nav = useNavigate();
  const [u, setU] = useState(''); const [p, setP] = useState(''); const [show, setShow] = useState(false); const [err, setErr] = useState('');
  if (isAdminSession()) return <Navigate to="/admin" replace />;
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!u.trim() || !p) { setErr('Enter your username and password.'); return; }
    if (serverAuthRequired) {
      setBusy(true); setErr('');
      try { const r = await api<{ token: string }>('/auth/login', { body: { username: u.trim(), password: p } }); setToken(r.token); markServerSession(); nav('/admin', { replace: true }); }
      catch (x) { setErr(x instanceof Error ? x.message : 'Could not sign in.'); } finally { setBusy(false); }
      return;
    }
    if (!verifyAdmin(u, p)) { setErr('Incorrect username or password.'); return; }
    startAdminSession();
    nav('/admin', { replace: true });
  };
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#E9F0E6] px-4 py-10">
      <form onSubmit={submit} noValidate className="w-full max-w-sm rounded-2xl border border-[#D5E0D1] bg-white p-7 shadow-lg">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src="/images/admin-logo.png" alt="IGO Agri Estate" className="mb-3 h-16 w-auto" />
          <h1 className="text-xl font-semibold normal-case tracking-tight text-[#10231D]">IGO Agri Estate Admin</h1>
          <p className="mt-1 text-sm text-[#5E726B]">Sign in to manage the website</p>
        </div>
        <label htmlFor="adm-user" className="mb-1 block text-[13px] font-medium normal-case tracking-normal text-[#2B4139]">Username</label>
        <div className="relative mb-4"><User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#93A39D]" /><input id="adm-user" autoComplete="username" className={`${inputCls} pl-9`} value={u} onChange={(e) => { setU(e.target.value); setErr(''); }} autoFocus /></div>
        <label htmlFor="adm-pass" className="mb-1 block text-[13px] font-medium normal-case tracking-normal text-[#2B4139]">Password</label>
        <div className="relative"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#93A39D]" /><input id="adm-pass" type={show ? 'text' : 'password'} autoComplete="current-password" className={`${inputCls} pl-9 pr-10`} value={p} onChange={(e) => { setP(e.target.value); setErr(''); }} />
          <button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#5E726B]">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
        {err && <p role="alert" className="mt-3 rounded-lg bg-[#FDECEA] px-3 py-2 text-sm text-[#B42318]">{err}</p>}
        <button type="submit" disabled={busy} className="mt-5 disabled:opacity-60 w-full rounded-lg bg-[#124B3B] py-2.5 text-sm font-semibold normal-case tracking-normal text-white hover:bg-[#0c3a2d]">{busy ? 'Signing in…' : 'Sign in'}</button>
        <a href="/" className="mt-4 block text-center text-sm text-[#5E726B] hover:underline">← Back to website</a>
      </form>
    </main>
  );
};
export default PanelLogin;
