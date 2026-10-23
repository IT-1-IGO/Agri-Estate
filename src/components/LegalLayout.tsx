import React, { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import SEO from './SEO';
import './LegalLayout.css';

export interface LegalSection {
  id: string;
  title: string;
  icon: LucideIcon;
  intro?: string;
  bullets?: React.ReactNode[];
  outro?: React.ReactNode;
}

interface Props {
  seoTitle: string;
  seoDescription: string;
  canonical: string;
  heroIcon: LucideIcon;
  titleLead: string;
  titleAccent: string;
  description: string;
  sections: LegalSection[];
}

const LegalLayout: React.FC<Props> = ({ seoTitle, seoDescription, canonical, heroIcon: HeroIcon, titleLead, titleAccent, description, sections }) => {
  const [active, setActive] = useState(sections[0].id);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="lg-page">
      <SEO title={seoTitle} description={seoDescription} canonical={canonical} keywords="IGO Agri Estates legal, agricultural land enquiry, farm projects" noIndex={false} />
      <header className="lg-hero">
        <div className="lg-hero__img" aria-hidden="true" />
        <div className="lg-hero__in">
          <span className="lg-hero__icon"><HeroIcon size={28} /></span>
          <h1>{titleLead} <span>{titleAccent}</span></h1>
          <p>{description}</p>
        </div>
      </header>

      <div className="lg-wrap">
        <aside className="lg-toc" aria-label="Table of contents">
          <p className="lg-toc__h">Table of Contents</p>
          <ul>
            {sections.map((s, i) => {
              const I = s.icon;
              return (
                <li key={s.id}>
                  <a href={`#${s.id}`} onClick={go(s.id)} className={active === s.id ? 'is-active' : undefined} aria-current={active === s.id ? 'true' : undefined}>
                    <I size={16} /><span>{i + 1}. {s.title}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="lg-main">
          {sections.map((s, i) => {
            const I = s.icon;
            return (
              <section key={s.id} id={s.id} className="lg-card">
                <span className="lg-card__ico"><I size={22} /></span>
                <div className="lg-card__body">
                  <h2>{i + 1}. {s.title}</h2>
                  {s.intro && <p>{s.intro}</p>}
                  {s.bullets && <ul>{s.bullets.map((b, k) => <li key={k}>{b}</li>)}</ul>}
                  {s.outro && <p>{s.outro}</p>}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LegalLayout;
