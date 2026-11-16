'use client';
import { heatGrid } from '@/lib/analytics';
import { useTooltip, TipBody } from './Tooltip';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/* Weekday x hour heatmap of violation counts. */
export default function Heatmap({ incidents }) {
  const tip = useTooltip();
  const grid = heatGrid(incidents);
  const max = Math.max(1, ...grid.flat());
  return (
    <>
      <div className="heat">
        <span />
        {Array.from({ length: 24 }, (_, i) => <span className="h" key={i}>{i % 3 === 0 ? String(i).padStart(2, '0') : ''}</span>)}
        {grid.map((row, d) => (
          <FragmentRow key={d} day={DAYS[d]}>
            {row.map((n, i) => (
              <div className="c" key={i} style={{ '--v': ((n / max) * 0.95).toFixed(2) }}
                onMouseMove={(e) => tip.show(e, <TipBody title={`${DAYS[d]} ${String(i).padStart(2, '0')}:00`} rows={[{ label: 'Violations', value: n }]} />)}
                onMouseLeave={tip.hide} />
            ))}
          </FragmentRow>
        ))}
      </div>
      <div className="scale">Fewer<i />More</div>
    </>
  );
}

function FragmentRow({ day, children }) {
  return (<><span className="d">{day}</span>{children}</>);
}
