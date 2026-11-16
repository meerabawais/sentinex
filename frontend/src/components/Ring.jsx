import { useId } from 'react';

/* Circular gauge with a gradient stroke. */
export default function Ring({ pct, c1, c2, size = 96, stroke = 9, center, sub = '' }) {
  const id = useId().replace(/:/g, '');
  const r = (size - stroke) / 2, C = 2 * Math.PI * r, p = Math.max(0, Math.min(100, pct));
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={c1} /><stop offset="1" stopColor={c2} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${id})`} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${((C * p) / 100).toFixed(1)} ${C.toFixed(1)}`} style={{ filter: `drop-shadow(0 0 5px ${c1}66)` }} />
      </svg>
      <div className="rc"><b>{center}</b><small>{sub}</small></div>
    </div>
  );
}
