import React, { useState } from 'react';
import SEO from '../../components/SEO';
import LegalEnquiryModal, { LegalEnquiryMode } from '../../components/services/LegalEnquiryModal';
import {
  ShieldCheck, FileCheck2, FileText, Scale, MapPin, Layers, Handshake, Search, FolderOpen, Check,
  Leaf, Sprout, ArrowRight, FileSearch, TriangleAlert, UserRound,
} from 'lucide-react';

const SERIF = '"DM Serif Display","Playfair Display",Georgia,"Times New Roman",serif';
const GREEN = '#0f3d28';
const GOLD = '#a8741a';

const services = [
  { icon: FileCheck2, title: 'Title Verification', desc: ['Confirm ownership', 'and history'] },
  { icon: FileText, title: 'Patta & Chitta Verification', desc: ['Validate land records'] },
  { icon: ShieldCheck, title: 'Encumbrance Certificate (EC) Analysis', desc: ['Check legal liabilities'] },
  { icon: Scale, title: 'Parent Document Verification', desc: ['Trace ownership chain'] },
  { icon: MapPin, title: 'Survey & Boundary Verification', desc: ['Confirm exact boundaries'] },
  { icon: Layers, title: 'Land Classification', desc: ['Know your land type'] },
  { icon: Handshake, title: 'Registration Assistance', desc: ['Support for sale deed &', 'registration'] },
  { icon: Search, title: 'Legal Due Diligence', desc: ['Identify legal risks'] },
];

const documents = ['Sale Deed', 'Parent Document', 'Patta / Chitta', 'Encumbrance Certificate', 'FMB Sketch', 'A-Register Extract', 'Survey Number', 'Owner ID Proof'];

const steps = [
  { icon: FileText, label: ['Document', 'Collection'] },
  { icon: FileSearch, label: ['Document', 'Review'] },
  { icon: ShieldCheck, label: ['Ownership', 'Verification'] },
  { icon: TriangleAlert, label: ['Risk Assessment'] },
  { icon: FileText, label: ['Final Report'] },
];

const SectionTitle: React.FC<{ children: React.ReactNode; leafRight?: boolean }> = ({ children, leafRight = true }) => (
  <div className="flex items-center justify-center gap-3">
    <span aria-hidden className="hidden h-px flex-1 bg-[#0f3d28]/30 sm:block" />
    <Leaf size={22} style={{ color: '#2e7d32' }} className="shrink-0" />
    <h2 className="text-center text-2xl font-medium normal-case md:text-[2rem]" style={{ fontFamily: SERIF, color: GREEN }}>{children}</h2>
    {leafRight ? <Sprout size={22} style={{ color: '#2e7d32' }} className="shrink-0" /> : null}
    <span aria-hidden className="hidden h-px flex-1 bg-[#0f3d28]/30 sm:block" />
  </div>
);

