import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Settings,
  Clock,
  ShieldCheck,
  Sprout,
  IndianRupee,
  Handshake,
  RefreshCw,
  Scale,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  Droplet,
  Sun,
} from 'lucide-react';
import SEO from '../components/SEO';
import { usePublishedCollection, usePublishedDoc } from '../admin/store';
import { resolveMedia } from '../admin/store';
import { LEGAL_SEED, SOIL_SEED } from '../data/siteContent';
import { useLanguage } from '../context/LanguageContext';
import HeroStage from '../components/HeroStage';
import ValuationContent from '../components/services/ValuationContent';
import TaxOptimizerContent from '../components/services/TaxOptimizerContent';

const EASE = [0.22, 1, 0.36, 1] as const;
const SERIF = '"DM Serif Display","Playfair Display",Georgia,"Times New Roman",serif';

const GREEN = '#124B3B';
const INK = '#123C37';
const MUTED = '#4F6A66';

const AMC_BENEFITS = [
  { Icon: Settings, label: 'Regular Maintenance' },
  { Icon: Clock, label: 'Quick Support' },
  { Icon: ShieldCheck, label: 'Improved Performance' },
  { Icon: Sprout, label: 'Longer Equipment Life' },
];

const BUYBACK_BENEFITS = [
  { Icon: IndianRupee, label: 'Fair Valuation' },
  { Icon: Handshake, label: 'Transparent Process' },
  { Icon: RefreshCw, label: 'Hassle-Free Experience' },
  { Icon: ShieldCheck, label: 'Trusted Partnership' },
];

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: GREEN }}>
    <span className="h-px w-8" style={{ background: GREEN }} aria-hidden="true" />
    {children}
  </p>
);

const Benefits: React.FC<{ items: { Icon: typeof Settings; label: string }[]; compact?: boolean }> = ({ items, compact }) => (
  <ul className={`${compact ? 'mt-5' : 'mt-7'} grid grid-cols-2 gap-y-6 sm:grid-cols-4 sm:gap-y-0`}>
    {items.map(({ Icon, label }, i) => (
      <li
        key={label}
        className={`flex flex-col items-start ${compact ? 'gap-2' : 'gap-3'} px-0 ${compact ? 'sm:px-3' : 'sm:px-4'} sm:first:pl-0 ${i > 0 ? 'sm:border-l sm:border-[#124B3B]/15' : ''}`}
      >
        <span className={`flex items-center justify-center rounded-full bg-[#D5E6CF] ${compact ? 'h-12 w-12' : 'h-14 w-14'}`} style={{ color: GREEN }}>
          <Icon size={compact ? 22 : 26} strokeWidth={1.7} aria-hidden="true" />
        </span>
        <span className={`${compact ? 'text-[14.5px]' : 'text-[15px]'} leading-snug`} style={{ color: INK }}>{label}</span>
      </li>
    ))}
  </ul>
);

const CtaButton: React.FC<{ to: string; children: React.ReactNode; compact?: boolean }> = ({ to, children, compact }) => (
  <Link
    to={to}
    className={`group/btn ${compact ? 'mt-6 gap-3 px-7 py-3 text-[15px]' : 'mt-8 gap-3 px-7 py-3 text-[15px]'} inline-flex items-center rounded-full font-semibold normal-case tracking-normal text-white shadow-[0_10px_24px_-12px_rgba(18,75,59,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0d3a2d] hover:shadow-[0_16px_28px_-12px_rgba(18,75,59,0.75)]`}
    style={{ background: GREEN }}
  >
    {children}
    <ArrowRight size={compact ? 18 : 18} className="transition-transform duration-300 group-hover/btn:translate-x-1" aria-hidden="true" />
  </Link>
);

const Badge: React.FC<{ children: React.ReactNode; Icon: typeof ShieldCheck; className?: string }> = ({ children, Icon, className = '' }) => (
  <span
    className={`absolute flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium leading-tight text-white shadow-lg ${className}`}
    style={{ background: GREEN }}
  >
    <Icon size={30} strokeWidth={1.5} aria-hidden="true" />
    <span>{children}</span>
  </span>
);

