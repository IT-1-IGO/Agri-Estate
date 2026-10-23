import React, { useState } from 'react';

export interface Hotspot {
  x: number; // percent from left
  y: number; // percent from top
  title: string;
  text: string;
}

interface HotspotImageProps {
  src: string;
  alt: string;
  hotspots: Hotspot[];
  className?: string;
}

const HotspotImage: React.FC<HotspotImageProps> = ({ src, alt, hotspots, className = '' }) => {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className={`${className.includes('absolute') ? '' : 'relative'} ${className}`} onMouseLeave={() => setActive(null)}>
      <img src={src} alt={alt} loading="lazy" decoding="async" className="w-full h-full object-cover" />
      {hotspots.map((h, i) => (
        <div key={h.title} className="absolute" style={{ left: `${h.x}%`, top: `${h.y}%` }}>
          <button
            type="button"
            aria-label={h.title}
            aria-expanded={active === i}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            onClick={() => setActive(active === i ? null : i)}
            className="relative -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-4 border-[#1B5E20] shadow-lg"
          >
            <span className="absolute inset-0 rounded-full bg-white/70 animate-ping" aria-hidden="true" />
          </button>
          {active === i && (
            <div
              role="status"
              className={`absolute z-20 w-52 rounded-xl bg-white p-3 text-left shadow-xl ${h.y > 55 ? 'bottom-5' : 'top-5'} ${h.x > 60 ? 'right-0' : 'left-0'}`}
            >
              <b className="block text-sm text-[#1B5E20]">{h.title}</b>
              <span className="block text-xs text-gray-600 mt-1">{h.text}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default HotspotImage;
