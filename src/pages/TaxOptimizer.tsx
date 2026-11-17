import React, { useState } from 'react';
import SEO from '../components/SEO';
import LegalEnquiryModal, { LegalEnquiryMode } from '../components/services/LegalEnquiryModal';
import {
  Scale, MapPinned, FileText, RefreshCw, Leaf, CalendarCheck, Headset, ArrowRight, Check, Sprout,
  FileSearch, TrendingUp, CircleCheck, Info,
} from 'lucide-react';

const SERIF = '"DM Serif Display","Playfair Display",Georgia,"Times New Roman",serif';
const GREEN = '#0f3d28';

const categories = [
  { icon: Scale, label: ['Capital Gains', 'Review'] },
  { icon: MapPinned, label: ['Agricultural Land', 'Classification'] },
  { icon: FileText, label: ['Ownership &', 'Documentation'] },
  { icon: RefreshCw, label: ['Tax-Smart', 'Reinvestment'] },
];

const cards = [
  { title: 'Understand Your Tax Position', img: '/images/services/tax-card-1.jpg', alt: 'Green agricultural land with a location marker and boundary lines',
    items: ['Land location and classification', 'Ownership and holding period', 'Purchase and improvement costs', 'Sale consideration and expenses'] },
  { title: 'Tax Planning Areas', img: '/images/services/tax-card-2.jpg', alt: 'Calculator, TAX wooden blocks and a small indoor plant',
    items: ['Capital gains assessment', 'Agricultural land eligibility review', 'Reinvestment options where eligible', 'Timing and compliance planning'] },
  { title: 'Documents to Prepare', img: '/images/services/tax-card-3.jpg', alt: 'Stack of property documents and files with a pen',
    items: ['Sale deed and title documents', 'Patta / Chitta / Adangal or relevant land records', 'Purchase and improvement receipts', 'Survey details and transaction records'] },
  { title: 'Professional Tax Review', img: '/images/services/tax-card-4.jpg', alt: 'IGO advisor in a black igo T-shirt reviewing documents with a farmer',
    items: ['Eligibility assessment', 'Scenario comparison', 'Documentation checklist', 'Action plan with a qualified tax professional'] },
];

const steps = [
  { icon: Sprout, label: ['Understand', 'Your Land'] },
  { icon: FileSearch, label: ['Review', 'Documents'] },
  { icon: Scale, label: ['Assess Applicable', 'Rules'] },
  { icon: TrendingUp, label: ['Compare Planning', 'Options'] },
  { icon: CircleCheck, label: ['Receive Your', 'Action Plan'] },
];

