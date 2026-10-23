import React from 'react';

/**
 * Tablet/desktop hero banner: a text-free background image with live (translatable) text laid over it.
 * Everything inside is sized in container-width units (cqw), so the text keeps its place on the
 * artwork at every screen width, exactly like the original single-image banner.
 */
const HeroStage: React.FC<{
  src: string;
  width: number;
  height: number;
  children: React.ReactNode;
}> = ({ src, width, height, children }) => (
  <div className="hidden md:block">
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: `${width} / ${height}`, containerType: 'inline-size' }}>
      <img
        src={src}
        alt=""
        aria-hidden="true"
        width={width}
        height={height}
        fetchPriority="high"
        className="absolute inset-0 block h-full w-full object-cover"
      />
      {children}
    </div>
  </div>
);

export default HeroStage;
