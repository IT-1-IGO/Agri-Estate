import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCollection, getDoc, resolveMedia, subscribeCms } from '../admin/store';
import { PAGES_SEED } from '../data/siteContent';
import { setTextOverrides } from '../i18n/domTranslator';
import { applyAll, scanPage } from './dom';
import { livePageName, type LiveValues } from './types';

const isPanelPath = (p: string) => /^\/admin(\/|$)/.test(p) && !/^\/admin\/(dashboard|new|edit)(\/|$)/.test(p);

/**
 * Applies content saved in the admin panel (Pages → Edit) to the page being shown.
 * Visitors see the published version only; ?cms_preview=1 shows the draft.
 */
const LiveContent = () => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isPanelPath(pathname)) return;
    const params = new URLSearchParams(search);
    const preview = params.has('cms_preview');
    const name = livePageName(pathname);
    const hiddenPage = !preview && pathname !== '/' && getCollection('pages', PAGES_SEED).some((p) => String(p.path) === pathname && p.hidden === true);
    if (hiddenPage) { navigate('/', { replace: true }); return; }
    let values: LiveValues = {};
    let raf = 0;
    const run = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { try { applyAll(values, (r) => resolveMedia(r, r)); } catch { /* never break the page */ } }); };
    const load = () => {
      const d = getDoc(name);
      const useDraft = preview && Object.keys(d.draft || {}).length > 0;
      values = ((useDraft ? d.draft : d.published) || {}) as LiveValues;
      if (!preview && values.addedSections) values = { ...values, addedSections: values.addedSections.filter((x) => x.status !== 'draft') }; // draft sections are never public
      setTextOverrides(values.text || {});
      run();
    };
    load();
    const unsub = subscribeCms(load);
    const mo = new MutationObserver(run);
    mo.observe(document.body, { childList: true, subtree: true });
    (window as unknown as { __cmsScan?: () => unknown }).__cmsScan = () => scanPage();

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as Element).closest?.('a[data-cms-new]') as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute('href') || '';
      e.preventDefault(); e.stopPropagation();
      if (/^(https?:|mailto:|tel:)/i.test(href)) { if (a.target === '_blank') window.open(href, '_blank', 'noopener'); else window.location.assign(href); }
      else navigate(href);
    };
    document.addEventListener('click', onClick, true);
    return () => {
      cancelAnimationFrame(raf); mo.disconnect(); unsub(); setTextOverrides({});
      document.removeEventListener('click', onClick, true);
      delete (window as unknown as { __cmsScan?: unknown }).__cmsScan;
    };
  }, [pathname, search, navigate]);

  return null;
};
export default LiveContent;
