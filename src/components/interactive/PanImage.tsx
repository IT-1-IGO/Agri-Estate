import React, { useEffect, useRef, useState } from 'react';
import { Plus, Minus, Move } from 'lucide-react';

interface PanImageProps {
  src: string;
  alt: string;
  className?: string;
}

const PanImage: React.FC<PanImageProps> = ({ src, alt, className = '' }) => {
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1.6);
  const [idle, setIdle] = useState(true);
  const dir = useRef(1);

  const clamp = (x: number, y: number, s = scale) => {
    const el = box.current;
    if (!el) return { x, y };
    const mx = (el.clientWidth * (s - 1)) / 2;
    const my = (el.clientHeight * (s - 1)) / 2;
    return { x: Math.max(-mx, Math.min(mx, x)), y: Math.max(-my, Math.min(my, y)) };
  };

  useEffect(() => {
    if (!idle || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      setPos((p) => {
        const next = clamp(p.x + dir.current * 0.6, p.y);
        if (next.x === p.x) dir.current *= -1;
        return next;
      });
    }, 16);
    return () => window.clearInterval(id);
  }, [idle, scale]);

  const zoom = (d: number) => {
    const s = Math.max(1, Math.min(3, scale + d));
    setScale(s);
    setPos((p) => clamp(p.x, p.y, s));
  };

  return (
    <div
      ref={box}
      className={`relative overflow-hidden touch-none select-none cursor-grab active:cursor-grabbing ${className}`}
      onPointerDown={(e) => {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        drag.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
        setIdle(false);
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        setPos(clamp(drag.current.px + e.clientX - drag.current.x, drag.current.py + e.clientY - drag.current.y));
      }}
      onPointerUp={() => { drag.current = null; }}
      onWheel={(e) => zoom(e.deltaY < 0 ? 0.15 : -0.15)}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="w-full h-full object-cover pointer-events-none"
        style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})` }}
      />
      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white/80 text-xs pointer-events-none">
        <Move size={14} /> Drag to look around
      </div>
      <div className="absolute bottom-4 right-4 flex gap-2" onPointerDown={(e) => e.stopPropagation()}>
        <button aria-label="Zoom in" onClick={() => zoom(0.3)} className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center"><Plus size={16} /></button>
        <button aria-label="Zoom out" onClick={() => zoom(-0.3)} className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center"><Minus size={16} /></button>
      </div>
    </div>
  );
};

export default PanImage;
