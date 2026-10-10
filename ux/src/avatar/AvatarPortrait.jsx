import { useId } from 'react';
import { ACCOUTREMENTS, normalizeAvatar } from './avatarSchema';

// A painted, full-body portrait of a member's avatar, drawn as pure inline SVG.
// Styled after Renaissance (Florentine, Venetian, Flemish, Tudor) and Asian court
// portraiture (Ming, Edo, Mughal, Joseon). Earned accoutrements appear as symbolic objects.

// ---------------------------------------------------------------- colour palette

const PRIMARY = {
  crimson: '#9e1b2c', ultramarine: '#26408f', emerald: '#1f6b4a', ochre: '#c08a2a',
  plum: '#5e2a52', ivory: '#e8dcbc', black: '#25222a', teal: '#1f6f73', rose: '#c8687a',
};
const ACCENT = { gold: '#d9aa3f', silver: '#c3c8d0', pearl: '#efe7d6', jade: '#5fa883', coral: '#e2775e' };
const SKIN = {
  porcelain: '#f6e0d2', fair: '#efcdb1', olive: '#d4a77a', tan: '#bf8a5c', brown: '#8d5a3b', deep: '#5c3a27',
};
const HAIR = {
  black: '#211c1e', brown: '#5b3a24', auburn: '#8a3b1f', blonde: '#d7b35e', red: '#b8461f',
  silver: '#c9c9d0', blue: '#33559f',
};

const EAST = ['ming', 'edo', 'joseon'];
const EUROPE = ['florentine', 'venetian', 'flemish', 'tudor'];
const INK = '#2a1d18';

function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
const shade = (c, t) => (t < 0 ? mix(c, '#000000', -t) : mix(c, '#ffffff', t));

// ---------------------------------------------------------------- geometry

const CX = 138;
const FLOOR = 292;

const POSES = {
  standing: {
    legs: [[[129, 232], [128, 290], [127, 343]], [[147, 232], [148, 290], [149, 343]]],
    free: [[166, 150], [175, 196], [173, 238]],
  },
  contrapposto: {
    legs: [[[130, 232], [132, 290], [134, 343]], [[149, 231], [158, 288], [154, 339]]],
    free: [[166, 150], [177, 195], [184, 232]],
  },
  'hand-on-hip': {
    legs: [[[128, 232], [125, 290], [122, 343]], [[148, 232], [151, 290], [154, 343]]],
    free: [[166, 150], [199, 184], [163, 214]],
  },
};
const HOLD = [[110, 150], [100, 197], [120, 214]];

const GARMENT_LABEL = {
  doublet: 'doublet and hose', gown: 'gown', robe: 'scholar’s robe', hanfu: 'hanfu',
  kimono: 'kimono', jama: 'jama', hanbok: 'hanbok', cloak: 'cloak',
};

const linePts = (pts) => 'M' + pts.map((p) => p.join(',')).join(' L');

// ---------------------------------------------------------------- defs

function Defs({ u, C, a }) {
  const p = C.primary;
  const acc = C.accent;
  return (
    <defs>
      <linearGradient id={u('cloth')} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={shade(p, -0.32)} />
        <stop offset="0.3" stopColor={p} />
        <stop offset="0.52" stopColor={shade(p, 0.14)} />
        <stop offset="0.75" stopColor={p} />
        <stop offset="1" stopColor={shade(p, -0.38)} />
      </linearGradient>
      <linearGradient id={u('cloth2')} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={shade(C.second, -0.25)} />
        <stop offset="0.5" stopColor={shade(C.second, 0.1)} />
        <stop offset="1" stopColor={shade(C.second, -0.3)} />
      </linearGradient>
      <linearGradient id={u('skin')} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={shade(C.skin, -0.12)} />
        <stop offset="0.45" stopColor={shade(C.skin, 0.06)} />
        <stop offset="1" stopColor={shade(C.skin, -0.16)} />
      </linearGradient>
      <linearGradient id={u('gold')} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#f6dc8a" />
        <stop offset="0.35" stopColor="#c99a32" />
        <stop offset="0.6" stopColor="#f1d27a" />
        <stop offset="1" stopColor="#8a6418" />
      </linearGradient>
      <linearGradient id={u('accent')} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={shade(acc, 0.35)} />
        <stop offset="0.5" stopColor={acc} />
        <stop offset="1" stopColor={shade(acc, -0.3)} />
      </linearGradient>
      <linearGradient id={u('wood')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8a5a34" />
        <stop offset="1" stopColor="#4e3020" />
      </linearGradient>
      <radialGradient id={u('glow')} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#fff6c8" />
        <stop offset="0.6" stopColor="#f2c454" />
        <stop offset="1" stopColor="#c9822a" />
      </radialGradient>
      <radialGradient id={u('vignette')} cx="0.5" cy="0.45" r="0.7">
        <stop offset="0.55" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.38" />
      </radialGradient>
      <pattern id={u('brocade')} width="14" height="18" patternUnits="userSpaceOnUse">
        <path d="M7,2 Q12,6 7,9 Q2,6 7,2 Z M7,9 Q13,13 7,17 Q1,13 7,9 Z" fill={acc} opacity="0.7" />
        <circle cx="0" cy="9" r="1.5" fill={acc} />
        <circle cx="14" cy="9" r="1.5" fill={acc} />
      </pattern>
      <pattern id={u('seigaiha')} width="16" height="8" patternUnits="userSpaceOnUse">
        {[[8, 4], [0, 8], [16, 8]].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r="7.5" fill={C.waveBase} stroke={acc} strokeWidth="0.8" />
            <circle cx={x} cy={y} r="5" fill="none" stroke={acc} strokeWidth="0.8" />
            <circle cx={x} cy={y} r="2.5" fill="none" stroke={acc} strokeWidth="0.8" />
          </g>
        ))}
      </pattern>
      <pattern id={u('clouds')} width="22" height="14" patternUnits="userSpaceOnUse">
        <path
          d="M2,10 q2,-6 7,-3 q2,-5 7,-1 q4,1 2,5 q-2,2 -4,0 M9,7 q2,3 -1,4 M2,10 q2,2 4,0"
          fill="none" stroke={acc} strokeWidth="1" strokeLinecap="round"
        />
      </pattern>
      <pattern id={u('dots')} width="7" height="7" patternUnits="userSpaceOnUse">
        <circle cx="3.5" cy="3.5" r="1.1" fill={a.tradition === 'mughal' ? acc : shade(p, -0.45)} />
      </pattern>
      <pattern id={u('lattice')} width="10" height="14" patternUnits="userSpaceOnUse">
        <path d="M0,7 L5,0 L10,7 L5,14 Z" fill="none" stroke="#3b3a36" strokeWidth="0.8" />
      </pattern>
      <pattern id={u('leaf')} width="18" height="18" patternUnits="userSpaceOnUse">
        <path d="M0,0 H18 V18" fill="none" stroke="#a87b22" strokeWidth="0.5" opacity="0.6" />
      </pattern>
    </defs>
  );
}

// ---------------------------------------------------------------- backdrops

