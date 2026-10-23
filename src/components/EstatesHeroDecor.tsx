import React from 'react';

/** Decorative, non-interactive artwork for the "Estates by Location" hero (SVG only, no photos). */

const LEAF = 'M0 0 C 26 -34 70 -38 96 0 C 70 38 26 34 0 0 Z';

export const TopLeftLeaves: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 220 300" fill="none" aria-hidden="true">
    <path d="M30 300 C 40 200 70 110 150 30" stroke="#8fbf7a" strokeWidth="2" opacity=".55" />
    <path d="M10 250 C 70 230 150 170 215 60" stroke="#9cc788" strokeWidth="1.5" opacity=".4" />
    <g fill="#8fbf7a">
      <path d={LEAF} transform="translate(40 200) rotate(-62) scale(1.05)" opacity=".42" />
      <path d={LEAF} transform="translate(66 150) rotate(-30) scale(1.15)" opacity=".4" />
      <path d={LEAF} transform="translate(96 100) rotate(-72) scale(.95)" opacity=".38" />
      <path d={LEAF} transform="translate(130 52) rotate(-48) scale(.8)" opacity=".34" />
    </g>
  </svg>
);

export const TopRightLeaves: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 200 280" fill="none" aria-hidden="true">
    <path d="M170 0 C 160 90 120 160 30 230" stroke="#9cc788" strokeWidth="1.6" opacity=".5" />
    <g fill="#8fbf7a">
      <path d={LEAF} transform="translate(160 40) rotate(205) scale(.9)" opacity=".42" />
      <path d={LEAF} transform="translate(150 165) rotate(250) scale(.38)" opacity=".4" />
    </g>
  </svg>
);

export const BottomPlants: React.FC<{ className?: string; flip?: boolean }> = ({ className, flip }) => (
  <svg className={className} viewBox="0 0 260 220" fill="none" aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
    <path d="M0 220 C 20 170 90 150 170 190 C 200 205 230 215 260 220 Z" fill="#2f8a52" opacity=".85" />
    <g>
      <path d={LEAF} transform="translate(20 215) rotate(-80) scale(1.25)" fill="#3f9a57" opacity=".9" />
      <path d={LEAF} transform="translate(30 215) rotate(-58) scale(1.35)" fill="#2d7a3e" opacity=".9" />
      <path d={LEAF} transform="translate(44 215) rotate(-38) scale(1.1)" fill="#4aa862" opacity=".85" />
      <path d={LEAF} transform="translate(60 215) rotate(-20) scale(.9)" fill="#3f9a57" opacity=".85" />
    </g>
  </svg>
);

export const Landscape: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 1440 260" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <defs>
      <linearGradient id="estLandFade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F5F7E9" stopOpacity="1" />
        <stop offset=".55" stopColor="#F5F7E9" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="estField" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#d9e6b8" />
        <stop offset="1" stopColor="#bcd58f" />
      </linearGradient>
    </defs>
    {/* distant hills */}
    <path d="M0 120 C 80 80 150 70 240 100 C 320 125 380 95 470 110 L 470 260 L 0 260 Z" fill="#dbe7c8" opacity=".7" />
    <path d="M900 118 C 1000 82 1100 70 1200 96 C 1300 120 1380 100 1440 84 L 1440 260 L 900 260 Z" fill="#dbe7c8" opacity=".7" />
    {/* tree line */}
    <g fill="#c3d6ae" opacity=".8">
      {[60, 150, 210, 330, 420, 520, 640, 760, 860, 980, 1070, 1160, 1250, 1340, 1410].map((x, i) => (
        <ellipse key={x} cx={x} cy={128 + (i % 3) * 6} rx={22 + (i % 4) * 5} ry={16 + (i % 3) * 4} />
      ))}
    </g>
    <g fill="#b3cb9b" opacity=".75">
      <rect x="120" y="116" width="4" height="26" /><circle cx="122" cy="106" r="26" />
      <rect x="1372" y="92" width="4" height="52" /><circle cx="1374" cy="84" r="28" />
      <rect x="1296" y="100" width="3" height="40" /><circle cx="1297" cy="92" r="18" />
    </g>
    {/* fields */}
    <path d="M0 150 C 240 134 520 146 760 140 C 1040 134 1240 146 1440 136 L 1440 260 L 0 260 Z" fill="url(#estField)" />
    <g stroke="#cfe0a6" strokeWidth="2" fill="none" opacity=".85">
      <path d="M0 176 C 300 160 700 176 1440 158" />
      <path d="M0 200 C 360 180 760 202 1440 180" />
      <path d="M0 226 C 380 206 800 230 1440 206" />
    </g>
    {/* rolling hills */}
    <path d="M0 200 C 120 170 240 186 330 230 L 330 260 L 0 260 Z" fill="#7fbf7f" opacity=".55" />
    <path d="M1440 196 C 1330 168 1230 190 1140 232 L 1140 260 L 1440 260 Z" fill="#7fbf7f" opacity=".55" />
    <rect width="1440" height="150" fill="url(#estLandFade)" />
  </svg>
);
