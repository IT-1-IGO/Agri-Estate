import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Target, Eye, Gem, MapPin, MapPinned, ClipboardList, Tractor, Handshake, ArrowRight, Quote, Users, Lightbulb, Sprout, Leaf } from 'lucide-react';
import SEO from '../components/SEO';
import { useLanguage } from '../context/LanguageContext';
import HeroStage from '../components/HeroStage';

const EASE = [0.22, 1, 0.36, 1] as const;
const SERIF = '"DM Serif Display","Playfair Display",Georgia,"Times New Roman",serif';

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#0f4d24]">
    <span className="h-px w-8 bg-[#2d7a3e]" aria-hidden="true" />
    {children}
    <span className="h-px w-8 bg-[#2d7a3e]" aria-hidden="true" />
  </p>
);

const VALUES = [
  { Icon: Target, title: 'Our Mission', text: 'To deliver sustainable agri-estate solutions, create value for our customers and contribute to a greener, healthier future.' },
  { Icon: Eye, title: 'Our Vision', text: 'To be a leading agri-estate company, recognized for innovation, trust and sustainable growth across India.' },
  { Icon: Gem, title: 'Our Values', text: 'Integrity, Excellence, Customer Focus, Sustainability and Long-Term Growth.' },
];

const STEPS = [
  { Icon: MapPinned, title: 'Land Acquisition', text: 'We help landowners sell their land at the best value.' },
  { Icon: ClipboardList, title: 'Project Planning', text: 'We design and plan sustainable agri-projects for the land.' },
  { Icon: Tractor, title: 'Development', text: 'We create infrastructure and develop the project as per plan.' },
  { Icon: Handshake, title: 'Handover', text: 'We deliver ready-to-use farms and long-term support.' },
];

const APPROACH = [
  { Icon: Users, label: 'Customer First' },
  { Icon: Lightbulb, label: 'Innovation Driven' },
  { Icon: Sprout, label: 'Sustainability Focused' },
  { Icon: Handshake, label: 'Long-Term Partnerships' },
];

/** Dashed land-parcel outline + location pin drawn over a farmland photo. */
const ParcelOverlay: React.FC<{ points: string; pin: { left: string; top: string } }> = ({ points, pin }) => (
  <>
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <polygon points={points} fill="rgba(255,255,255,0.10)" stroke="#fff" strokeWidth="2" strokeDasharray="7 6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
    <span
      className="pointer-events-none absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#2a8a3a] text-white shadow-lg ring-4 ring-white/70"
      style={pin}
      aria-hidden="true"
    >
      <MapPin size={18} />
    </span>
  </>
);

