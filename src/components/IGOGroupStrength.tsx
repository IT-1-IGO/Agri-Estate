import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Building2, Layers, Monitor, Tag, Users } from 'lucide-react';
import './IGOGroupStrength.css';

const STATS = [
  { icon: Tag, value: '26', label: 'Brands' },
  { icon: Layers, value: '28', label: 'Operational Departments' },
  { icon: Users, value: '2,500+', label: 'Employees' },
];

const PHOTOS = [
  { src: '/images/igo-group-head-office.webp', alt: 'IGO Group head office building', label: 'IGO Group Head Office', icon: Building2 },
  { src: '/images/igo-group-back-office.webp', alt: 'IGO Group back office operations team at work', label: 'Back Office Operations', icon: Monitor },
];

/** "Powered by the Strength of IGO Group": last content section of the Contact Us page, directly above the footer. */
const IGOGroupStrength: React.FC = () => {
  // The typewriter effect on the stats only runs while the section is on screen (text is plain/static otherwise).
  const ref = useRef<HTMLElement>(null);
  const [live, setLive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
  <section ref={ref} className={`igs${live ? ' igs--live' : ''}`} aria-labelledby="igs-heading">
    <div className="igs__inner">
      <header className="igs__head">
        <p className="igs__eyebrow"><span aria-hidden="true" />The IGO Group Strength<span aria-hidden="true" /></p>
        <h2 id="igs-heading" className="igs__title">
          Powered by the <em>Strength of IGO Group</em>
        </h2>
        <svg className="igs__swoosh" viewBox="0 0 240 14" aria-hidden="true" preserveAspectRatio="none"><path d="M2 11 C 60 2, 150 2, 238 9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
        <p className="igs__lead">Driving a greener future and sustainable growth through a powerful network of 26 brands and 2,500+ employees.</p>
      </header>

      <div className="igs__grid">
        <ul className="igs__stats">
          {STATS.map(({ icon: Icon, value, label }, i) => (
            <li key={label} className="igs__stat" style={{ '--d': `${i * 0.7}s` } as React.CSSProperties}>
              <span className="igs__stat-icon"><Icon size={30} strokeWidth={1.6} aria-hidden="true" /></span>
              <span className="igs__stat-text">
                <strong className="igs__stat-value"><span className="igs__type" style={{ '--n': value.length } as React.CSSProperties}>{value}</span></strong>
                <span className="igs__stat-label"><span className="igs__type" style={{ '--n': label.length } as React.CSSProperties}>{label}</span></span>
              </span>
            </li>
          ))}
        </ul>

        <ul className="igs__photos">
          {PHOTOS.map(({ src, alt, label, icon: Icon }) => (
            <li key={label} className="igs__photo">
              <img src={src} alt={alt} loading="lazy" decoding="async" />
              <p className="igs__photo-label"><Icon size={24} strokeWidth={1.5} aria-hidden="true" /><i aria-hidden="true" /><span>{label}</span></p>
            </li>
          ))}
        </ul>

        <div className="igs__cta">
          <a href="https://igogroups.in/" target="_blank" rel="noopener noreferrer" className="igs__btn">
            <span>Explore IGO Group</span><ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  </section>
  );
};

export default IGOGroupStrength;
