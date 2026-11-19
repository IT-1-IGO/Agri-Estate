import React, { useEffect, useState } from 'react';
import { api, ApiError } from './api';
import { useSession } from './session';
import { Btn, Card, inputCls } from './ui';

const KEYS: [string, string][] = [['company_name', 'Company name'], ['company_phone', 'Phone'], ['company_email', 'Email'], ['whatsapp_number', 'WhatsApp number'], ['company_address', 'Address'], ['seo_title', 'Default SEO title'], ['seo_description', 'Default SEO description'], ['enquiry_notify_email', 'Enquiry notification email']];

const Settings: React.FC = () => {
  const { can } = useSession(); const [v, setV] = useState<Record<string, string>>({}); const [msg, setMsg] = useState(''); const [err, setErr] = useState(''); const [fe, setFe] = useState<Record<string, string>>({});
  useEffect(() => { api('/settings').then(setV).catch((e) => setErr(e.message)); }, []);
  const save = async (e: React.FormEvent) => { e.preventDefault(); setMsg(''); setErr(''); setFe({}); try { await api('/settings', { method: 'PUT', body: v }); setMsg('Settings saved'); } catch (x) { setErr((x as ApiError).message); setFe((x as ApiError).fields || {}); } };
  const pw = useChangePassword();
  return (
    <div className="max-w-3xl space-y-6"><h1 className="text-2xl font-bold">Settings</h1>
      <Card title="Company & contact"><form onSubmit={save} className="space-y-3">{KEYS.map(([k, l]) => <div key={k}><label className="mb-1 block text-sm font-medium">{l}</label><input className={inputCls} value={v[k] ?? ''} disabled={!can('settings.edit')} onChange={(e) => setV({ ...v, [k]: e.target.value })} />{fe[k] && <p className="text-xs text-rose-600">{fe[k]}</p>}</div>)}
        {err && <p className="text-sm text-rose-700">{err}</p>}{msg && <p className="text-sm text-emerald-700">{msg}</p>}{can('settings.edit') && <Btn v="primary">Save settings</Btn>}</form></Card>
      {pw}
    </div>
  );
};
function useChangePassword() {
  const { logout } = useSession(); const [f, setF] = useState({ current_password: '', new_password: '', confirm_password: '' }); const [err, setErr] = useState(''); const [fe, setFe] = useState<Record<string, string>>({});
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setErr(''); setFe({}); try { await api('/auth/change-password', { body: f }); await logout(); window.location.assign('/admin/crm/login'); } catch (x) { setErr((x as ApiError).message); setFe((x as ApiError).fields || {}); } };
  return <Card title="Change my password"><form onSubmit={submit} className="space-y-3">{(['current_password', 'new_password', 'confirm_password'] as const).map((k) => <div key={k}><label className="mb-1 block text-sm font-medium">{k.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())}</label><input type="password" className={inputCls} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} autoComplete={k === 'current_password' ? 'current-password' : 'new-password'} />{fe[k] && <p className="text-xs text-rose-600">{fe[k]}</p>}</div>)}
    {err && <p className="text-sm text-rose-700">{err}</p>}<Btn v="primary">Change password</Btn><p className="text-xs text-slate-500">You will be signed out after changing your password.</p></form></Card>;
}
export default Settings;
