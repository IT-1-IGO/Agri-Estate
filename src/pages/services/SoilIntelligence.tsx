import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import {
  ArrowRight, Check, Plus, Leaf, FlaskConical, FileText, Headset, Sprout, Network, Droplets,
  Wheat, HandHeart, Layers, BarChart3, ClipboardList, Lightbulb,
} from 'lucide-react';

const GREEN = '#14532d';
const ACCENT = '#4c9a1e';

const highlights = [
  { icon: FlaskConical, label: ['Advanced', 'Lab Analysis'] },
  { icon: FileText, label: ['Detailed', 'Soil Report'] },
  { icon: Headset, label: ['Expert', 'Guidance'] },
];

const whyCards = [
  { icon: Sprout, label: ['Understand', 'Soil Fertility'] },
  { icon: Network, label: ['Identify Nutrient', 'Deficiencies'] },
  { icon: Droplets, label: ['Check Soil pH', 'and Salinity'] },
  { icon: Wheat, label: ['Improve Crop', 'Selection'] },
  { icon: HandHeart, label: ['Avoid Unnecessary', 'Fertilizer Usage'] },
];

const tests = [
  'Soil pH – Acidity and Alkalinity',
  'Electrical Conductivity (EC) – Salinity Levels',
  'Nitrogen, Phosphorus and Potassium (NPK)',
  'Organic Carbon',
  'Secondary Nutrients and Micronutrients',
  'Soil Texture and Physical Properties',
];

const steps = [
  { icon: Layers, label: ['1. Soil Sample', 'Collection'] },
  { icon: FlaskConical, label: ['2. Laboratory', 'Analysis'] },
  { icon: BarChart3, label: ['3. Nutrient', 'Assessment'] },
  { icon: ClipboardList, label: ['4. Soil Health', 'Report'] },
  { icon: Lightbulb, label: ['5. Expert', 'Recommendations'] },
];

const receive = [
  'Detailed Soil Testing Report',
  'Nutrient Deficiency Analysis',
  'Fertilizer Recommendations',
  'Crop Suitability Guidance',
  'Soil Improvement Suggestions',
];

const faqs = [
  { q: 'How long does soil testing take?', a: 'Most reports are ready within a few working days of the sample reaching our laboratory.' },
  { q: 'How much soil is required?', a: 'Our team collects the sample from your land following the correct sampling method, so you do not need to prepare anything.' },
  { q: 'How often should soil be tested?', a: 'We recommend testing at least once a year, or before every new crop cycle.' },
  { q: 'Can soil testing identify suitable crops?', a: 'Yes. The report includes crop suitability guidance based on your soil’s nutrients, pH and texture.' },
];

const Heading: React.FC<{ a: string; b: string; c?: string; className?: string }> = ({ a, b, c, className = '' }) => (
  <h2 className={`font-extrabold normal-case tracking-tight ${className}`} style={{ color: GREEN }}>
    {a} <span style={{ color: ACCENT }}>{b}</span>{c ? ` ${c}` : ''}
  </h2>
);

