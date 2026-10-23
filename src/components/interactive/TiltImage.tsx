import React, { useRef } from 'react';

interface TiltImageProps {
  children: React.ReactNode;
  className?: string;
  max?: number;
}

const TiltImage: React.FC<TiltImageProps> = ({ children, className = '', max = 8 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || reduced || e.pointerType === 'touch') return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(900px) rotateY(${(x - 0.5) * max * 2}deg) rotateX(${(0.5 - y) * max * 2}deg) scale(1.03)`;
    el.style.setProperty('--gx', `${x * 100}%`);
    el.style.setProperty('--gy', `${y * 100}%`);
    el.style.setProperty('--go', '1');
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = '';
    el.style.setProperty('--go', '0');
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`relative overflow-hidden ${className}`}
      style={{ transition: 'transform .25s ease-out', willChange: 'transform' }}
    >
      {children}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: 'var(--go, 0)',
          transition: 'opacity .25s',
          background: 'radial-gradient(circle at var(--gx, 50%) var(--gy, 50%), rgba(255,255,255,.28), transparent 55%)',
        }}
      />
    </div>
  );
};

export default TiltImage;