function Backdrop({ a, u, B }) {
  const W = B.x1 - B.x0;
  const H = B.y1 - B.y0;
  const floor = (fill, extra) => (
    <g>
      <rect x={B.x0} y={FLOOR} width={W} height={B.y1 - FLOOR} fill={fill} />
      <rect x={B.x0} y={FLOOR} width={W} height="3" fill="#000" opacity="0.18" />
      {extra}
    </g>
  );

  switch (a.backdrop) {
    case 'loggia': {
      const arch = `M68,${FLOOR} V128 A82,82 0 0 1 232,128 V${FLOOR} Z`;
      return (
        <g>
          <linearGradient id={u('stone')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d9c6a0" />
            <stop offset="1" stopColor="#a8916a" />
          </linearGradient>
          <linearGradient id={u('sky')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7fa6c9" />
            <stop offset="0.7" stopColor="#e9e2c8" />
            <stop offset="1" stopColor="#f2e3bf" />
          </linearGradient>
          <clipPath id={u('arch')}><path d={arch} /></clipPath>
          <rect x={B.x0} y={B.y0} width={W} height={H} fill={`url(#${u('stone')})`} />
          <path d={arch} fill={`url(#${u('sky')})`} />
          <g clipPath={`url(#${u('arch')})`}>
            <path d="M60,214 Q100,186 140,206 Q180,180 240,200 V300 H60 Z" fill="#9db3c4" />
            <path d="M60,232 Q95,212 130,228 Q175,206 240,226 V300 H60 Z" fill="#7e9a86" />
            <path d="M60,250 Q120,236 170,248 Q210,240 240,246 V300 H60 Z" fill="#5f7d4c" />
            <path d="M120,300 Q150,262 196,248" fill="none" stroke="#e5d6a8" strokeWidth="4" />
            {[[86, 236], [204, 232], [222, 238]].map(([x, y]) => (
              <g key={x}>
                <line x1={x} y1={y} x2={x} y2={y + 12} stroke="#4a3a2a" strokeWidth="1.2" />
                <ellipse cx={x} cy={y - 2} rx="5" ry="7" fill="#3f5a32" />
              </g>
            ))}
            <path d="M100,150 q6,-3 12,0 M170,140 q5,-3 10,0" fill="none" stroke="#4a5560" strokeWidth="0.8" />
          </g>
          <path d={arch} fill="none" stroke="#8c7550" strokeWidth="7" />
          <path d={arch} fill="none" stroke="#efe0bd" strokeWidth="1.5" />
          <path d="M143,40 h14 l-2,12 h-10 Z" fill="#c4ad82" stroke="#8c7550" />
          {[44, 236].map((x) => (
            <g key={x}>
              <rect x={x} y="120" width="20" height={FLOOR - 120} fill="#e6d6b2" stroke="#8c7550" />
              <rect x={x + 4} y="124" width="3" height={FLOOR - 130} fill="#c9b48c" />
              <rect x={x + 13} y="124" width="3" height={FLOOR - 130} fill="#c9b48c" />
              <rect x={x - 4} y="110" width="28" height="10" fill="#d6c39b" stroke="#8c7550" />
              <rect x={x - 3} y={FLOOR - 8} width="26" height="8" fill="#d6c39b" stroke="#8c7550" />
            </g>
          ))}
          {floor('#bba57e', (
            <g stroke="#8c7550" strokeWidth="0.8" opacity="0.7">
              {[-140, -80, -30, 20, 70, 120, 180, 240, 300].map((x) => (
                <line key={x} x1={150 + (x - 150) * 0.25} y1={FLOOR} x2={x} y2={B.y1} />
              ))}
              {[306, 324, 348, 378, 412].map((y) => <line key={y} x1={B.x0} y1={y} x2={B.x1} y2={y} />)}
            </g>
          ))}
        </g>
      );
    }
    case 'study': {
      const books = ['#7a2a22', '#2e4a6b', '#6b5a2a', '#3d5a3a', '#5a2d4a', '#8a6a3a', '#2a2a3a', '#7a3a1a'];
      return (
        <g>
          <linearGradient id={u('panel')} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#3a271b" />
            <stop offset="0.5" stopColor="#5a3d29" />
            <stop offset="1" stopColor="#3a271b" />
          </linearGradient>
          <rect x={B.x0} y={B.y0} width={W} height={H} fill={`url(#${u('panel')})`} />
          {[30, 96, 162, 228].map((x) => (
            <rect key={x} x={x} y="196" width="56" height="86" fill="none" stroke="#2a1b12" strokeWidth="2" opacity="0.7" />
          ))}
          <rect x={B.x0} y="186" width={W} height="5" fill="#2a1b12" opacity="0.6" />
          {/* leaded window */}
          <path d="M32,140 V62 Q66,30 100,62 V140 Z" fill="#cfe0e2" />
          <path d="M32,140 V62 Q66,30 100,62 V140 Z" fill={`url(#${u('lattice')})`} />
          <path d="M32,140 V62 Q66,30 100,62 V140 Z" fill="none" stroke="#2a1b12" strokeWidth="4" />
          <rect x="28" y="140" width="76" height="6" fill="#6b4a30" />
          {/* bookshelf */}
          <rect x="190" y="112" width={B.x1 - 190} height="5" fill="#6b4a30" />
          {books.map((c, i) => {
            const h = 18 + ((i * 7) % 9);
            return <rect key={c} x={196 + i * 9.5} y={112 - h} width="8" height={h} fill={c} stroke="#1c120c" strokeWidth="0.5" />;
          })}
          {floor('#5b3c26', (
            <g stroke="#3a2618" strokeWidth="1">
              {[304, 320, 340, 364, 394].map((y) => <line key={y} x1={B.x0} y1={y} x2={B.x1} y2={y} />)}
            </g>
          ))}
        </g>
      );
    }
    case 'garden':
      return (
        <g>
          <linearGradient id={u('sky')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6f9cc4" />
            <stop offset="1" stopColor="#f0e6c6" />
          </linearGradient>
          <rect x={B.x0} y={B.y0} width={W} height={H} fill={`url(#${u('sky')})`} />
          <path d={`M${B.x0},${FLOOR - 70} Q90,190 160,215 Q220,195 ${B.x1},212 V${FLOOR} H${B.x0} Z`} fill="#9fb5a8" />
          {[[44, 110], [262, 120], [232, 150]].map(([x, top]) => (
            <g key={x}>
              <path d={`M${x},${top} Q${x + 14},${(top + FLOOR) / 2} ${x + 4},${FLOOR - 40} H${x - 4} Q${x - 14},${(top + FLOOR) / 2} ${x},${top} Z`} fill="#2f4a2c" />
              <path d={`M${x},${top} Q${x + 6},${(top + FLOOR) / 2} ${x + 2},${FLOOR - 40}`} fill="none" stroke="#4a6b3e" strokeWidth="2" />
            </g>
          ))}
          <path d={`M${B.x0},${FLOOR} V246 Q40,232 64,244 Q92,230 120,244 Q150,230 180,244 Q210,230 240,244 Q262,232 ${B.x1},244 V${FLOOR} Z`} fill="#3e5f35" />
          {[[40, 252], [78, 258], [110, 250], [170, 256], [210, 250], [250, 260], [60, 270], [230, 272]].map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <circle cx={x} cy={y} r="3.2" fill="#d65a6a" />
              <circle cx={x} cy={y} r="1.3" fill="#f6c0c6" />
            </g>
          ))}
          {floor('#7c9a52', (
            <g>
              <path d={`M110,${B.y1} Q140,330 150,${FLOOR}`} fill="none" stroke="#c9b98a" strokeWidth="18" opacity="0.5" />
              {[[50, 320], [240, 330], [80, 370], [260, 380]].map(([x, y]) => (
                <path key={x} d={`M${x},${y} l3,-7 l3,7 l3,-6 l2,6`} fill="none" stroke="#56743a" strokeWidth="1.2" />
              ))}
            </g>
          ))}
        </g>
      );
    case 'mountains': {
      const paper = '#efe5cc';
      return (
        <g>
          <linearGradient id={u('ink1')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6d7174" />
            <stop offset="1" stopColor={paper} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={u('ink2')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3f4547" />
            <stop offset="1" stopColor={paper} stopOpacity="0" />
          </linearGradient>
          <rect x={B.x0} y={B.y0} width={W} height={H} fill={paper} />
          <circle cx="214" cy="62" r="16" fill="#f7efd9" stroke="#c9b68a" strokeWidth="0.6" />
          <path d={`M${B.x0},210 L60,120 L84,150 L118,70 L150,140 L176,110 L210,170 L240,96 L${B.x1},150 V250 H${B.x0} Z`} fill={`url(#${u('ink1')})`} opacity="0.75" />
          <path d={`M${B.x0},250 L44,180 L70,206 L96,160 L130,230 L190,190 L222,150 L260,200 L${B.x1},186 V${FLOOR} H${B.x0} Z`} fill={`url(#${u('ink2')})`} opacity="0.85" />
          <path d="M118,70 L112,96 M240,96 L236,124 M96,160 L92,184" stroke="#2c3133" strokeWidth="1" opacity="0.5" />
          <path d={`M${B.x1},40 Q240,52 222,46 M246,46 l-6,-6 M236,50 l-5,-7 M228,48 l-5,-5`} fill="none" stroke="#34433a" strokeWidth="2" strokeLinecap="round" />
          {[[244, 38], [236, 42], [230, 40], [252, 44]].map(([x, y]) => (
            <path key={x} d={`M${x},${y} l-4,-4 m4,4 l-5,1 m5,-1 l-3,4`} stroke="#2f4a38" strokeWidth="1" />
          ))}
          <path d="M150,96 q4,-3 8,0 M162,92 q3,-2 6,0" fill="none" stroke="#333" strokeWidth="0.8" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x="32" y={36 + i * 11} width="5" height={6 + (i % 2) * 2} fill="#2a2a2a" opacity="0.55" rx="1" />
          ))}
          <rect x="30" y="108" width="10" height="10" fill="#b4322a" />
          <path d="M32.5,110.5 h5 v5 h-5 Z" fill="none" stroke={paper} strokeWidth="0.8" />
          {floor('#ddd0b0', (
            <g>
              <path d={`M${B.x0},${FLOOR + 6} Q120,${FLOOR - 4} ${B.x1},${FLOOR + 10}`} fill="none" stroke="#8b8a80" strokeWidth="1.2" opacity="0.6" />
              <path d={`M${B.x0},${B.y1} V340 Q60,326 90,340 Q70,350 ${B.x0},${B.y1}`} fill="#a19b8a" opacity="0.5" />
            </g>
          ))}
        </g>
      );
    }
    case 'waves': {
      const blue = '#1f3f6e';
      return (
        <g>
          <rect x={B.x0} y={B.y0} width={W} height={H} fill="#efe1bf" />
          <path d="M196,250 L222,206 Q226,202 230,206 L256,250 Z" fill="#5a7894" />
          <path d="M214,220 L222,206 Q226,202 230,206 L238,220 L232,216 L228,222 L222,215 Z" fill="#fbf7ee" />
          <path d={`M${B.x0},250 Q60,240 100,252 Q150,262 200,248 Q240,240 ${B.x1},250 V${FLOOR} H${B.x0} Z`} fill="#3d6591" />
          <path
            d={`M${B.x0},${FLOOR} V180 Q${B.x0 + 4},110 60,96 Q100,88 118,118 Q104,108 92,116 Q84,124 96,140 Q70,140 70,170 Q70,220 120,${FLOOR} Z`}
            fill={blue}
          />
          <path d={`M${B.x0 + 8},${FLOOR} Q${B.x0 + 14},200 50,140`} fill="none" stroke="#5f86b3" strokeWidth="3" />
          <path d="M60,96 Q100,88 118,118 Q104,108 92,116 Q84,124 96,140" fill="none" stroke="#f8f2e2" strokeWidth="3" />
          {[[116, 116], [108, 108], [98, 104], [88, 104], [78, 102]].map(([x, y]) => (
            <path key={x} d={`M${x},${y} q4,-6 8,-2 q-3,-1 -4,3`} fill="#f8f2e2" stroke="#f8f2e2" strokeWidth="1.2" />
          ))}
          {[[130, 80], [140, 96], [150, 70], [124, 66], [160, 88]].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="2" fill="#f8f2e2" />
          ))}
          {floor('#d6bf8e', (
            <path d={`M${B.x0},${FLOOR + 4} Q100,${FLOOR + 14} ${B.x1},${FLOOR + 4}`} fill="none" stroke="#f8f2e2" strokeWidth="2" opacity="0.8" />
          ))}
        </g>
      );
    }
    case 'gold-leaf': {
      const cloud = (y, x0, x1) => `M${x0},${y} Q${x0 - 10},${y - 10} ${x0 + 6},${y - 12} H${x1 - 6} Q${x1 + 10},${y - 10} ${x1},${y} Q${x1 + 8},${y + 10} ${x1 - 8},${y + 10} H${x0 + 8} Q${x0 - 8},${y + 10} ${x0},${y} Z`;
      return (
        <g>
          <linearGradient id={u('leafbg')} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e6c46a" />
            <stop offset="0.5" stopColor="#d2a742" />
            <stop offset="1" stopColor="#b98a2c" />
          </linearGradient>
          <rect x={B.x0} y={B.y0} width={W} height={H} fill={`url(#${u('leafbg')})`} />
          <rect x={B.x0} y={B.y0} width={W} height={H} fill={`url(#${u('leaf')})`} />
          <path d={cloud(64, 40, 120)} fill="#f2dc93" stroke="#b88a2c" strokeWidth="0.8" />
          <path d={cloud(170, 186, 270)} fill="#f2dc93" stroke="#b88a2c" strokeWidth="0.8" />
          <path d={cloud(240, 20, 80)} fill="#f2dc93" stroke="#b88a2c" strokeWidth="0.8" />
          {floor('#8f6a2a', (
            <rect x={B.x0} y={FLOOR + 3} width={W} height={B.y1 - FLOOR} fill={`url(#${u('leaf')})`} opacity="0.5" />
          ))}
        </g>
      );
    }
    case 'drapery':
    default: {
      const drape = ['crimson', 'rose', 'plum', 'coral'].includes(a.primaryColor) ? '#284a3a' : '#6a1c25';
      return (
        <g>
          <linearGradient id={u('fold')} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={shade(drape, -0.45)} />
            <stop offset="0.5" stopColor={shade(drape, 0.18)} />
            <stop offset="1" stopColor={shade(drape, -0.45)} />
          </linearGradient>
          <rect x={B.x0} y={B.y0} width={W} height={H} fill={shade(drape, -0.3)} />
          {Array.from({ length: 10 }, (_, i) => {
            const x = B.x0 - 10 + i * (W / 8.5);
            return (
              <path key={i} d={`M${x},${B.y0} Q${x + 12},170 ${x + 2},${FLOOR} H${x + 32} Q${x + 22},170 ${x + 34},${B.y0} Z`} fill={`url(#${u('fold')})`} />
            );
          })}
          <path d={`M${B.x0},${B.y0} H${B.x1} V${B.y0 + 30} Q215,${B.y0 + 64} 150,${B.y0 + 40} Q85,${B.y0 + 64} ${B.x0},${B.y0 + 30} Z`} fill={shade(drape, -0.1)} />
          <path d={`M${B.x0},${B.y0 + 30} Q85,${B.y0 + 64} 150,${B.y0 + 40} Q215,${B.y0 + 64} ${B.x1},${B.y0 + 30}`} fill="none" stroke="#d6a948" strokeWidth="2" strokeDasharray="2 3" />
          {floor('#6f5a48', (
            <g stroke="#4a3a2e" strokeWidth="0.8">
              {[308, 330, 358, 392].map((y) => <line key={y} x1={B.x0} y1={y} x2={B.x1} y2={y} />)}
            </g>
          ))}
        </g>
      );
    }
  }
}

// ---------------------------------------------------------------- frames