const SoilIntelligence: React.FC = () => (
  <div className="min-h-screen bg-white pb-16 pt-[76px]">
    <SEO
      title="Soil Testing Services for Agricultural Land India | IGO Agri Estate"
      description="Professional soil testing for farmland: pH, salinity, NPK, organic carbon and micronutrients, with a detailed soil health report and expert recommendations."
      canonical="/services/soil"
      keywords="soil testing India, soil test farmland, NPK test, soil pH salinity test, soil health report, fertilizer recommendation, crop suitability"
      schema={{
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'IGO Soil Testing Services',
        url: 'https://www.igoagriestate.com/services/soil',
        description: 'Professional soil testing and agronomic recommendations for agricultural land',
        provider: { '@type': 'Organization', name: 'IGO Agri Estates', url: 'https://www.igoagriestate.com' },
        serviceType: 'Soil Testing',
        areaServed: ['Tamil Nadu', 'Karnataka', 'Maharashtra'],
      }}
    />

    {/* HERO */}
    <section
      className="relative isolate overflow-hidden"
      aria-labelledby="soil-hero-heading"
      style={{ background: 'linear-gradient(180deg,#cfe7f6 0%,#e8f3e0 55%,#9fd05a 100%)' }}
    >
      <img
        src="/images/services/soil-page-hero-photo.jpg"
        alt="Soil scientist in a lab coat examining a soil sample in a green field"
        width={1624}
        height={786}
        fetchPriority="high"
        className="absolute inset-y-0 right-0 -z-10 h-full w-full object-cover object-[75%_center] md:w-[54%] md:object-right"
        style={{ WebkitMaskImage: 'linear-gradient(90deg,transparent 0%,#000 28%)', maskImage: 'linear-gradient(90deg,transparent 0%,#000 28%)' }}
      />
      <div
        className="absolute inset-0 -z-10 md:hidden"
        style={{ background: 'linear-gradient(180deg,rgba(255,255,255,.88),rgba(255,255,255,.72))' }}
      />

      <div className="mx-auto max-w-[1280px] px-5 py-10 sm:px-8 md:py-12 lg:px-10 lg:py-14">
        <div className="max-w-[640px]">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-slate-800 shadow-sm">
            <Leaf size={16} style={{ color: ACCENT }} /> Soil Testing Services
          </span>
          <h1
            id="soil-hero-heading"
            className="mt-5 font-extrabold normal-case leading-[1.08] tracking-tight"
            style={{ fontSize: 'clamp(2.1rem, 4.2vw, 3.5rem)', color: GREEN }}
          >
            Know Your Soil.
            <br />
            <span style={{ color: ACCENT }}>Grow with Confidence.</span>
          </h1>
          <p className="mt-4 max-w-[520px] text-base font-medium leading-relaxed text-slate-800 md:text-lg">
            Understand your soil's health, nutrient levels, and agricultural potential through professional soil testing.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-md transition hover:brightness-110"
              style={{ background: '#1f7a1f' }}
            >
              Book Soil Testing <ArrowRight size={16} />
            </Link>
            <a
              href="#why-soil-testing"
              className="inline-flex items-center rounded-full border border-slate-800/70 bg-white/40 px-6 py-3 text-sm font-bold text-slate-900 transition hover:bg-white/80"
            >
              Learn More
            </a>
          </div>
          <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            {highlights.map(({ icon: Icon, label }, i) => (
              <li key={i} className="flex items-center gap-3 text-sm font-medium leading-tight text-slate-900">
                {i > 0 && <span aria-hidden className="hidden h-9 w-px bg-slate-400/60 sm:block" />}
                <Icon size={30} strokeWidth={1.6} />
                <span>{label[0]}<br />{label[1]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>

    <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
      {/* WHY */}
      <section id="why-soil-testing" className="scroll-mt-28 pt-10 text-center">
        <Heading a="Why" b="Soil Testing" c="Is Important?" className="text-2xl md:text-3xl" />
        <p className="mt-2 text-sm text-slate-700 md:text-base">
          Know more about your soil and make informed decisions for better yields.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {whyCards.map(({ icon: Icon, label }, i) => (
            <div
              key={i}
              className="flex items-center justify-center gap-3 rounded-xl bg-[#eef6e6] px-4 py-5 text-left text-sm font-medium leading-tight text-slate-800"
            >
              <Icon size={34} strokeWidth={1.5} style={{ color: ACCENT }} className="shrink-0" />
              <span>{label[0]}<br />{label[1]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT WE TEST + PROCESS */}
      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.05fr]">
        <div className="grid items-center gap-5 rounded-3xl bg-[#f6faf1] p-6 sm:grid-cols-[1fr_1fr] md:p-8">
          <div>
            <Heading a="What" b="We Test" className="text-2xl" />
            <ul className="mt-4 space-y-2.5">
              {tests.map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: '#2e9b3f' }}>
                    <Check size={13} strokeWidth={3} className="text-white" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <img
            src="/images/services/soil-page-hand.jpg"
            alt="Hands holding fresh soil in a green crop field"
            width={776}
            height={354}
            loading="lazy"
            className="h-full max-h-[260px] w-full rounded-2xl object-cover shadow-lg"
          />
        </div>

        <div className="flex flex-col justify-center rounded-3xl bg-[#f6faf1] p-6 md:p-8">
          <Heading a="Our Soil Testing" b="Process" className="text-2xl" />
          <ol className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 xl:flex xl:items-start xl:justify-between xl:gap-0">
            {steps.map(({ icon: Icon, label }, i) => (
              <React.Fragment key={i}>
                <li className="flex flex-col items-center text-center xl:w-[104px]">
                  <span
                    className="flex h-14 w-14 items-center justify-center rounded-full text-[#14532d]"
                    style={{ background: 'radial-gradient(circle at 35% 30%,#c9e9a0,#7cc243)' }}
                  >
                    <Icon size={26} strokeWidth={1.6} />
                  </span>
                  <span className="mt-3 text-xs font-medium leading-snug text-slate-700">
                    {label[0]}<br />{label[1]}
                  </span>
                </li>
                {i < steps.length - 1 && (
                  <ArrowRight aria-hidden size={18} className="mt-5 hidden shrink-0 text-slate-600 xl:block" />
                )}
              </React.Fragment>
            ))}
          </ol>
        </div>
      </section>

      {/* RECEIVE + FAQ + CTA */}
      <section className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_1fr_1fr]">
        <div className="rounded-3xl bg-[#f6faf1] p-6 md:p-8">
          <Heading a="What" b="You Receive" className="text-xl" />
          <div className="mt-4 flex items-end justify-between gap-3">
          <ul className="space-y-2.5">
            {receive.map((t) => (
              <li key={t} className="flex items-start gap-3 text-sm text-slate-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: '#2e9b3f' }}>
                  <Check size={13} strokeWidth={3} className="text-white" />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <img
            src="/images/services/soil-page-report.jpg"
            alt="Soil health report with a seedling growing from soil"
            width={474}
            height={312}
            loading="lazy"
            className="pointer-events-none hidden w-[150px] shrink-0 mix-blend-multiply sm:block"
          />
          </div>
        </div>

        <div className="py-2">
          <h2 className="text-xl font-extrabold normal-case tracking-tight text-slate-900">Frequently Asked Questions</h2>
          <div className="mt-4 space-y-2">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-lg bg-[#f3f6ef] px-4 py-2.5 text-sm text-slate-800">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium">
                  {f.q}
                  <Plus size={16} className="shrink-0 transition group-open:rotate-45" />
                </summary>
                <p className="pb-1 pt-2 text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div
          className="relative flex flex-col justify-center overflow-hidden rounded-3xl p-7 text-white md:p-8"
          style={{
            background:
              'linear-gradient(100deg,rgba(7,48,20,.96) 0%,rgba(14,70,28,.9) 55%,rgba(40,110,40,.8) 100%), repeating-linear-gradient(80deg,#2f7a2a 0 14px,#1d5a22 14px 28px)',
          }}
        >
          <h2 className="text-2xl font-extrabold normal-case leading-tight tracking-tight">
            Book Your<br />
            <span style={{ color: '#a6e06a' }}>Soil Testing Service</span> Today!
          </h2>
          <p className="mt-3 text-sm text-white/90">Get expert insights for healthier soil and higher yields.</p>
          <Link
            to="/contact"
            className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-900 shadow transition hover:bg-[#eaf6dc]"
          >
            Contact Us <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  </div>
);

export default SoilIntelligence;
