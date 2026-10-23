import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Landmark, Sprout, KeyRound, HandCoins, ClipboardList, Building2 } from 'lucide-react';

const PATHS = [
  { Icon: Sprout, title: 'Have a plan', img: '/images/featured/organic-farmland-hd.webp', alt: 'Cultivated farmland with green crop rows and an irrigation channel', text: 'Buy the land and build your own farm. IGO helps with site review, documents and setup.' },
  { Icon: KeyRound, title: 'No plan yet', img: '/images/featured/greenhouse-farm-hd.webp', alt: 'Turnkey polyhouse farm with organised crop cultivation', text: 'Choose a turnkey IGO Agri Tech project and we set up and guide the farm with you.' },
  { Icon: Landmark, title: 'Just hold', img: '/images/blog/farmland.png', alt: 'Aerial view of a bounded agricultural land parcel surrounded by green orchards', text: 'Keep the land as an asset. Verified documents and clear boundaries from day one.' },
];

const PROJECTS = [
  'Polyhouse', 'Hydroponic', 'Vertical farming', 'Open cultivation', 'Horticulture',
  'Goat farming', 'Floriculture', 'Rooftop farming', 'Landscaping', 'Joint venture',
];

const OFFERS = [
  { to: '/listings', Icon: Building2, title: 'Buy land from IGO', img: '/images/featured/offer-buy-land.webp', alt: 'Aerial view of green agricultural land with clearly visible farm plots', pos: 'center', text: 'Browse agricultural land offered directly by IGO, with documents and guided site visits.', cta: 'See available land' },
  { to: '/sell-land', Icon: HandCoins, title: 'Sell your land to IGO', img: '/images/featured/offer-sell-land.webp', alt: 'Landowner discussing farmland with an IGO representative in a green field', pos: 'center', text: 'Share your land details and get a site visit, a legal check and a clear offer.', cta: 'Get an offer' },
  { to: '/post-requirement', Icon: ClipboardList, title: 'Tell us what you need', img: '/images/featured/offer-need.webp', alt: 'Well-maintained farm with green crop rows, irrigation and a greenhouse in the background', pos: 'center', text: 'Share your budget, preferred location and farm plan, and the IGO team will come back to you.', cta: 'Post a requirement' },
];

const LandAndProjects: React.FC = () => {
  const reduce = useReducedMotion();
  const rise = (i: number) => ({
    initial: reduce ? false as const : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-40px' },
    transition: { type: 'spring' as const, stiffness: 90, damping: 18, delay: i * 0.07 },
  });

  return (
    <>
      <section className="relative bg-[#F5F2E9] py-20 lg:py-28" aria-labelledby="land-projects-heading">
        <div className="container-pro grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1B5E20]">Your land, our expertise</p>
            <h2 id="land-projects-heading" className="mt-3 text-4xl md:text-5xl font-bold text-[#0f4d24] leading-[1.05] tracking-[-0.02em] normal-case [text-wrap:balance]">
              Buy land. Build a project. Or just hold.
            </h2>
            <p className="mt-5 max-w-md text-lg text-slate-600 leading-relaxed [text-wrap:pretty]">
              Every IGO land purchase can come with an IGO Agri Tech project, or stand on its own. The choice is yours.
            </p>
            <Link to="/projects" className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#1B5E20] px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#144a18] hover:gap-4 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B5E20]">
              View all projects <ArrowRight size={18} />
            </Link>
          </div>

          <div>
            <ol className="divide-y divide-[#0f4d24]/10 border-y border-[#0f4d24]/10">
              {PATHS.map(({ Icon, title, text, img, alt }, i) => (
                <motion.li key={title} {...rise(i)} className="flex flex-col gap-5 py-7 sm:flex-row sm:items-center sm:gap-6">
                  <img
                    src={img}
                    alt={alt}
                    width={1024}
                    height={640}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[16/10] w-full shrink-0 rounded-2xl object-cover shadow-[0_12px_28px_-16px_rgba(15,77,36,0.45)] ring-1 ring-[#0f4d24]/10 sm:w-48 md:w-56"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eaf4e6] text-[#1B5E20]"><Icon size={18} /></span>
                      <h3 className="text-xl font-semibold text-[#0f4d24] normal-case tracking-normal">{title}</h3>
                    </div>
                    <p className="mt-2 text-slate-600 leading-relaxed">{text}</p>
                  </div>
                </motion.li>
              ))}
            </ol>

            <p className="mt-10 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f4d24]/60">Turnkey project types</p>
            <ul className="mt-4 flex flex-wrap gap-2.5">
              {PROJECTS.map((p) => (
                <li key={p}>
                  <Link to="/projects" className="inline-block rounded-full border border-[#1B5E20]/20 bg-[#f4f9ee] px-4 py-2 text-sm font-medium text-[#0f4d24] transition hover:bg-[#1B5E20] hover:text-white active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1B5E20]">
                    {p}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-[#f4f9ee] py-20 lg:py-24" aria-labelledby="offers-heading">
        <div className="container-pro">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1B5E20]">Buy and sell agricultural land</p>
            <h2 id="offers-heading" className="mt-3 text-4xl md:text-5xl font-bold text-[#0f4d24] leading-[1.05] tracking-[-0.02em] normal-case [text-wrap:balance]">
              Agricultural land, handled directly by IGO
            </h2>
          </div>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {OFFERS.map(({ to, Icon, title, text, cta, img, alt, pos }, i) => (
              <motion.li key={to} {...rise(i)} className="sm:last:col-span-2 lg:last:col-span-1">
                <Link to={to} className="group flex h-full flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_18px_40px_-26px_rgba(15,77,36,0.45)] ring-1 ring-[#0f4d24]/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_52px_-26px_rgba(15,77,36,0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B5E20]">
                  <div className="aspect-[11/4] w-full overflow-hidden bg-[#eaf4e6]">
                    <img
                      src={img}
                      alt={alt}
                      width={1096}
                      height={396}
                      loading="lazy"
                      decoding="async"
                      style={{ objectPosition: pos }}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-7">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eaf4e6] text-[#1B5E20]"><Icon size={24} /></span>
                    <h3 className="mt-5 text-xl font-semibold text-[#0f4d24] normal-case tracking-normal">{title}</h3>
                    <p className="mt-2 flex-1 text-slate-600 leading-relaxed">{text}</p>
                    <span className="mt-6 inline-flex items-center gap-2 font-semibold text-[#1B5E20] transition-all group-hover:gap-3">{cta} <ArrowRight size={18} /></span>
                  </div>
                </Link>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
};

export default LandAndProjects;
