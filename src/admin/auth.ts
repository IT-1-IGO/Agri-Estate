// Admin sign-in.
// When VITE_API_URL is set (production) the only valid session is a server-issued login (/admin/crm/login):
// passwords are checked and hashed on the server, never in the browser.
// The built-in browser check below exists ONLY for local development without the API and is removed from production builds.
import { getToken, setToken } from './crm/api';

const SESSION_KEY = 'igo.admin.session';
const LEGACY_FLAG = 'isAdminAuthenticated'; // used by the older property pages (/admin/dashboard, /admin/new, /admin/edit)
const API_ON = !!((import.meta as any).env?.VITE_API_URL as string | undefined);
const DEV = !!(import.meta as any).env?.DEV;
const ADMIN_USER = 'Admin';
const ADMIN_PASS = DEV ? 'Admin@123' : '';

export const serverAuthRequired = API_ON || !DEV;

export const verifyAdmin = (username: string, password: string): boolean =>
  !serverAuthRequired && DEV && username.trim() === ADMIN_USER && password === ADMIN_PASS;

export const startAdminSession = () => {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user: ADMIN_USER, at: Date.now() }));
    localStorage.setItem(LEGACY_FLAG, 'true');
  } catch { /* storage unavailable */ }
};

/** Called after a successful server login so the older admin pages accept the session too. */
export const markServerSession = () => { try { localStorage.setItem(LEGACY_FLAG, 'true'); } catch { /* ignore */ } };

export const isAdminSession = (): boolean => {
  if (serverAuthRequired) return !!getToken();
  try {
    return !!sessionStorage.getItem(SESSION_KEY) && localStorage.getItem(LEGACY_FLAG) === 'true';
  } catch { return false; }
};

export const endAdminSession = () => {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LEGACY_FLAG);
  } catch { /* ignore */ }
  setToken(null);
};

export const adminName = ADMIN_USER;