const LEGAL_SERVICES = [
  {
    Icon: ShieldCheck,
    title: 'Land Title Verification',
    text: 'We conduct thorough verification of land ownership records, survey documents, encumbrances and legal history to help you make informed investment decisions and reduce the risk of property disputes.',
    image: '/images/services/legal-title-records.webp',
    alt: 'Land records document with a pen on a desk overlooking green farmland',
    features: [
      { title: 'Owner Due Diligence', text: 'Verify ownership details and identify potential discrepancies.' },
      { title: 'Survey Record Check', text: 'Review survey numbers, patta and relevant land records.' },
      { title: 'Legal History Review', text: 'Check available records for encumbrances and potential disputes.' },
    ],
  },
  {
    Icon: Scale,
    title: 'Land Use & Conversion',
    text: 'Get expert guidance on land-use classification, conversion requirements and applicable approvals for agricultural, commercial and estate development projects. We help you understand the regulatory process and prepare the necessary documentation.',
    image: '/images/services/legal-land-use.webp',
    alt: 'Aerial view of farmland plots with a map pin and boundary lines',
    features: [
      { title: 'Land-Use Classification', text: 'Understand permitted and restricted land uses.' },
      { title: 'Conversion Process Guidance', text: 'Get assistance with documentation and application procedures.' },
      { title: 'Government Approval Assistance', text: 'Guidance on applicable permissions and regulatory requirements.' },
    ],
  },
  {
    Icon: FileCheck,
    title: 'Estate Documentation',
    text: 'We help prepare and organize essential property documents, agreements and sale deeds to support transparent transactions and simplify the documentation process from start to finish.',
    image: '/images/services/legal-sale-deed.webp',
    alt: 'Sale deed document with a pen and a small model house',
    features: [
      { title: 'Sale & Purchase Agreements', text: 'Support for preparing transaction-related documents.' },
      { title: 'Title Deeds', text: 'Organize ownership and property transfer records.' },
      { title: 'Legal Documentation Support', text: 'Assistance with supporting documents and paperwork.' },
    ],
  },
  {
    Icon: AlertCircle,
    title: 'Boundary & Dispute Support',
    text: 'We assist with land boundary clarification, survey discrepancies and coordination with relevant professionals to help address land-related disputes effectively. Our goal is to promote clarity, transparency and confidence in your property decisions.',
    image: '/images/services/legal-boundary-survey.webp',
    alt: 'Surveying instrument on a tripod in a field with boundary markings',
    features: [
      { title: 'Boundary Verification', text: 'Help clarify property boundaries and survey details.' },
      { title: 'Survey Coordination', text: 'Coordinate with appropriate surveying professionals when required.' },
      { title: 'Dispute Resolution Assistance', text: 'Support the process of addressing land-related discrepancies.' },
    ],
  },
];

const SOIL_SERVICES = [
  {
    Icon: Sprout,
    title: 'NPK Audits',
    text: 'Detailed Nitrogen, Phosphorus, and Potassium profiling to assess soil fertility and recommend the right nutrient plan for better yields.',
    image: '/images/services/soil-npk.webp',
    alt: 'Gloved hand holding soil beside sample vials and a soil test kit in a green field',
    features: [
      { title: 'Soil Sampling', text: 'Collect and analyze representative soil samples.' },
      { title: 'Nutrient Analysis', text: 'Measure NPK and other essential soil nutrients.' },
      { title: 'Fertilizer Recommendation', text: 'Get customized nutrient plans for improved productivity.' },
    ],
  },
  {
    Icon: Droplet,
    title: 'Water Viability',
    text: 'Borewell yield testing and watershed mapping to assess reliable water availability and sustainable water usage for your land.',
    image: '/images/services/soil-water.webp',
    alt: 'Water flowing from a borewell outlet in a rural agricultural landscape',
    features: [
      { title: 'Borewell Yield Testing', text: 'Measure water discharge and quality.' },
      { title: 'Watershed Mapping', text: 'Identify water flow and recharge zones.' },
      { title: 'Water Availability Report', text: 'Assess water resources for sustainable agricultural planning.' },
    ],
  },
  {
    Icon: Sun,
    title: 'Climate Mapping',
    text: 'Micro-climate analysis for high-yield horticulture. Understand temperature, rainfall, humidity, and local conditions to plan crops and maximize productivity.',
    image: '/images/services/soil-climate.webp',
    alt: 'Drone flying over crop rows in an agricultural field under a clear sky',
    features: [
      { title: 'Weather Patterns', text: 'Analyze temperature, rainfall, and humidity.' },
      { title: 'Micro-climate Data', text: 'Assess local environmental conditions for each crop.' },
      { title: 'Crop Suitability', text: 'Recommend suitable crops based on climate and land conditions.' },
    ],
  },
];

