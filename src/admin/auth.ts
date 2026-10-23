// Admin sign-in (front-end only for now).
// NOTE: because there is no backend yet, this check runs in the browser and is NOT real security.
// When the database/backend is connected, replace verifyAdmin() with server-side authentication.
const SESSION_KEY = 'igo.admin.session';
const LEGACY_FLAG = 'isAdminAuthenticated'; // used by the older property pages (/admin/dashboard, /admin/new, /admin/edit)
const ADMIN_USER = 'Admin';
const ADMIN_PASS = 'Admin@123';

export const verifyAdmin = (username: string, password: string): boolean =>
  username.trim() === ADMIN_USER && password === ADMIN_PASS;

export const startAdminSession = () => {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user: ADMIN_USER, at: Date.now() }));
    localStorage.setItem(LEGACY_FLAG, 'true');
  } catch { /* storage unavailable */ }
};

export const isAdminSession = (): boolean => {
  try {
    return !!sessionStorage.getItem(SESSION_KEY) && localStorage.getItem(LEGACY_FLAG) === 'true';
  } catch { return false; }
};

export const endAdminSession = () => {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LEGACY_FLAG);
  } catch { /* ignore */ }
};

export const adminName = ADMIN_USER;
