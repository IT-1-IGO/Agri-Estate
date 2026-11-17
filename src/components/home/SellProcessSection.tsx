import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion';
import { MapPinned, ClipboardCheck, FileCheck2, BadgeIndianRupee, Handshake, ArrowRight } from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1] as const;
const SERIF = '"DM Serif Display","Playfair Display",Georgia,"Times New Roman",serif';
const STAGGER = 0.14; // seconds between one card and the next

const STEPS = [
  { Icon: MapPinned, title: 'Share Your Land', text: 'Tell us location, size and survey details through the form below.' },
  { Icon: ClipboardCheck, title: 'Site Verification', text: 'An IGO team visits the land to check access, soil, water and boundaries.' },
  { Icon: FileCheck2, title: 'Legal Check', text: 'Our legal team reviews the title, encumbrances and land records.' },
  { Icon: BadgeIndianRupee, title: 'Valuation & Offer', text: 'You receive a transparent market-based offer for your land.' },
  { Icon: Handshake, title: 'Agreement & Payment', text: 'Registration is completed and payment is made directly to you.' },
];

/* Card, number, icon and bottom bar all hang off the list's "hidden" / "show" state, so one in-view check starts the whole sequence. */
const cardV: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE, delay: i * STAGGER } }),
};
const numberV: Variants = {
  hidden: { opacity: 0, scale: 0.3 },
  show: (i: number) => ({ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 240, damping: 16, delay: i * STAGGER + 0.25 } }),
};
const iconV: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  show: (i: number) => ({ opacity: 1, scale: 1, transition: { duration: 0.6, ease: EASE, delay: i * STAGGER + 0.35 } }),
};
const barV: Variants = {
  hidden: { scaleX: 0 },
  show: (i: number) => ({ scaleX: 1, transition: { duration: 0.7, ease: EASE, delay: i * STAGGER + 0.55 } }),
};

/* Icon outlines draw themselves once the section is in view (only when the visitor allows motion). */
const DRAW_CSS = `
@media (prefers-reduced-motion: no-preference) {
  .sp-list .sp-draw path, .sp-list .sp-draw circle, .sp-list .sp-draw rect, .sp-list .sp-draw line, .sp-list .sp-draw polyline {
    stroke-dasharray: 200; stroke-dashoffset: 200;
  }
  .sp-list.sp-in .sp-draw path, .sp-list.sp-in .sp-draw circle, .sp-list.sp-in .sp-draw rect, .sp-list.sp-in .sp-draw line, .sp-list.sp-in .sp-draw polyline {
    stroke-dashoffset: 0; transition: stroke-dashoffset 1.3s cubic-bezier(0.22, 1, 0.36, 1) var(--sp-d, 0.5s);
  }
}`;

