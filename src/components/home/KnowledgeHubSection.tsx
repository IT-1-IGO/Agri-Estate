import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Newspaper, Sprout, Lightbulb, BookOpen } from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1] as const;

const RESOURCES = [
  { Icon: Newspaper, title: 'Market Blogs', desc: 'Stay updated with the latest agri market trends, insights and industry news.', to: '/blogs' },
  { Icon: Sprout, title: 'Crop Guides', desc: 'Learn about best crops, seasonal planning and yield management strategies.', to: '/knowledge-hub' },
  { Icon: Lightbulb, title: 'Expert Advice', desc: 'Get guidance from agricultural experts and industry professionals.', to: '/contact' },
  { Icon: BookOpen, title: 'Resource Library', desc: 'Access useful guides, documents and learning materials.', to: '/knowledge-hub' },
];

const Leaf: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 120 220" className={className} fill="currentColor" aria-hidden="true">
    <path d="M60 215c-2-60-1-110 4-205 20 30 38 60 30 100-6 30-20 55-34 105z" opacity=".9" />
    <path d="M58 150c-30-8-48-30-52-62 28 4 48 20 54 50z" opacity=".75" />
    <path d="M64 120c26-10 42-32 46-64-26 6-44 24-50 52z" opacity=".75" />
    <path d="M60 80c-22-8-34-26-36-50 22 4 34 18 38 42z" opacity=".6" />
  </svg>
);

const KnowledgeHubSection: React.FC = () => {
  const reduce = useReducedMotion();
  const reveal = (delay = 0, y = 24) => ({
    initial: reduce ? false as const : { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.6, ease: EASE, delay },
  });

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F5F7EF] to-[#e9f1e4] py-16 lg:py-24" aria-labelledby="knowledge-heading">

      <div className="container-pro relative">
        <div className="grid items-stretch gap-10 lg:grid-cols-[1.12fr_1fr] lg:gap-10 xl:gap-12">
          {/* Left: heading + resource cards */}
          <div className="min-w-0">
            <motion.div {...reveal(0, 16)} className="flex items-center gap-4">
              <span className="text-xs font-extrabold uppercase tracking-[0.3em] text-[#AD740D]">Knowledge Hub</span>
              <span className="h-[2px] w-14 rounded-full bg-[#AD740D]" />
            </motion.div>
            <motion.h2 {...reveal(0.1)} id="knowledge-heading" className="mt-3 text-4xl font-extrabold normal-case leading-[1.05] tracking-tight text-[#07543D] sm:text-5xl">
              Investment <br />
              <span className="not-italic text-[#AD740D]">Intelligence</span>
            </motion.h2>
            <motion.p {...reveal(0.2)} className="mt-5 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
              Gain valuable insights, expert advice and practical guides to make smarter decisions in agricultural land investment.
            </motion.p>
            <motion.div {...reveal(0.28, 8)} className="mt-4 h-[2px] w-14 rounded-full bg-[#AD740D]" />

            <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {RESOURCES.map(({ Icon, title, desc, to }, i) => (
                <motion.div key={title} {...reveal(0.12 + i * 0.1, 28)} className="h-full">
                  <Link
                    to={to}
                    className="group relative flex h-full gap-4 rounded-[22px] bg-white/90 p-5 pl-7 shadow-[0_12px_30px_-22px_rgba(7,84,61,0.45)] ring-1 ring-[#07543D]/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_44px_-22px_rgba(7,84,61,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#07543D]"
                  >
                    <span className="absolute bottom-6 left-3 top-6 w-[2px] rounded-full bg-[#AD740D]/70" aria-hidden="true" />
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e3efdd] text-[#07543D]"><Icon size={26} strokeWidth={1.7} /></span>
                    <span className="min-w-0 flex-1 pr-9">
                      <span className="block text-lg font-bold text-[#07543D]">{title}</span>
                      <span className="mt-1.5 block text-sm leading-relaxed text-slate-500">{desc}</span>
                    </span>
                    <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#e3efdd] text-[#07543D] transition-colors duration-300 group-hover:bg-[#07543D] group-hover:text-white">
                      <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: featured image card */}
          <motion.div {...reveal(0.2, 32)} className="flex min-w-0 lg:items-end">
            <div className="group relative aspect-[3/2] w-full overflow-hidden rounded-[28px] shadow-[0_26px_54px_-28px_rgba(7,84,61,0.6)] sm:aspect-[785/538] lg:aspect-auto lg:h-[calc(100%-5.5rem)] lg:min-h-[420px]">
              <img
                src="/images/featured/knowledge-seedling.webp"
                alt="Young green seedling growing in rich soil with a sunlit agricultural field and mountains behind"
                width={1683}
                height={1038}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-left transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-y-0 left-0 w-[62%] bg-gradient-to-r from-white/90 via-white/60 to-transparent" aria-hidden="true" />
              <div className="relative flex h-full max-w-[62%] flex-col justify-center p-6 sm:max-w-[52%] sm:p-9 lg:p-10">
                <Sprout size={34} strokeWidth={1.6} className="text-[#07543D]" />
                <h3 className="mt-5 text-2xl font-extrabold normal-case leading-tight tracking-tight text-[#07543D] sm:text-3xl">
                  Learn. Plan. <br />
                  <span className="italic text-[#AD740D]">Grow Together.</span>
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                  Your journey to successful agri investment starts with knowledge.
                </p>
                <Link
                  to="/knowledge-hub"
                  className="mt-6 inline-flex w-fit items-center gap-3 rounded-full bg-[#07543D] px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:gap-4 hover:bg-[#053f2e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#07543D]"
                >
                  Explore All Resources <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default KnowledgeHubSection;
