import React, { useState } from 'react';
import SEO from '../components/SEO';
import LegalEnquiryModal, { LegalEnquiryMode } from '../components/services/LegalEnquiryModal';
import { submitLead } from '../lib/leadsService';
import {
  Calculator, Headset, MapPin, Layers, Milestone, Building2, Sprout, TrendingUp, Droplet, FileText, Maximize,
  Home, Search, BarChart3, Leaf, ArrowRight, ChartColumn, Check, CheckCircle2, Loader2, UserRound, BadgeCheck, ListChecks,
} from 'lucide-react';

const SERIF = '"DM Serif Display","Playfair Display",Georgia,"Times New Roman",serif';
const GREEN = '#0f3d28';

const DISTRICTS: Record<string, string[]> = {
  'Tamil Nadu': ['Chengalpattu', 'Kancheepuram', 'Tiruvallur', 'Vellore', 'Coimbatore', 'Erode', 'Salem', 'Madurai', 'Tiruchirappalli', 'Thanjavur', 'Krishnagiri', 'Dharmapuri'],
  Karnataka: ['Bengaluru Rural', 'Mysuru', 'Mandya', 'Tumakuru', 'Kolar', 'Ramanagara', 'Chikkaballapur', 'Hassan', 'Belagavi', 'Dharwad'],
  Maharashtra: ['Pune', 'Nashik', 'Satara', 'Sangli', 'Kolhapur', 'Raigad', 'Ahmednagar', 'Solapur', 'Nagpur'],
  'Andhra Pradesh': ['Chittoor', 'Tirupati', 'Nellore', 'Guntur', 'Krishna', 'Visakhapatnam', 'Anantapur', 'Kurnool'],
  Telangana: ['Rangareddy', 'Medchal-Malkajgiri', 'Sangareddy', 'Vikarabad', 'Medak', 'Nalgonda', 'Warangal', 'Karimnagar'],
  Kerala: ['Palakkad', 'Thrissur', 'Ernakulam', 'Idukki', 'Wayanad', 'Kottayam'],
};
const AREAS = ['Below 1 acre', '1 – 2 acres', '2 – 5 acres', '5 – 10 acres', '10 – 25 acres', 'Above 25 acres'];
const LAND_TYPES = ['Agricultural', 'Plantation', 'Horticulture', 'Industrial / Agri Infrastructure', 'Developed Farm Estate'];
const WATER = ['Borewell', 'Open well', 'Canal / River', 'Tank / Pond', 'Rain-fed only', 'No water source'];

const factors = [
  [MapPin, 'Location & Accessibility'], [Layers, 'Land Classification'],
  [Milestone, 'Road Connectivity'], [Building2, 'Nearby Infrastructure'],
  [Sprout, 'Soil Fertility'], [TrendingUp, 'Market Demand'],
  [Droplet, 'Water Availability'], [FileText, 'Legal Document Status'],
  [Maximize, 'Land Size'], [Home, 'Development Potential'],
] as const;

const types = [
  ['Agricultural Land', 'Valuation', '/images/services/valuation-type-1.jpg'],
  ['Plantation Land', 'Valuation', '/images/services/valuation-type-2.jpg'],
  ['Horticulture Farm', 'Valuation', '/images/services/valuation-type-3.jpg'],
  ['Industrial / Agri Infrastructure', 'Land Valuation', '/images/services/valuation-type-4.jpg'],
  ['Developed Farm Estate', 'Valuation', '/images/services/valuation-type-5.jpg'],
];

const steps = [
  { icon: FileText, label: 'Property Information Collection' },
  { icon: Search, label: 'Location and Market Research' },
  { icon: BarChart3, label: 'Comparable Land Price Analysis' },
  { icon: Sprout, label: 'Soil, Water and Infrastructure Assessment' },
  { icon: ListChecks, label: 'Final Valuation Report' },
];

const reportItems = ['Property Overview', 'Location Analysis', 'Market Comparable Prices', 'Soil & Water Assessment', 'Estimated Market Value'];

