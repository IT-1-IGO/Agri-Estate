import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, HandCoins, Sprout, ShieldCheck } from 'lucide-react';
import TiltImage from '../interactive/TiltImage';

const PATHS = [
  {
    to: '/sell-land',
    eyebrow: 'For landowners',
    title: 'Sell Your Land to IGO',
    text: 'We buy directly from you. Share your land details and receive a verified valuation and offer, with no brokers in between.',
    points: ['Direct purchase from the owner', 'Site and legal verification by IGO', 'Transparent valuation and payment'],
    cta: 'Start selling',
    img: '/images/featured/organic-farmland-hd.webp',
    Icon: HandCoins,
    alt: 'Farm workers tending vegetable rows on agricultural land beside an irrigation channel',
  },
  {
    to: '/projects',
    eyebrow: 'For buyers and investors',
    title: 'Buy Land with IGO Agri Tech Projects',
    text: 'Choose verified land, or land developed together with an IGO Agri Tech project: polyhouse, hydroponic, horticulture and more.',
    points: ['Verified title and documents', 'Project setup by IGO Agri Tech', 'Guided site visits and handover'],
    cta: 'Explore projects',
    img: '/images/featured/greenhouse-farm-hd.webp',
    Icon: Sprout,
    alt: 'Polyhouse with capsicum plants and farm workers',
  },
];

const SellBuyPaths: React.FC = () => (
  <section className="relative z-20 py-16 bg-[#F3EFE7]" aria-labelledby="paths-heading">
    <div className="container-pro">
      <div className="max-w-3xl mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#1B5E20] mb-3">IGO Group of Companies</p>
        <h2 id="paths-heading" className="text-3xl md:text-5xl text-[#0f4d24] leading-tight">
          One group. Two ways to work with land.
        </h2>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {PATHS.map(({ to, eyebrow, title, text, points, cta, img, alt, Icon }) => (
          <Link key={to} to={to} className="group rounded-3xl overflow-hidden bg-[#EAE6DF] border border-black/5 shadow-md hover:shadow-2xl transition-shadow flex flex-col">
            <TiltImage className="aspect-[16/8]">
              <img src={img} alt={alt} loading="lazy" decoding="async" className="w-full h-full object-cover" />
              <span className="absolute top-4 left-4 inline-flex items-center gap-2 bg-white/95 text-[#0f4d24] text-xs font-bold px-3 py-1.5 rounded-full">
                <Icon size={14} /> {eyebrow}
              </span>
            </TiltImage>
            <div className="p-6 md:p-8 flex flex-col flex-1">
              <h3 className="text-2xl text-[#0f4d24] normal-case tracking-normal">{title}</h3>
              <p className="mt-3 text-slate-600">{text}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {points.map((p) => (
                  <li key={p} className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#1B5E20] shrink-0" />{p}</li>
                ))}
              </ul>
              <span className="mt-auto pt-6 inline-flex items-center gap-2 font-semibold text-[#1B5E20] group-hover:gap-4 transition-all">
                {cta} <ArrowRight size={18} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default SellBuyPaths;
