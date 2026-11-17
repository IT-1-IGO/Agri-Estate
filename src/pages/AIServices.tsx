import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import LegalEnquiryModal, { LegalEnquiryMode } from '../components/services/LegalEnquiryModal';
import {
  ArrowRight, Layers, Leaf, Calculator, Receipt, MapPinned, Database, Brain, TrendingUp, Sprout, MonitorCheck,
  ShieldCheck, Droplets, Eye, Target, Check,
} from 'lucide-react';

const DARK = '#0b3d22';
const LIME = '#b6f23c';
const GREEN = '#0f4d24';

type Svc = { title: string; img: string; icon: React.ElementType; bullets: string[]; to?: string; cta: string };
const services: Svc[] = [
  { title: 'AI Land Valuation', img: '/images/services/ai-land.jpg', icon: Layers, to: '/valuation', cta: 'Request a valuation',
    bullets: ['AI-assisted land price estimation', 'Location and market trend analysis', 'Land area and classification insights', 'Valuation report preview'] },
  { title: 'Soil Intelligence', img: '/images/services/ai-soil.jpg', icon: Leaf, to: '/services/soil', cta: 'Explore soil testing',
    bullets: ['Soil health assessment', 'Soil pH and nutrient analysis', 'Soil fertility insights', 'Crop suitability recommendations'] },
  { title: 'Tax Optimization', img: '/images/services/tax-card-2.jpg', icon: Receipt, to: '/tax-optimizer', cta: 'Explore tax planning',
    bullets: ['Agricultural land tax planning guidance', 'Capital gains review', 'Ownership and documentation review', 'Tax planning insights'] },
  { title: 'Smart Investment Calculator', img: '/images/services/ai-invest.jpg', icon: Calculator, cta: 'Talk to an expert',
    bullets: ['Land investment estimation', 'Investment cost breakdown', 'Potential return calculations', 'Comparison of investment scenarios'] },
  { title: 'AI-Powered Land Insights', img: '/images/services/ai-drone.jpg', icon: MapPinned, cta: 'Talk to an expert',
    bullets: ['Location-based insights', 'Infrastructure and accessibility analysis', 'Land characteristics and development potential', 'Agricultural suitability insights'] },
];

const steps = [
  { icon: Database, title: 'Submit Your Land Details', text: 'Location, survey details, land type and water data.' },
  { icon: Brain, title: 'AI Data Analysis', text: 'Data processing and pattern identification.' },
  { icon: TrendingUp, title: 'Generate Insights', text: 'Land suitability and agricultural indications.' },
  { icon: Sprout, title: 'Review Recommendations', text: 'Go through the findings and options with us.' },
  { icon: MonitorCheck, title: 'Connect with an Expert', text: 'An IGO expert reviews and guides your next step.' },
];

const benefits = [
  { icon: ShieldCheck, label: ['Better', 'Risk Assessment'] },
  { icon: TrendingUp, label: ['Informed', 'Investments'] },
  { icon: Droplets, label: ['Resource', 'Optimization'] },
  { icon: Leaf, label: ['Sustainable', 'Farming'] },
  { icon: Eye, label: ['Operational', 'Transparency'] },
  { icon: Target, label: ['Improved', 'Decision-Making'] },
];