const Title: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <h2 className="flex items-center gap-2.5 text-xl font-medium normal-case md:text-[1.4rem]" style={{ fontFamily: SERIF, color: GREEN }}>
    {icon}{children}
  </h2>
);

const ValuationSimulator: React.FC = () => {
  const [modal, setModal] = useState<LegalEnquiryMode | null>(null);
  const [f, setF] = useState({ state: '', district: '', location: '', survey: '', area: '', type: 'Agricultural', road: 'Yes', water: '', name: '', phone: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k: string, v: string) => { setF((p) => ({ ...p, [k]: v, ...(k === 'state' ? { district: '' } : {}) })); setErrors((e) => ({ ...e, [k]: '' })); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!f.state) er.state = 'Select a state.';
    if (!f.district) er.district = 'Select a district.';
    if (f.location.trim().length < 2) er.location = 'Enter the location.';
    if (f.survey.trim().length < 1) er.survey = 'Enter the survey number.';
    if (!f.area) er.area = 'Select the land area.';
    if (!f.water) er.water = 'Select an option.';
    if (f.name.trim().length < 2) er.name = 'Enter your name.';
    if (!/^[6-9]\d{9}$/.test(f.phone.replace(/[\s-]/g, '').replace(/^(\+91|91)/, ''))) er.phone = 'Enter a valid 10-digit mobile number.';
    setErrors(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    try {
      await submitLead({
        type: 'requirement',
        name: f.name.trim(),
        phone: f.phone.trim(),
        preferred_state: f.state,
        location: `${f.location.trim()}, ${f.district}`,
        size: f.area,
        landType: f.type,
        waterSource: f.water,
        intent: 'Land Valuation',
        property_title: `Survey No. ${f.survey.trim()}`,
        notes: `Land valuation request\nState: ${f.state}\nDistrict: ${f.district}\nLocation: ${f.location}\nSurvey No: ${f.survey}\nArea: ${f.area}\nLand type: ${f.type}\nRoad access: ${f.road}\nWater: ${f.water}`,
      });
    } catch { /* lead service falls back to local storage */ }
    setBusy(false);
    setSent(true);
  };

  const field = (err?: string) =>
    `w-full rounded-md border bg-white px-3 py-2 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-[#1f6b3a]/25 ${err ? 'border-red-400' : 'border-slate-300 focus:border-[#1f6b3a]'}`;
  const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="mb-1 block text-[13px] font-semibold text-slate-800">{children}</span>;
  const Err: React.FC<{ k: string }> = ({ k }) => (errors[k] ? <span className="mt-0.5 block text-[11px] text-red-600">{errors[k]}</span> : null);

  return (
    <div className="min-h-screen pb-16 pt-[76px]" style={{ background: '#fbf6e9' }}>
      <SEO
        title="Agricultural Land Valuation India — Know the True Value of Your Land | IGO Agri Estate"
        description="Get a data-driven agricultural land valuation based on location, soil, infrastructure and market trends. Request a professional land valuation report from IGO Agri Estate experts."
        canonical="/valuation"
        keywords="agricultural land valuation India, farm land value, land valuation report, plantation land valuation, horticulture farm valuation, farm estate valuation, land value calculator"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: 'IGO Agricultural Land Valuation',
          url: 'https://www.igoagriestate.com/valuation',
          description: 'Data-driven agricultural land valuation based on location, soil, infrastructure and market trends',
          provider: { '@type': 'Organization', name: 'IGO Agri Estates', url: 'https://www.igoagriestate.com' },
        }}
      />

      {/* HERO */}
      <section className="relative isolate overflow-hidden" aria-labelledby="valuation-hero-heading"
        style={{ background: 'radial-gradient(ellipse at 6% 14%,#fde7b0 0%,rgba(253,231,176,0) 50%),linear-gradient(180deg,#dfe9d0 0%,#c6dd9c 55%,#7fb04a 100%)' }}>
        <img
          src="/images/services/valuation-page-hero-photo.jpg"
          alt="Land surveyor in a safety helmet holding a tablet while a drone maps green agricultural fields with digital boundary markers"
          width={2024}
          height={730}
          fetchPriority="high"
          className="absolute inset-y-0 right-0 -z-10 h-full w-full object-cover object-[78%_center] md:w-[66%] md:object-right"
          style={{ WebkitMaskImage: 'linear-gradient(90deg,transparent 0%,#000 16%)', maskImage: 'linear-gradient(90deg,transparent 0%,#000 16%)' }}
        />
        <div className="absolute inset-0 -z-10 md:hidden" style={{ background: 'linear-gradient(180deg,rgba(251,246,233,.95),rgba(251,246,233,.86))' }} />
        <div className="mx-auto max-w-[1360px] px-5 py-10 sm:px-8 md:py-12 lg:px-10 lg:py-14">
          <div className="max-w-[620px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#b9c98f] bg-[#eef3d6]/90 px-4 py-1.5 text-sm font-medium text-slate-800 shadow-sm">
              <MapPin size={18} style={{ color: GREEN }} /> Accurate • Reliable • Data-Driven
            </span>
            <h1 id="valuation-hero-heading" className="mt-5 font-semibold normal-case leading-[1.04] tracking-tight"
              style={{ fontFamily: SERIF, fontSize: 'clamp(2.3rem, 4.5vw, 4rem)', color: GREEN }}>
              Know the True<br />Value of Your Land
            </h1>
            <p className="mt-4 max-w-[470px] text-base font-medium leading-snug text-slate-900 md:text-[1.15rem]">
              Get a Data-Driven Agricultural Land Valuation Based on Location, Soil, Infrastructure and Market Trends.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#valuation-calculator" className="inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-125" style={{ background: GREEN }}>
                <Calculator size={18} /> Get Land Valuation <ArrowRight size={16} />
              </a>
              <button onClick={() => setModal('valuation-expert')} className="inline-flex items-center gap-2.5 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-md transition hover:-translate-y-0.5">
                <Headset size={18} /> Talk to Valuation Expert
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-6">
        {/* MAIN 4 COLUMNS */}
        <div className="grid gap-5 pt-7 md:grid-cols-2 xl:grid-cols-[minmax(0,1.12fr)_minmax(0,1.12fr)_minmax(0,0.96fr)_minmax(0,0.84fr)]">
          {/* Calculator */}
          <section id="valuation-calculator" className="scroll-mt-28 overflow-hidden rounded-xl bg-white/80 shadow-md md:col-span-2 xl:col-span-1">
            <h2 className="flex items-center gap-2.5 px-5 py-3 text-lg font-medium normal-case text-white" style={{ fontFamily: SERIF, background: 'linear-gradient(90deg,#1c5a24,#2c6a2c)' }}>
              <Calculator size={22} /> Land Valuation Calculator
            </h2>
            {sent ? (
              <div className="px-6 py-10 text-center">
                <CheckCircle2 size={50} className="mx-auto text-[#2e9b3f]" />
                <h3 className="mt-3 text-xl font-semibold normal-case" style={{ fontFamily: SERIF, color: GREEN }}>Valuation request received</h3>
                <p className="mt-2 text-sm text-slate-700">Our valuation experts will review your property details and share the estimated market value with you shortly.</p>
                <button onClick={() => { setSent(false); setF({ state: '', district: '', location: '', survey: '', area: '', type: 'Agricultural', road: 'Yes', water: '', name: '', phone: '' }); }} className="mt-5 rounded-full border border-[#1c5a24] px-5 py-2 text-sm font-semibold text-[#1c5a24] hover:bg-[#1c5a24] hover:text-white">New valuation</button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="grid grid-cols-2 gap-x-4 gap-y-3 p-5">
                <label><Label>State</Label>
                  <select className={field(errors.state)} value={f.state} onChange={(e) => set('state', e.target.value)}>
                    <option value="">Select State</option>{Object.keys(DISTRICTS).map((s) => <option key={s}>{s}</option>)}
                  </select><Err k="state" /></label>
                <label><Label>District</Label>
                  <select className={field(errors.district)} value={f.district} onChange={(e) => set('district', e.target.value)} disabled={!f.state}>
                    <option value="">Select District</option>{(DISTRICTS[f.state] || []).map((d) => <option key={d}>{d}</option>)}
                  </select><Err k="district" /></label>
                <label><Label>Location</Label>
                  <input className={field(errors.location)} placeholder="Enter Location" value={f.location} onChange={(e) => set('location', e.target.value)} /><Err k="location" /></label>
                <label><Label>Survey Number</Label>
                  <input className={field(errors.survey)} placeholder="Enter Survey Number" value={f.survey} onChange={(e) => set('survey', e.target.value)} /><Err k="survey" /></label>
                <label><Label>Land Area</Label>
                  <select className={field(errors.area)} value={f.area} onChange={(e) => set('area', e.target.value)}>
                    <option value="">Select Area</option>{AREAS.map((a) => <option key={a}>{a}</option>)}
                  </select><Err k="area" /></label>
                <label><Label>Land Type</Label>
                  <select className={field()} value={f.type} onChange={(e) => set('type', e.target.value)}>
                    {LAND_TYPES.map((a) => <option key={a}>{a}</option>)}
                  </select></label>
                <fieldset><Label>Road Access</Label>
                  <div className="flex items-center gap-5 pt-1.5 text-[13px] text-slate-800">
                    {['Yes', 'No'].map((v) => (
                      <label key={v} className="flex cursor-pointer items-center gap-1.5">
                        <input type="radio" name="road" checked={f.road === v} onChange={() => set('road', v)} className="h-4 w-4 accent-[#2e7d32]" /> {v}
                      </label>
                    ))}
                  </div></fieldset>
                <label><Label>Water Availability</Label>
                  <select className={field(errors.water)} value={f.water} onChange={(e) => set('water', e.target.value)}>
                    <option value="">Select Option</option>{WATER.map((a) => <option key={a}>{a}</option>)}
                  </select><Err k="water" /></label>
                <label><Label>Your Name</Label>
                  <input className={field(errors.name)} placeholder="Enter your name" value={f.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" /><Err k="name" /></label>
                <label><Label>Mobile Number</Label>
                  <input className={field(errors.phone)} placeholder="10-digit mobile" inputMode="tel" value={f.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" /><Err k="phone" /></label>
                <div className="col-span-2 mt-1 flex justify-center">
                  <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:brightness-125 disabled:opacity-70" style={{ background: GREEN }}>
                    {busy ? <Loader2 size={17} className="animate-spin" /> : <ChartColumn size={17} />} {busy ? 'Submitting…' : 'Calculate Land Value'}
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Factors */}
          <section className="rounded-xl bg-white/50 p-5">
            <Title icon={<TrendingUp size={26} style={{ color: '#2e7d32' }} />}>Factors Affecting Land Value</Title>
            <ul className="mt-4 grid grid-cols-1 gap-x-3 gap-y-3.5 sm:grid-cols-2">
              {[0, 2, 4, 6, 8].flatMap((i) => [factors[i], factors[i + 1]]).map(([Icon, label]) => (
                <li key={label} className="flex items-center gap-2.5 text-[13px] font-medium text-slate-800">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e5eed6]"><Icon size={18} style={{ color: '#1f6b3a' }} /></span>
                  {label}
                </li>
              ))}
            </ul>
          </section>

          {/* Types */}
          <section className="rounded-xl bg-white/50 p-5">
            <Title icon={<Layers size={26} style={{ color: GREEN }} />}>Types of Valuation</Title>
            <ul className="mt-4 space-y-2">
              {types.map(([a, b, img]) => (
                <li key={a} className="group flex items-center gap-3 rounded-md bg-white/80 p-1 pr-3 shadow-sm transition hover:shadow-md">
                  <img src={img} alt="" aria-hidden="true" width={380} height={200} loading="lazy" className="h-[50px] w-[95px] shrink-0 rounded object-cover" />
                  <span className="text-[13px] font-semibold leading-tight" style={{ fontFamily: SERIF, color: GREEN }}>{a}<br />{b}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Report preview */}
          <section className="rounded-xl bg-white/50 p-5 md:col-span-2 xl:col-span-1">
            <Title icon={<FileText size={24} style={{ color: GREEN }} />}>Valuation Report Preview</Title>
            <div className="relative mx-auto mt-5 max-w-[250px] pb-3 pt-1 xl:max-w-none">
              <div className="rounded-sm bg-white p-3.5 shadow-lg ring-1 ring-black/5 md:-rotate-[4deg]">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#1f6b3a]"><Leaf size={14} /> IGO Agri Estate</p>
                <p className="mt-2 text-[15px] font-semibold leading-tight" style={{ fontFamily: SERIF, color: GREEN }}>Land Valuation Report</p>
                <img src="/images/services/valuation-report-field.jpg" alt="" aria-hidden="true" width={900} height={320} loading="lazy" className="mt-2 h-[64px] w-full rounded-sm object-cover" />
                <ul className="mt-2.5 space-y-1.5">
                  {reportItems.map((t) => (
                    <li key={t} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#2e9b3f]"><Check size={9} strokeWidth={3.5} className="text-white" /></span>{t}
                    </li>
                  ))}
                </ul>
              </div>
              <span className="absolute -right-2 top-0 flex h-[76px] w-[76px] flex-col items-center justify-center rounded-full bg-gradient-to-b from-[#3f9a3a] to-[#1f6b2a] text-center text-[10px] font-bold leading-tight text-white shadow-lg ring-2 ring-white/70 xl:-right-3">
                <BadgeCheck size={22} /> Sample<br />Report
              </span>
            </div>
          </section>
        </div>

        {/* PROCESS + CTA */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_370px]">
          <section>
            <div className="flex items-center justify-center gap-3">
              <span aria-hidden className="hidden h-px flex-1 bg-[#0f3d28]/30 sm:block" />
              <Leaf size={20} style={{ color: '#2e7d32' }} />
              <h2 className="text-center text-2xl font-medium normal-case md:text-[1.9rem]" style={{ fontFamily: SERIF, color: GREEN }}>How We Calculate Land Value</h2>
              <Sprout size={20} style={{ color: '#2e7d32' }} />
              <span aria-hidden className="hidden h-px flex-1 bg-[#0f3d28]/30 sm:block" />
            </div>
            <ol className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3 xl:flex xl:items-start xl:justify-between">
              {steps.map(({ icon: Icon, label }, i) => (
                <React.Fragment key={label}>
                  <li className="flex items-start justify-center gap-2 xl:w-[150px]">
                    <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: '#17623a' }}>{i + 1}</span>
                    <span className="flex flex-col items-center text-center">
                      <Icon size={34} strokeWidth={1.5} style={{ color: GREEN }} />
                      <span className="mt-1.5 text-[0.9rem] font-semibold leading-tight" style={{ fontFamily: SERIF, color: GREEN }}>{label}</span>
                    </span>
                  </li>
                  {i < steps.length - 1 && <ArrowRight aria-hidden size={18} className="mt-5 hidden shrink-0 text-slate-700 xl:block" />}
                </React.Fragment>
              ))}
            </ol>
          </section>

          <aside className="flex items-center gap-4 self-start rounded-2xl p-5 text-white shadow-xl lg:self-center" style={{ background: GREEN }}>
            <UserRound size={68} strokeWidth={1.2} style={{ color: '#f2b92c' }} className="hidden shrink-0 sm:block" />
            <div>
              <h2 className="text-xl font-medium normal-case leading-tight" style={{ fontFamily: SERIF }}>Request Professional Valuation</h2>
              <p className="mt-1.5 text-xs leading-snug text-white/90">Get expert analysis for your land investment.</p>
              <button onClick={() => setModal('valuation-request')} className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-[#2a1e00] transition hover:-translate-y-0.5 hover:brightness-110" style={{ background: '#f5b82e' }}>
                Request a Valuation <ArrowRight size={14} />
              </button>
            </div>
          </aside>
        </div>
      </div>

      <LegalEnquiryModal mode={modal} onClose={() => setModal(null)} />
    </div>
  );
};

export default ValuationSimulator;