function Frame({ a, u }) {
  const ring = 'M0,0 H300 V420 H0 Z M22,22 V380 H278 V22 Z';
  switch (a.frame) {
    case 'lacquer':
      return (
        <g>
          <path d={ring} fill="#8e1b1b" fillRule="evenodd" />
          <rect x="3" y="3" width="294" height="414" fill="none" stroke="#5a0e0e" strokeWidth="2" />
          <rect x="15" y="15" width="270" height="372" fill="none" stroke="#151012" strokeWidth="8" />
          <rect x="19.5" y="19.5" width="261" height="363" fill="none" stroke="#d9aa3f" strokeWidth="1" />
          <rect x="8" y="8" width="284" height="404" fill="none" stroke="#d9aa3f" strokeWidth="0.6" opacity="0.7" />
          {[[3, 3, 1, 1], [297, 3, -1, 1], [3, 417, 1, -1], [297, 417, -1, -1]].map(([x, y, sx, sy]) => (
            <path key={`${x}-${y}`} d={`M${x},${y} h${18 * sx} v${5 * sy} h${-13 * sx} v${13 * sy} h${-5 * sx} Z`} fill={`url(#${u('gold')})`} />
          ))}
        </g>
      );
    case 'ebony':
      return (
        <g>
          <path d={ring} fill="#1b1512" fillRule="evenodd" />
          {[5, 9, 13, 17].map((i) => (
            <rect key={i} x={i} y={i} width={300 - 2 * i} height={420 - 2 * i} fill="none" stroke="#3a302a" strokeWidth="1.4" strokeDasharray="3 2" />
          ))}
          <rect x="20" y="20" width="260" height="362" fill="none" stroke="#c9a24a" strokeWidth="1.5" />
        </g>
      );
    case 'scroll-mount':
      return (
        <g>
          <path d={ring} fill="#b7a27a" fillRule="evenodd" />
          <path d={ring} fill={`url(#${u('clouds')})`} fillRule="evenodd" opacity="0.25" />
          <rect x="0" y="0" width="300" height="14" fill="#5a4a6a" />
          <rect x="21" y="21" width="258" height="360" fill="none" stroke="#6b5636" strokeWidth="1.5" />
          {[118, 176].map((x) => <rect key={x} x={x} y="5" width="6" height="16" fill="#e8dcc0" opacity="0.85" />)}
          <rect x="0" y="0" width="300" height="5" fill="#3a2a1c" />
          <path d="M140,3 Q150,-6 160,3" fill="none" stroke="#3a2a1c" strokeWidth="1.5" />
          <rect x="6" y="406" width="288" height="11" rx="5" fill={`url(#${u('wood')})`} />
          <rect x="0" y="405" width="10" height="13" rx="2" fill="#d9c08a" stroke="#6b5636" />
          <rect x="290" y="405" width="10" height="13" rx="2" fill="#d9c08a" stroke="#6b5636" />
        </g>
      );
    case 'gilded':
    default: {
      const corners = [[11, 11], [289, 11], [11, 401], [289, 401]];
      return (
        <g>
          <path d={ring} fill={`url(#${u('gold')})`} fillRule="evenodd" />
          <rect x="1" y="1" width="298" height="418" fill="none" stroke="#6e4e12" strokeWidth="2" />
          <rect x="11" y="11" width="278" height="384" fill="none" stroke="#fbe7a6" strokeWidth="1.5" />
          <rect x="11" y="11" width="278" height="384" fill="none" stroke="#8a6418" strokeWidth="2" strokeDasharray="1 3" strokeLinecap="round" />
          <rect x="20" y="20" width="260" height="362" fill="none" stroke="#6e4e12" strokeWidth="3" />
          {corners.map(([x, y]) => (
            <g key={`${x}-${y}`}>
              {[0, 45, 90, 135].map((r) => (
                <ellipse key={r} cx={x} cy={y} rx="11" ry="3.6" fill="#f4d982" stroke="#8a6418" strokeWidth="0.7" transform={`rotate(${r} ${x} ${y})`} />
              ))}
              <circle cx={x} cy={y} r="4.5" fill="#fff0bd" stroke="#8a6418" strokeWidth="0.8" />
              <circle cx={x} cy={y} r="1.8" fill="#c99a32" />
            </g>
          ))}
          <path d="M132,12 Q150,-2 168,12 Q150,24 132,12 Z" fill="#f4d982" stroke="#8a6418" strokeWidth="0.8" />
          <circle cx="150" cy="11" r="3" fill="#fff0bd" stroke="#8a6418" strokeWidth="0.6" />
        </g>
      );
    }
  }
}

function Caption({ a, text, showFrame, u }) {
  const style = showFrame ? a.frame : 'gilded';
  const len = text.length;
  const fs = len > 30 ? 9 : len > 22 ? 10.5 : 12;
  const w = Math.min(250, Math.max(110, len * fs * 0.56 + 30));
  const x = 150 - w / 2;
  const y = style === 'scroll-mount' ? 384 : 386;
  const plate = {
    gilded: { fill: `url(#${u('gold')})`, stroke: '#6e4e12', ink: '#3a2608' },
    lacquer: { fill: '#151012', stroke: '#d9aa3f', ink: '#e9c66a' },
    ebony: { fill: `url(#${u('gold')})`, stroke: '#2a1f18', ink: '#2a1f18' },
    'scroll-mount': { fill: '#f1e6cb', stroke: '#8b7348', ink: '#2a2420' },
  }[style];
  return (
    <g>
      <rect x={x} y={y} width={w} height="20" rx="3" fill={plate.fill} stroke={plate.stroke} strokeWidth="1.2" />
      {style !== 'scroll-mount' && (
        <>
          <circle cx={x + 5} cy={y + 10} r="1.4" fill={plate.stroke} />
          <circle cx={x + w - 5} cy={y + 10} r="1.4" fill={plate.stroke} />
        </>
      )}
      {style === 'scroll-mount' && <rect x={x + w - 14} y={y + 5} width="9" height="10" fill="#b4322a" />}
      <text
        x="150" y={y + 14} textAnchor="middle" fontSize={fs}
        fontFamily="'Cormorant Garamond', 'EB Garamond', Georgia, 'Times New Roman', serif"
        fontStyle="italic" fill={plate.ink} letterSpacing="0.3"
      >
        {text}
      </text>
    </g>
  );
}

// ---------------------------------------------------------------- garments

// Returns the outline paths and attributes of each garment silhouette.
function garmentShape(g) {
  const shoulders = 'M116,140 L108,146 Q103,150 105,160';
  const shouldersR = 'L171,160 Q173,150 168,146 L160,140 Q138,149 116,140 Z';
  switch (g) {
    case 'gown':
      return {
        body: `${shoulders} L119,204 Q100,270 88,349 Q138,358 188,349 Q176,270 157,204 ${shouldersR}`,
        hem: 349, legs: 'none', sleeve: 14, drape: 0,
      };
    case 'robe':
      return {
        body: 'M116,140 L106,146 Q100,152 102,166 L99,347 Q138,353 177,347 L174,166 Q176,152 170,146 L160,140 Q138,150 116,140 Z',
        hem: 347, legs: 'none', sleeve: 20, drape: 14,
      };
    case 'hanfu':
      return {
        body: 'M116,140 L104,148 Q98,156 100,170 L95,348 Q138,357 181,348 L176,170 Q178,156 172,148 L160,140 Q138,150 116,140 Z',
        hem: 348, legs: 'none', sleeve: 22, drape: 40,
      };
    case 'kimono':
      return {
        body: 'M118,140 L108,148 Q104,156 106,170 L107,348 Q138,352 169,348 L170,170 Q172,156 168,148 L158,140 Q138,150 118,140 Z',
        hem: 348, legs: 'none', sleeve: 20, drape: 32,
      };
    case 'jama':
      return {
        body: `${shoulders} L117,204 Q98,256 90,302 Q138,312 186,302 Q178,256 159,204 ${shouldersR}`,
        hem: 302, legs: 'trousers', sleeve: 13, drape: 0,
      };
    case 'hanbok':
      return {
        body: 'M117,174 Q96,262 84,349 Q138,359 192,349 Q180,262 159,174 Z',
        jacket: 'M118,140 L106,148 Q100,154 103,166 L110,182 Q138,186 166,182 L173,166 Q176,154 170,148 L158,140 Q138,150 118,140 Z',
        hem: 349, legs: 'none', sleeve: 15, drape: 0,
      };
    case 'cloak':
    case 'doublet':
    default:
      return {
        body: `${shoulders} L114,205 L108,248 Q138,255 168,248 L162,205 ${shouldersR}`,
        hem: 248, legs: 'hose', sleeve: 14, drape: 0,
      };
  }
}