const LegalServices: React.FC = () => {
  const [mode, setMode] = useState<LegalEnquiryMode | null>(null);

  return (
    <div className="min-h-screen pb-16 pt-[76px]" style={{ background: '#fbf6e9' }}>
      <SEO
        title="Agricultural Land Legal Services India — Title Verification & Due Diligence"
        description="IGO Agri Estates provides comprehensive legal due diligence for agricultural land purchases across India. 30-year encumbrance checks, title chain verification, survey, tax, and registration support in Tamil Nadu, Karnataka, Maharashtra, Andhra Pradesh & Telangana."
        canonical="/services/legal"
        keywords="agricultural land legal services India, title verification farm land India, land due diligence India, encumbrance check agri land, farm land legal check Karnataka, agri estate title search Andhra Pradesh, how to verify agricultural land title India, land document check Hyderabad, farm land registration Tamil Nadu"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'LegalService',
          name: 'IGO Agri Estates Legal Due Diligence',
          url: 'https://www.igoagriestate.com/services/legal',
          description: 'Comprehensive legal verification and title due diligence for agricultural land in India',
          provider: { '@type': 'Organization', name: 'IGO Agri Estates', url: 'https://www.igoagriestate.com' },
          areaServed: ['Tamil Nadu', 'Karnataka', 'Maharashtra'],
        }}
      />

      {/* HERO */}
      <section
        className="relative isolate overflow-hidden"
        aria-labelledby="legal-hero-heading"
        style={{ background: 'radial-gradient(ellipse at 8% 18%,#fbe7b5 0%,rgba(251,231,181,0) 55%),linear-gradient(180deg,#e9dcc0 0%,#efe6c8 30%,#a9cc6c 62%,#6fa23c 100%)' }}
      >
        <img
          src="/images/services/legal-page-hero-photo.jpg"
          alt="Wooden judge's gavel, golden scales of justice, law books, a miniature house and land documents on a desk before green farmland"
          width={2024}
          height={840}
          fetchPriority="high"
          className="absolute inset-y-0 right-0 -z-10 h-full w-full object-cover object-[70%_center] md:w-[66%] md:object-right"
          style={{ WebkitMaskImage: 'linear-gradient(90deg,transparent 0%,#000 18%)', maskImage: 'linear-gradient(90deg,transparent 0%,#000 18%)' }}
        />
        <div className="absolute inset-0 -z-10 md:hidden" style={{ background: 'linear-gradient(180deg,rgba(251,246,233,.9),rgba(251,246,233,.75))' }} />

        <div className="mx-auto max-w-[1360px] px-5 py-10 sm:px-8 md:py-12 lg:px-10 lg:py-14">
          <div className="max-w-[640px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#b9c98f] bg-[#f4f1d8]/90 px-4 py-1.5 text-sm font-medium text-slate-800 shadow-sm">
              <ShieldCheck size={18} style={{ color: GREEN }} /> Trusted • Transparent • Secure
            </span>
            <h1
              id="legal-hero-heading"
              className="mt-5 font-semibold normal-case leading-[1.02] tracking-tight"
              style={{ fontFamily: SERIF, fontSize: 'clamp(2.3rem, 4.4vw, 3.9rem)', color: GREEN }}
            >
              Agricultural Land
              <br />
              Legal Services
            </h1>
            <p className="mt-4 max-w-[480px] text-lg font-medium leading-snug text-slate-900 md:text-[1.35rem]">
              Secure Your Land Investment with Complete Legal Clarity.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => setMode('consultation')}
                className="inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-125"
                style={{ background: GREEN }}
              >
                <Scale size={18} /> Get Legal Consultation <ArrowRight size={16} />
              </button>
              <button
                onClick={() => setMode('verify')}
                className="inline-flex items-center gap-2.5 rounded-full border border-[#d9c27a] bg-[#fdf6dc] px-6 py-3 text-sm font-semibold text-slate-900 shadow-md transition hover:-translate-y-0.5 hover:bg-white"
              >
                <FileText size={18} /> Verify Your Property
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <div className="relative mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-6">
        <div className="grid gap-8 pt-9 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            <SectionTitle>Our Legal Services</SectionTitle>
            <p className="mt-2 text-center text-sm text-slate-800 md:text-base">Comprehensive legal support for your agricultural land</p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {services.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="group flex min-h-[116px] flex-col items-center justify-start rounded-lg border border-transparent bg-white/70 px-3 py-3.5 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#d9c27a] hover:bg-white hover:shadow-lg"
                >
                  <Icon size={30} strokeWidth={1.5} style={{ color: GREEN }} className="transition-transform duration-300 group-hover:scale-110" />
                  <h3 className="mt-1.5 text-[0.95rem] font-semibold normal-case leading-tight" style={{ fontFamily: SERIF, color: GREEN }}>{title}</h3>
                  <p className="mt-1 text-xs leading-snug text-slate-700">{desc.map((d, i) => (<React.Fragment key={i}>{i > 0 && <br />}{d}</React.Fragment>))}</p>
                </div>
              ))}
            </div>

            {/* PROCESS */}
            <div className="mt-9">
              <SectionTitle leafRight>Our Legal Verification Process</SectionTitle>
              <ol className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3 xl:flex xl:items-start xl:justify-around">
                {steps.map(({ icon: Icon, label }, i) => (
                  <React.Fragment key={i}>
                    <li className="flex items-start justify-center gap-2 xl:w-[150px]">
                      <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: '#17623a' }}>{i + 1}</span>
                      <span className="flex flex-col items-center text-center">
                        <Icon size={34} strokeWidth={1.5} style={{ color: GREEN }} />
                        <span className="mt-1 text-[0.95rem] font-semibold leading-tight" style={{ fontFamily: SERIF, color: GREEN }}>
                          {label.map((l, k) => (<React.Fragment key={k}>{k > 0 && <br />}{l}</React.Fragment>))}
                        </span>
                      </span>
                    </li>
                    {i < steps.length - 1 && <ArrowRight aria-hidden size={18} className="mt-4 hidden shrink-0 text-slate-700 xl:block" />}
                  </React.Fragment>
                ))}
              </ol>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <aside className="flex flex-col gap-5">
            <div className="relative overflow-hidden rounded-3xl border border-[#d6e3c1] p-6" style={{ background: 'linear-gradient(160deg,#eef4df,#e4eed0)' }}>
              <FileText aria-hidden size={150} strokeWidth={0.8} className="pointer-events-none absolute -right-14 top-12 rotate-6 text-[#0f3d28]/10" />
              <h2 className="flex items-center gap-3 text-xl font-medium normal-case" style={{ fontFamily: SERIF, color: GREEN }}>
                <FolderOpen size={26} /> Documents Required
              </h2>
              <ul className="relative mt-4 space-y-2.5">
                {documents.map((d) => (
                  <li key={d} className="flex items-center gap-3 text-sm text-slate-800">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: '#2e9b3f' }}>
                      <Check size={13} strokeWidth={3} className="text-white" />
                    </span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-4 rounded-2xl p-5 text-white shadow-xl" style={{ background: GREEN }}>
              <UserRound size={64} strokeWidth={1.2} style={{ color: '#f2b92c' }} className="hidden shrink-0 sm:block" />
              <div>
                <h2 className="text-lg font-medium normal-case leading-tight" style={{ fontFamily: SERIF }}>Get Expert Legal Support</h2>
                <p className="mt-1 text-xs leading-snug text-white/90">Consult with our legal experts for hassle-free land transactions.</p>
                <button
                  onClick={() => setMode('request')}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-[#2a1e00] transition hover:-translate-y-0.5 hover:brightness-110"
                  style={{ background: '#f5b82e' }}
                >
                  Request a Consultation <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <LegalEnquiryModal mode={mode} onClose={() => setMode(null)} />
    </div>
  );
};

export default LegalServices;
