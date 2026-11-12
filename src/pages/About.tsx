import React from 'react';
import SEO from '../components/SEO';
import { motion, useReducedMotion } from 'framer-motion';
import MissionSection from '../components/home/MissionSection';

interface AboutProps {
  /** false when this component is embedded as a section inside another page (e.g. the homepage),
   * so it doesn't emit a duplicate <h1>/SEO tags for that page. Defaults to true (standalone /about route). */
  standalone?: boolean;
}

const About: React.FC<AboutProps> = ({ standalone = true }) => {
  const Heading = standalone ? 'h1' : 'h2';
  const reduce = useReducedMotion();
  const EASE = [0.22, 1, 0.36, 1] as const;
  // Fade + rise, played once when the element scrolls into view; disabled for reduced-motion users
  const reveal = (delay = 0, y = 24) => ({
    initial: reduce ? false as const : { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.7, ease: EASE, delay },
  });
  return (
    <>
    <section id="about" className="relative bg-[#f8fbf6] py-16 lg:py-24">
      {standalone && (
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
      )}
      <div className="container-pro grid items-center gap-10 lg:grid-cols-[1fr_1.08fr] lg:gap-16">
        <div>
          <motion.p {...reveal(0, 16)} className="text-xs font-bold uppercase tracking-[0.3em] text-[#00814a]">Our Legacy</motion.p>
          <motion.div {...reveal(0.12)}>
            <Heading className="mt-3 text-4xl font-extrabold uppercase leading-[1.05] tracking-tight text-[#0b4a2a] sm:text-5xl lg:text-[3.4rem]">
              The Institution <br />of{' '}
              <motion.span
                className="inline-block italic text-secondary"
                initial={reduce ? false : { opacity: 0, y: 10, filter: 'blur(4px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
              >Agricultural Land</motion.span>
            </Heading>
          </motion.div>
          <motion.div {...reveal(0.26)} className="mt-7 max-w-xl space-y-1 text-lg leading-relaxed text-slate-600">
            <p>IGO Agri Estates is the land arm of IGO Group of Companies, buying and selling agricultural land directly.</p>
            <p>We bridge the gap between traditional land ownership and modern investment excellence.</p>
          </motion.div>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          className="group overflow-hidden rounded-3xl shadow-[0_24px_50px_-28px_rgba(15,77,36,0.55)]"
        >
          <img
            src="/images/team-legacy-landscape.webp"
            alt="IGO Agri Estates expert team — agricultural land investment specialists reviewing project information on a tablet in a green farm"
            width={1024}
            height={455}
            loading="lazy"
            decoding="async"
            className="aspect-[9/4] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        </motion.div>
      </div>
    </section>

    <MissionSection />
    </>
  );
};

export default About;