const SellProcessSection: React.FC = () => {
  const reduce = !!useReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);
  const inView = useInView(listRef, { once: true, amount: 0.15 });
  const show = reduce || inView;

  const reveal = (i: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.2 },
          transition: { duration: 0.6, ease: EASE, delay: i * 0.08 },
        };

  return (
    <section aria-labelledby="steps-heading" className="relative overflow-hidden bg-[#FAF6EA]">
      <style>{DRAW_CSS}</style>
      <div className="pointer-events-none absolute -right-24 -top-32 hidden h-[360px] w-[360px] rounded-full bg-[#e9eedb] opacity-80 md:block" aria-hidden="true" />

      <div className="container-pro relative pt-14 md:pt-20">
        <motion.div {...reveal(0)}>
          <div className="flex items-center gap-4">
            <span className="h-px w-14 bg-[#2d6a3e]" aria-hidden="true" />
            <span className="text-sm font-medium uppercase tracking-[0.25em] text-[#2d6a3e]">How it works</span>
            <span className="h-px w-14 bg-[#2d6a3e]" aria-hidden="true" />
          </div>
          <h2
            id="steps-heading"
            className="mt-5 max-w-3xl text-4xl font-bold normal-case leading-[1.12] tracking-tight text-[#0f4d24] sm:text-5xl lg:text-6xl"
            style={{ fontFamily: SERIF }}
          >
            A Simple Process to <span className="block text-[#2a8a3a]">Sell Your Land</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#5f7480] sm:text-lg">
            We make the process easy, transparent and secure — so you can move forward with confidence.
          </p>
        </motion.div>

        <div className="relative mt-12">
          {/* Connecting line (desktop): draws from step 1 to step 5, with a soft light travelling along it */}
          <div
            className="pointer-events-none absolute top-[116px] z-0 hidden h-[3px] -translate-y-1/2 xl:block"
            style={{ left: 'calc((100% - 128px) / 10)', right: 'calc((100% - 128px) / 10)' }}
            aria-hidden="true"
          >
            <span className="absolute inset-0 rounded-full bg-[#2d7a3e]/15" />
            <motion.span
              className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-[#2d7a3e] via-[#4fa863] to-[#c97b45]"
              initial={reduce ? false : { scaleX: 0 }}
              animate={{ scaleX: show ? 1 : 0 }}
              transition={{ duration: reduce ? 0 : 1.8, ease: EASE, delay: reduce ? 0 : 0.4 }}
            />
            {!reduce && show && (
              <motion.span
                className="absolute top-1/2 h-[7px] w-24 -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-white/90 to-transparent blur-[2px]"
                initial={{ left: '-8%', opacity: 0 }}
                animate={{ left: ['-8%', '100%'], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 3.4, ease: 'easeInOut', delay: 2.4, repeat: Infinity, repeatDelay: 2.2 }}
              />
            )}
          </div>

          <motion.ol
            ref={listRef}
            initial={reduce ? false : 'hidden'}
            animate={show ? 'show' : 'hidden'}
            className={`sp-list ${show ? 'sp-in' : ''} relative z-10 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5`}
          >
            {STEPS.map(({ Icon, title, text }, i) => {
              const sage = i % 2 === 1;
              return (
                <motion.li
                  key={title}
                  {...(reduce ? {} : { variants: cardV, custom: i })}
                  whileHover={reduce ? undefined : { y: -10 }}
                  style={{ ['--sp-d' as string]: `${(i * STAGGER + 0.5).toFixed(2)}s` }}
                  className={`group relative z-0 flex min-h-[300px] flex-col rounded-[22px] border bg-gradient-to-br px-6 pb-9 pt-7 shadow-[0_14px_34px_-24px_rgba(15,77,36,0.35)] transition-shadow duration-500 hover:z-20 hover:shadow-[0_30px_60px_-22px_rgba(15,77,36,0.5)] ${
                    sage ? 'border-[#dfe5d0] from-[#F2F5E9] to-[#E8EDDB]' : 'border-[#ece4d0] from-[#FDFBF3] to-[#F7F1E0]'
                  }`}
                >
                  {/* soft radial glow on hover */}
                  <span
                    className="pointer-events-none absolute inset-0 rounded-[22px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: 'radial-gradient(circle at 50% 28%, rgba(74,168,99,0.20), rgba(74,168,99,0) 62%)' }}
                    aria-hidden="true"
                  />

                  <motion.span
                    {...(reduce ? {} : { variants: numberV, custom: i })}
                    className="absolute left-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#0f4d24] text-xl font-bold text-white shadow-md transition-shadow duration-500 group-hover:shadow-[0_0_0_6px_rgba(42,138,58,0.18),0_0_24px_rgba(42,138,58,0.55)]"
                    style={{ fontFamily: SERIF }}
                    aria-label={`Step ${i + 1}`}
                  >
                    {i + 1}
                  </motion.span>

                  <motion.span {...(reduce ? {} : { variants: iconV, custom: i })} className="relative mx-auto flex h-[84px] w-[84px] items-center justify-center">
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-[#E4EAD8] text-[#0f4d24] transition-[transform,background-color] duration-500 ease-out group-hover:-translate-y-1 group-hover:rotate-[6deg] group-hover:bg-[#d7e3c6]">
                      <Icon size={40} strokeWidth={1.4} aria-hidden="true" className="sp-draw" />
                    </span>
                  </motion.span>

                  <h3
                    className="relative mt-8 text-[1.3rem] font-bold normal-case leading-tight tracking-normal text-[#0f4d24]"
                    style={{ fontFamily: SERIF }}
                  >
                    {title}
                  </h3>
                  <p className="relative mt-3 text-[0.95rem] leading-relaxed text-[#6b7f8c]">{text}</p>

                  <motion.span
                    {...(reduce ? {} : { variants: barV, custom: i })}
                    className="absolute bottom-0 left-4 right-4 origin-left"
                    aria-hidden="true"
                  >
                    <span
                      className={`relative block h-[5px] overflow-hidden rounded-full transition-all duration-500 group-hover:h-[8px] ${sage ? 'bg-[#2d7a3e]' : 'bg-[#c97b45]'}`}
                    >
                      <span className="absolute inset-y-0 -left-full w-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[200%]" />
                    </span>
                  </motion.span>

                  {i < STEPS.length - 1 && (
                    <span
                      className="pointer-events-none absolute -right-8 top-[104px] hidden h-6 w-8 items-center xl:flex"
                      aria-hidden="true"
                    >
                      <span className="absolute inset-x-0 h-px bg-[#2d7a3e]/60" />
                      <span className="relative mx-auto flex h-6 w-6 items-center justify-center rounded-full border border-[#cfe0c8] bg-white text-[#0f4d24] shadow-sm">
                        <motion.span
                          className="flex"
                          animate={reduce || !show ? undefined : { x: [0, 2.5, 0] }}
                          transition={{ duration: 1.8, ease: 'easeInOut', repeat: Infinity, delay: 1.4 + i * 0.25 }}
                        >
                          <ArrowRight size={13} strokeWidth={2.5} />
                        </motion.span>
                      </span>
                    </span>
                  )}
                </motion.li>
              );
            })}
          </motion.ol>
        </div>
      </div>
    </section>
  );
};

export default SellProcessSection;
