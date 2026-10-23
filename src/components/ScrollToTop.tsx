import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets the window scroll position to the top whenever the route changes.
 * Uses behavior:'instant' so the global `scroll-behavior: smooth` in index.css
 * does not animate the jump, and re-applies after the lazy-loaded page mounts.
 */
const toTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  // Take over from the browser's own scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
  }, []);

  useLayoutEffect(() => {
    toTop();
    // Re-assert after lazy page / exit animation swaps content and changes page height
    const raf = requestAnimationFrame(toTop);
    const t1 = window.setTimeout(toTop, 100);
    const t2 = window.setTimeout(toTop, 400);
    return () => { cancelAnimationFrame(raf); clearTimeout(t1); clearTimeout(t2); };
  }, [pathname]);

  return null;
};

export default ScrollToTop;