function Legs({ a, C, legs, kind }) {
  const shoe = C.shoe;
  if (kind === 'none') {
    return null;
  }
  if (kind === 'tips') {
    return (
      <g>
        {legs.map(([, , ank], i) => (
          <path key={i} d={`M${ank[0] + (i ? -4 : -10)},353 Q${ank[0] + (i ? 3 : -3)},345 ${ank[0] + (i ? 10 : 4)},353 Z`} fill={shoe} stroke={INK} strokeWidth="0.6" />
        ))}
      </g>
    );
  }
  const col = kind === 'trousers' ? '#eee4cf' : C.hose;
  return (
    <g>
      {legs.map(([hip, knee, ank], i) => {
        const d = linePts([hip, knee, ank]);
        return (
          <g key={i}>
            <path d={d} stroke={INK} strokeWidth={kind === 'trousers' ? 15 : 13.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d={d} stroke={col} strokeWidth={kind === 'trousers' ? 13.5 : 12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {kind === 'trousers' && [0, 5, 10].map((k) => (
              <path key={k} d={`M${ank[0] - 6},${ank[1] - 14 + k} q6,3 12,0`} fill="none" stroke="#b9ab8c" strokeWidth="0.8" />
            ))}
            <path
              d={`M${ank[0] - (i ? 2 : 10)},${ank[1] + 1} Q${ank[0] + (i ? 4 : -4)},${ank[1] - 6} ${ank[0] + (i ? 10 : 2)},${ank[1] + 2} Q${ank[0] + (i ? 11 : 1)},${ank[1] + 8} ${ank[0] + (i ? 4 : -4)},${ank[1] + 8} Q${ank[0] - (i ? 2 : 10)},${ank[1] + 8} ${ank[0] - (i ? 2 : 10)},${ank[1] + 1} Z`}
              fill={a.tradition === 'mughal' ? '#b8862a' : shoe} stroke={INK} strokeWidth="0.6"
            />
          </g>
        );
      })}
      {a.tradition === 'tudor' && kind === 'hose' && legs.map(([hip], i) => (
        <g key={`th${i}`}>
          <ellipse cx={hip[0] + (i ? 2 : -2)} cy="252" rx="12" ry="14" fill={C.primary} stroke={INK} strokeWidth="0.7" />
          {[-6, 0, 6].map((dx) => (
            <path key={dx} d={`M${hip[0] + dx + (i ? 2 : -2)},241 v22`} stroke={C.accent} strokeWidth="2" />
          ))}
        </g>
      ))}
    </g>
  );
}

// Garment body, neckline and tradition ornament.
function Garment({ a, C, u, shape }) {
  const g = a.garment;
  const t = a.tradition;
  const cloth = `url(#${u('cloth')})`;
  const clipId = u('bodyclip');
  const overlay = {
    venetian: [`url(#${u('brocade')})`, 0.5],
    edo: [`url(#${u('seigaiha')})`, 0.4],
    ming: [`url(#${u('clouds')})`, 0.3],
    joseon: [`url(#${u('clouds')})`, 0.3],
    mughal: [`url(#${u('dots')})`, 0.55],
  }[t];
  const bandFill = { ming: 'clouds', joseon: 'clouds', edo: 'seigaiha', venetian: 'brocade' }[t] || 'dots';
  const hemBand = (
    <g clipPath={`url(#${clipId})`}>
      <rect x="60" y={shape.hem - 11} width="160" height="16" fill={['ming', 'joseon', 'edo'].includes(t) ? shade(C.primary, -0.35) : C.accent} />
      <rect x="60" y={shape.hem - 11} width="160" height="16" fill={`url(#${u(bandFill)})`} opacity="0.85" />
      <rect x="60" y={shape.hem - 12} width="160" height="1.5" fill={C.accent} />
    </g>
  );

  const body = (
    <g>
      <clipPath id={clipId}><path d={shape.body} /></clipPath>
      <path d={shape.body} fill={g === 'cloak' ? mix(C.primary, '#2a2428', 0.72) : cloth} stroke={INK} strokeWidth="0.9" />
      {overlay && <path d={shape.body} fill={overlay[0]} opacity={overlay[1]} />}
      {hemBand}
    </g>
  );

  const crossCollar = (inner, edge) => (
    <g>
      <path d="M124,140 L142,176 L150,170 L132,140 Z" fill={inner} />
      <path d="M154,140 Q148,168 116,214" fill="none" stroke={edge} strokeWidth="6" />
      <path d="M154,140 Q148,168 116,214" fill="none" stroke={INK} strokeWidth="0.6" transform="translate(3,1)" />
      <path d="M124,140 L138,168" fill="none" stroke={edge} strokeWidth="5" />
    </g>
  );

  let details = null;
  switch (g) {
    case 'gown':
      details = (
        <g>
          <path d="M128,206 L112,350 Q138,355 164,350 L148,206 Z" fill={shade(C.accent, 0.25)} stroke={INK} strokeWidth="0.6" />
          <path d="M128,206 L112,350 Q138,355 164,350 L148,206 Z" fill={`url(#${u('dots')})`} opacity="0.4" />
          <path d="M125,148 L138,206 L151,148 Z" fill={shade(C.accent, 0.2)} stroke={C.accent} strokeWidth="1" />
          <path d="M122,140 L124,154 Q138,158 152,154 L154,140 Q138,147 122,140 Z" fill={`url(#${u('skin')})`} />
          <path d="M123,154 Q138,158 153,154" fill="none" stroke={C.accent} strokeWidth="2.2" />
          <path d="M119,204 Q138,210 157,204" fill="none" stroke={C.accent} strokeWidth="3" />
        </g>
      );
      break;
    case 'robe':
      details = (
        <g>
          <path d="M131,146 V347 M145,146 V347" stroke={C.accent} strokeWidth="5" />
          <path d="M138,150 V347" stroke={INK} strokeWidth="0.7" opacity="0.6" />
          <path d="M122,139 Q138,154 154,139" fill="none" stroke={shade(C.primary, -0.5)} strokeWidth="5" />
          <path d="M108,204 Q138,212 168,204" fill="none" stroke={shade(C.primary, -0.4)} strokeWidth="4" />
        </g>
      );
      break;
    case 'hanfu':
      details = (
        <g>
          {crossCollar('#f3ecdc', C.accent)}
          <rect x="104" y="196" width="68" height="14" fill={C.accent} stroke={INK} strokeWidth="0.6" />
          <rect x="104" y="196" width="68" height="14" fill={`url(#${u('clouds')})`} opacity="0.6" />
          <path d="M132,210 Q130,250 128,292 M140,210 Q142,250 145,288" stroke={C.accent} strokeWidth="3" fill="none" />
          {[116, 158, 166].map((x) => <path key={x} d={`M${x},214 L${x + (x - 138) * 0.25},340`} stroke={shade(C.primary, -0.3)} strokeWidth="0.8" />)}
        </g>
      );
      break;
    case 'kimono':
      details = (
        <g>
          {crossCollar('#f3ecdc', shade(C.primary, -0.3))}
          <path d="M116,214 L122,348" stroke={INK} strokeWidth="0.8" />
          <rect x="107" y="190" width="63" height="28" fill={C.accent} stroke={INK} strokeWidth="0.7" />
          <rect x="107" y="190" width="63" height="28" fill={`url(#${u('seigaiha')})`} opacity="0.5" />
          <path d="M107,204 H170" stroke={shade(C.primary, -0.2)} strokeWidth="2" />
          <circle cx="138" cy="204" r="2.5" fill={C.accent} stroke={INK} strokeWidth="0.5" />
        </g>
      );
      break;
    case 'jama':
      details = (
        <g>
          <path d="M126,141 Q160,160 154,200" fill="none" stroke={C.accent} strokeWidth="2.5" />
          <path d="M126,141 Q160,160 154,200" fill="none" stroke={INK} strokeWidth="0.6" />
          <path d="M122,139 Q138,149 154,139" fill="none" stroke={C.accent} strokeWidth="3" />
        </g>
      );
      break;
    case 'hanbok':
      details = (
        <g>
          <path d={shape.jacket} fill={`url(#${u('cloth2')})`} stroke={INK} strokeWidth="0.9" />
          <path d="M154,140 Q150,160 122,180" fill="none" stroke="#f3ecdc" strokeWidth="5" />
          <path d="M154,140 Q150,160 122,180" fill="none" stroke={shade(C.primary, -0.2)} strokeWidth="2" transform="translate(2,3)" />
          <path d="M124,140 L136,160" fill="none" stroke="#f3ecdc" strokeWidth="4" />
          <path d="M142,174 q10,-6 12,2 q-6,6 -12,-2 Z" fill={C.accent} stroke={INK} strokeWidth="0.5" />
          <path d="M142,174 Q140,210 134,240 M143,175 Q148,206 150,232" stroke={C.accent} strokeWidth="3.5" fill="none" />
        </g>
      );
      break;
    case 'cloak':
    case 'doublet':
    default:
      details = (
        <g>
          <path d="M138,148 V247" stroke={INK} strokeWidth="0.7" opacity="0.7" />
          {[160, 172, 184, 196, 218, 230].map((y) => <circle key={y} cx="138" cy={y} r="1.6" fill={C.accent} stroke={INK} strokeWidth="0.3" />)}
          <path d="M114,205 Q138,211 162,205" fill="none" stroke={shade(C.primary, -0.55)} strokeWidth="4" />
          <rect x="134" y="203" width="8" height="6" fill={C.accent} stroke={INK} strokeWidth="0.5" />
          <path d="M123,137 L123,145 Q138,150 153,145 L153,137" fill={C.accent} stroke={INK} strokeWidth="0.6" />
          {t === 'tudor' && [-1, 1].map((s) => (
            <path key={s} d={`M${138 + s * 18},158 l${s * 4},30 M${138 + s * 10},160 l${s * 2},32`} stroke={C.accent} strokeWidth="2" opacity="0.8" />
          ))}
        </g>
      );
  }

  const european = ['doublet', 'gown', 'robe', 'cloak'].includes(g);
  const orn = [];
  if (t === 'flemish') {
    if (european) {
      orn.push(
        <g key="ruff">
          <ellipse cx="138" cy="141" rx="25" ry="8" fill="#fbf8f0" stroke="#bdb6a6" strokeWidth="0.8" />
          {Array.from({ length: 14 }, (_, i) => {
            const ang = (Math.PI * 2 * i) / 14;
            return <path key={i} d={`M138,141 L${138 + Math.cos(ang) * 24},${141 + Math.sin(ang) * 7.5}`} stroke="#d4cec0" strokeWidth="0.8" />;
          })}
        </g>,
      );
    } else {
      orn.push(<path key="collar" d="M120,140 Q138,160 156,140 L150,138 Q138,150 126,138 Z" fill="#fbf8f0" stroke="#bdb6a6" strokeWidth="0.6" />);
    }
  }
  if (t === 'tudor' && european) {
    orn.push(
      <path key="chain" d="M114,149 Q138,196 162,149" fill="none" stroke="#e7bf4a" strokeWidth="3" strokeDasharray="3 1.5" />,
      <circle key="pend" cx="138" cy="172" r="4" fill="#b02a3a" stroke="#e7bf4a" strokeWidth="1.5" />,
    );
  }
  if ((t === 'ming' || t === 'joseon') && ['robe', 'hanfu', 'cloak', 'doublet', 'jama'].includes(g)) {
    orn.push(
      <g key="badge">
        <rect x="125" y="160" width="26" height="26" fill={shade(C.primary, -0.4)} stroke={C.accent} strokeWidth="2" />
        <path d="M130,178 q4,-10 10,-6 q2,-8 6,-4 M132,182 q3,-2 6,0 q3,-2 6,0" fill="none" stroke={C.accent} strokeWidth="1.2" />
        <circle cx="145" cy="166" r="2" fill="#d23a2a" />
      </g>,
    );
  }
  if (t === 'mughal' && !['kimono', 'hanbok'].includes(g)) {
    orn.push(
      <g key="patka">
        <rect x="110" y="199" width="56" height="10" rx="2" fill={C.accent} stroke={INK} strokeWidth="0.6" />
        <path d="M133,208 L131,290 L145,290 L143,208 Z" fill={C.accent} stroke={INK} strokeWidth="0.6" />
        <path d="M131,280 H145 M131,284 H145" stroke={shade(C.accent, -0.4)} strokeWidth="1" />
        {[[118, 204, '#c8243a'], [128, 204, '#1f8a5a'], [138, 204, '#2a4fb0'], [148, 204, '#c8243a'], [158, 204, '#1f8a5a'], [138, 230, '#c8243a'], [138, 252, '#2a4fb0']].map(([x, y, c]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill={c} stroke="#fff3c4" strokeWidth="0.6" />
        ))}
      </g>,
    );
  }
  if (t === 'venetian' && european) {
    orn.push(<path key="vchain" d="M120,146 Q138,166 156,146" fill="none" stroke="#e7bf4a" strokeWidth="1.6" />);
  }

  return <g>{body}{details}{orn}</g>;
}

function CloakBack({ C }) {
  return (
    <path
      d="M110,146 Q84,206 74,332 Q138,346 202,332 Q192,206 166,146 Z"
      fill={shade(C.primary, -0.25)} stroke={INK} strokeWidth="0.9"
    />
  );
}

function CloakFront({ C, u }) {
  return (
    <g>
      <path d="M114,139 Q94,146 90,178 Q138,192 186,178 Q182,146 162,139 Q138,150 114,139 Z" fill={`url(#${u('cloth')})`} stroke={INK} strokeWidth="0.9" />
      <path d="M90,178 Q138,192 186,178" fill="none" stroke={C.accent} strokeWidth="3" />
      <path d="M126,146 Q138,156 150,146" fill="none" stroke={C.accent} strokeWidth="1.5" strokeDasharray="2 1.5" />
      <circle cx="126" cy="146" r="2.6" fill={C.accent} stroke={INK} strokeWidth="0.5" />
      <circle cx="150" cy="146" r="2.6" fill={C.accent} stroke={INK} strokeWidth="0.5" />
    </g>
  );
}

function Hand({ u, at }) {
  return <ellipse cx={at[0]} cy={at[1] + 1} rx="5" ry="5.8" fill={`url(#${u('skin')})`} stroke={INK} strokeWidth="0.6" />;
}

function Arm({ a, C, u, pts, shape, color, showHand = true, akimbo = false }) {
  const [S, E, H] = pts;
  const d = linePts(pts);
  const w = shape.sleeve;
  const fitted = shape.drape === 0;
  const puff = a.tradition === 'tudor' && fitted;
  let drape = null;
  if (shape.drape) {
    // On an akimbo arm a full-length hanging sleeve would stick out like a flag, so shorten it.
    const bottom = Math.max(E[1], H[1]) + shape.drape * (akimbo ? 0.45 : 1);
    const left = Math.min(E[0], H[0]) - 8;
    const right = Math.max(E[0], H[0]) + 6;
    const square = a.garment === 'kimono';
    drape = (
      <path
        d={square
          ? `M${E[0] - 6},${E[1] - 4} L${H[0] + 2},${H[1] - 6} L${right},${bottom - 4} Q${right},${bottom} ${right - 4},${bottom} L${left + 4},${bottom} Q${left},${bottom} ${left},${bottom - 4} Z`
          : `M${E[0] - 7},${E[1] - 6} L${H[0] + 4},${H[1] - 6} Q${right + 4},${bottom - 8} ${(left + right) / 2},${bottom} Q${left - 4},${bottom - 14} ${E[0] - 7},${E[1] - 6} Z`}
        fill={color} stroke={INK} strokeWidth="0.8"
      />
    );
  }
  return (
    <g>
      {drape}
      <path d={d} stroke={INK} strokeWidth={w + 1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {puff && (
        <g>
          <ellipse cx={(S[0] + E[0]) / 2} cy={(S[1] + E[1]) / 2 - 4} rx="11" ry="16" fill={color} stroke={INK} strokeWidth="0.8"
            transform={`rotate(${(Math.atan2(E[1] - S[1], E[0] - S[0]) * 180) / Math.PI - 90} ${(S[0] + E[0]) / 2} ${(S[1] + E[1]) / 2 - 4})`} />
          {[-4, 0, 4].map((k) => (
            <path key={k} d={`M${(S[0] + E[0]) / 2 + k},${S[1] + 6} L${(S[0] + E[0]) / 2 + k * 1.3},${E[1] - 12}`} stroke={C.accent} strokeWidth="1.6" />
          ))}
        </g>
      )}
      {a.garment === 'jama' && (
        <path d={`M${E[0] + (H[0] - E[0]) * 0.55},${E[1] + (H[1] - E[1]) * 0.55} L${H[0]},${H[1]}`} stroke={C.accent} strokeWidth={w - 2} strokeLinecap="butt" />
      )}
      <path
        d={`M${H[0] + (E[0] - H[0]) * 0.1},${H[1] + (E[1] - H[1]) * 0.1} L${H[0] + (E[0] - H[0]) * 0.24},${H[1] + (E[1] - H[1]) * 0.24}`}
        stroke={a.tradition === 'flemish' ? '#fbf8f0' : fitted ? C.accent : '#f3ecdc'} strokeWidth={fitted ? w + 1 : w - 2}
      />
      {showHand && <Hand u={u} at={H} />}
    </g>
  );
}

// ---------------------------------------------------------------- head

function HairBack({ a, C }) {
  const h = C.hair;
  switch (a.hairStyle) {
    case 'long':
      return <path d="M122,104 Q114,140 114,190 Q138,200 162,190 Q162,140 154,104 Z" fill={h} stroke={INK} strokeWidth="0.6" />;
    case 'wavy':
      return <path d="M121,104 Q116,124 120,136 q4,4 6,-2 q4,6 8,0 l8,0 q4,6 8,0 q2,6 6,2 Q160,124 155,104 Z" fill={h} stroke={INK} strokeWidth="0.6" />;
    case 'braided':
      return <path d="M122,104 Q118,124 124,134 L152,134 Q158,124 154,104 Z" fill={h} />;
    case 'curly':
      return (
        <g fill={h} stroke={INK} strokeWidth="0.4">
          {[[120, 108], [118, 120], [121, 131], [156, 108], [158, 120], [155, 131]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="6.5" />)}
        </g>
      );
    case 'bun':
      return <circle cx="138" cy="88" r="9" fill={h} stroke={INK} strokeWidth="0.6" />;
    default:
      return null;
  }
}

function HairFront({ a, C }) {
  const h = C.hair;
  const hl = shade(h, 0.25);
  switch (a.hairStyle) {
    case 'shaved':
      return <path d="M123.5,108 Q124,93 138,93 Q152,93 152.5,108 Q146,100 138,100 Q130,100 123.5,108 Z" fill={h} opacity="0.25" />;
    case 'curly':
      return (
        <g fill={h} stroke={INK} strokeWidth="0.4">
          {[[124, 100], [130, 94], [138, 92], [146, 94], [152, 100], [127, 99], [149, 98], [134, 97], [142, 97]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="6" />)}
        </g>
      );
    case 'topknot':
      return (
        <g>
          <path d="M122.5,110 Q121,91 138,90 Q155,91 153.5,110 Q148,100 138,100 Q128,100 122.5,110 Z" fill={h} stroke={INK} strokeWidth="0.6" />
          <ellipse cx="138" cy="86" rx="5" ry="6" fill={h} stroke={INK} strokeWidth="0.6" />
          <rect x="133" y="89" width="10" height="2.5" fill={C.accent} />
        </g>
      );
    case 'braided':
      return (
        <g>
          <path d="M122.5,112 Q121,91 138,90 Q155,91 153.5,112 Q150,99 138,98 Q126,99 122.5,112 Z" fill={h} stroke={INK} strokeWidth="0.6" />
          <path d="M138,91 V99" stroke={shade(h, -0.3)} strokeWidth="0.8" />
          {Array.from({ length: 7 }, (_, i) => (
            <ellipse key={i} cx={125 - i * 1.4} cy={136 + i * 8} rx="4.2" ry="5" fill={i % 2 ? h : shade(h, 0.12)} stroke={INK} strokeWidth="0.5" />
          ))}
          <path d="M115,190 l1,8 l3,-8" fill={C.accent} />
        </g>
      );
    case 'wavy':
      return (
        <g>
          <path d="M122.5,114 Q120,90 138,90 Q156,90 153.5,114 Q152,102 146,99 Q134,104 126,100 Q123,104 122.5,114 Z" fill={h} stroke={INK} strokeWidth="0.6" />
          <path d="M130,94 Q138,92 146,96" fill="none" stroke={hl} strokeWidth="1.2" />
        </g>
      );
    case 'long':
    case 'bun':
      return (
        <g>
          <path d="M122.5,114 Q121,91 138,90 Q155,91 153.5,114 Q151,100 138,98.5 Q125,100 122.5,114 Z" fill={h} stroke={INK} strokeWidth="0.6" />
          <path d="M138,91 Q137,95 138,99" stroke={shade(h, -0.3)} strokeWidth="0.8" fill="none" />
          <path d="M128,94 Q132,92 136,92" fill="none" stroke={hl} strokeWidth="1" />
        </g>
      );
    case 'short':
    default:
      return (
        <g>
          <path d="M122.5,112 Q121,90 138,90 Q155,90 153.5,112 Q151,101 144,100 Q134,103 126,101 Q123,104 122.5,112 Z" fill={h} stroke={INK} strokeWidth="0.6" />
          <path d="M131,94 Q139,92 146,96" fill="none" stroke={hl} strokeWidth="1" />
        </g>
      );
  }
}

function Face({ a, C, u }) {
  const brow = shade(a.hairStyle === 'shaved' ? '#3a2a20' : C.hair, -0.2);
  const deepSkin = ['brown', 'deep'].includes(a.skinTone);
  return (
    <g>
      <path d="M131,124 H145 V138 Q146,143 150,145 H126 Q130,143 131,138 Z" fill={`url(#${u('skin')})`} />
      <path d="M132,132 Q138,138 144,132 V136 Q138,140 132,136 Z" fill="#000" opacity="0.12" />
      <ellipse cx="123" cy="113" rx="3" ry="4.5" fill={shade(C.skin, -0.08)} stroke={INK} strokeWidth="0.5" />
      <ellipse cx="153" cy="113" rx="3" ry="4.5" fill={shade(C.skin, -0.08)} stroke={INK} strokeWidth="0.5" />
      <path d="M123,108 Q123,92 138,92 Q153,92 153,108 Q153,123 146,128 Q138,133 130,128 Q123,123 123,108 Z" fill={`url(#${u('skin')})`} stroke={INK} strokeWidth="0.7" />
      <ellipse cx="129.5" cy="119" rx="3.2" ry="2" fill="#e0606a" opacity={deepSkin ? 0.2 : 0.22} />
      <ellipse cx="146.5" cy="119" rx="3.2" ry="2" fill="#e0606a" opacity={deepSkin ? 0.2 : 0.22} />
      <path d="M128,107.5 Q131.5,105.5 135,107.2 M141,107.2 Q144.5,105.5 148,107.5" fill="none" stroke={brow} strokeWidth="1.3" strokeLinecap="round" />
      <ellipse cx="131.5" cy="112" rx="1.7" ry="2.1" fill="#24180f" />
      <ellipse cx="144.5" cy="112" rx="1.7" ry="2.1" fill="#24180f" />
      <circle cx="132.1" cy="111.3" r="0.55" fill="#fff" />
      <circle cx="145.1" cy="111.3" r="0.55" fill="#fff" />
      <path d="M129,110.3 Q131.5,109.2 134,110.3 M142,110.3 Q144.5,109.2 147,110.3" fill="none" stroke="#24180f" strokeWidth="0.6" />
      <path d="M138.5,113 Q137,118 136.5,119.5 Q138,120.6 140,119.8" fill="none" stroke={shade(C.skin, -0.32)} strokeWidth="0.9" strokeLinecap="round" />
      <path d="M134.2,123.2 Q138,125.8 141.8,123.2" fill="none" stroke="#8a4038" strokeWidth="1.1" strokeLinecap="round" />
    </g>
  );
}

function FacialHair({ a, C }) {
  const h = a.hairStyle === 'shaved' ? '#3a2a20' : C.hair;
  const mustache = <path key="m" d="M131.5,122 Q135,119.5 138,121 Q141,119.5 144.5,122 Q141,121.8 138,122.6 Q135,121.8 131.5,122 Z" fill={h} stroke={INK} strokeWidth="0.4" />;
  switch (a.facialHair) {
    case 'mustache':
      return mustache;
    case 'goatee':
      return <g>{mustache}<path d="M135,127 Q138,135 141,127 Q138,128.4 135,127 Z" fill={h} stroke={INK} strokeWidth="0.4" /></g>;
    case 'beard':
      return (
        <g>
          <path d="M123.5,111 Q124,127 130,131 Q138,138 146,131 Q152,127 152.5,111 Q150,124 144,126 Q138,128 132,126 Q126,124 123.5,111 Z" fill={h} stroke={INK} strokeWidth="0.4" />
          {mustache}
        </g>
      );
    default:
      return null;
  }
}

function Headwear({ a, C }) {
  const p = C.primary;
  const acc = C.accent;
  switch (a.headwear) {
    case 'beret':
      return (
        <g>
          <ellipse cx="135" cy="92" rx="23" ry="8.5" fill={shade(p, -0.45)} stroke={INK} strokeWidth="0.7" transform="rotate(-8 135 92)" />
          <path d="M122,97 Q138,101 154,94" fill="none" stroke={shade(p, -0.2)} strokeWidth="2.5" />
          <circle cx="150" cy="91" r="2.4" fill={acc} stroke={INK} strokeWidth="0.4" />
          <path d="M150,90 q10,-10 18,-6" fill="none" stroke="#f3eee0" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case 'coif':
      return (
        <g>
          <path d="M121,118 Q117,86 138,85 Q159,86 155,118 Q152,100 138,99 Q124,100 121,118 Z" fill="#f6f1e4" stroke="#a9a08c" strokeWidth="0.8" />
          <path d="M123,104 Q138,96 153,104" fill="none" stroke="#d6cfbd" strokeWidth="0.8" />
        </g>
      );
    case 'turban':
      return (
        <g>
          <path d="M119,104 Q114,82 138,78 Q162,82 157,104 Q138,96 119,104 Z" fill={shade(acc, 0.3)} stroke={INK} strokeWidth="0.7" />
          <path d="M121,96 Q138,84 156,98 M120,90 Q140,80 154,90" fill="none" stroke={shade(acc, -0.25)} strokeWidth="1" />
          <circle cx="139" cy="88" r="3.2" fill="#c8243a" stroke="#f3d27a" strokeWidth="1" />
          <path d="M139,85 Q136,70 146,62 Q142,72 141,85" fill="#f6f1e4" stroke="#bdb6a6" strokeWidth="0.5" />
          <path d="M127,92 q2,4 0,8 M151,92 q-2,4 0,8" stroke="#f3eee0" strokeWidth="1.5" strokeDasharray="1 1.5" fill="none" />
        </g>
      );
    case 'wreath':
      return (
        <g>
          {Array.from({ length: 11 }, (_, i) => {
            const x = 121 + i * 3.4;
            const y = 98 - Math.sin((i / 10) * Math.PI) * 4;
            return i % 2
              ? <circle key={i} cx={x} cy={y} r="2.6" fill={['#e46a7e', '#f3d6e0', '#f1c04a'][i % 3]} stroke={INK} strokeWidth="0.3" />
              : <ellipse key={i} cx={x} cy={y} rx="2.8" ry="1.6" fill="#5c7f3a" transform={`rotate(${i * 8 - 40} ${x} ${y})`} />;
          })}
        </g>
      );
    case 'scholar-hat':
      return (
        <g>
          <ellipse cx="138" cy="95" rx="40" ry="2.8" fill="#1a1718" />
          <path d="M122,99 Q120,84 138,83 Q156,84 154,99 Z" fill="#1f1c1e" stroke="#000" strokeWidth="0.6" />
          <path d="M128,86 Q130,74 138,74 Q146,74 148,86 Z" fill="#27242a" stroke="#000" strokeWidth="0.6" />
          <path d="M122,96 Q138,93 154,96" stroke={acc} strokeWidth="1" fill="none" />
        </g>
      );
    case 'eboshi':
      return (
        <g>
          <path d="M124,101 Q122,86 130,70 Q138,58 152,60 Q147,74 152,101 Q138,95 124,101 Z" fill="#1b191b" stroke="#000" strokeWidth="0.6" />
          <path d="M130,76 Q138,72 148,76 M127,86 Q138,82 150,86" stroke="#3a363a" strokeWidth="0.8" fill="none" />
          <path d="M124,100 Q122,116 126,126" stroke="#f3eee0" strokeWidth="0.8" fill="none" />
        </g>
      );
    case 'hairpin':
      return (
        <g>
          <circle cx="138" cy="88" r="8" fill={C.hair} stroke={INK} strokeWidth="0.6" />
          <path d="M116,90 L162,84" stroke={acc} strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="117" cy="90" r="3" fill={acc} stroke={INK} strokeWidth="0.4" />
          <path d="M160,85 l2,12 M162,85 l4,10" stroke={acc} strokeWidth="0.8" />
          <circle cx="162" cy="98" r="1.6" fill="#c8243a" />
          <circle cx="166" cy="96" r="1.6" fill={acc} />
        </g>
      );
    case 'veil':
      return (
        <g>
          <path d="M121,100 Q120,86 138,85 Q156,86 155,100" fill="none" stroke="#fbf8f0" strokeWidth="5" opacity="0.85" />
          <path d="M122,99 Q138,90 154,99" fill="none" stroke={acc} strokeWidth="1.4" />
        </g>
      );
    case 'gat':
      return (
        <g>
          <ellipse cx="138" cy="96" rx="40" ry="7" fill="#151315" opacity="0.72" />
          <ellipse cx="138" cy="96" rx="40" ry="7" fill="none" stroke="#000" strokeWidth="0.6" />
          <path d="M126,96 L127,72 Q138,68 149,72 L150,96 Z" fill="#151315" opacity="0.85" />
          <rect x="126.5" y="88" width="23" height="4" fill="#2f2b30" />
          <path d="M120,99 Q118,124 132,138 M156,99 Q158,124 144,138" fill="none" stroke={shade(acc, -0.2)} strokeWidth="1.6" strokeDasharray="1.8 1.2" />
        </g>
      );
    default:
      return null;
  }
}

function HeadwearBack({ a }) {
  if (a.headwear === 'veil') {
    return <path d="M119,100 Q108,140 108,190 L168,190 Q168,140 157,100 Z" fill="#fbf8f0" opacity="0.5" />;
  }
  return null;
}

// ---------------------------------------------------------------- held items

const HAND_FIRST = ['globe', 'teacup', 'compass'];

function HeldItem({ item }) {
  switch (item) {
    case 'book':
      return (
        <g transform="rotate(-14 114 214)">
          <rect x="102" y="199" width="21" height="28" rx="1.5" fill="#6b2a1f" stroke={INK} strokeWidth="0.7" />
          <rect x="121" y="200" width="3" height="26" fill="#efe3c6" />
          <rect x="105" y="203" width="15" height="20" fill="none" stroke="#d9aa3f" strokeWidth="0.8" />
          <circle cx="112.5" cy="213" r="2.2" fill="#d9aa3f" />
        </g>
      );
    case 'lute':
      return (
        <g transform="rotate(-40 128 222)">
          <rect x="124.5" y="168" width="7" height="44" fill="#6b4122" stroke={INK} strokeWidth="0.6" />
          <path d="M124.5,168 L122,158 L133,158 L131.5,168 Z" fill="#5a3418" stroke={INK} strokeWidth="0.6" />
          <ellipse cx="128" cy="230" rx="15" ry="19" fill="#c88a42" stroke={INK} strokeWidth="0.8" />
          <path d="M116,226 Q128,206 140,226" fill="none" stroke="#a26a2c" strokeWidth="0.8" />
          <circle cx="128" cy="226" r="4" fill="#3a2614" />
          <rect x="123" y="240" width="10" height="2.5" fill="#3a2614" />
          <path d="M126.5,170 V241 M128,170 V241 M129.5,170 V241" stroke="#f2e8cc" strokeWidth="0.35" />
        </g>
      );
    case 'globe':
      return (
        <g>
          <circle cx="120" cy="198" r="12.5" fill="#4a7aa8" stroke={INK} strokeWidth="0.8" />
          <path d="M112,192 q4,-4 8,-1 q2,4 -2,6 q-4,3 -6,-1 Z M122,198 q5,-2 7,3 q-2,6 -6,4 q-3,-3 -1,-7 Z M118,188 q3,-2 6,0" fill="#c9b06a" />
          <ellipse cx="120" cy="198" rx="5" ry="12.5" fill="none" stroke="#d9c58a" strokeWidth="0.6" />
          <path d="M106,200 Q120,206 134,196" fill="none" stroke="#d9aa3f" strokeWidth="1.5" />
          <circle cx="116" cy="193" r="3" fill="#fff" opacity="0.25" />
        </g>
      );
    case 'scroll':
      return (
        <g transform="rotate(-38 120 212)">
          <rect x="103" y="208" width="34" height="9" rx="4.5" fill="#f1e6c8" stroke={INK} strokeWidth="0.7" />
          <path d="M108,208 V217 M132,208 V217" stroke="#c9b58a" strokeWidth="0.6" />
          <circle cx="102" cy="212.5" r="3" fill="#d9aa3f" stroke={INK} strokeWidth="0.5" />
          <circle cx="138" cy="212.5" r="3" fill="#d9aa3f" stroke={INK} strokeWidth="0.5" />
          <path d="M124,217 q2,6 -2,10 M124,217 q4,5 4,9" stroke="#b4322a" strokeWidth="1.2" fill="none" />
        </g>
      );
    case 'fan': {
      const cx = 118;
      const cy = 214;
      const r = 27;
      const pt = (deg, rr) => [cx + rr * Math.cos((deg * Math.PI) / 180), cy - rr * Math.sin((deg * Math.PI) / 180)];
      const [ax, ay] = pt(165, r);
      const [bx, by] = pt(45, r);
      const [ix, iy] = pt(165, 9);
      const [jx, jy] = pt(45, 9);
      return (
        <g>
          <path d={`M${ix},${iy} L${ax},${ay} A${r},${r} 0 0 1 ${bx},${by} L${jx},${jy} A9,9 0 0 0 ${ix},${iy} Z`} fill="#f4e8c8" stroke={INK} strokeWidth="0.7" />
          {[165, 141, 117, 93, 69, 45].map((d) => {
            const [x, y] = pt(d, r);
            return <line key={d} x1={cx} y1={cy} x2={x} y2={y} stroke="#8a6a3a" strokeWidth="0.6" />;
          })}
          <circle cx={pt(110, 19)[0]} cy={pt(110, 19)[1]} r="4" fill="#c8243a" />
          <path d={`M${pt(150, 22).join(',')} q6,-2 10,2`} stroke="#3a4a3a" strokeWidth="0.9" fill="none" />
        </g>
      );
    }
    case 'quill':
      return (
        <g>
          <path d="M104,168 Q97,184 111,202 Q116,196 115,188 Q112,176 104,168 Z" fill="#f6f1e4" stroke={INK} strokeWidth="0.6" />
          <path d="M104,168 Q109,186 121,218" fill="none" stroke="#8a7a5a" strokeWidth="0.9" />
          {[176, 182, 188, 194].map((y) => (
            <path key={y} d={`M${104 + (y - 168) * 0.32},${y} l-4,-1 M${104 + (y - 168) * 0.32},${y} l4,-3`} stroke="#c9c0ac" strokeWidth="0.5" />
          ))}
          <path d="M120,216 L122,224" stroke="#2a2a2a" strokeWidth="1.2" />
        </g>
      );
    case 'teacup':
      return (
        <g>
          <ellipse cx="120" cy="208" rx="11" ry="2.8" fill="#f2efe6" stroke={INK} strokeWidth="0.6" />
          <path d="M112,198 H128 Q127,208 120,208 Q113,208 112,198 Z" fill="#9fcfb8" stroke={INK} strokeWidth="0.6" />
          <path d="M112.6,201 H127.4" stroke="#2a5a8a" strokeWidth="1.1" />
          <path d="M117,195 q-2,-4 1,-7 M122,195 q-2,-4 1,-7" fill="none" stroke="#bdb6a6" strokeWidth="0.8" />
        </g>
      );
    case 'compass':
      return (
        <g>
          <circle cx="120" cy="206" r="10" fill="#d9aa3f" stroke={INK} strokeWidth="0.7" />
          <circle cx="120" cy="206" r="7.5" fill="#f4ecd4" />
          <path d="M120,199 L122,206 L120,213 L118,206 Z" fill="#b4322a" />
          <path d="M120,206 L122,206 L120,213 L118,206 Z" fill="#2a2a2a" />
          <circle cx="120" cy="206" r="1" fill="#d9aa3f" />
          <circle cx="120" cy="195.5" r="1.8" fill="none" stroke="#d9aa3f" strokeWidth="1" />
        </g>
      );
    case 'brush':
      return (
        <g>
          <path d="M122,186 L119,230" stroke="#c9a46b" strokeWidth="3" strokeLinecap="round" />
          <path d="M122,186 L121.6,192" stroke="#3a2a1a" strokeWidth="3.4" />
          <path d="M117.5,229 Q119,240 119,242 Q120.5,240 121.5,229 Z" fill="#1a1a1a" />
          <path d="M122,184 q3,-4 0,-6" stroke="#b4322a" strokeWidth="0.8" fill="none" />
        </g>
      );
    case 'flower':
      return (
        <g>
          <path d="M120,214 Q114,196 110,176" fill="none" stroke="#3d6b2e" strokeWidth="1.6" />
          <ellipse cx="114" cy="194" rx="5" ry="2" fill="#4f8a3a" transform="rotate(-30 114 194)" />
          <ellipse cx="117" cy="202" rx="5" ry="2" fill="#4f8a3a" transform="rotate(30 117 202)" />
          {[[0, -4], [4, -1], [2.5, 4], [-2.5, 4], [-4, -1]].map(([dx, dy]) => (
            <circle key={`${dx}${dy}`} cx={110 + dx} cy={173 + dy} r="3.6" fill="#d2364e" stroke="#8a1a2a" strokeWidth="0.4" />
          ))}
          <circle cx="110" cy="173" r="2.4" fill="#f07a8a" />
        </g>
      );
    case 'sprig':
      return <Sprig x={120} y={214} angle={-25} />;
    default:
      return null;
  }
}

function Sprig({ x, y, angle = 0, scale = 1 }) {
  const leaves = [[-6, -5, -40], [6, -10, 40], [-6, -16, -40], [6, -22, 40], [-5, -28, -35], [0, -34, 0]];
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
      <path d="M0,0 Q-1,-18 0,-34" fill="none" stroke="#6b5a3a" strokeWidth="1.2" />
      {leaves.map(([dx, dy, r]) => (
        <ellipse key={`${dx}${dy}`} cx={dx * 0.9} cy={dy} rx="5.5" ry="1.8" fill="#8aa56a" stroke="#4f6b3a" strokeWidth="0.4" transform={`rotate(${r} ${dx * 0.9} ${dy})`} />
      ))}
      <circle cx="3" cy="-14" r="1.8" fill="#4b5a2a" />
      <circle cx="-3" cy="-24" r="1.8" fill="#4b5a2a" />
    </g>
  );
}

// ---------------------------------------------------------------- companions

function Companion({ kind }) {
  switch (kind) {
    case 'dog':
      return (
        <g stroke={INK} strokeWidth="0.7">
          <path d="M206,352 Q200,320 212,306 Q228,300 234,320 Q240,340 236,352 Z" fill="#f3ece0" />
          <path d="M222,312 Q234,312 236,332 Q238,346 234,352 L222,352 Q226,334 222,312 Z" fill="#a8693a" />
          <path d="M236,350 q10,-4 10,-14" fill="none" stroke="#a8693a" strokeWidth="3" strokeLinecap="round" />
          <path d="M207,320 L206,350 M214,322 L214,350" stroke={INK} strokeWidth="0.8" />
          <ellipse cx="204" cy="350" rx="5" ry="2.5" fill="#f3ece0" />
          <ellipse cx="214" cy="351" rx="5" ry="2.5" fill="#f3ece0" />
          <circle cx="208" cy="300" r="10" fill="#f3ece0" />
          <path d="M200,302 Q194,304 193,299 Q194,294 201,295 Z" fill="#f3ece0" />
          <circle cx="193.5" cy="298.5" r="1.6" fill="#1a1a1a" stroke="none" />
          <path d="M210,292 Q222,292 220,312 Q214,314 212,304 Z" fill="#a8693a" />
          <circle cx="204" cy="297" r="1.2" fill="#1a1a1a" stroke="none" />
          <path d="M200,310 Q208,314 216,310" fill="none" stroke="#c8243a" strokeWidth="2" />
        </g>
      );
    case 'cat':
      return (
        <g stroke={INK} strokeWidth="0.7">
          <path d="M228,350 Q248,348 244,330 Q242,322 236,326" fill="none" stroke="#d08a3c" strokeWidth="4" strokeLinecap="round" />
          <path d="M202,352 Q198,330 208,316 Q220,312 226,328 Q230,344 228,352 Z" fill="#d89a4c" />
          <path d="M208,330 q6,-2 12,0 M206,338 q8,-2 16,0" stroke="#a8692a" strokeWidth="1.4" fill="none" />
          <circle cx="212" cy="308" r="9" fill="#d89a4c" />
          <path d="M204,304 L205,293 L211,300 Z M213,300 L219,293 L220,304 Z" fill="#d89a4c" />
          <path d="M206,302 L207,296 L209,300 Z" fill="#f2b6a6" stroke="none" />
          <path d="M206.5,307 q2,-2 4,0 M214,307 q2,-2 4,0" fill="none" stroke={INK} strokeWidth="1" />
          <path d="M211,311 l1.2,1.2 l1.2,-1.2" fill="#e88a8a" />
          <path d="M210,350 v-12 M218,350 v-12" stroke="#a8692a" />
        </g>
      );
    case 'rabbit':
      return (
        <g stroke={INK} strokeWidth="0.7">
          <ellipse cx="218" cy="340" rx="15" ry="12" fill="#c4b39c" />
          <circle cx="232" cy="336" r="4" fill="#fbf8f0" />
          <ellipse cx="207" cy="351" rx="6" ry="2.4" fill="#b3a28a" />
          <circle cx="205" cy="328" r="8" fill="#c4b39c" />
          <ellipse cx="203" cy="312" rx="3" ry="10" fill="#c4b39c" transform="rotate(-12 203 312)" />
          <ellipse cx="209" cy="313" rx="3" ry="10" fill="#c4b39c" transform="rotate(14 209 313)" />
          <ellipse cx="209" cy="313" rx="1.3" ry="7" fill="#eab0a6" stroke="none" transform="rotate(14 209 313)" />
          <circle cx="201" cy="326" r="1.3" fill="#1a1a1a" stroke="none" />
          <circle cx="197.5" cy="330" r="1" fill="#d68a8a" stroke="none" />
        </g>
      );
    case 'crane':
      return (
        <g stroke={INK} strokeWidth="0.7">
          <path d="M60,352 L62,286 M70,352 L66,286" stroke="#2a2a2a" strokeWidth="1.6" />
          <path d="M55,352 h9 M66,352 h9" stroke="#2a2a2a" strokeWidth="1.4" />
          <path d="M44,276 Q48,256 66,256 Q82,258 82,272 Q74,290 52,290 Q40,290 44,276 Z" fill="#fbf8f0" />
          <path d="M40,278 Q34,290 48,294 Q56,290 58,284 Q50,286 40,278 Z" fill="#1d1b1e" />
          <path d="M76,262 Q84,236 74,222 Q66,208 76,196" fill="none" stroke="#1d1b1e" strokeWidth="5" strokeLinecap="round" />
          <path d="M80,250 Q84,236 78,226" fill="none" stroke="#fbf8f0" strokeWidth="3" />
          <circle cx="78" cy="194" r="5" fill="#fbf8f0" />
          <circle cx="78" cy="191" r="2.4" fill="#c8243a" stroke="none" />
          <path d="M82,194 L96,197 L82,197 Z" fill="#8a7a5a" />
          <circle cx="79.5" cy="194" r="0.8" fill="#1a1a1a" stroke="none" />
        </g>
      );
    case 'falcon':
      return (
        <g stroke={INK} strokeWidth="0.6">
          <path d="M94,148 Q90,132 96,122 Q106,116 110,128 Q112,140 106,150 Z" fill="#8a6a4a" />
          <path d="M98,130 Q102,128 106,132 Q108,142 104,148 Q98,146 98,130 Z" fill="#efe3c6" />
          <path d="M100,136 l1,1 M103,138 l1,1 M101,142 l1,1 M104,144 l1,1" stroke="#6b4a2a" strokeWidth="1" />
          <path d="M94,148 L90,166 L98,164 L100,150 Z" fill="#6b4a2a" />
          <circle cx="104" cy="120" r="6" fill="#8a3a2a" />
          <path d="M104,114 q2,-6 6,-6" stroke="#d9aa3f" strokeWidth="1.2" fill="none" />
          <path d="M109,120 q4,1 3,5 l-3,-2 Z" fill="#d9aa3f" />
          <path d="M100,150 l-1,3 M104,150 l0,3" stroke="#d9aa3f" strokeWidth="1.2" />
        </g>
      );
    case 'parrot':
      return (
        <g stroke={INK} strokeWidth="0.6">
          <path d="M96,148 L88,178 L94,177 L101,150 Z" fill="#2f5fb0" />
          <path d="M95,150 Q90,134 98,124 Q108,120 110,132 Q110,144 104,152 Z" fill="#d23a2a" />
          <path d="M96,138 Q100,132 106,136 Q106,146 100,150 Z" fill="#f1c04a" />
          <path d="M97,144 Q101,140 104,146 L100,151 Z" fill="#2f5fb0" />
          <circle cx="104" cy="122" r="6" fill="#d23a2a" />
          <circle cx="106" cy="121" r="2.2" fill="#fbf8f0" stroke="none" />
          <circle cx="106.3" cy="121" r="0.9" fill="#1a1a1a" stroke="none" />
          <path d="M109,121 q5,1 3,7 q-2,-2 -4,-2 Z" fill="#efe3c6" />
        </g>
      );
    default:
      return null;
  }
}

// ---------------------------------------------------------------- accoutrements

function Lantern({ east, glow }) {
  if (east) {
    const x = 66;
    return (
      <g>
        <line x1={x} y1="0" x2={x} y2="46" stroke="#2a1d18" strokeWidth="1" />
        <rect x={x - 5} y="44" width="10" height="4" fill="#1d1b1e" />
        <ellipse cx={x} cy="62" rx="13" ry="15" fill="#d8402e" stroke={INK} strokeWidth="0.7" />
        <ellipse cx={x} cy="62" rx="7" ry="15" fill="none" stroke="#8a1a1a" strokeWidth="0.6" />
        <ellipse cx={x} cy="62" rx="13" ry="5" fill="#f6c45a" opacity="0.35" />
        <rect x={x - 5} y="76" width="10" height="4" fill="#1d1b1e" />
        <path d={`M${x},80 v10`} stroke="#d9aa3f" strokeWidth="2" />
      </g>
    );
  }
  const x = 252;
  return (
    <g>
      <line x1={x} y1="0" x2={x} y2="44" stroke="#2a1d18" strokeWidth="1" strokeDasharray="2 1" />
      <circle cx={x} cy="44" r="2.5" fill="none" stroke="#6b5a3a" strokeWidth="1.2" />
      <path d={`M${x - 9},54 L${x},46 L${x + 9},54 Z`} fill="#6b5a3a" stroke={INK} strokeWidth="0.6" />
      <rect x={x - 8} y="54" width="16" height="20" fill={glow} stroke="#4a3a2a" strokeWidth="1.2" />
      <path d={`M${x},54 V74`} stroke="#4a3a2a" strokeWidth="1" />
      <rect x={x - 10} y="74" width="20" height="4" fill="#6b5a3a" stroke={INK} strokeWidth="0.6" />
    </g>
  );
}

function Laurel({ cx, cy, rx, ry, color = '#6f8a34', berries = true }) {
  const n = 16;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const t = (i / n) * Math.PI * 2;
        const x = cx + Math.cos(t) * rx;
        const y = cy + Math.sin(t) * ry;
        const rot = (t * 180) / Math.PI + 90 + (i % 2 ? 30 : -30);
        return <ellipse key={i} cx={x} cy={y} rx="4" ry="1.7" fill={color} stroke="#3e5220" strokeWidth="0.3" transform={`rotate(${rot} ${x} ${y})`} />;
      })}
      {berries && [0.3, 2.2, 4.1].map((t) => (
        <circle key={t} cx={cx + Math.cos(t) * rx} cy={cy + Math.sin(t) * ry} r="1.3" fill="#e2b545" />
      ))}
    </g>
  );
}

