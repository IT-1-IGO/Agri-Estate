import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, Sprout, Settings, Tractor, TrendingUp } from 'lucide-react';
import SEO from '../components/SEO';
import { useLanguage } from '../context/LanguageContext';
import HeroStage from '../components/HeroStage';
import TiltImage from '../components/interactive/TiltImage';
import { useProperties } from '../hooks/useProperties';

const SERIF = '"DM Serif Display","Playfair Display",Georgia,"Times New Roman",serif';

const HERO_CARDS = [
  { Icon: Sprout, title: 'Right Land', sub: '(Verified & Trusted)' },
  { Icon: Settings, title: 'Smart Planning', sub: '(Crop & Farm Model)' },
  { Icon: Tractor, title: 'Complete Setup', sub: '(Infrastructure & Inputs)' },
  { Icon: TrendingUp, title: 'Guidance & Support', sub: '(From Visit to Harvest)' },
];

const Projects: React.FC = () => {
  const { language } = useLanguage();
  const nonEn = language !== 'en'; // Tamil/Hindi glyphs are taller: scale the overlay type to keep the banner layout
  const { publicProperties } = useProperties();
  const projects = publicProperties.filter((p) => p.projectUrl);

  return (
    <main className="bg-background pb-20 pt-[76px]">
      <SEO
        title="IGO Agri Tech Projects | Land with Farm Projects"
        description="Buy verified land together with an IGO Agri Tech project: polyhouse, hydroponic, horticulture, mushroom, microgreens and more."
        canonical="/projects"
      />
      {/* Hero banner: tablet/desktop uses the supplied image (text is part of it); mobile shows live text above a cropped image */}
      <section className="relative w-full bg-[#F4F8E8]" aria-labelledby="projects-hero-heading">
        <h1 id="projects-hero-heading" className="sr-only">Land, with the project already planned.</h1>
        <HeroStage src="/images/projects-hero-clean.webp" width={2172} height={724}>
          <div className="absolute" style={{ left: '7.2cqw', top: '7.7cqw', width: '47cqw' }}>
            <p className="flex items-center font-semibold uppercase" style={{ marginLeft: '-2.8cqw', gap: '0.9cqw', fontSize: '0.95cqw', lineHeight: '1.6cqw', letterSpacing: '0.22em', color: '#1B5E20' }}>
              <span aria-hidden="true" style={{ width: '1.85cqw', height: 1, background: '#1B5E20', opacity: 0.5 }} />
              IGO Agri Tech x IGO Agri Estates
              <span aria-hidden="true" style={{ width: '1.85cqw', height: 1, background: '#1B5E20', opacity: 0.5 }} />
            </p>
            <p aria-hidden="true" className="font-bold normal-case" style={{ marginTop: '0.35cqw', maxWidth: '47cqw', fontFamily: SERIF, fontSize: nonEn ? '3.1cqw' : '3.87cqw', lineHeight: nonEn ? 1.2 : 1.05, color: '#0f4d24' }}>
              Land, with the project already planned.
            </p>
            <p style={{ marginTop: '1.7cqw', maxWidth: '38cqw', fontSize: '1.17cqw', lineHeight: 1.45, color: '#3f5a6b' }}>
              Each project pairs verified land with an IGO Agri Tech farm model: setup, crop plan and guidance from site visit to harvest.
            </p>
          </div>
          <ul className="absolute m-0 flex list-none p-0" style={{ left: '59.2cqw', top: '6.4cqw', gap: '1.06cqw' }}>
            {HERO_CARDS.map(({ Icon, title, sub }) => (
              <li
                key={title}
                className="relative flex flex-col items-center text-center"
                style={{ width: '8.62cqw', height: '6.8cqw', marginTop: '0cqw', borderRadius: '0.7cqw', background: 'rgba(255,255,255,0.62)', border: '1px solid rgba(255,255,255,0.7)', boxShadow: '0 0.5cqw 1.4cqw -0.8cqw rgba(15,77,36,0.35)', backdropFilter: 'blur(2px)' }}
              >
                <span className="flex items-center justify-center rounded-full" style={{ width: '3.4cqw', height: '3.4cqw', marginTop: '0.2cqw', background: '#DDF7D3', color: '#1f6b35' }}>
                  <Icon style={{ width: '1.6cqw', height: '1.6cqw' }} strokeWidth={2} aria-hidden="true" />
                </span>
                <span className="font-bold" style={{ marginTop: '0.45cqw', fontSize: '0.8cqw', lineHeight: 1.2, padding: '0 0.3cqw', color: '#0f4d24' }}>{title}</span>
                <span style={{ marginTop: '0.25cqw', fontSize: '0.6cqw', lineHeight: 1.25, color: '#6b7f73' }}>{sub}</span>
              </li>
            ))}
          </ul>
        </HeroStage>
        <div className="md:hidden">
          <div className="px-5 pb-5 pt-9 sm:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#1B5E20]">IGO Agri Tech x IGO Agri Estates</p>
            <p aria-hidden="true" className="mt-3 text-[2rem] font-bold leading-[1.1] tracking-tight text-[#0f4d24]">Land, with the project already planned.</p>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Each project pairs verified land with an IGO Agri Tech farm model: setup, crop plan and guidance from site visit to harvest.
            </p>
          </div>
          <img src="/images/projects-hero-clean.webp" alt="" aria-hidden="true" className="block h-[240px] w-full object-cover object-[85%_center] sm:h-[300px]" />
        </div>
      </section>

      <div className="container-pro pt-12">
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <li key={p.id} className="rounded-3xl overflow-hidden bg-white border border-black/5 shadow-md flex flex-col">
              <TiltImage className="aspect-[16/10]">
                <img src={p.image} alt={p.title} loading="lazy" className="w-full h-full object-cover" />
              </TiltImage>
              <div className="p-6 flex flex-col flex-1">
                <h2 className="text-xl text-[#0f4d24] normal-case tracking-normal">{p.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{p.location} · {p.size}</p>
                {p.revenueModel && <p className="mt-3 text-sm text-slate-700 line-clamp-3">{p.revenueModel}</p>}
                {p.crops && <p className="mt-3 text-xs text-[#0f4d24] bg-[#eaf4e6] rounded-full px-3 py-1 self-start">{p.crops.slice(0, 3).join(' · ')}</p>}
                <div className="mt-auto pt-5 flex items-center justify-between gap-3">
                  <Link to={`/properties/${p.id}`} className="inline-flex items-center gap-2 font-semibold text-[#1B5E20]">View details <ArrowRight size={16} /></Link>
                  <a href={p.projectUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-[#1B5E20]">
                    IGO Agri Tech <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-12 text-center">
          <Link to="/contact" className="inline-block rounded-full bg-[#1B5E20] text-white px-8 py-3 font-semibold">Talk to the project team</Link>
        </div>
      </div>
    </main>
  );
};

export default Projects;
