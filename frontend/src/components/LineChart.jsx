'use client';
import { useId, useRef, useState } from 'react';
import { useWidth } from '@/hooks/useWidth';
import { useTooltip, TipBody } from './Tooltip';

/* Smooth curve through points (Catmull-Rom converted to cubic beziers). */
function smooth(pts) {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

/*
  labels: [{ short, long }]  one per point
  series: [{ name, color, vals, area? }]
  min/max: fixed y range (otherwise 0..auto);  yf: y value formatter
*/
export default function LineChart({ labels, series, h = 270, ml = 34, min, max, yf }) {
  const [ref, W] = useWidth();
  const uid = useId().replace(/:/g, '');
  const tip = useTooltip();
  const svgRef = useRef(null);
  const [hover, setHover] = useState(null);

  if (!W) return <div className="chart" ref={ref} style={{ height: h }} />;

  const m = { l: ml, r: 12, t: 12, b: 26 }, n = series[0].vals.length;
  const all = series.flatMap((s) => s.vals);
  const lo = min ?? 0;
  let hi = max ?? Math.max(4, ...all), step;
  if (min === undefined) {
    step = hi <= 8 ? 2 : hi <= 20 ? 5 : hi <= 50 ? 10 : hi <= 100 ? 20 : 50;
    hi = Math.ceil(hi / step) * step;
  } else step = (hi - lo) / 4;
  const iw = W - m.l - m.r, ih = h - m.t - m.b;
  const x = (i) => m.l + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
  const y = (v) => m.t + ih - ((v - lo) / (hi - lo)) * ih;
  const fy = yf || ((v) => Math.round(v));

  const ticks = [];
  for (let t = lo; t <= hi + 1e-9; t += step) ticks.push(t);
  const every = Math.ceil(n / Math.max(2, Math.floor(iw / 64)));

  const onMove = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    const i = Math.max(0, Math.min(n - 1, Math.round(((e.clientX - r.left - m.l) / (iw || 1)) * (n - 1))));
    setHover(i);
    tip.show(e, <TipBody title={labels[i].long} rows={series.map((s) => ({ color: s.color, label: s.name, value: fy(s.vals[i]) }))} />);
  };
  const onLeave = () => { setHover(null); tip.hide(); };

  return (
    <div className="chart" ref={ref}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${h}`} height={h}>
        <defs>
          {series.map((s, k) => s.area && (
            <linearGradient key={k} id={`${uid}a${k}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={s.color} stopOpacity=".32" /><stop offset="1" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={m.l} x2={W - m.r} y1={y(t)} y2={y(t)} stroke={`rgba(255,255,255,${t === lo ? 0.14 : 0.06})`} />
            <text x={m.l - 8} y={y(t) + 4} textAnchor="end">{fy(t)}</text>
          </g>
        ))}
        {labels.map((l, i) => i % every === 0 && <text key={i} x={x(i)} y={h - 6} textAnchor="middle">{l.short}</text>)}
        {series.map((s, k) => {
          const d = smooth(s.vals.map((v, i) => [x(i), y(v)]));
          return (
            <g key={s.name}>
              {s.area && <path d={`${d} L${x(n - 1)} ${y(lo)} L${x(0)} ${y(lo)}Z`} fill={`url(#${uid}a${k})`} />}
              <path d={d} fill="none" stroke={s.color} strokeWidth="2.6" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${s.color}88)` }} />
            </g>
          );
        })}
        {hover !== null && (
          <>
            <line x1={x(hover)} x2={x(hover)} y1={m.t} y2={m.t + ih} stroke="rgba(255,255,255,.3)" strokeDasharray="3 3" />
            {series.map((s) => <circle key={s.name} cx={x(hover)} cy={y(s.vals[hover])} r="5" fill={s.color} stroke="#0a101e" strokeWidth="2" />)}
          </>
        )}
        <rect x={m.l} y="0" width={iw} height={h} fill="transparent" onMouseMove={onMove} onMouseLeave={onLeave} />
      </svg>
    </div>
  );
}
