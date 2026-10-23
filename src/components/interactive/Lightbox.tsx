import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface LightboxProps {
  images: string[];
  index: number | null;
  onIndexChange: (i: number | null) => void;
  alt?: string;
}

const Lightbox: React.FC<LightboxProps> = ({ images, index, onIndexChange, alt = 'Estate image' }) => {
  const [zoom, setZoom] = useState(false);
  const open = index !== null;
  const count = images.length;

  useEffect(() => { setZoom(false); }, [index]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onIndexChange(null);
      if (e.key === 'ArrowRight') onIndexChange(((index as number) + 1) % count);
      if (e.key === 'ArrowLeft') onIndexChange(((index as number) - 1 + count) % count);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, index, count, onIndexChange]);

  if (!open) return null;
  const btn = 'w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur transition';

  return (
    <div className="fixed inset-0 z-[80] bg-black/90 flex items-center justify-center" role="dialog" aria-modal="true" aria-label={alt}>
      <button className="absolute inset-0 cursor-zoom-out" aria-label="Close" onClick={() => onIndexChange(null)} />
      <div className="relative max-w-[92vw] max-h-[88vh] overflow-auto">
        <img
          src={images[index as number]}
          alt={`${alt} ${(index as number) + 1}`}
          onClick={() => setZoom((z) => !z)}
          className={`block select-none transition-transform duration-300 ${zoom ? 'scale-[1.8] cursor-zoom-out' : 'cursor-zoom-in max-w-[92vw] max-h-[88vh] object-contain'}`}
          draggable={false}
        />
      </div>
      <div className="absolute top-5 right-5 flex gap-3">
        <button className={btn} aria-label={zoom ? 'Zoom out' : 'Zoom in'} onClick={() => setZoom((z) => !z)}>
          {zoom ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
        </button>
        <button className={btn} aria-label="Close" onClick={() => onIndexChange(null)}><X size={20} /></button>
      </div>
      {count > 1 && (
        <>
          <button className={`${btn} absolute left-5 top-1/2 -translate-y-1/2`} aria-label="Previous image" onClick={() => onIndexChange(((index as number) - 1 + count) % count)}><ChevronLeft size={22} /></button>
          <button className={`${btn} absolute right-5 top-1/2 -translate-y-1/2`} aria-label="Next image" onClick={() => onIndexChange(((index as number) + 1) % count)}><ChevronRight size={22} /></button>
          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/80 text-sm">{(index as number) + 1} / {count}</span>
        </>
      )}
    </div>
  );
};

export default Lightbox;
