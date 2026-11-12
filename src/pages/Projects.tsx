import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import SEO from '../components/SEO';
import TiltImage from '../components/interactive/TiltImage';
import { useProperties } from '../hooks/useProperties';

const Projects: React.FC = () => {
  const { publicProperties } = useProperties();
  const projects = publicProperties.filter((p) => p.projectUrl);

  return (
    <main className="bg-background pb-20 pt-[76px]">
      <SEO
        title="IGO Agri Tech Projects | Land with Farm Projects"
        description="Buy verified land together with an IGO Agri Tech project: polyhouse, hydroponic, horticulture, mushroom, microgreens and more."
        canonical="/projects"
      />
      {/* Hero banner: the supplied artwork already carries its own text, so it is shown as-is at every width */}
      <section className="relative w-full bg-[#F4F8E8]" aria-labelledby="projects-hero-heading">
        <h1 id="projects-hero-heading" className="sr-only">Integrated Farming Projects</h1>
        <img
          src="/images/projects-hero-integrated.webp"
          alt="Integrated farming estate with hydroponic farming, open field cultivation, polyhouse farming and horticulture and fruit farming"
          width={3198}
          height={1364}
          fetchPriority="high"
          className="mx-auto block h-auto w-full max-w-[1920px] md:h-[clamp(300px,36vw,620px)] md:object-cover md:object-top"
        />
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
