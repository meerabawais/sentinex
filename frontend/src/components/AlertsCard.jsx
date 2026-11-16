'use client';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { ppeBy } from '@/lib/constants';
import { hhmm } from '@/lib/utils';
import Icon from './Icon';

/* Latest open / under-review incidents in the selected range. */
export default function AlertsCard() {
  const { data, view, setDrawerId } = useApp();
  const items = view.cur.slice(-40).reverse().filter((x) => x.status !== 'resolved').slice(0, 5);
  const camName = (id) => data.cameras.find((c) => c.id === id)?.name;
  return (
    <div className="card">
      <div className="ch">
        <div><h3>Real-time safety alerts</h3><div className="sub">Open &amp; under review</div></div>
        <span className="dots">•••</span>
      </div>
      <div className="alerts">
        {items.map((x) => {
          const cls = x.severity === 'high' ? 'critical' : x.severity === 'medium' ? 'warning' : 'notice';
          const label = x.severity === 'high' ? 'Critical' : x.severity === 'medium' ? 'Warning' : 'Notice';
          return (
            <div key={x.id} className={`al ${cls}`} onClick={() => setDrawerId(x.id)}>
              <div className="ic"><Icon name={cls === 'notice' ? 'info' : 'warn'} strokeWidth={2.2} /></div>
              <div><b>{label} · {ppeBy(x.ppe).label}</b><span>{camName(x.camera)} · {x.camera}</span></div>
              <time>{hhmm(x.ts)}</time>
            </div>
          );
        })}
        {!items.length && <div className="empty">All clear</div>}
      </div>
      <Link href="/incidents" className="showmore">Show more</Link>
    </div>
  );
}
