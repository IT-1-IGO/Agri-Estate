import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from './api';
import { endAdminSession, markServerSession } from '../auth';

export interface Me { id: number; name: string; username: string; role: string; role_label: string; permissions: string[]; }
interface Ctx { me: Me | null; loading: boolean; can: (p: string) => boolean; login: (u: string, p: string) => Promise<void>; logout: () => Promise<void>; }
const C = createContext<Ctx>(null as any);
export const useSession = () => useContext(C);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(!!getToken());
  useEffect(() => {
    if (getToken()) api<Me>('/auth/me').then(setMe).catch(() => setToken(null)).finally(() => setLoading(false));
    const off = () => setMe(null); window.addEventListener('crm-logout', off); return () => window.removeEventListener('crm-logout', off);
  }, []);
  const login = useCallback(async (username: string, password: string) => {
    const r = await api<{ token: string; user: Me }>('/auth/login', { body: { username, password } });
    setToken(r.token); markServerSession(); setMe(r.user);
  }, []);
  const logout = useCallback(async () => { try { await api('/auth/logout', { method: 'POST' }); } catch { /* ignore */ } endAdminSession(); setMe(null); }, []);
  const can = useCallback((p: string) => !!me && (me.role === 'super_admin' || me.permissions.includes(p)), [me]);
  return <C.Provider value={{ me, loading, can, login, logout }}>{children}</C.Provider>;
};
