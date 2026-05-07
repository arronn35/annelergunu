// Decorative SVG components used across the site

const HeartGift = ({ size = 280 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="heartFace" x1="50" y1="40" x2="160" y2="180" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#FFC0D4"/>
        <stop offset="0.5" stopColor="#F48FB1"/>
        <stop offset="1" stopColor="#EC407A"/>
      </linearGradient>
      <linearGradient id="heartShine" x1="60" y1="50" x2="120" y2="120" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9"/>
        <stop offset="1" stopColor="#FFFFFF" stopOpacity="0"/>
      </linearGradient>
      <linearGradient id="ribbonGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFE0EB"/>
        <stop offset="1" stopColor="#F48FB1"/>
      </linearGradient>
      <linearGradient id="bowGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFD0E0"/>
        <stop offset="1" stopColor="#EC407A"/>
      </linearGradient>
      <radialGradient id="bowKnot" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#FFE0EB"/>
        <stop offset="1" stopColor="#D81B60"/>
      </radialGradient>
    </defs>
    {/* Heart shape — body */}
    <path
      d="M100 175 C40 130, 15 95, 25 65 C32 42, 58 32, 78 45 C88 51, 96 60, 100 70 C104 60, 112 51, 122 45 C142 32, 168 42, 175 65 C185 95, 160 130, 100 175Z"
      fill="url(#heartFace)"
    />
    {/* Sheen */}
    <path
      d="M65 60 C58 55, 50 60, 48 70 C46 78, 52 85, 60 82 C70 78, 80 70, 82 60 C82 55, 76 53, 70 56 Z"
      fill="url(#heartShine)"
      opacity="0.7"
    />
    {/* Ribbon vertical */}
    <rect x="92" y="42" width="16" height="135" fill="url(#ribbonGrad)" opacity="0.95" />
    {/* Ribbon horizontal — curves over the heart */}
    <path
      d="M30 95 Q100 110, 170 95 L170 115 Q100 130, 30 115 Z"
      fill="url(#ribbonGrad)"
      opacity="0.9"
    />
    {/* Bow loops */}
    <ellipse cx="78" cy="38" rx="22" ry="14" fill="url(#bowGrad)" transform="rotate(-18 78 38)" />
    <ellipse cx="122" cy="38" rx="22" ry="14" fill="url(#bowGrad)" transform="rotate(18 122 38)" />
    <ellipse cx="78" cy="38" rx="10" ry="6" fill="#FFE8EE" opacity="0.6" transform="rotate(-18 78 38)" />
    <ellipse cx="122" cy="38" rx="10" ry="6" fill="#FFE8EE" opacity="0.6" transform="rotate(18 122 38)" />
    {/* Bow ribbons trailing */}
    <path d="M68 50 Q60 62, 56 78" stroke="#EC407A" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.8" />
    <path d="M132 50 Q140 62, 144 78" stroke="#EC407A" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.8" />
    {/* Knot */}
    <circle cx="100" cy="38" r="11" fill="url(#bowKnot)" />
    <circle cx="100" cy="36" r="3" fill="#FFFFFF" opacity="0.7" />
    {/* Sparkles around heart */}
    <g opacity="0.9">
      <path d="M30 50 L32 45 L34 50 L39 52 L34 54 L32 59 L30 54 L25 52 Z" fill="#FFE0EB"/>
      <path d="M170 130 L172 124 L174 130 L180 132 L174 134 L172 140 L170 134 L164 132 Z" fill="#FFFFFF" opacity="0.85"/>
      <circle cx="40" cy="120" r="3" fill="#FFFFFF" opacity="0.8"/>
      <circle cx="160" cy="60" r="3" fill="#FFFFFF" opacity="0.8"/>
    </g>
  </svg>
);

const Flower = ({ size = 60, hue = 'pink' }) => {
  const palettes = {
    pink:    { petal: '#FFB6C8', petalDark: '#F48FB1', center: '#FFE0A0', centerDark: '#E8B86F' },
    rose:    { petal: '#FFC4D6', petalDark: '#EC407A', center: '#FFF0F5', centerDark: '#F48FB1' },
    cream:   { petal: '#FFFAF5', petalDark: '#FFE0EB', center: '#F5D89E', centerDark: '#E8B86F' },
    blush:   { petal: '#FFE0EB', petalDark: '#FFB6C8', center: '#FFF', centerDark: '#FFD6E2' },
  };
  const c = palettes[hue] || palettes.pink;
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <radialGradient id={`p${id}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={c.petal}/>
          <stop offset="1" stopColor={c.petalDark}/>
        </radialGradient>
        <radialGradient id={`ce${id}`} cx="0.5" cy="0.4" r="0.6">
          <stop offset="0" stopColor={c.center}/>
          <stop offset="1" stopColor={c.centerDark}/>
        </radialGradient>
      </defs>
      {[0, 72, 144, 216, 288].map(a => (
        <ellipse
          key={a}
          cx="30" cy="14" rx="9" ry="14"
          fill={`url(#p${id})`}
          transform={`rotate(${a} 30 30)`}
          opacity="0.95"
        />
      ))}
      <circle cx="30" cy="30" r="7" fill={`url(#ce${id})`}/>
      <circle cx="28" cy="28" r="2" fill="#FFF" opacity="0.6"/>
    </svg>
  );
};

