'use client';
import { useWidth } from '@/hooks/useWidth';
import { fmt } from '@/lib/utils';
import { useTooltip, TipBody } from './Tooltip';

/* Vertical bars with value labels. items: [{ label, val, color, pct? }] */
export default function BarChart({ items, h = 250 }) {
  const [ref, W] = useWidth();
  const tip = useTooltip();
  if (!W) return <div className="chart" ref={ref} style={{ height: h }} />;

  const m = { l: 8, r: 8, t: 24, b: 44 }, iw = W - m.l - m.r, ih = h - m.t - m.b;
  const n = items.length, bw = iw / n, barW = Math.min(76, bw * 0.66);
  const mx = Math.max(1, ...items.map((i) => i.val));

  return (
    <div className="chart" ref={ref}>
      <svg viewBox={`0 0 ${W} ${h}`} height={h}>
        <line x1={m.l} x2={W - m.r} y1={m.t + ih} y2={m.t + ih} stroke="rgba(255,255,255,.16)" />
        {items.map((it, i) => {
          const bh = Math.max(3, (it.val / mx) * ih), x0 = m.l + i * bw + (bw - barW) / 2, y0 = m.t + ih - bh, r = Math.min(8, barW / 2, bh);
          const words = it.label.split(' '), half = Math.ceil(words.length / 2);
          const l1 = words.slice(0, half).join(' '), l2 = words.slice(half).join(' ');
          const cx = x0 + barW / 2;
          return (
            <g key={it.label}>
              <path d={`M${x0} ${m.t + ih}V${y0 + r}Q${x0} ${y0} ${x0 + r} ${y0}H${x0 + barW - r}Q${x0 + barW} ${y0} ${x0 + barW} ${y0 + r}V${m.t + ih}Z`}
                fill={it.color} style={{ filter: `drop-shadow(0 4px 10px ${it.color}40)` }}
                onMouseMove={(e) => tip.show(e, <TipBody title={it.label} rows={[{ label: 'Violations', value: fmt(it.val) }, ...(it.pct != null ? [{ label: 'Share', value: it.pct + '%' }] : [])]} />)}
                onMouseLeave={tip.hide} />
              <text x={cx} y={y0 - 7} textAnchor="middle" style={{ fill: '#dfe7f5', fontWeight: 700, fontSize: 12 }}>{fmt(it.val)}</text>
              <text x={cx} y={m.t + ih + 17} textAnchor="middle" style={{ fill: '#a4b0c8' }}>{l1}</text>
              {l2 && <text x={cx} y={m.t + ih + 31} textAnchor="middle" style={{ fill: '#a4b0c8' }}>{l2}</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