const TaxOptimizer: React.FC = () => {
  const [modal, setModal] = useState<LegalEnquiryMode | null>(null);

  return (
    <div className="min-h-screen pb-16 pt-[76px]" style={{ background: '#fbf6e9' }}>
      <SEO
        title="Agricultural Land Tax Planning India — Capital Gains Guidance | IGO Agri Estate"
        description="Clear, compliant tax planning guidance for agricultural land and estate investments in India: capital gains review, land classification, documentation and reinvestment options."
        canonical="/tax-optimizer"
        keywords="agricultural land tax planning India, capital gains farmland, Section 54B guidance, land tax advisor, agricultural land classification tax, reinvestment planning farmland"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: 'IGO Land Tax Planning Guidance',
          url: 'https://www.igoagriestate.com/tax-optimizer',
          description: 'Compliant tax planning guidance for agricultural land and estate investments',
          provider: { '@type': 'Organization', name: 'IGO Agri Estates', url: 'https://www.igoagriestate.com' },
        }}
      />

      {/* HERO */}
      <section className="relative isolate overflow-hidden" aria-labelledby="tax-hero-heading"
        style={{ background: 'radial-gradient(ellipse at 8% 10%,#fde9b8 0%,rgba(253,233,184,0) 52%),linear-gradient(180deg,#e7f0f3 0%,#e7efc9 45%,#a6cf5e 100%)' }}>
        <img
          src="/images/services/tax-page-hero-photo.jpg"
          alt="IGO advisor in a black igo T-shirt reviewing land tax documents with a farmer in a turquoise turban, with a laptop on the table"
          width={978}
          height={790}
          fetchPriority="high"
          className="absolute inset-y-0 right-0 -z-10 h-full w-full object-cover object-[80%_center] md:w-[50%] md:object-right"
          style={{ WebkitMaskImage: 'linear-gradient(90deg,transparent 0%,#000 12%)', maskImage: 'linear-gradient(90deg,transparent 0%,#000 14%)' }}
        />
        <div className="absolute inset-0 -z-10 md:hidden" style={{ background: 'linear-gradient(180deg,rgba(251,246,233,.95),rgba(251,246,233,.88))' }} />
        <div className="mx-auto max-w-[1280px] px-5 py-10 sm:px-8 md:py-12 lg:px-10 lg:py-14">
          <div className="max-w-[600px]">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#e4efc7]/95 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-800 shadow-sm sm:text-xs">
              <Leaf size={17} style={{ color: '#1f6b3a' }} className="shrink-0" /> Smart • Compliant • Land-Focused Tax Planning
            </span>
            <h1 id="tax-hero-heading" className="mt-5 font-semibold normal-case leading-[1.05] tracking-tight"
              style={{ fontFamily: SERIF, fontSize: 'clamp(2.3rem, 4.2vw, 3.7rem)', color: GREEN }}>
              Plan Your Land Taxes<br />with Confidence
            </h1>
            <p className="mt-4 max-w-[480px] text-base font-medium leading-snug text-slate-900 md:text-[1.1rem]">
              Make informed property decisions with clear, compliant tax guidance for agricultural land and estate investments.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => setModal('tax-consult')} className="inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-125" style={{ background: GREEN }}>
                <CalendarCheck size={18} /> Request a Consultation <ArrowRight size={16} />
              </button>
              <a href="#tax-planning" className="inline-flex items-center gap-2.5 rounded-full border border-[#1f6b3a] bg-white/90 px-6 py-3 text-sm font-semibold text-slate-900 shadow-md transition hover:-translate-y-0.5 hover:bg-white">
                <Headset size={18} /> Explore Tax Planning
              </a>
            </div>
          </div>
        </div>
      </section>

      <div id="tax-planning" className="mx-auto max-w-[1280px] scroll-mt-24 px-5 sm:px-8 lg:px-8">
        {/* CATEGORIES */}
        <div className="grid grid-cols-1 gap-3 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(({ icon: Icon, label }) => (
            <div key={label[0]} className="group flex items-center gap-4 rounded-xl bg-[#e8f0d8] px-5 py-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
              <Icon size={38} strokeWidth={1.4} style={{ color: GREEN }} className="shrink-0 transition-transform duration-300 group-hover:scale-110" />
              <span className="text-[1.05rem] leading-tight text-slate-800" style={{ fontFamily: SERIF }}>{label[0]}<br />{label[1]}</span>
            </div>
          ))}
        </div>

        {/* FOUR CARDS */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <article key={c.title} className="group flex flex-col overflow-hidden rounded-xl border border-[#ece4cf] bg-[#fdf9ee] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="overflow-hidden">
                <img src={c.img} alt={c.alt} width={460} height={344} loading="lazy" className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="flex-1 p-4">
                <h2 className="text-[1.15rem] font-semibold normal-case leading-tight" style={{ fontFamily: SERIF, color: GREEN }}>{c.title}</h2>
                <span aria-hidden className="mt-2 block h-0.5 w-6 rounded bg-[#2e9b3f]" />
                <ul className="mt-3 space-y-2.5">
                  {c.items.map((t) => (
                    <li key={t} className="flex items-start gap-2.5 text-[13px] leading-snug text-slate-700">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full" style={{ background: '#4aa84f' }}>
                        <Check size={10} strokeWidth={3.5} className="text-white" />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        {/* PROCESS */}
        <section className="mt-9">
          <div className="flex items-center justify-center gap-3">
            <span aria-hidden className="hidden h-px flex-1 bg-[#0f3d28]/30 sm:block" />
            <Sprout size={20} style={{ color: '#2e7d32' }} />
            <h2 className="text-center text-2xl font-medium normal-case md:text-[2rem]" style={{ fontFamily: SERIF, color: GREEN }}>Our Tax Planning Process</h2>
            <span aria-hidden className="hidden h-px flex-1 bg-[#0f3d28]/30 sm:block" />
          </div>
          <ol className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:flex lg:items-start lg:justify-between lg:gap-0">
            {steps.map(({ icon: Icon, label }, i) => (
              <React.Fragment key={i}>
                <li className="flex flex-col items-center text-center lg:w-[150px]">
                  <span className="relative flex h-[84px] w-[84px] items-center justify-center rounded-full bg-[#e3efcf]">
                    <span className="absolute -top-2 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full text-sm font-bold text-white ring-2 ring-[#fbf6e9]" style={{ background: GREEN }}>{i + 1}</span>
                    <Icon size={34} strokeWidth={1.5} style={{ color: '#2e7d32' }} />
                  </span>
                  <span className="mt-3 text-[1rem] leading-tight" style={{ fontFamily: SERIF, color: GREEN }}>{label[0]}<br />{label[1]}</span>
                </li>
                {i < steps.length - 1 && <ArrowRight aria-hidden size={20} className="mt-8 hidden shrink-0 text-slate-700 lg:block" />}
              </React.Fragment>
            ))}
          </ol>
        </section>

        {/* CTA */}
        <section className="relative isolate mt-9 overflow-hidden rounded-2xl text-white shadow-xl" style={{ background: 'linear-gradient(100deg,#0c3b21 0%,#12502c 60%,#2c6a30 100%)' }}>
          <img
            src="/images/services/tax-cta-photo.jpg"
            alt=""
            aria-hidden="true"
            width={444}
            height={448}
            loading="lazy"
            className="absolute inset-y-0 right-0 -z-10 hidden h-full w-[48%] object-cover object-center md:block"
            style={{ WebkitMaskImage: 'linear-gradient(90deg,transparent 0%,#000 45%)', maskImage: 'linear-gradient(90deg,transparent 0%,#000 45%)' }}
          />
          <div className="max-w-[640px] px-6 py-8 sm:px-8 md:py-9">
            <h2 className="text-2xl font-medium normal-case leading-tight md:text-[2rem]" style={{ fontFamily: SERIF }}>Need Clarity on Your Land Tax Matters?</h2>
            <p className="mt-2 text-sm text-white/95 md:text-base">Speak with our team to understand your options before making your next property decision.</p>
            <button onClick={() => setModal('tax-advisor')} className="mt-5 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-[#2a1e00] shadow-md transition hover:-translate-y-0.5 hover:brightness-110" style={{ background: '#f5b82e' }}>
              Talk to a Tax Advisor <ArrowRight size={16} />
            </button>
            <p className="mt-6 flex items-start gap-2 text-[11px] leading-snug text-white/85 md:text-xs">
              <Info size={15} className="mt-px shrink-0" />
              Tax outcomes depend on individual facts and applicable law. Eligibility and benefits must be verified by a qualified tax professional.
            </p>
          </div>
        </section>
      </div>

      <LegalEnquiryModal mode={modal} onClose={() => setModal(null)} />
    </div>
  );
};

export default TaxOptimizer;
