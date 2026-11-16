'use client';
import { fmt } from '@/lib/utils';
import { useTooltip, TipBody } from './Tooltip';

/* Horizontal ranked list. rows: [{ label, n }] */
export default function RankedBars({ rows }) {
  const tip = useTooltip();
  const max = Math.max(1, ...rows.map((r) => r.n));
  const tot = rows.reduce((s, r) => s + r.n, 0) || 1;
  return (
    <div className="rank">
      {rows.map((r) => (
        <div className="r" key={r.label}
          onMouseMove={(e) => tip.show(e, <TipBody title={r.label} rows={[{ label: 'Violations', value: fmt(r.n) }, { label: 'Share', value: Math.round((r.n / tot) * 100) + '%' }]} />)}
          onMouseLeave={tip.hide}>
          <span>{r.label}</span><b>{fmt(r.n)}</b>
          <div className="track"><div className="fill" style={{ width: `${(r.n / max) * 100}%` }} /></div>
        </div>
      ))}
    </div>
  );
}
