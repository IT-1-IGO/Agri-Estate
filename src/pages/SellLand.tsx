import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, ClipboardList, MapPinned, Scale, Banknote, FileSignature, Loader2, Handshake, IndianRupee, ShieldCheck, Users, ArrowRight, Sprout, Phone } from 'lucide-react';
import SEO from '../components/SEO';
import SellProcessSection from '../components/home/SellProcessSection';
import { submitLead } from '../lib/leadsService';

const STEPS = [
  { Icon: ClipboardList, title: 'Share your land', text: 'Tell us location, size and survey details through the form below.' },
  { Icon: MapPinned, title: 'Site verification', text: 'An IGO team visits the land to check access, soil, water and boundaries.' },
  { Icon: Scale, title: 'Legal check', text: 'Our legal team reviews the title, encumbrances and land records.' },
  { Icon: Banknote, title: 'Valuation and offer', text: 'You receive a transparent market-based offer for your land.' },
  { Icon: FileSignature, title: 'Agreement and payment', text: 'Registration is completed and payment is made directly to you.' },
];

const HERO_BENEFITS = [
  { Icon: Handshake, label: 'Fair & Transparent Deal' },
  { Icon: IndianRupee, label: 'Best Market Value' },
  { Icon: ShieldCheck, label: 'Hassle-Free & Secure Process' },
  { Icon: Users, label: 'Professional Support End-to-End' },
];

const LAND_TYPES = ['Agricultural (dry)', 'Agricultural (irrigated)', 'Plantation / orchard', 'Farm with structures', 'Other'];

const inputCls = 'w-full rounded-xl border border-[#cfdcc0] bg-white shadow-sm px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#1B5E20]';

