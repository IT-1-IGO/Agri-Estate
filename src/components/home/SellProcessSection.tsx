import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MapPinned, ClipboardCheck, FileCheck2, BadgeIndianRupee, Handshake, ArrowRight } from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1] as const;
const SERIF = '"DM Serif Display","Playfair Display",Georgia,"Times New Roman",serif';

const STEPS = [
  { Icon: MapPinned, title: 'Share Your Land', text: 'Tell us location, size and survey details through the form below.' },
  { Icon: ClipboardCheck, title: 'Site Verification', text: 'An IGO team visits the land to check access, soil, water and boundaries.' },
  { Icon: FileCheck2, title: 'Legal Check', text: 'Our legal team reviews the title, encumbrances and land records.' },
  { Icon: BadgeIndianRupee, title: 'Valuation & Offer', text: 'You receive a transparent market-based offer for your land.' },
  { Icon: Handshake, title: 'Agreement & Payment', text: 'Registration is completed and payment is made directly to you.' },
];

const SellProcessSection: React.FC = () => {
  const reduce = useReducedMotion();
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

        <ol className="mt-12 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {STEPS.map(({ Icon, title, text }, i) => {
            const sage = i % 2 === 1;
            return (
              <motion.li
                key={title}
                {...reveal(i + 1)}
                className={`relative flex min-h-[300px] flex-col rounded-[22px] border px-6 pb-9 pt-7 shadow-[0_14px_34px_-24px_rgba(15,77,36,0.35)] ${
                  sage ? 'border-[#dfe5d0] bg-[#EEF1E4]' : 'border-[#ece4d0] bg-[#FBF8EE]'
                }`}
              >
                <span
                  className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#0f4d24] text-xl font-bold text-white shadow-md"
                  style={{ fontFamily: SERIF }}
                  aria-label={`Step ${i + 1}`}
                >
                  {i + 1}
                </span>
                <span className="mx-auto flex h-[84px] w-[84px] items-center justify-center rounded-full bg-[#E4EAD8] text-[#0f4d24]">
                  <Icon size={40} strokeWidth={1.4} aria-hidden="true" />
                </span>
                <h3
                  className="mt-8 text-[1.3rem] font-bold normal-case leading-tight tracking-normal text-[#0f4d24]"
                  style={{ fontFamily: SERIF }}
                >
                  {title}
                </h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-[#6b7f8c]">{text}</p>
                <span
                  className={`absolute bottom-0 left-4 right-4 h-[5px] rounded-full ${sage ? 'bg-[#2d7a3e]' : 'bg-[#c97b45]'}`}
                  aria-hidden="true"
                />
                {i < STEPS.length - 1 && (
                  <span
                    className="pointer-events-none absolute -right-8 top-[104px] hidden h-6 w-8 items-center xl:flex"
                    aria-hidden="true"
                  >
                    <span className="absolute inset-x-0 h-px bg-[#2d7a3e]/60" />
                    <span className="relative mx-auto flex h-6 w-6 items-center justify-center rounded-full border border-[#cfe0c8] bg-white text-[#0f4d24] shadow-sm">
                      <ArrowRight size={13} strokeWidth={2.5} />
                    </span>
                  </span>
                )}
              </motion.li>
            );
          })}
        </ol>
      </div>

      <div className="mx-auto mt-6 w-full max-w-[1672px]">
        <img
          src="/images/sell-land-process-farmland-v3.webp"
          alt=""
          aria-hidden="true"
          width={1672}
          height={211}
          loading="lazy"
          className="block h-auto w-full min-h-[110px] object-cover object-left"
        />
      </div>
    </section>
  );
};

export default SellProcessSection;
