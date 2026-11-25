import React, { useEffect, useRef, useState } from 'react';
import BrandsMarquee from './BrandsMarquee';
import './EcosystemSection.css';

const STATS = [
  { value: '26', label: 'Brands' },
  { value: '28', label: 'Departments' },
  { value: '2,500+', label: 'Employees' },
];

const CARDS = [
  { src: '/images/igo-group-head-office.webp', alt: 'IGO Group head office building', label: 'Head Office' },
  { src: '/images/igo-group-back-office.webp', alt: 'Sundarakottam, Thiruvalluvar Illam back office', label: 'Back Office' },
];

const EcosystemSection: React.FC = () => {
  // The typewriter effect on the stats only runs while the section is on screen.
  const ref = useRef<HTMLElement>(null);
  const [live, setLive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
  <section ref={ref} className={`eco${live ? ' eco--live' : ''}`} aria-labelledby="eco-heading">

    <div className="eco__inner">
      <header className="eco__head">
        <span className="eco__rule" />
        <h2 id="eco-heading" className="eco__title"><span>IGO</span> <em>Group of Units</em></h2>
        <span className="eco__rule" />
      </header>

      <div className="eco__row">
        {CARDS.map(({ src, alt, label }, i) => (
          <figure key={label} className={`eco__card eco__card--${i}`}>
            <img src={src} alt={alt} loading="lazy" decoding="async" />
            <figcaption className="eco__pill"><span>{label}</span></figcaption>
          </figure>
        ))}
        <div className="eco__logo"><img src="/images/igo-group-logo-wide.webp" alt="IGO Group — India's Leading Farming Conglomerate" loading="lazy" decoding="async" /></div>
      </div>

      <p className="eco__lead"><span className="eco__lead-line" /><span className="eco__lead-text">A sovereign agricultural ecosystem covering Engineering, Production, Trade, and Consumer Lifestyle.</span><span className="eco__lead-line" /></p>

      <ul className="eco__stats">
        {STATS.map(({ value, label }, i) => (
          <li key={label} className="eco__stat" style={{ '--d': `${i * 0.7}s` } as React.CSSProperties}>
            <strong className="eco__stat-value"><span className="eco__type" style={{ '--n': value.length } as React.CSSProperties}>{value}</span></strong>
            <span className="eco__stat-label"><span className="eco__type" style={{ '--n': label.length } as React.CSSProperties}>{label}</span></span>
          </li>
        ))}
      </ul>
    </div>
    <div className="eco__brands"><BrandsMarquee headless /></div>
  </section>
  );
};

export default EcosystemSection;