function Table({ east }) {
  if (east) {
    return (
      <g>
        <rect x="196" y="250" width="90" height="7" fill="#1d1b1e" stroke="#8e1b1b" strokeWidth="1.2" />
        <path d="M204,257 Q200,300 208,344 M272,257 Q276,300 268,344" stroke="#1d1b1e" strokeWidth="5" fill="none" />
        <path d="M206,300 H270" stroke="#8e1b1b" strokeWidth="2" />
      </g>
    );
  }
  return (
    <g>
      <path d="M206,290 V346 M272,290 V346" stroke="#4e3020" strokeWidth="6" />
      <rect x="196" y="250" width="90" height="5" fill="#5a3a24" />
      <path d="M196,254 H286 V292 H196 Z" fill="#7a1e22" stroke={INK} strokeWidth="0.6" />
      <path d="M196,260 H286 M196,286 H286" stroke="#d9a441" strokeWidth="2" />
      {[206, 222, 238, 254, 270].map((x) => (
        <path key={x} d={`M${x},266 l6,7 l-6,7 l-6,-7 Z`} fill="#24366b" stroke="#d9a441" strokeWidth="0.6" />
      ))}
      {Array.from({ length: 18 }, (_, i) => <line key={i} x1={198 + i * 5} y1="292" x2={198 + i * 5} y2="297" stroke="#d9a441" strokeWidth="1" />)}
    </g>
  );
}