const AboutPage: React.FC = () => {
  const { language } = useLanguage();
  const nonEn = language !== 'en'; // Tamil/Hindi glyphs are taller: scale the overlay type to keep the banner layout
  const reduce = useReducedMotion();
  const reveal = (delay = 0, y = 22) => ({
    initial: reduce ? (false as const) : { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.7, ease: EASE, delay },
  });
  const h2 = 'text-3xl font-bold normal-case leading-[1.12] tracking-tight text-[#0f4d24] sm:text-4xl lg:text-[2.6rem]';
  const body = 'text-[15px] leading-7 text-[#5f7480] sm:text-base';

  return (
    <main className="overflow-x-hidden bg-[#FAF8EE] pt-[76px] text-[#0f4d24]">
      <SEO
          title="About IGO Agri Estates — India's Premier Agricultural Land Platform"
          description="IGO Agri Estates is the land arm of IGO Group of Companies. We buy and sell agricultural land directly and offer land with IGO Agri Estate projects."
          canonical="/about"
          keywords="IGO Agri Estates about, agricultural land company India, farmland investment company India, agri estate company, managed farmland India, farm land developer Tamil Nadu Karnataka Maharashtra"
          ogImage="https://www.igoagriestate.com/images/team-expert-indian.png"
          schema={[
            {
              '@context': 'https://schema.org',
              '@type': 'AboutPage',
              name: "About IGO Agri Estates",
              url: 'https://www.igoagriestate.com/about',
              mainEntity: { '@id': 'https://www.igoagriestate.com/#organization' },
              description: "IGO Agri Estates is the land arm of IGO Group of Companies, buying and selling agricultural land directly and offering land with IGO Agri Estate projects."
            },
            {
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.igoagriestate.com/' },
                { '@type': 'ListItem', position: 2, name: 'About', item: 'https://www.igoagriestate.com/about' }
              ]
            }
          ]}
        />

      {/* 1. Hero */}
      <section className="relative w-full bg-[#F4F8E8]" aria-labelledby="about-hero-heading">
        <h1 id="about-hero-heading" className="sr-only">Building Sustainable Land Solutions</h1>
        {/* Tablet and desktop: text-free banner with live, translatable text on top */}
        <HeroStage src="/images/about-hero-clean.webp" width={2170} height={725}>
          <div className="absolute" style={{ left: '7.4cqw', top: '7.1cqw', width: '44cqw' }}>
            <p className="flex items-center font-semibold uppercase" style={{ marginLeft: '-1.1cqw', gap: '1.1cqw', fontSize: '1.05cqw', lineHeight: '1.6cqw', letterSpacing: '0.2em', color: '#0f4d24' }}>
              <span aria-hidden="true" style={{ width: '2.6cqw', height: 1, background: '#0f4d24' }} />
              About Us
              <span aria-hidden="true" style={{ width: '2.6cqw', height: 1, background: '#0f4d24' }} />
            </p>
            <p aria-hidden="true" className="font-bold normal-case" style={{ marginTop: '0cqw', maxWidth: '40cqw', fontFamily: SERIF, fontSize: nonEn ? '3cqw' : '3.69cqw', lineHeight: nonEn ? 1.2 : 1.05, color: '#0f4d24' }}>
              Building Sustainable Land Solutions
            </p>
            <p style={{ marginTop: '1.5cqw', maxWidth: '31cqw', fontSize: '1.27cqw', lineHeight: 1.5, color: '#5f7480' }}>
              IGO Agri Estate is dedicated to creating value from land by connecting landowners with the right buyers and helping customers develop meaningful, sustainable agri-projects.
            </p>
          </div>
        </HeroStage>
        {/* Mobile: live text above the image, cropped to keep the hands and land plot in view */}
        <div className="md:hidden">
          <div className="px-5 pb-5 pt-9 sm:px-8">
            <Label>About Us</Label>
            <p aria-hidden="true" className="mt-4 text-[2rem] font-bold normal-case leading-[1.1] tracking-tight text-[#0f4d24]" style={{ fontFamily: SERIF }}>
              Building Sustainable Land Solutions
            </p>
            <p className={`mt-4 ${body}`}>
              IGO Agri Estate is dedicated to creating value from land by connecting landowners with the right buyers and helping customers develop meaningful, sustainable agri-projects.
            </p>
          </div>
          <img src="/images/about-hero-clean.webp" alt="" aria-hidden="true" className="block h-[240px] w-full object-cover object-[88%_center] sm:h-[300px]" />
        </div>
      </section>

      {/* 2. Legacy: Mission, Vision, Values */}
      <section className="bg-[#FAF8EE] py-14 md:py-20">
        <div className="container-pro grid items-start gap-10 lg:grid-cols-[0.9fr_1.7fr] lg:gap-14">
          <motion.div {...reveal(0)}>
            <Label>Our Legacy</Label>
            <h2 className={`mt-5 ${h2}`} style={{ fontFamily: SERIF }}>
              Our Mission, Vision <span className="block text-[#1f7a3a]">and Values</span>
            </h2>
            <p className={`mt-5 max-w-sm ${body}`}>
              Guided by a strong sense of purpose, we are committed to building a sustainable tomorrow through innovation, responsibility and people.
            </p>
          </motion.div>
          <div className="grid gap-5 sm:grid-cols-3">
            {VALUES.map(({ Icon, title, text }, i) => (
              <motion.article
                key={title}
                {...reveal(0.08 * (i + 1))}
                className="rounded-[20px] border border-[#e6e2cc] bg-[#FDFCF6] p-6 shadow-[0_14px_30px_-22px_rgba(15,77,36,0.4)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_40px_-24px_rgba(15,77,36,0.45)]"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E4EDD6] text-[#0f4d24]"><Icon size={28} strokeWidth={1.5} aria-hidden="true" /></span>
                <h3 className="mt-5 text-lg font-bold normal-case tracking-normal text-[#0f4d24]" style={{ fontFamily: SERIF }}>{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5f7480]">{text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Founder */}
      <section
        className="relative grid grid-cols-1 overflow-hidden bg-[linear-gradient(90deg,#EEEFF3,#EAF3F8_50%,#E8F2F9)] min-[901px]:min-h-[clamp(380px,29vw,560px)] min-[901px]:grid-cols-[46%_1fr] min-[901px]:items-center"
        aria-labelledby="founder-heading"
      >
        <div className="relative aspect-[921/591] w-full min-[901px]:aspect-auto min-[901px]:h-full min-[901px]:min-h-[380px]">
          <img
            src="/images/leadership/ceo-john-yesudhas.webp"
            alt="Dr. John Yesudhas, Founder and CEO of IGO Group of Companies"
            width={1254}
            height={1254}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 block h-full w-full object-contain object-[center_bottom] [mask-image:linear-gradient(0deg,transparent_0,#000_22%)] min-[901px]:object-[62%_bottom] min-[901px]:[mask-image:linear-gradient(270deg,transparent_0,#000_22%)]"
          />
        </div>
        <motion.div
          {...reveal(0)}
          className="w-full max-w-[640px] px-5 pb-10 pt-6 sm:px-8 min-[901px]:py-12 min-[901px]:pl-[2vw] min-[901px]:pr-[max(2rem,5vw)]"
        >
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#2d6a3e]">
            Our Founder <span className="h-px w-12 bg-[#2d6a3e]" aria-hidden="true" />
          </p>
          <h2
            id="founder-heading"
            className="mt-3 text-[28px] font-extrabold normal-case leading-[1.12] tracking-tight text-[#0B2233] min-[901px]:text-[clamp(28px,2.8vw,46px)]"
          >
            A Vision Led by Its Founder
          </h2>
          <blockquote className="mt-5 flex items-start gap-4">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2d6a3e]/10 text-[#2d6a3e]" aria-hidden="true">
              <Quote size={18} />
            </span>
            <p className="text-[clamp(15px,1.2vw,20px)] font-medium italic leading-[1.5] text-[#12303F]">
              Progress means nothing if it costs the planet. Our goal is to power growth in a way that leaves the world better than we found it.
            </p>
          </blockquote>
          <p className="mt-5 flex flex-col">
            <b className="text-base font-bold text-[#0B2233]">Dr. John Yesudhas</b>
            <span className="text-sm text-[#44565F]">Founder &amp; CEO</span>
            <span className="text-sm text-[#44565F]">IGO Group of Companies</span>
          </p>
          <p className="mt-4 text-[clamp(14px,1vw,17px)] leading-[1.65] text-[#44565F]">
            Under the leadership of Dr. John Yesudhas, the IGO Group has earned a reputation for trust, quality and commitment.
          </p>
        </motion.div>
      </section>

      {/* 4. Who we are */}
      <section className="bg-[#F1F5E6] py-14 md:py-20">
        <div className="container-pro grid items-center gap-10 lg:grid-cols-[0.85fr_1.25fr] lg:gap-14">
          <motion.div {...reveal(0)}>
            <Label>Who We Are</Label>
            <h2 className={`mt-5 ${h2}`} style={{ fontFamily: SERIF }}>
              A Trusted Partner in <span className="block text-[#1f7a3a]">Agri Estate Development</span>
            </h2>
            <p className={`mt-5 max-w-md ${body}`}>
              IGO Agri Estate helps landowners unlock the value of their land and supports customers in building farm projects. We bridge the gap between land and opportunity, creating sustainable agri-communities for a better tomorrow.
            </p>
            <Link to="/projects" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#0f4d24] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3b1c]">
              Learn More <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </motion.div>

          <motion.div {...reveal(0.1)} className="grid gap-3 sm:grid-cols-[1fr_0.3fr]">
            <div className="relative overflow-hidden rounded-[26px] shadow-[0_24px_50px_-28px_rgba(15,77,36,0.5)]">
              <img src="/images/featured/maduranthagam-aerial.webp" alt="Aerial view of an agricultural land parcel" width={1024} height={1024} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              <ParcelOverlay points="14,52 44,34 82,60 46,90" pin={{ left: '30%', top: '44%' }} />
              <ul className="absolute right-3 top-4 flex w-[56%] flex-col gap-2.5 sm:right-4 sm:w-[48%]">
                {[
                  ['Your Land', 'For Sale', MapPin],
                  ['Our Development', 'Projects & Infrastructure', Tractor],
                  ['Your Future', 'Profit & Sustainability', Leaf],
                ].map(([t, s, I]) => {
                  const Ico = I as typeof MapPin;
                  return (
                    <li key={t as string} className="flex items-center gap-2.5 rounded-full bg-white/92 px-3 py-2 shadow-md backdrop-blur-[2px]">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1f7a3a] text-white"><Ico size={15} aria-hidden="true" /></span>
                      <span className="min-w-0 leading-tight">
                        <span className="block text-[13px] font-bold text-[#0f4d24]">{t as string}</span>
                        <span className="block truncate text-[11px] text-[#5f7480]">{s as string}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-[22px] bg-white p-2 shadow-[0_18px_36px_-24px_rgba(15,77,36,0.45)] sm:grid-cols-1">
              {[
                ['/images/featured/greenhouse-farm-hd.webp', 'Greenhouse farming'],
                ['/images/featured/mango-plantation-hd.webp', 'Plantation'],
                ['/images/featured/organic-farmland-hd.webp', 'Agricultural farmland'],
              ].map(([s, a]) => (
                <img key={s} src={s} alt={a} loading="lazy" className="aspect-[4/3] w-full rounded-xl object-cover sm:aspect-auto sm:h-full" />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. What we do */}
      <section className="bg-[#FAF8EE] py-14 md:py-20">
        <div className="container-pro grid items-center gap-10 lg:grid-cols-[0.85fr_1.4fr] lg:gap-14">
          <motion.div {...reveal(0)}>
            <Label>What We Do</Label>
            <h2 className={`mt-5 ${h2}`} style={{ fontFamily: SERIF }}>
              From Land to <span className="block text-[#1f7a3a]">Lasting Value</span>
            </h2>
            <p className={`mt-5 max-w-sm ${body}`}>
              We connect landowners with buyers and develop agri-projects that create long-term value. Our end-to-end support ensures a smooth process — from land acquisition to project development and management.
            </p>
          </motion.div>
          <ol className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {STEPS.map(({ Icon, title, text }, i) => (
              <motion.li key={title} {...reveal(0.08 * (i + 1))} className="relative flex flex-col items-center text-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#E4EDD6] text-[#0f4d24]"><Icon size={36} strokeWidth={1.4} aria-hidden="true" /></span>
                <h3 className="mt-4 text-base font-bold normal-case tracking-normal text-[#0f4d24]" style={{ fontFamily: SERIF }}>{title}</h3>
                <p className="mt-2 max-w-[180px] text-[13px] leading-5 text-[#6b7f8c]">{text}</p>
                {i < STEPS.length - 1 && (
                  <ArrowRight size={20} className="absolute -right-3 top-8 hidden text-[#9bc79a] md:block" aria-hidden="true" />
                )}
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* 6. Our approach */}
      <section className="bg-[#F5F7EA] pb-14 md:pb-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          <motion.div {...reveal(0)} className="relative mx-5 overflow-hidden rounded-[26px] shadow-[0_24px_50px_-28px_rgba(15,77,36,0.5)] sm:mx-8 lg:mx-0 lg:rounded-l-none lg:rounded-r-[32px]">
            <img src="/images/featured/aerial-farmland-16x9.webp" alt="Farmland with a marked land parcel for sale" width={1024} height={576} loading="lazy" className="aspect-[4/3] w-full object-cover" />
            <ParcelOverlay points="12,60 40,40 76,66 40,92" pin={{ left: '40%', top: '56%' }} />
            <span className="absolute bottom-[14%] right-[10%] rounded-md border-2 border-[#5b3b1b] bg-[#2f6a3a] px-4 py-2 text-sm font-semibold text-white shadow-lg">
              Land Sale <ArrowRight size={14} className="ml-1 inline" aria-hidden="true" />
            </span>
          </motion.div>
          <motion.div {...reveal(0.1)} className="container-pro lg:!ml-0 lg:!pl-0">
            <Label>Our Approach</Label>
            <h2 className={`mt-5 ${h2}`} style={{ fontFamily: SERIF }}>People. Process. Progress.</h2>
            <p className={`mt-5 max-w-xl ${body}`}>
              We follow a customer-centric approach, combining innovation, transparency and operational excellence to deliver sustainable, long-term results.
            </p>
            <ul className="mt-8 grid grid-cols-2 gap-y-6 md:grid-cols-4 md:gap-y-0">
              {APPROACH.map(({ Icon, label }, i) => (
                <li key={label} className={`flex flex-col items-center gap-3 px-3 text-center ${i > 0 ? 'md:border-l md:border-[#d9e0c8]' : ''}`}>
                  <Icon size={30} strokeWidth={1.4} className="text-[#1f7a3a]" aria-hidden="true" />
                  <span className="text-sm text-[#5f7480]">{label}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
