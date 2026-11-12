import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import TiltImage from '../interactive/TiltImage';

interface FarmType {
  id: string; // property id of the IGO Agri Tech project
  label: string;
  text: string;
  img: string;
  alt: string;
}

const FARMS: FarmType[] = [
  { id: 'open-cultivation-project', label: 'Open cultivation farm', text: 'Field crops with irrigation and crop planning.', img: '/images/properties/open-cultivation.png', alt: 'Vegetable rows with a drainage channel and workers in an Indian farm field' },
  { id: 'horticulture-project', label: 'Horticulture farm', text: 'Fruit orchards with drip irrigation.', img: '/images/properties/mango-orchard.png', alt: 'Mango orchard with drip line and a farmhouse' },
  { id: 'polyhouse-project', label: 'Polyhouse farm', text: 'Protected cultivation of high-value vegetables.', img: '/images/properties/polyhouse.png', alt: 'Polyhouse with capsicum plants and workers' },
  { id: 'vertical-farming-project', label: 'Vertical farm', text: 'Indoor, soil-free growing in stacked trays.', img: '/images/properties/vertical-farm.png', alt: 'Vertical farm with leafy greens under grow lights' },
  { id: 'mushroom-project', label: 'Mushroom farm', text: 'Climate-controlled mushroom cultivation units.', img: '/images/properties/mushroom.png', alt: 'Workers harvesting oyster mushrooms in a growing hall' },
  { id: 'microgreens-project', label: 'Microgreens farm', text: 'Compact, quick-cycle greens production.', img: '/images/properties/microgreens.png', alt: 'Trays of microgreens on shelves' },
  { id: 'nursery-project', label: 'Nursery', text: 'Saplings raised under shade net with misting.', img: '/images/properties/nursery.png', alt: 'Plant nursery under shade net with women workers' },
];

const FarmCategories: React.FC = () => {
  const reduce = useReducedMotion();

  return (
    <section className="relative bg-[#EDE4D6] py-20 lg:py-28 overflow-hidden" aria-labelledby="categories-heading">
      <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[#cfe8c0]/60 blur-3xl" aria-hidden="true"></div>
      <div className="container-pro relative">
        <div className="max-w-2xl">
          <h2 id="categories-heading" className="text-4xl md:text-5xl font-bold text-[#0f4d24] leading-[1.05] tracking-[-0.02em] normal-case [text-wrap:balance]">
            Farm types we set up and run with you
          </h2>
          <p className="mt-4 text-lg text-slate-600 [text-wrap:pretty]">
            Pick a farm model to see how the project works, what it needs and how IGO supports it.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12">
          {FARMS.map((f, i) => (
            <motion.li
              key={f.id}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ type: 'spring', stiffness: 90, damping: 18, delay: (i % 4) * 0.06 }}
              className={i < 3 ? 'lg:col-span-4' : 'lg:col-span-3'}
            >
              <Link
                to={`/properties/${f.id}`}
                className="group block h-full rounded-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B5E20]"
              >
                <TiltImage className="aspect-[4/3] rounded-3xl shadow-[0_22px_44px_-26px_rgba(15,77,36,0.6)]" max={5}>
                  <img src={f.img} alt={f.alt} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <span className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" aria-hidden="true"></span>
                </TiltImage>
                <div className="mt-4 flex items-start justify-between gap-3 px-1">
                  <div>
                    <h3 className="text-xl font-semibold text-[#0f4d24] normal-case tracking-normal">{f.label}</h3>
                    <p className="mt-1 text-sm text-slate-600 normal-case tracking-normal leading-snug">{f.text}</p>
                  </div>
                  <ArrowUpRight size={22} className="mt-1 shrink-0 text-[#1B5E20]/50 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#1B5E20]" aria-hidden="true" />
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default FarmCategories;