function TableObject({ kind, x, raised }) {
  const top = 250 - (raised || 0);
  switch (kind) {
    case 'ledger':
      return (
        <g>
          <rect x={x - 13} y={top - 9} width="26" height="9" rx="1" fill="#4e2a1a" stroke={INK} strokeWidth="0.6" />
          <rect x={x - 12} y={top - 7.5} width="23" height="6" fill="#efe3c6" />
          <path d={`M${x - 12},${top - 5.5} H${x + 11} M${x - 12},${top - 3.5} H${x + 11}`} stroke="#c9b58a" strokeWidth="0.4" />
          <path d={`M${x + 4},${top - 1} v8`} stroke="#b4322a" strokeWidth="1.4" />
        </g>
      );
    case 'hourglass':
      return (
        <g>
          <rect x={x - 7} y={top - 3} width="14" height="3" fill="#6b4122" stroke={INK} strokeWidth="0.5" />
          <rect x={x - 7} y={top - 26} width="14" height="3" fill="#6b4122" stroke={INK} strokeWidth="0.5" />
          <path d={`M${x - 5},${top - 23} H${x + 5} L${x + 0.8},${top - 13} L${x + 5},${top - 3} H${x - 5} L${x - 0.8},${top - 13} Z`} fill="#dbe8ec" opacity="0.8" stroke="#7a8a90" strokeWidth="0.5" />
          <path d={`M${x - 3},${top - 19} H${x + 3} L${x},${top - 14} Z`} fill="#d9aa3f" />
          <path d={`M${x - 4.5},${top - 3} Q${x},${top - 9} ${x + 4.5},${top - 3} Z`} fill="#d9aa3f" />
          <path d={`M${x - 6},${top - 23} V${top - 3} M${x + 6},${top - 23} V${top - 3}`} stroke="#6b4122" strokeWidth="1" />
        </g>
      );
    case 'ship':
      return (
        <g>
          <path d={`M${x - 13},${top - 9} H${x + 13} L${x + 9},${top - 2} H${x - 9} Z`} fill="#7a4a24" stroke={INK} strokeWidth="0.6" />
          <rect x={x - 4} y={top - 2} width="8" height="2" fill="#4e3020" />
          <path d={`M${x - 2},${top - 9} V${top - 36} M${x + 7},${top - 9} V${top - 26}`} stroke="#4e3020" strokeWidth="1" />
          <path d={`M${x - 10},${top - 32} Q${x - 4},${top - 24} ${x - 10},${top - 13} H${x - 3} V${top - 32} Z`} fill="#fbf8f0" stroke="#8a7a5a" strokeWidth="0.4" />
          <path d={`M${x - 1},${top - 30} Q${x + 6},${top - 22} ${x - 1},${top - 13} Z`} fill="#fbf8f0" stroke="#8a7a5a" strokeWidth="0.4" />
          <path d={`M${x + 7},${top - 24} Q${x + 12},${top - 18} ${x + 7},${top - 12} Z`} fill="#fbf8f0" stroke="#8a7a5a" strokeWidth="0.4" />
          <path d={`M${x - 2},${top - 36} l6,1.5 l-6,1.5 Z`} fill="#c8243a" />
        </g>
      );
    case 'vase':
      return (
        <g>
          <Sprig x={x} y={top - 12} angle={8} scale={0.75} />
          <path d={`M${x - 3},${top - 16} H${x + 3} L${x + 2},${top - 13} Q${x + 7},${top - 8} ${x + 4},${top} H${x - 4} Q${x - 7},${top - 8} ${x - 2},${top - 13} Z`} fill="#3d6b8a" stroke={INK} strokeWidth="0.6" />
          <path d={`M${x - 5},${top - 7} H${x + 5}`} stroke="#efe3c6" strokeWidth="1" />
        </g>
      );
    default:
      return null;
  }
}

