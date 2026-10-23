import { useCallback, useEffect, useRef, useState } from 'react';
import type { ScanResult } from '../cms/types';

/** Loads the real public page in a hidden frame and reads back its sections, texts, images, links and cards. */
export const useScan = (path: string) => {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [nonce, setNonce] = useState(0);
  const frame = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    setState('loading');
    const f = document.createElement('iframe');
    f.setAttribute('aria-hidden', 'true'); f.tabIndex = -1;
    f.style.cssText = 'position:fixed;left:-12000px;top:0;width:1280px;height:900px;border:0;opacity:0;pointer-events:none';
    f.src = `${path}${path.includes('?') ? '&' : '?'}cms_preview=1`;
    document.body.appendChild(f); frame.current = f;
    let stop = false, last = '', stable = 0; const t0 = Date.now();
    const tick = () => {
      if (stop) return;
      try {
        const w = f.contentWindow as (Window & { __cmsScan?: () => ScanResult }) | null;
        if (w?.__cmsScan && f.contentDocument?.readyState === 'complete') {
          const r = w.__cmsScan();
          if (r.hasMain) {
            const sig = JSON.stringify(r).length + ':' + r.sections.length;
            stable = sig === last ? stable + 1 : 0; last = sig;
            if (stable >= 2) { setResult(r); setState('ready'); return; }
          }
        }
      } catch { /* frame not ready */ }
      if (Date.now() - t0 > 12000) {
        try { const r = (f.contentWindow as unknown as { __cmsScan?: () => ScanResult }).__cmsScan?.(); if (r?.hasMain) { setResult(r); setState('ready'); return; } } catch { /* ignore */ }
        setState('error'); return;
      }
      setTimeout(tick, 500);
    };
    setTimeout(tick, 800);
    return () => { stop = true; f.remove(); };
  }, [path, nonce]);

  const rescan = useCallback(() => setNonce((n) => n + 1), []);
  return { state, result, rescan };
};
