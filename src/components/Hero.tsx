import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, LandPlot, Sprout, TreePine, Building2, CloudSun, Leaf, Search, ArrowRight, ChevronDown, Droplets, Flower2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProcessShowcase from './home/ProcessShowcase';
import WhyChooseUs from './home/WhyChooseUs';
import FarmDevelopment from './home/FarmDevelopment';
import FarmCategories from './home/FarmCategories';
import LandAndProjects from './home/LandAndProjects';

const Hero: React.FC = () => {
  const [searchType, setSearchType] = useState('Buy');
  const [state, setState] = useState('');
  const [locality, setLocality] = useState('');
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const rise = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 90, damping: 18 } } };

  const topSearches = [
    { label: 'Agricultural Land', icon: <LandPlot size={15} />, category: 'Open Field' },
    { label: 'Horticulture Farm', icon: <TreePine size={15} />, category: 'Horticulture' },
    { label: 'Plantation Farm', icon: <Leaf size={15} />, category: 'Nursery' },
    { label: 'Livestock Farm', icon: <Building2 size={15} />, category: 'Livestock' },
    { label: 'Protected Farm', icon: <CloudSun size={15} />, category: 'Protected' },
    { label: 'Hydroponic Farm', icon: <Droplets size={15} />, category: 'Hydroponic' },
    { label: 'Mushroom Farm', icon: <Flower2 size={15} />, category: 'Mushroom' },
    { label: 'Microgreens Farm', icon: <Sprout size={15} />, category: 'Microgreens' },
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchType) params.append('intent', searchType.toLowerCase());
    if (state) params.append('state', state);
    if (locality) params.append('query', locality);
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <>
      <section className="relative min-h-[100dvh] lg:min-h-[max(92vh,740px)] lg:max-h-[900px] flex flex-col justify-center overflow-hidden bg-[#04210f]" aria-labelledby="hero-heading">
        {/* Background video with green-tinted, left-weighted scrim */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster="/images/hero-poster.jpg"
            aria-hidden="true"
            className="w-full h-full object-cover object-center"
          >
            <source src="/videos/hero-1080p.mp4" type="video/mp4" />
            <track kind="captions" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-[#04210f]/85 via-[#04210f]/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#04210f]/70 via-transparent to-[#04210f]/30"></div>
          <div className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}></div>
        </div>

        <div className="container-pro relative z-10 w-full pt-32 pb-24 md:pt-40 lg:pt-44 lg:pb-28">
          <div className="max-w-3xl pb-14 lg:pb-16">
            {/* Left: message */}
            <motion.div
              initial={reduceMotion ? false : 'hidden'}
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.09 } } }}
              className="text-left"
            >
              <motion.p variants={rise} className="inline-flex items-center gap-3 text-[13px] font-medium tracking-[0.18em] uppercase text-[#f1c27d]">
                <span className="h-px w-8 bg-[#f1c27d]/70" aria-hidden="true"></span>
                IGO Group of Companies
              </motion.p>

              <motion.h1 id="hero-heading" variants={rise} className="mt-5 text-[2.6rem] sm:text-6xl lg:text-[4.5rem] font-bold text-white leading-[1.02] tracking-[-0.025em] normal-case [text-wrap:balance]">
                Land you can trust.<br />
                <span className="text-[#f1c27d]">Projects that grow.</span>
              </motion.h1>

              <motion.p variants={rise} className="mt-6 max-w-[34rem] text-lg text-white/85 leading-relaxed [text-wrap:pretty]">
                Buy verified agricultural land with IGO Agri Estate projects, or sell your land directly to IGO with a free site visit and a clear offer.
              </motion.p>
            </motion.div>

          </div>
        </div>
      </section>
      {/* Buy / Sell action bar, sits under the hero */}
      <div className="container-pro relative z-20 -mt-16 mb-10">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 90, damping: 18, delay: 0.25 }}
          className="rounded-[28px] border border-black/5 bg-white p-4 sm:p-6 shadow-[0_30px_80px_-24px_rgba(4,33,15,0.55)]"
        >
          <div className="grid gap-4 lg:grid-cols-[auto_1fr] lg:items-center">
            <div role="tablist" aria-label="What would you like to do" className="relative grid grid-cols-2 rounded-full bg-[#04210f]/[0.07] p-1 lg:w-64">
              {['Buy', 'Sell'].map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={searchType === t}
                  onClick={() => setSearchType(t)}
                  className="relative z-10 rounded-full py-2.5 text-sm font-semibold tracking-wide normal-case transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B5E20]"
                  style={{ color: searchType === t ? '#fff' : '#0f4d24' }}
                >
                  {searchType === t && (
                    <motion.span layoutId="hero-tab" transition={{ type: 'spring', stiffness: 400, damping: 32 }} className="absolute inset-0 -z-10 rounded-full bg-[#1B5E20] shadow-md" />
                  )}
                  {t === 'Buy' ? 'Buy land' : 'Sell land'}
                </button>
              ))}
            </div>

            {searchType === 'Sell' ? (
              <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <p className="text-[15px] text-slate-700 normal-case tracking-normal">
                  <b className="text-[#0f4d24]">Sell your land directly to IGO.</b> No brokers, a free site visit and legal check, and a clear offer paid to you.
                </p>
                <button
                  onClick={() => navigate('/sell-land')}
                  className="md:min-w-[220px] flex items-center justify-center gap-3 rounded-xl bg-[#1B5E20] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#144a18] hover:shadow-lg active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B5E20]"
                >
                  Get my offer <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-[1fr_1.3fr_auto]">
                <div className="relative">
                  <label htmlFor="hero-state-select" className="sr-only">Select state</label>
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1B5E20] pointer-events-none" />
                  <select
                    id="hero-state-select"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-black/10 bg-white py-3.5 pl-11 pr-10 text-[15px] font-medium text-[#0f4d24] normal-case tracking-normal outline-none transition focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/30"
                  >
                    <option value="">Any state</option>
                    <option>Karnataka</option>
                    <option>Maharashtra</option>
                    <option>Tamil Nadu</option>
                    <option>Andhra Pradesh</option>
                    <option>Kerala</option>
                    <option>Haryana</option>
                    <option>Rajasthan</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0f4d24]/40 pointer-events-none" />
                </div>
                <div className="relative">
                  <label htmlFor="hero-locality-input" className="sr-only">Search locality</label>
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1B5E20] pointer-events-none" />
                  <input
                    id="hero-locality-input"
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="Locality, district or project"
                    className="w-full rounded-xl border border-black/10 bg-white py-3.5 pl-11 pr-4 text-[15px] font-medium text-[#0f4d24] normal-case tracking-normal outline-none transition focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/30"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="md:min-w-[200px] flex items-center justify-center gap-3 rounded-xl bg-[#1B5E20] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#144a18] hover:shadow-lg active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B5E20]"
                >
                  Search estates <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>

          {searchType === 'Buy' && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-black/5 pt-4">
              <span className="mr-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#0f4d24]/60">Popular</span>
              {topSearches.map((tag) => (
                <button
                  key={tag.label}
                  onClick={() => navigate(`/listings?category=${encodeURIComponent(tag.category)}`)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#1B5E20]/20 bg-[#eaf4e6]/70 px-3 py-1.5 text-xs font-medium normal-case tracking-normal text-[#0f4d24] transition hover:bg-[#1B5E20] hover:text-white active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1B5E20]"
                >
                  {tag.icon}
                  {tag.label}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>


      <FarmCategories />

      {/* Process: land selection to farm development */}
      <section className="bg-[#f6faf1]" aria-label="From land selection to farm development">
        <ProcessShowcase />
      </section>

      <WhyChooseUs />
      <FarmDevelopment />


      <LandAndProjects />
    </>
  );
};

export default Hero;
