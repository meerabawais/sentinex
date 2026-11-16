'use client';
import { fmt } from '@/lib/utils';
import { useTooltip, TipBody } from './Tooltip';

/* segments: [{ label, n, color }] */
export default function DonutChart({ segments, mid, midSub }) {
  const tip = useTooltip();
  const size = 176, t = 28, r = (size - t) / 2, C = 2 * Math.PI * r;
  const tot = segments.reduce((s, x) => s + x.n, 0) || 1;
  let acc = 0;
  return (
    <div className="donutwrap">
      <div className="donut">
        <svg viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth={t} />
          {segments.map((s) => {
            const len = Math.max(0, (s.n / tot) * C - 3), off = acc;
            acc += (s.n / tot) * C;
            return (
              <circle key={s.label} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={t}
                strokeDasharray={`${len.toFixed(1)} ${(C - len).toFixed(1)}`} strokeDashoffset={(-off).toFixed(1)}
                onMouseMove={(e) => tip.show(e, <TipBody title={s.label} rows={[{ label: 'Count', value: fmt(s.n) }, { label: 'Share', value: Math.round((s.n / tot) * 100) + '%' }]} />)}
                onMouseLeave={tip.hide} />
            );
          })}
        </svg>
        <div className="mid"><b>{mid}</b><small>{midSub}</small></div>
      </div>
      <div className="dl">
        {segments.map((s) => (
          <div key={s.label}>
            <span className="sw" style={{ background: s.color }} />{s.label}
            <b>{fmt(s.n)}</b><em>{Math.round((s.n / tot) * 100)}%</em>
          </div>
        ))}
      </div>
    </div>
  );
}