type CardItem = { Icon: any; title: string; text: string; image: string; alt: string; features: { title: string; text: string }[] };
// Cards come from the admin panel (Services / Land & Soil). Until edited there they equal the built-in cards.
const useCards = (name: string, seed: typeof LEGAL_SEED, base: any[], DefaultIcon: any): CardItem[] => {
  const stored = usePublishedCollection(name, seed);
  return stored.map((c) => {
    const idx = Number(String(c.id).split('-')[1]);
    const b = String(c.id).startsWith(name.endsWith('legal') ? 'legal-' : 'soil-') ? base[idx] : undefined;
    const feats = (Array.isArray(c.features) ? (c.features as string[]) : []).map((l) => {
      const [t, ...r] = String(l).split('|');
      return { title: t.trim(), text: r.join('|').trim() };
    });
    return { Icon: b?.Icon || DefaultIcon, title: String(c.title || ''), text: String(c.text || ''), image: resolveMedia(c.image, b?.image || ''), alt: String(c.alt || c.title || ''), features: feats };
  });
};

const Services: React.FC = () => {
  const legalCards = useCards('services.legal', LEGAL_SEED, LEGAL_SERVICES, ShieldCheck);
  const soilCards = useCards('services.soil', SOIL_SEED, SOIL_SERVICES, Sprout);
  const doc = usePublishedDoc('services') as Record<string, string | undefined>;
  const t = (k: string, d: string) => (doc[k] && String(doc[k]).trim() ? String(doc[k]) : d); // blank in admin = built-in text
  const { language } = useLanguage();
  const nonEn = language !== 'en'; // Tamil/Hindi glyphs are taller: scale the overlay type to keep the banner layout
  const heroTitle = t('heroTitle', 'Comprehensive Support for a Sustainable Tomorrow');
  const heroText = t('heroText', 'We offer reliable AMC and Buyback services to ensure long-term value and peace of mind for your agricultural investments.');
  const heroLabel = t('heroLabel', 'Our Services');
  const reduce = useReducedMotion();
  const reveal = (delay = 0, y = 24) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.2 },
          transition: { duration: 0.7, ease: EASE, delay },
        };

  const card =
    'relative overflow-hidden rounded-[28px] border border-[#DDEBD8] bg-gradient-to-br from-[#EAF2E4] via-[#E4EEDD] to-[#DDEBD8] shadow-[0_18px_40px_-28px_rgba(18,75,59,0.45)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_26px_50px_-26px_rgba(18,75,59,0.5)]';
  const h2 = 'mt-4 text-[2rem] font-normal normal-case leading-[1.12] tracking-tight sm:text-4xl lg:text-[2.6rem]';
  const body = 'mt-4 max-w-xl text-[15px] leading-7 sm:text-base';

  return (
    <main className="overflow-x-hidden bg-[#F8F8F0] pt-[76px]" style={{ color: INK }}>
      <SEO
        title="Farm AMC & Land Buyback Services | IGO Agri Estates"
        description="Reliable AMC and Buyback services that bring long-term value and peace of mind to your agricultural investments."
        canonical="/services"
      />

      {/* 1. Hero: supplied banner (text is part of the image) on tablet/desktop; live text over a cropped image on mobile */}
      <section className="relative w-full bg-[#F8F8F0]" aria-labelledby="services-heading">
        <h1 id="services-heading" className="sr-only">{heroTitle}</h1>
        <HeroStage src="/images/services/services-hero-clean.webp" width={2172} height={724}>
          <div className="absolute" style={{ left: '5.3cqw', top: '5.8cqw', width: '40cqw' }}>
            <p className="flex items-center font-semibold uppercase" style={{ gap: '1.4cqw', fontSize: '1.05cqw', lineHeight: '1.6cqw', letterSpacing: '0.3em', color: GREEN }}>
              <span aria-hidden="true" style={{ width: '3.2cqw', height: 1, background: GREEN }} />
              {heroLabel}
            </p>
            <p aria-hidden="true" className="font-normal normal-case" style={{ marginTop: '0.1cqw', maxWidth: '32cqw', fontFamily: SERIF, fontSize: nonEn ? '2.8cqw' : '3.4cqw', lineHeight: nonEn ? 1.2 : 1.08, letterSpacing: '-0.005em', color: GREEN }}>
              {heroTitle}
            </p>
            <p style={{ marginTop: '1.2cqw', maxWidth: '33cqw', fontSize: '1.27cqw', lineHeight: 1.46, color: MUTED }}>
              {heroText}
            </p>
          </div>
        </HeroStage>
        <div className="md:hidden">
          <div className="px-5 pb-5 pt-9 sm:px-8">
            <Label>{heroLabel}</Label>
            <p aria-hidden="true" className="mt-4 text-[2rem] font-normal leading-[1.1] tracking-tight" style={{ fontFamily: SERIF, color: GREEN }}>
              {heroTitle}
            </p>
            <p className="mt-4 text-[15px] leading-7" style={{ color: MUTED }}>
              {heroText}
            </p>
          </div>
          <img src="/images/services/services-hero-clean.webp" alt="" aria-hidden="true" className="block h-[240px] w-full object-cover object-[82%_center] sm:h-[300px]" />
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-8 px-5 py-8 sm:px-6 md:gap-12 md:py-12 lg:px-10">
        {/* 2. AMC (full-width) */}
        <motion.section {...reveal(0)} className={card} aria-labelledby="amc-heading">
          <div className="grid items-stretch gap-6 p-4 sm:p-5 lg:grid-cols-[0.84fr_1.16fr] lg:gap-10">
            <div className="relative overflow-hidden rounded-[22px] lg:min-h-[340px]">
              <img
                src={resolveMedia(doc.amcImage, '/images/services/services-amc.webp')}
                alt="Technician inspecting solar panels in a green field"
                width={740}
                height={732}
                loading="lazy"
                className="block aspect-[16/11] w-full object-cover object-center sm:aspect-[2/1] lg:absolute lg:inset-0 lg:aspect-auto lg:h-full"
              />
              <Badge Icon={ShieldCheck} className="left-4 top-4">
                Reliable<br />Maintenance
              </Badge>
            </div>
            <div className="flex flex-col justify-center pb-3 pr-0 pt-1 lg:py-5 lg:pr-10">
              <Label>{t('amcLabel', 'AMC Service')}</Label>
              <h2 id="amc-heading" className={h2.replace('mt-4','mt-2').replace('lg:text-[2.6rem]','lg:text-[2.4rem]').replace('sm:text-4xl','sm:text-[2.1rem]')} style={{ fontFamily: SERIF, color: GREEN }}>
                {t('amcTitle', 'Annual Maintenance Contract (AMC)')}
              </h2>
              <p className={body.replace('mt-4','mt-4').replace('text-[15px] leading-7 sm:text-base','text-[15px] leading-7')} style={{ color: MUTED }}>
                {t('amcText', 'Keep your systems running at their best with our Annual Maintenance Contract (AMC) service. We ensure regular check-ups, timely maintenance and quick support to minimize downtime and maximize performance.')}
              </p>
              <Benefits items={AMC_BENEFITS} compact />
              <div><CtaButton to={t('amcButtonLink', '/contact')} compact>{t('amcButtonText', 'Learn More')}</CtaButton></div>
            </div>
          </div>
        </motion.section>

        {/* 3. Buyback */}
        <motion.section {...reveal(0)} className={card} aria-labelledby="buyback-heading">
          <div className="grid items-stretch gap-6 p-4 sm:p-5 lg:grid-cols-[1.16fr_0.84fr] lg:gap-10">
            <div className="order-2 flex flex-col justify-center pb-3 pt-1 lg:order-1 lg:py-5 lg:pl-10">
              <Label>{t('buybackLabel', 'Buyback Service')}</Label>
              <h2 id="buyback-heading" className={h2.replace('mt-4','mt-2').replace('lg:text-[2.6rem]','lg:text-[2.4rem]').replace('sm:text-4xl','sm:text-[2.1rem]')} style={{ fontFamily: SERIF, color: GREEN }}>
                {t('buybackTitle', 'Buyback Service')}
              </h2>
              <p className={body.replace('mt-4','mt-4')} style={{ color: MUTED }}>
                {t('buybackText', 'We offer a hassle-free buyback service to help you get the best value for your investment. Whether you’re upgrading or exiting, we ensure a transparent, fair and smooth process.')}
              </p>
              <Benefits items={BUYBACK_BENEFITS} compact />
              <div><CtaButton to={t('buybackButtonLink', '/contact')} compact>{t('buybackButtonText', 'Learn More')}</CtaButton></div>
            </div>
            <div className="relative order-1 overflow-hidden rounded-[22px] lg:order-2 lg:min-h-[340px]">
              <img
                src={resolveMedia(doc.buybackImage, '/images/services/services-buyback.webp')}
                alt="A handshake in a green field with a buyback agreement in the foreground"
                width={728}
                height={720}
                loading="lazy"
                className="block aspect-[16/11] w-full object-cover object-center sm:aspect-[2/1] lg:absolute lg:inset-0 lg:aspect-auto lg:h-full"
              />
              <Badge Icon={RefreshCw} className="right-4 top-4">
                Value<br />Returns
              </Badge>
            </div>
          </div>
        </motion.section>

        {/* 3b. Legal and documentation support */}
        <section aria-labelledby="legal-support-heading" className="grid gap-6 lg:grid-cols-2">
          <h2 id="legal-support-heading" className="sr-only">Legal and documentation support</h2>
          {legalCards.map(({ Icon, title, text, image, alt, features }, i) => (
            <motion.article
              key={title}
              {...reveal(0.06 * (i % 2))}
              className="group flex flex-col rounded-[28px] border border-[#EADCC8] bg-[#F5EBDD] p-6 shadow-[0_18px_40px_-30px_rgba(6,61,48,0.4)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_26px_50px_-28px_rgba(6,61,48,0.45)] sm:p-8"
            >
              <div className="grid items-start gap-6 sm:grid-cols-[1fr_minmax(0,0.78fr)] sm:gap-7">
                <div className="order-2 sm:order-1">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E5EFE3] text-[#063D30] transition-colors duration-300 group-hover:bg-[#063D30] group-hover:text-white">
                    <Icon size={28} strokeWidth={1.6} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-[1.55rem] font-bold normal-case leading-tight tracking-normal text-[#063D30]">{title}</h3>
                  <p className="mt-3 text-[15px] leading-7 text-[#5F6F6A]">{text}</p>
                </div>
                <div className="relative order-1 overflow-hidden rounded-[20px] sm:order-2">
                  <img
                    src={image}
                    alt={alt}
                    loading="lazy"
                    className="block aspect-[5/4] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04] sm:aspect-[6/5]"
                  />
                </div>
              </div>
              <ul className="mt-auto grid gap-5 pt-7 sm:grid-cols-3 sm:gap-0">
                {features.map((f, j) => (
                  <li key={f.title} className={`flex items-start gap-3 sm:px-4 sm:first:pl-0 ${j > 0 ? 'sm:border-l sm:border-[#063D30]/10' : ''}`}>
                    <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-[#2F7D5B]" aria-hidden="true" />
                    <span>
                      <span className="block text-[14px] font-semibold leading-snug text-[#063D30]">{f.title}</span>
                      <span className="mt-1 block text-[13px] leading-5 text-[#6B7A76]">{f.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </section>

        {/* 3c. Soil Intelligence */}
        <section aria-labelledby="soil-heading">
          <style>{`.si-card{container-type:inline-size}.si-body{display:grid;gap:1.1rem}.si-feats{display:grid;gap:0.85rem}@container (min-width:480px){.si-body{grid-template-columns:1fr 42%;align-items:start}.si-feats{grid-template-columns:repeat(3,1fr)}}`}</style>
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#A86A12]">{t('soilLabel', 'Agronomic Science')}</p>
          <h2 id="soil-heading" className="mt-3 text-[1.9rem] font-bold normal-case leading-[1.1] tracking-tight text-[#063D30] sm:text-[2.6rem] lg:text-[3.5rem]">
            {doc.soilTitle && doc.soilTitle.trim() ? doc.soilTitle : <>Soil <em className="font-bold not-italic text-[#A86A12]">Intelligence</em></>}
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#5F6F6A] sm:text-base">
            {t('soilText', 'Scientific validation of agricultural assets. We map NPK levels, water table viability, and crop suitability to help customers make informed agricultural investment decisions.')}
          </p>
          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {soilCards.map(({ Icon, title, text, image, alt, features }, i) => (
              <motion.article
                key={title}
                {...reveal(0.06 * i)}
                className="si-card group relative flex flex-col rounded-[28px] border border-[#EEEBE1] bg-[#FDFCF8] p-5 shadow-[0_22px_50px_-30px_rgba(6,61,48,0.35)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-28px_rgba(6,61,48,0.42)] sm:p-6"
              >
                <div className="si-body mb-5">
                  <div style={{ order: 1 }}>
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E5EFE3] text-[#063D30]">
                      <Icon size={26} strokeWidth={1.6} aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-[1.35rem] font-bold normal-case leading-tight tracking-normal text-[#063D30]">{title}</h3>
                    <p className="mt-2 text-[14px] leading-6 text-[#5F6F6A]">{text}</p>
                  </div>
                  <div className="relative" style={{ order: 2 }}>
                    <svg aria-hidden="true" viewBox="0 0 40 40" className="pointer-events-none absolute -right-3 -top-4 z-0 h-12 w-12 text-[#9DBF9A]/70"><path d="M6 34C6 16 18 5 36 4c0 18-10 30-30 30z" fill="currentColor" /><path d="M6 34L26 14" stroke="#FDFCF8" strokeWidth="1.5" fill="none" /></svg>
                    <span aria-hidden="true" className="pointer-events-none absolute -bottom-3 -left-4 z-0 h-14 w-14 rounded-full bg-[#DDEBD8]/70" />
                    <img src={image} alt={alt} loading="lazy" className="relative z-10 block aspect-[16/10] w-full rounded-[20px] object-cover shadow-md transition-transform duration-700 group-hover:scale-[1.02]" />
                  </div>
                </div>
                <ul className="si-feats mt-auto border-t border-[#063D30]/10 pt-4">
                  {features.map((f) => (
                    <li key={f.title} className="flex items-start gap-2.5">
                      <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-[#2F7D5B]" aria-hidden="true" />
                      <span>
                        <span className="block text-[14px] font-semibold leading-snug text-[#063D30]">{f.title}</span>
                        <span className="mt-0.5 block text-[12.5px] leading-[1.15rem] text-[#6B7A76]">{f.text}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>
        </section>

        {/* 3d. Valuation (from /valuation) */}
        <ValuationContent />

        {/* 3e. Tax Optimizer (from /tax-optimizer) */}
        <TaxOptimizerContent />

        {/* 4. Commitment */}
        <motion.section
          {...reveal(0)}
          className="relative isolate overflow-hidden rounded-[28px] border border-[#DDEBD8] bg-gradient-to-r from-[#F4F6EA] via-[#EDF3E3] to-[#E3EEDB]"
          aria-labelledby="commit-heading"
        >
          <img
            src="/images/estates-hero-landscape-v4.webp"
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-y-0 right-0 -z-10 hidden h-full w-[62%] object-cover object-[center_60%] [mask-image:linear-gradient(90deg,transparent_0,#000_45%)] md:block"
          />
          <div className="flex flex-col gap-6 px-6 py-9 sm:px-10 md:min-h-[200px] md:flex-row md:items-center md:justify-between md:py-10">
            <div className="max-w-md border-l-2 pl-5" style={{ borderColor: GREEN }}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: GREEN }}>{t('commitLabel', 'Our Commitment')}</p>
              <h2 id="commit-heading" className="mt-2 text-[1.9rem] font-normal normal-case leading-[1.15] sm:text-4xl" style={{ fontFamily: SERIF, color: GREEN }}>
                {t('commitTitle', 'Your Growth, Our Commitment')}
              </h2>
              <p className="mt-3 text-[15px] leading-7" style={{ color: MUTED }}>
                {t('commitText', 'From ongoing support to future opportunities, our services are designed to add value at every step of your journey.')}
              </p>
            </div>
            <div>
              <Link
                to={t('commitButtonLink', '/contact')}
                className="group/btn inline-flex items-center gap-3 rounded-full px-7 py-3 text-[15px] font-semibold normal-case tracking-normal text-white shadow-[0_10px_24px_-12px_rgba(18,75,59,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0d3a2d]"
                style={{ background: GREEN }}
              >
                {t('commitButtonText', 'Get in Touch')}
                <ArrowRight size={18} className="transition-transform duration-300 group-hover/btn:translate-x-1" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
};

export default Services;