const SellLand: React.FC = () => {
  const reduce = !!useReducedMotion();
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [form, setForm] = useState({ name: '', phone: '', email: '', location: '', size: '', landType: LAND_TYPES[0], waterSource: '', budget: '', notes: '' });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending');
    try {
      await submitLead({
        type: 'requirement',
        intent: 'Sell Land to IGO',
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        location: form.location,
        size: form.size,
        landType: form.landType,
        waterSource: form.waterSource || undefined,
        budget: form.budget || undefined,
        notes: `[SELL LAND TO IGO] ${form.notes}`.trim(),
      });
      setState('done');
    } catch {
      setState('error');
    }
  };

  return (
    <main className="bg-background pt-20 pb-0">
      <SEO
        title="Sell Your Land to IGO | Direct Land Purchase"
        description="Sell your agricultural land directly to IGO Group. Free site visit, legal verification and a transparent offer, with no brokers."
        canonical="/sell-land"
      />
      {/* Hero: the supplied banner is cropped to its artwork (heading, categories, land split) at a controlled height; its benefits bar and button are live below it */}
      <section aria-labelledby="sell-hero-heading" className="bg-[#F7F8EE] pb-2 md:pb-4">
        <h1 id="sell-hero-heading" className="sr-only">Sell your land to IGO</h1>

        {/* Tablet and desktop */}
        <div className="mx-auto hidden w-full max-w-[1415px] overflow-hidden md:block lg:rounded-b-[28px]">
          <motion.img
            src="/images/sell-land-hero-top.webp"
            alt="Sell your land to us. Looking to sell your land? We buy both agricultural land and general land for the right value."
            width={1600}
            height={588}
            fetchPriority="high"
            className="block h-auto w-full"
            initial={reduce ? false : { scale: 1.03 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        {/* Mobile: live text over the land photo so nothing is clipped */}
        <div className="md:hidden">
          <div className="px-5 pb-4 pt-7 sm:px-8">
            <p className="text-[2.15rem] font-extrabold italic normal-case leading-[1.05] tracking-tight text-[#0f4d24]">
              Sell Your<br />Land{' '}
              <span className="ml-1 inline-block -skew-x-6 rounded-lg bg-gradient-to-r from-[#0f5a2a] to-[#2a8a3a] px-3 py-0.5 text-white shadow-[0_3px_0_#8bd04a]">to Us</span>
            </p>
            <p className="mt-4 text-lg font-bold text-[#10231D]">Looking to sell your Land?</p>
            <p className="mt-1 border-l-[3px] border-[#4fa83d] pl-3 text-[0.95rem] leading-snug text-[#274a3d]">We buy both Agricultural Land and General Land for the right value.</p>
            <ul className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-[#F6F1DF] p-2 shadow-sm">
              <li className="flex items-center gap-2 px-2 py-1.5 text-[0.8rem] font-semibold leading-tight text-[#10231D]"><Sprout size={22} className="shrink-0 text-[#2a8a3a]" aria-hidden="true" />Agricultural Land</li>
              <li className="flex items-center gap-2 border-l border-[#0f4d24]/15 px-2 py-1.5 text-[0.8rem] font-semibold leading-tight text-[#10231D]"><MapPinned size={22} className="shrink-0 text-[#2a8a3a]" aria-hidden="true" />General / Non-Agricultural Land</li>
            </ul>
          </div>
          <img src="/images/sell-land-hero-top.webp" alt="" aria-hidden="true" width={1600} height={588} className="block h-[190px] w-full object-cover object-[78%_center] sm:h-[240px]" />
        </div>

        {/* Benefits bar + call to action */}
        <div className="mx-auto mt-3 w-full max-w-[1440px] px-4 sm:px-6 md:mt-4 lg:px-8">
          <div className="grid grid-cols-2 items-center gap-x-2 gap-y-4 rounded-[26px] border border-[#e6dfc7] bg-[#FBF8EE] px-3 py-4 shadow-[0_14px_34px_-24px_rgba(15,77,36,0.4)] md:grid-cols-4 lg:grid-cols-[repeat(4,1fr)_auto] lg:gap-x-3 lg:px-6">
            {HERO_BENEFITS.map(({ Icon, label }, i) => (
              <div key={label} className={`flex flex-col items-center gap-1.5 px-2 text-center ${i > 0 ? 'lg:border-l lg:border-[#0f4d24]/12' : ''}`}>
                <Icon size={26} strokeWidth={1.7} className="text-[#2a8a3a]" aria-hidden="true" />
                <span className="text-[0.82rem] font-semibold leading-tight text-[#0f4d24] sm:text-[0.9rem]">{label}</span>
              </div>
            ))}
            <a
              href="#sell-form"
              onClick={(e) => { const f = document.getElementById('sell-form'); if (f) { e.preventDefault(); f.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); } }}
              className="group col-span-2 mx-auto inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#0f4d24] to-[#1a6b32] py-2 pl-2 pr-2 text-[1rem] font-bold normal-case tracking-normal text-white shadow-[0_10px_24px_-12px_rgba(15,77,36,0.8)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-12px_rgba(15,77,36,0.85)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9bd68a] md:col-span-4 lg:col-span-1 lg:mx-0 lg:ml-3"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0f4d24]"><Phone size={18} aria-hidden="true" /></span>
              <span className="pr-1">Sell Your Land Now</span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e4f27a] text-[#0f4d24] transition-transform duration-300 group-hover:translate-x-1"><ArrowRight size={18} aria-hidden="true" /></span>
            </a>
          </div>
        </div>
      </section>
      <SellProcessSection />
      <div className="relative overflow-hidden bg-gradient-to-b from-[#FAF6EA] via-[#F3F4E6] to-[#E6EDD9] pb-20 pt-6 md:pb-24">
      <div className="container-pro relative">
        <section id="sell-form" aria-labelledby="form-heading" className="max-w-3xl mx-auto rounded-3xl bg-gradient-to-br from-[#F4F7EA] via-[#EEF3E1] to-[#E5EDD4] border border-[#d5e1c3] shadow-[0_30px_60px_-30px_rgba(15,77,36,0.35)] p-6 md:p-10">
          <h2 id="form-heading" className="text-2xl md:text-3xl text-[#0f4d24]">Tell us about your land</h2>
          {state === 'done' ? (
            <div role="status" className="mt-6 flex items-start gap-3 rounded-2xl bg-[#eaf4e6] p-5 text-[#0f4d24]">
              <CheckCircle2 className="shrink-0" />
              <p>Thank you. The IGO land team will call you within one working day to arrange a site visit.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 grid sm:grid-cols-2 gap-4">
              <label className="block">Your name<input required className={inputCls} value={form.name} onChange={set('name')} autoComplete="name" /></label>
              <label className="block">Phone<input required type="tel" className={inputCls} value={form.phone} onChange={set('phone')} autoComplete="tel" /></label>
              <label className="block">Email (optional)<input type="email" className={inputCls} value={form.email} onChange={set('email')} autoComplete="email" /></label>
              <label className="block">Land location<input required className={inputCls} value={form.location} onChange={set('location')} placeholder="Village, taluk, district" /></label>
              <label className="block">Land size<input required className={inputCls} value={form.size} onChange={set('size')} placeholder="e.g. 5 acres" /></label>
              <label className="block">Land type
                <select className={inputCls} value={form.landType} onChange={set('landType')}>{LAND_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
              </label>
              <label className="block">Water source<input className={inputCls} value={form.waterSource} onChange={set('waterSource')} placeholder="Borewell, canal, river..." /></label>
              <label className="block">Expected price (optional)<input className={inputCls} value={form.budget} onChange={set('budget')} /></label>
              <label className="block sm:col-span-2">Anything else we should know<textarea rows={3} className={inputCls} value={form.notes} onChange={set('notes')} /></label>
              {state === 'error' && <p role="alert" className="sm:col-span-2 text-red-700">Something went wrong. Please try again or call +91 73977 89803.</p>}
              <button type="submit" disabled={state === 'sending'} className="sm:col-span-2 rounded-full bg-[#1B5E20] text-white px-8 py-3 font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60">
                {state === 'sending' && <Loader2 className="animate-spin" size={18} />} Submit for valuation
              </button>
            </form>
          )}
        </section>
      </div>
      </div>
    </main>
  );
};

export default SellLand;
