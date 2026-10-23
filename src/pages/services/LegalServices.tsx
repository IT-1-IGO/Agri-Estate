import React from 'react';
import SEO from '../../components/SEO';
import HeroStage from '../../components/HeroStage';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldCheck, FileCheck, Scale, AlertCircle, CheckCircle2 } from 'lucide-react';

const LegalServices: React.FC = () => {
  const { language } = useLanguage();
  const nonEn = language !== 'en'; // Tamil/Hindi glyphs are taller: scale the banner type to keep its layout
  return (
    <div className="pb-24 min-h-screen bg-background pt-[76px]">
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
          provider: {
            '@type': 'Organization',
            name: 'IGO Agri Estates',
            url: 'https://www.igoagriestate.com'
          },
          areaServed: ['Tamil Nadu', 'Karnataka', 'Maharashtra']
        }}
      />
      {/* Hero banner: text-free artwork with live, translatable text (tablet/desktop); live text above a cropped image on mobile */}
      <section className="relative w-full bg-[#EEF3E6]" aria-labelledby="legal-hero-heading">
        <h1 id="legal-hero-heading" className="sr-only">Title Ledger & Legal Diligence</h1>
        <HeroStage src="/images/services/legal-hero-clean.webp" width={2172} height={724}>
          <div className="absolute" style={{ left: '5.6cqw', top: '5.1cqw', width: '44cqw' }}>
            <p className="flex items-center font-semibold uppercase" style={{ gap: '1cqw', fontSize: '0.95cqw', lineHeight: '1.6cqw', letterSpacing: '0.25em', color: '#0f4d3a' }}>
              <span aria-hidden="true" style={{ width: '2.6cqw', height: 1, background: '#0f4d3a' }} />
              Institutional Security
            </p>
            <p aria-hidden="true" className="font-medium normal-case" style={{ marginTop: '0.1cqw', fontFamily: '"DM Serif Display","Playfair Display",Georgia,"Times New Roman",serif', fontSize: nonEn ? '3.6cqw' : '5cqw', lineHeight: nonEn ? 1.18 : 1.02, color: '#0f4d3a' }}>
              Title Ledger &amp; <br /><span className="italic" style={{ color: '#a8741a' }}>Legal Diligence</span>
            </p>
            <p style={{ marginTop: '1.2cqw', maxWidth: '40cqw', fontSize: '1.18cqw', lineHeight: 1.45, color: '#3c5a52' }}>
              Secure your agricultural investments with our comprehensive legal framework. From 30-year encumbrance checks to Bio-CNG feasibility.
            </p>
          </div>
        </HeroStage>
        <div className="md:hidden">
          <div className="px-5 pb-5 pt-9 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#0f4d3a]">Institutional Security</p>
            <p aria-hidden="true" className="mt-3 text-[2.1rem] font-medium normal-case leading-[1.1] text-[#0f4d3a]" style={{ fontFamily: '"DM Serif Display","Playfair Display",Georgia,"Times New Roman",serif' }}>
              Title Ledger &amp; <span className="italic text-[#a8741a]">Legal Diligence</span>
            </p>
            <p className="mt-4 text-base leading-7 text-[#3c5a52]">
              Secure your agricultural investments with our comprehensive legal framework. From 30-year encumbrance checks to Bio-CNG feasibility.
            </p>
          </div>
          <img src="/images/services/legal-hero-clean.webp" alt="" aria-hidden="true" className="block h-[240px] w-full object-cover object-[80%_center] sm:h-[300px]" />
        </div>
      </section>

      <div className="container-pro pt-14">
        <div className="grid md:grid-cols-2 gap-10">
          {[
            { icon: <ShieldCheck size={32} />, title: 'Title Chain Verification', desc: 'Rigorous 30-year audit of EC, Patta, Chitta, and FMB sketches to ensure zero ownership disputes.' },
            { icon: <Scale size={32} />, title: 'Land Use Conversion', desc: 'Expert assistance in converting agricultural land for commercial or Bio-CNG industrial purposes.' },
            { icon: <FileCheck size={32} />, title: 'Sale Deed Drafting', desc: 'Institutional-grade contract drafting protecting both buyer and seller in high-value transactions.' },
            { icon: <AlertCircle size={32} />, title: 'Dispute Resolution', desc: 'Proactive legal mediation and boundary discrepancy resolution prior to listing.' }
          ].map((service, i) => (
            <div key={i} className="glass p-12 rounded-[40px] border-white/60 shadow-xl group hover:border-secondary/30 transition-all">
              <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">{service.title}</h3>
              <p className="text-text-muted leading-relaxed font-light">{service.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-primary rounded-[60px] p-16 text-center text-white relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-full h-full bg-topo opacity-5 pointer-events-none"></div>
           <h2 className="text-4xl font-bold mb-6 relative z-10">Request a Legal Audit</h2>
           <p className="text-white/60 mb-10 max-w-xl mx-auto relative z-10">Our institutional legal desk will review your prospective property documents within 48 hours.</p>
           <button className="btn-gold relative z-10">Consult Legal Expert</button>
        </div>
      </div>
    </div>
  );
};

export default LegalServices;
