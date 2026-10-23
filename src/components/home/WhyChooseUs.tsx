import React, { useEffect, useRef, useState } from 'react';
import { MapPin, CalendarCheck, UserRoundCheck, TrendingUp, Handshake } from 'lucide-react';
import './WhyChooseUs.css';

const FEATURES = [
  { Icon: MapPin, title: 'Prime Location', text: 'Discover agricultural lands in promising locations with convenient access, suitable surroundings, and strong potential for your farming plans.' },
  { Icon: CalendarCheck, title: 'Site Visit', text: 'Visit your preferred property in person to evaluate the land, accessibility, soil conditions, water availability, and farming suitability.' },
  { Icon: UserRoundCheck, title: 'Expert Guidance', text: 'Get professional guidance to choose the right agricultural land, understand farming opportunities, and plan your project with confidence.' },
  { Icon: TrendingUp, title: 'Long-Term Value', text: 'Explore land investment opportunities with long-term potential, helping you plan for future agricultural use and sustainable development.' },
  { Icon: Handshake, title: 'Trusted by Farm Entrepreneurs', text: 'Build your farming journey with transparent processes, dependable support, and guidance designed around your agricultural goals.' },
];

const Leaf: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <defs>
      <linearGradient id="wc-leaf-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#a5e36b" />
        <stop offset="1" stopColor="#2e9e1f" />
      </linearGradient>
    </defs>
    <path d="M4 13c0-6 5-9 16-9 0 11-4 16-10 16-4 0-6-2-6-7Z" fill="url(#wc-leaf-g)" />
  </svg>
);

const WhyChooseUs: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { setInView(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className={`wc-section${inView ? ' is-in' : ''}`} aria-labelledby="wc-heading">
      <Leaf className="wc-float wc-float--a" />
      <Leaf className="wc-float wc-float--b" />
      <div className="wc-head">
        <div className="wc-eyebrow">
          <span className="wc-eyebrow__line" />
          <span className="wc-eyebrow__text">Why Choose Us</span>
          <Leaf className="wc-eyebrow__leaf" />
          <span className="wc-eyebrow__line" />
        </div>
        <h2 id="wc-heading" className="wc-title">Why Choose <span>IGO</span> Agri Estate?</h2>
        <p className="wc-sub">We are more than a land platform — we are your long-term partner in sustainable agriculture.</p>
      </div>

      <div className="wc-inner">
        <figure className="wc-media">
          <img src="/images/why/why-growth-hd.webp" alt="A young green seedling growing from rich soil in a sunlit farm field with sustainability icons" width={2244} height={1384} loading="lazy" decoding="async" />
        </figure>

        <ul className="wc-grid">
          {FEATURES.map(({ Icon, title, text }, i) => (
            <li key={title} className="wc-card" style={{ ['--i' as string]: i } as React.CSSProperties}>
              <span className="wc-card__icon"><Icon size={22} strokeWidth={2.1} /></span>
              <h3 className="wc-card__title">{title}</h3>
              <p className="wc-card__text">{text}</p>
            </li>
          ))}
        </ul>
      </div>

    </section>
  );
};

export default WhyChooseUs;