function Shield({ east, C }) {
  if (east) {
    return (
      <g transform="rotate(-8 74 330)">
        <ellipse cx="74" cy="330" rx="18" ry="20" fill="#1d1b1e" stroke={C.accent} strokeWidth="2" />
        <ellipse cx="74" cy="330" rx="12" ry="13.5" fill="#8e1b1b" />
        <path d="M74,320 a5,5 0 1 1 0,10 a5,5 0 1 0 0,10" fill="none" stroke={C.accent} strokeWidth="1.8" />
        <circle cx="74" cy="330" r="2.4" fill={C.accent} />
      </g>
    );
  }
  const field = ['ultramarine', 'teal'].includes(C.primaryName) ? '#8e1b2a' : '#26408f';
  return (
    <g transform="rotate(-10 76 326)">
      <path d="M58,302 H94 V320 Q94,342 76,354 Q58,342 58,320 Z" fill={field} stroke={C.accent} strokeWidth="2.4" />
      <path d="M58,302 H94 V320 Q94,342 76,354 Q58,342 58,320 Z" fill="none" stroke={INK} strokeWidth="0.6" />
      <path d="M60,330 L76,314 L92,330" fill="none" stroke={C.accent} strokeWidth="4" />
      <circle cx="76" cy="309" r="2.5" fill={C.accent} />
      <circle cx="68" cy="339" r="2" fill={C.accent} />
      <circle cx="84" cy="339" r="2" fill={C.accent} />
    </g>
  );
}