const Butterfly = ({ size = 50, color = '#F48FB1' }) => {
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 60 50" fill="none">
      <defs>
        <linearGradient id={`bf${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFE0EB"/>
          <stop offset="1" stopColor={color}/>
        </linearGradient>
      </defs>
      <g className="butterfly-wing">
        {/* left upper wing */}
        <path d="M30 25 C18 8, 4 10, 6 22 C7 30, 18 30, 30 25 Z" fill={`url(#bf${id})`} opacity="0.95"/>
        {/* left lower wing */}
        <path d="M30 25 C20 36, 8 42, 10 32 C12 26, 22 24, 30 25 Z" fill={`url(#bf${id})`} opacity="0.85"/>
        {/* right upper wing */}
        <path d="M30 25 C42 8, 56 10, 54 22 C53 30, 42 30, 30 25 Z" fill={`url(#bf${id})`} opacity="0.95"/>
        {/* right lower wing */}
        <path d="M30 25 C40 36, 52 42, 50 32 C48 26, 38 24, 30 25 Z" fill={`url(#bf${id})`} opacity="0.85"/>
        {/* wing dots */}
        <circle cx="14" cy="18" r="2.5" fill="#FFF" opacity="0.7"/>
        <circle cx="46" cy="18" r="2.5" fill="#FFF" opacity="0.7"/>
      </g>
      {/* body */}
      <ellipse cx="30" cy="28" rx="2" ry="11" fill="#4A2C3A"/>
      {/* antennae */}
      <path d="M30 18 Q28 12, 25 10" stroke="#4A2C3A" strokeWidth="1" fill="none" strokeLinecap="round"/>
      <path d="M30 18 Q32 12, 35 10" stroke="#4A2C3A" strokeWidth="1" fill="none" strokeLinecap="round"/>
    </svg>
  );
};

const HeartShape = ({ size = 30, color = '#EC407A' }) => (
  <svg width={size} height={size} viewBox="0 0 30 30">
    <path
      d="M15 26 C5 18, 1 12, 4 7 C6 3, 11 3, 13 6 C14 7.5, 14.5 8.5, 15 9.5 C15.5 8.5, 16 7.5, 17 6 C19 3, 24 3, 26 7 C29 12, 25 18, 15 26Z"
      fill={color}
    />
  </svg>
);

const Petal = ({ size = 18, color = '#FFB6C8' }) => (
  <svg width={size} height={size} viewBox="0 0 20 20">
    <path
      d="M10 2 C14 4, 18 8, 16 14 C14 18, 8 18, 6 14 C4 8, 6 4, 10 2 Z"
      fill={color}
      opacity="0.9"
    />
  </svg>
);

const PlayIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7L8 5z"/>
  </svg>
);
const PauseIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="5" width="4" height="14" rx="1"/>
    <rect x="14" y="5" width="4" height="14" rx="1"/>
  </svg>
);
const ChevronLeft = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const ChevronRight = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const PlusIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const SendIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const CloseIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const TrashIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
  </svg>
);

Object.assign(window, {
  HeartGift, Flower, Butterfly, HeartShape, Petal,
  PlayIcon, PauseIcon, ChevronLeft, ChevronRight,
  PlusIcon, SendIcon, CloseIcon, TrashIcon,
});
