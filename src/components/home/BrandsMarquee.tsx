import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { brandsData } from '../../data/brandsData';

type Brand = (typeof brandsData)[number];

const CARD =
  'group/card relative mx-2.5 flex h-[220px] w-[260px] shrink-0 flex-col justify-center overflow-hidden rounded-3xl border border-black/5 bg-white p-5 shadow-sm transition-all duration-300 sm:w-[270px]';

const CardBody: React.FC<{ brand: Brand; linked: boolean }> = ({ brand }) => (
  <>
    <div className="flex h-28 items-center justify-center rounded-2xl border border-transparent bg-black/[0.02] p-3 transition-all group-hover/card:border-black/5 group-hover/card:bg-white">
      <img src={brand.logo} alt={brand.title} loading="lazy" className="max-h-[88px] max-w-full object-contain mix-blend-multiply" />
    </div>
    <h3 className="mt-4 text-center text-base font-black leading-snug text-primary">{brand.title}</h3>
  </>
);

const BrandCard: React.FC<{ brand: Brand; hidden?: boolean; onSoon: (b: Brand) => void }> = ({ brand, hidden, onSoon }) => {
  const cls = `${CARD} cursor-pointer hover:-translate-y-1.5 hover:border-secondary/40 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary`;
  if (brand.status === 'live' && brand.url) {
    return (
      <a
        href={brand.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${brand.title} (opens official website in a new tab)`}
        tabIndex={hidden ? -1 : undefined}
        className={cls}
      >
        <CardBody brand={brand} linked />
      </a>
    );
  }
  return (
    <button
      type="button"
      aria-label={`${brand.title} (coming soon)`}
      tabIndex={hidden ? -1 : undefined}
      onClick={() => onSoon(brand)}
      className={`${cls} text-left`}
    >
      <CardBody brand={brand} linked={false} />
    </button>
  );
};

const ComingSoonModal: React.FC<{ brand: Brand | null; onClose: () => void }> = ({ brand, onClose }) => {
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!brand) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    btn.current?.focus();
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [brand, onClose]);
  return (
    <AnimatePresence>
      {brand && (
        <motion.div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-[#052e22]/55 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog" aria-modal="true" aria-labelledby="soon-title"
            className="relative w-full max-w-md rounded-[28px] border border-[#cfe3d3] bg-gradient-to-b from-white to-[#f3f9ee] p-8 text-center shadow-[0_30px_80px_-20px_rgba(5,46,34,0.45)]"
            initial={{ opacity: 0, y: 24, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" aria-label="Close" onClick={onClose} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[#124B3B] transition-colors hover:bg-[#124B3B]/10">
              <X size={18} />
            </button>
            <div className="mx-auto flex h-24 w-40 items-center justify-center rounded-2xl bg-white p-3 shadow-sm ring-1 ring-[#5A963B]/20">
              <img src={brand.logo} alt="" className="max-h-full max-w-full object-contain" />
            </div>
            <p className="mt-4 text-sm font-bold text-[#124B3B]">{brand.title}</p>
            <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-[#5A963B]" />
            <h2 id="soon-title" className="mt-4 text-3xl font-black text-[#124B3B] normal-case tracking-normal">Coming Soon</h2>
            <p className="mt-1 text-base font-semibold text-[#5A963B]">Something Exciting Is on the Way!</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              We&rsquo;re working hard to bring this brand&rsquo;s website to you. Stay tuned for updates as we prepare to launch.
            </p>
            <button ref={btn} type="button" onClick={onClose} className="mt-6 rounded-full bg-[#124B3B] px-8 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-[#0d3a2d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A963B]">
              Got It
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const arrowBtn =
  'flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-black/10 text-text-muted transition-colors hover:bg-primary hover:text-white';

const BrandsMarquee = () => {
  const [soon, setSoon] = useState<Brand | null>(null);
  const closeSoon = React.useCallback(() => setSoon(null), []);
  return (
    <section className="overflow-hidden border-b border-t border-black/5 bg-background py-12 md:py-14">
      <div className="container-pro">
        <div className="relative mb-8 text-center">
          <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
            <img src="/images/igo-group-map.png" alt="" aria-hidden="true" loading="lazy" className="w-full max-w-[460px] object-contain opacity-[0.22] mix-blend-multiply" />
          </div>

          <div className="relative z-10">
            <div className="mb-3 flex items-center justify-center gap-4">
              <div className="h-px w-12 bg-secondary/40" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">THE SOVEREIGN ECOSYSTEM</span>
              <div className="h-px w-12 bg-secondary/40" />
            </div>
            <h2 className="mb-3 text-3xl font-black text-primary md:text-4xl">
              The <span className="font-serif italic text-secondary">26 Verticals</span> of IGO.
            </h2>
            <p className="mx-auto mb-5 max-w-xl text-sm font-light leading-relaxed text-text-muted md:text-base">
              A sovereign agricultural ecosystem covering Engineering, Production, Trade, and Consumer Lifestyle.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button type="button" aria-label="Previous" className={arrowBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">EXPLORE ALL 26 VERTICALS</span>
              <button type="button" aria-label="Next" className={arrowBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-full pb-4">
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-16 bg-gradient-to-r from-background to-transparent md:w-24" />
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-16 bg-gradient-to-l from-background to-transparent md:w-24" />

        <div className="animate-marquee hover:animation-play-state-paused group flex w-max py-2">
          <div className="flex">
            {brandsData.map((brand) => (
              <BrandCard key={`a-${brand.id}`} brand={brand} onSoon={setSoon} />
            ))}
          </div>
          <div className="flex" aria-hidden="true">
            {brandsData.map((brand) => (
              <BrandCard key={`b-${brand.id}`} brand={brand} hidden onSoon={setSoon} />
            ))}
          </div>
        </div>
      </div>
      <ComingSoonModal brand={soon} onClose={closeSoon} />
    </section>
  );
};

export default BrandsMarquee;
