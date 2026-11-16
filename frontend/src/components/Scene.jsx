import { useId } from 'react';

/* Simulated camera frame: two workers with detector boxes (drawn, not real video). */
function Worker({ x, y, vest, helmet }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="-13" y="62" width="10" height="46" rx="4" fill="#27324a" />
      <rect x="3" y="62" width="10" height="46" rx="4" fill="#27324a" />
      <rect x="-20" y="14" width="40" height="54" rx="10" fill={vest ? '#f08a24' : '#46567a'} />
      {vest && <><rect x="-20" y="30" width="40" height="5" fill="#e8ecf2" opacity=".85" /><rect x="-20" y="46" width="40" height="5" fill="#e8ecf2" opacity=".85" /></>}
      <rect x="-29" y="18" width="11" height="40" rx="5" fill="#3a4766" />
      <rect x="18" y="18" width="11" height="40" rx="5" fill="#3a4766" />
      <circle cx="0" cy="2" r="13" fill="#b58f78" />
      {helmet
        ? <><path d="M-15 0a15 15 0 0 1 30 0Z" fill="#f2c230" /><rect x="-17" y="-1" width="34" height="4" rx="2" fill="#d9a91c" /></>
        : <path d="M-13 -2a13 13 0 0 1 26 0c0-5-6-8-13-8s-13 3-13 8Z" fill="#2a2018" />}
    </g>
  );
}

function Box({ x, y, w, h, label, ok }) {
  const c = ok ? '#35e07a' : '#ff4d4d';
  return (
    <>
      <rect x={x} y={y} width={w} height={h} fill={ok ? 'rgba(53,224,122,.05)' : 'rgba(255,77,77,.08)'} stroke={c} strokeWidth="1.8" />
      {label && (
        <>
          <rect x={x} y={y - 15} width={label.length * 6.6 + 12} height="15" fill={c} />
          <text x={x + 5} y={y - 4} style={{ fill: '#04140a', font: '700 10px ui-monospace,monospace' }}>{label}</text>
        </>
      )}
    </>
  );
}

const SETS = [
  { a: { x: 200, helmet: 1, vest: 1 }, b: { x: 420, helmet: 0, vest: 1 } },
  { a: { x: 170, helmet: 1, vest: 0 }, b: { x: 400, helmet: 1, vest: 1 } },
  { a: { x: 230, helmet: 0, vest: 0 }, b: { x: 450, helmet: 1, vest: 1 } },
  { a: { x: 190, helmet: 1, vest: 1 }, b: { x: 410, helmet: 1, vest: 1 } }
];

export default function Scene({ index = 0, boxes = true }) {
  const uid = useId().replace(/:/g, '');
  const s = SETS[index % SETS.length];
  const person = (w, y, cls) => {
    const bad = !w.helmet || !w.vest;
    const label = !w.helmet ? 'NO HELMET 0.91' : !w.vest ? 'NO VEST 0.87' : 'PERSON 0.96';
    return (
      <g className={`walk ${cls}`}>
        <Worker x={w.x} y={y} vest={w.vest} helmet={w.helmet} />
        {boxes && <Box x={w.x - 34} y={y - 18} w={68} h={132} label={label} ok={!bad} />}
        {boxes && w.helmet ? <Box x={w.x - 17} y={y - 14} w={34} h={18} label="" ok /> : null}
      </g>
    );
  };
  return (
    <svg viewBox="0 0 640 330" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`${uid}w`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a2438" /><stop offset="1" stopColor="#0e1626" /></linearGradient>
        <linearGradient id={`${uid}f`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1c2638" /><stop offset="1" stopColor="#101827" /></linearGradient>
      </defs>
      <rect width="640" height="330" fill={`url(#${uid}w)`} />
      <rect y="215" width="640" height="115" fill={`url(#${uid}f)`} />
      <g opacity=".55" fill="#2a3a5a"><rect x="30" y="40" width="90" height="120" rx="3" /><rect x="140" y="40" width="90" height="120" rx="3" /><rect x="520" y="50" width="90" height="110" rx="3" /></g>
      <g stroke="#3b4f78" strokeWidth="2" opacity=".7"><path d="M30 80h90M30 120h90M140 80h90M140 120h90M520 85h90M520 120h90" /></g>
      <g fill="#e0b020" opacity=".35"><rect x="0" y="212" width="640" height="3" /></g>
      <rect x="250" y="190" width="150" height="30" rx="4" fill="#2c3b5c" />
      <rect x="250" y="190" width="150" height="6" fill="#3d5280" />
      {person(s.a, 150, 'a')}
      {person(s.b, 156, 'b')}
    </svg>
  );
}