const AIServices: React.FC = () => {
  const [modal, setModal] = useState<LegalEnquiryMode | null>(null);

  return (
    <div className="min-h-screen bg-white pb-16 pt-[76px]">
      <SEO
        title="AI-Enabled Agricultural Land Services | IGO Agri Estate"
        description="Technology and AI-supported services for agricultural land: land valuation, soil intelligence, tax planning guidance, investment estimation and land insights, with expert review."
        canonical="/ai-services"
        keywords="AI agriculture India, AI land valuation, soil intelligence, agricultural investment calculator, land insights, smart farming estates"
      />

      {/* HERO */}
      <section className="relative isolate overflow-hidden text-white" aria-labelledby="ai-hero-heading" style={{ background: DARK }}>
        <img src="/images/featured/vi-farmland-wide.webp" alt="" aria-hidden="true" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 -z-10" style={{ background: `linear-gradient(90deg,${DARK} 0%,rgba(11,61,34,.92) 45%,rgba(11,61,34,.35) 100%)` }} />
        <img
          src="/images/services/ai-hero-photo.jpg"
          alt="Drone surveying green farmland with a digital land boundary overlay"
          width={578}
          height={524}
          fetchPriority="high"
          className="absolute inset-y-0 right-0 -z-10 hidden h-full w-[40%] object-cover object-center md:block"
          style={{ WebkitMaskImage: 'linear-gradient(90deg,transparent 0%,#000 40%)', maskImage: 'linear-gradient(90deg,transparent 0%,#000 40%)' }}
        />
        <div className="mx-auto max-w-[1280px] px-5 py-12 sm:px-8 md:py-16 lg:px-10">
          <div className="max-w-[640px]">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/90">Technology meets agriculture</p>
            <h1 id="ai-hero-heading" className="mt-4 font-extrabold normal-case leading-[1.05] tracking-tight" style={{ fontSize: 'clamp(2.1rem, 4.4vw, 3.6rem)' }}>
              Intelligent Agriculture.<br /><span style={{ color: LIME }}>Smarter Investments.</span>
            </h1>
            <p className="mt-5 max-w-[470px] text-base leading-relaxed text-white/90 md:text-lg">
              Empowering agricultural estates through AI, data-driven insights and smart technologies.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#ai-solutions" className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-lg transition hover:-translate-y-0.5 hover:brightness-105" style={{ background: LIME, color: DARK }}>
                Explore AI Services <ArrowRight size={16} />
              </a>
              <button onClick={() => setModal('ai-expert')} className="inline-flex items-center rounded-xl border border-white/70 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/10">
                Talk to an Expert
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
        {/* INTRO */}
        <section className="pt-9 text-center">
          <div className="flex items-center justify-center gap-4">
            <span aria-hidden className="hidden h-px w-16 bg-[#6fbf3a] sm:block" />
            <h2 className="text-xl font-bold normal-case md:text-[1.7rem]" style={{ color: '#12341f' }}>Transforming Agriculture Through Artificial Intelligence</h2>
            <span aria-hidden className="hidden h-px w-16 bg-[#6fbf3a] sm:block" />
          </div>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-slate-700 md:text-[0.95rem]">
            At IGO Agri Estates, we aim to integrate artificial intelligence, advanced analytics and smart agricultural technologies to support better land investment decisions, optimize farm operations and promote sustainable agricultural development.
          </p>
        </section>

        {/* SOLUTIONS + HOW IT WORKS */}
        <div className="mt-9 grid gap-6 lg:grid-cols-[1.45fr_1fr]">
          <section id="ai-solutions" className="scroll-mt-28">
            <h2 className="text-2xl font-extrabold normal-case md:text-[1.8rem]" style={{ color: GREEN }}>Our AI-Enabled Solutions</h2>
            <span aria-hidden className="mt-1 block h-1 w-44 rounded-full bg-gradient-to-r from-[#3f9a3a] to-transparent" />
            <ul className="mt-5 divide-y divide-slate-200">
              {services.map(({ title, img, icon: Icon, bullets, to, cta }) => (
                <li key={title} className="group grid items-center gap-4 py-4 sm:grid-cols-[190px_1fr]">
                  <img src={img} alt="" aria-hidden="true" width={414} height={190} loading="lazy" className="h-[104px] w-full rounded-lg object-cover shadow transition duration-300 group-hover:shadow-lg sm:w-[190px]" />
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e6f3d6] transition group-hover:bg-[#d4ebb8]"><Icon size={22} style={{ color: '#2e7d32' }} /></span>
                    <div>
                      <h3 className="text-lg font-bold normal-case leading-tight" style={{ color: '#12341f' }}>{title}</h3>
                      <ul className="mt-1.5 grid gap-x-4 gap-y-0.5 text-[13px] text-slate-700 sm:grid-cols-2">
                        {bullets.map((b) => (
                          <li key={b} className="flex items-start gap-1.5"><Check size={13} strokeWidth={3} className="mt-1 shrink-0 text-[#2e9b3f]" />{b}</li>
                        ))}
                      </ul>
                      {to ? (
                        <Link to={to} className="mt-2 inline-flex items-center gap-1 text-[13px] font-bold text-[#1f6b3a] hover:underline">{cta} <ArrowRight size={14} /></Link>
                      ) : (
                        <button onClick={() => setModal('ai-expert')} className="mt-2 inline-flex items-center gap-1 text-[13px] font-bold text-[#1f6b3a] hover:underline">{cta} <ArrowRight size={14} /></button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="self-start rounded-3xl bg-[#e9f4dc] p-5 md:p-6">
            <h2 className="text-2xl font-extrabold normal-case leading-tight md:text-[1.8rem]" style={{ color: GREEN }}>How Our AI Services Work</h2>
            <ol className="mt-5">
              {steps.map(({ icon: Icon, title, text }, i) => (
                <li key={title}>
                  <div className="flex items-center gap-4 rounded-xl bg-white/70 p-3.5 transition hover:bg-white">
                    <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[#d9eec0]">
                      <Icon size={28} style={{ color: '#2e7d32' }} strokeWidth={1.6} />
                      <span className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: GREEN }}>{i + 1}</span>
                    </span>
                    <div>
                      <h3 className="text-base font-bold normal-case leading-tight" style={{ color: '#12341f' }}>{title}</h3>
                      <p className="mt-0.5 text-[13px] leading-snug text-slate-700">{text}</p>
                    </div>
                  </div>
                  {i < steps.length - 1 && <div aria-hidden className="py-1 text-center text-lg leading-none text-[#2e7d32]">↓</div>}
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* BENEFITS */}
        <section className="mt-10">
          <div className="flex items-center justify-center gap-4">
            <span aria-hidden className="hidden h-px w-28 bg-[#6fbf3a] sm:block" />
            <h2 className="text-2xl font-extrabold normal-case md:text-[1.8rem]" style={{ color: GREEN }}>Benefits for Investors</h2>
            <span aria-hidden className="hidden h-px w-28 bg-[#6fbf3a] sm:block" />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {benefits.map(({ icon: Icon, label }) => (
              <div key={label[0]} className="flex flex-col items-center rounded-xl bg-[#f1f7e8] px-3 py-5 text-center text-sm font-bold leading-tight text-[#12341f] transition duration-300 hover:-translate-y-1 hover:shadow-md">
                <Icon size={40} strokeWidth={1.4} style={{ color: '#2e7d32' }} className="mb-2" />
                {label[0]}<br />{label[1]}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="relative isolate mt-10 overflow-hidden rounded-3xl px-6 py-10 text-center text-white shadow-xl md:py-12">
          <img src="/images/featured/vi-farmland-wide.webp" alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover" />
          <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(180deg,rgba(11,61,34,.82),rgba(11,61,34,.9))' }} />
          <h2 className="text-2xl font-extrabold normal-case md:text-4xl">Make Smarter Land Decisions with AI</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/95 md:text-base">
            Discover intelligent insights, reliable assessments, and expert guidance for your agricultural land investments.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/valuation" className="rounded-xl px-7 py-3 text-sm font-bold shadow-lg transition hover:-translate-y-0.5 hover:brightness-105" style={{ background: LIME, color: DARK }}>Get Started</Link>
            <button onClick={() => setModal('ai-expert')} className="rounded-xl border border-white/80 px-7 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/10">Talk to an Expert</button>
          </div>
        </section>
        <p className="mx-auto mt-4 max-w-3xl text-center text-xs text-slate-500">
          Insights and estimates are indicative and are reviewed with IGO experts. They are not a guarantee of value, returns or tax outcomes.
        </p>
      </div>

      <LegalEnquiryModal mode={modal} onClose={() => setModal(null)} />
    </div>
  );
};

export default AIServices;