function CoinPurse() {
  return (
    <g>
      <path d="M133,205 L132,214" stroke="#5a3a24" strokeWidth="1" />
      <path d="M128,214 Q122,232 132,236 Q142,232 136,214 Q132,211 128,214 Z" fill="#8a5a2e" stroke={INK} strokeWidth="0.6" />
      <path d="M127.5,216 Q132,219 136.5,216" fill="none" stroke="#d9aa3f" strokeWidth="1.2" />
      <circle cx="132" cy="226" r="2.6" fill="#e6bf4a" stroke="#8a6418" strokeWidth="0.5" />
      <path d="M128,214 l-3,-3 M136,214 l3,-3" stroke="#d9aa3f" strokeWidth="0.8" />
    </g>
  );
}

function Keys() {
  return (
    <g stroke="#8a6418" fill="none">
      <circle cx="148" cy="211" r="3.5" strokeWidth="1.4" />
      <path d="M146,214 L144,232 M144,229 h-3 M144,226 h-2" strokeWidth="1.6" />
      <circle cx="146" cy="214" r="0" />
      <path d="M150,214 L154,230 M154,228 h3 M153,225 h3" strokeWidth="1.6" />
      <circle cx="143.6" cy="233" r="1.2" fill="#d9aa3f" />
    </g>
  );
}

function Pearls({ y = 0 }) {
  const pts = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const x = (1 - t) * (1 - t) * 125 + 2 * (1 - t) * t * 138 + t * t * 151;
    const yy = (1 - t) * (1 - t) * 141 + 2 * (1 - t) * t * 166 + t * t * 141;
    pts.push([x, yy + y]);
  }
  return (
    <g>
      {pts.map(([x, yy], i) => (
        <circle key={i} cx={x} cy={yy} r="1.9" fill="#f6f1e6" stroke="#a9a08c" strokeWidth="0.4" />
      ))}
      <circle cx="138" cy={157 + y} r="2.8" fill="#fbf8f0" stroke="#a9a08c" strokeWidth="0.5" />
    </g>
  );
}

// ---------------------------------------------------------------- main

function describe(a, caption) {
  const bits = [
    `Portrait of ${caption}`,
    `a ${a.tradition} style figure in a ${a.primaryColor} ${GARMENT_LABEL[a.garment]} with ${a.accentColor} trim`,
    `${a.hairColor} ${a.hairStyle} hair${a.facialHair !== 'none' ? ` and a ${a.facialHair}` : ''}`,
  ];
  if (a.headwear !== 'none') bits.push(`wearing a ${a.headwear}`);
  if (a.heldItem !== 'none') bits.push(`holding a ${a.heldItem}`);
  if (a.companion !== 'none') bits.push(`with a ${a.companion}`);
  bits.push(`posed ${a.pose} before a ${a.backdrop} backdrop`);
  if (a.accoutrements.length) {
    bits.push(`emblems: ${a.accoutrements.map((k) => ACCOUTREMENTS[k].label).join(', ')}`);
  }
  return bits.join('; ') + '.';
}

export default function AvatarPortrait({ spec, size = 320, showFrame = true, showCaption = true, title }) {
  const rawId = useId();
  const uid = 'ap' + rawId.replace(/[^a-zA-Z0-9]/g, '');
  const u = (n) => `${uid}-${n}`;
  const a = normalizeAvatar(spec);
  const caption = title || a.name;
  const east = EAST.includes(a.tradition);
  const european = EUROPE.includes(a.tradition);
  const has = (k) => a.accoutrements.includes(k);

  const C = {
    primary: PRIMARY[a.primaryColor],
    primaryName: a.primaryColor,
    accent: ACCENT[a.accentColor],
    skin: SKIN[a.skinTone],
    hair: HAIR[a.hairColor],
  };
  C.second = a.garment === 'hanbok' ? shade(C.primary, 0.62) : C.primary;
  C.waveBase = C.primary;
  C.hose = a.garment === 'cloak' ? '#2b2528' : shade(C.primary, a.primaryColor === 'black' ? 0.25 : -0.45);
  C.shoe = a.tradition === 'edo' ? '#f3efe4' : east ? '#1d1b1e' : '#3a2a22';

  const shape = garmentShape(a.garment);
  const pose = POSES[a.pose];
  const B = showFrame ? { x0: 22, y0: 22, x1: 278, y1: 380 } : { x0: 0, y0: 0, x1: 300, y1: 420 };

  const armColor = a.garment === 'hanbok'
    ? C.second
    : a.garment === 'cloak' ? mix(C.primary, '#2a2428', 0.72) : C.primary;

  const sprigInHand = has('sprig') && a.heldItem === 'none';
  const held = sprigInHand ? 'sprig' : a.heldItem;
  const laurelOnHead = has('laurel') && a.headwear === 'none';

  const tableItems = [];
  if (has('ledger')) tableItems.push('ledger');
  else if (has('hourglass')) tableItems.push('hourglass');
  if (has('sprig') && !sprigInHand) tableItems.push('vase');
  if (has('ship')) tableItems.push('ship');
  const stackHourglass = has('ledger') && has('hourglass');
  const slotW = tableItems.length ? 68 / tableItems.length : 0;

  const garmentIsCloak = a.garment === 'cloak';
  const perched = ['falcon', 'parrot'].includes(a.companion);
  const label = describe(a, caption);

  return (
    <svg
      viewBox="0 0 300 420" width={size} height={Math.round(size * 1.4)}
      role="img" aria-label={label} xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
    >
      <Defs u={u} C={C} a={a} />
      <clipPath id={u('canvas')}>
        <rect x={B.x0} y={B.y0} width={B.x1 - B.x0} height={B.y1 - B.y0} />
      </clipPath>

      <g clipPath={`url(#${u('canvas')})`}>
        <Backdrop a={a} u={u} B={B} />

        {/* wall-hung objects */}
        {has('lantern') && <Lantern east={east} glow={`url(#${u('glow')})`} />}
        {has('laurel') && !laurelOnHead && (
          <g>
            <circle cx="240" cy="160" r="15" fill="#000" opacity="0.12" />
            <Laurel cx={238} cy={156} rx={13} ry={13} />
            <path d="M232,168 l-6,14 M244,168 l6,14" stroke={C.accent} strokeWidth="2.4" />
            <circle cx="238" cy="168" r="2.5" fill={C.accent} />
          </g>
        )}

        {/* side table with earned objects */}
        {tableItems.length > 0 && (
          <g>
            <Table east={east} />
            {tableItems.map((k, i) => {
              const x = 202 + slotW * (i + 0.5);
              return (
                <g key={k}>
                  <TableObject kind={k} x={x} />
                  {k === 'ledger' && stackHourglass && <TableObject kind="hourglass" x={x - 2} raised={9} />}
                </g>
              );
            })}
          </g>
        )}

        {a.companion === 'crane' && <Companion kind="crane" />}

        {/* figure */}
        <ellipse cx={CX} cy="351" rx="46" ry="6" fill="#000" opacity="0.28" />
        <HeadwearBack a={a} />
        <HairBack a={a} C={C} />
        {garmentIsCloak && <CloakBack C={C} />}
        <Legs a={a} C={C} legs={pose.legs} kind={shape.legs} />
        <Garment a={a} C={C} u={u} shape={shape} />
        {shape.legs === 'none' && <Legs a={a} C={C} legs={pose.legs} kind="tips" />}
        {has('coin-purse') && <CoinPurse />}
        {has('keys') && <Keys />}

        <Arm a={a} C={C} u={u} pts={pose.free} shape={shape} color={armColor} akimbo={a.pose === 'hand-on-hip'} />
        {garmentIsCloak && <CloakFront C={C} u={u} />}
        {has('pearls') && <Pearls y={a.tradition === 'flemish' ? 4 : 0} />}
        <Arm a={a} C={C} u={u} pts={HOLD} shape={shape} color={armColor} showHand={false} />
        {HAND_FIRST.includes(held) && <Hand u={u} at={HOLD[2]} />}
        <HeldItem item={held} />
        {!HAND_FIRST.includes(held) && <Hand u={u} at={HOLD[2]} />}

        <Face a={a} C={C} u={u} />
        <HairFront a={a} C={C} />
        <FacialHair a={a} C={C} />
        <Headwear a={a} C={C} />
        {laurelOnHead && <Laurel cx={138} cy={97} rx={17} ry={5} />}

        {perched && <Companion kind={a.companion} />}
        {['dog', 'cat', 'rabbit'].includes(a.companion) && <Companion kind={a.companion} />}
        {has('shield') && <Shield east={east && !european} C={C} />}

        <rect x={B.x0} y={B.y0} width={B.x1 - B.x0} height={B.y1 - B.y0} fill={`url(#${u('vignette')})`} />
      </g>

      {showFrame && <Frame a={a} u={u} />}
      {showCaption && caption && <Caption a={a} text={caption} showFrame={showFrame} u={u} />}
    </svg>
  );
}
