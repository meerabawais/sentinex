'use client';
import { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ppeBy } from '@/lib/constants';
import { rel } from '@/lib/utils';
import Icon from './Icon';
import IncidentThumb from './IncidentThumb';
import { SeverityPill, StatusPill } from './Pill';

/* Side panel with incident details and the Resolve / Review actions. */
export default function IncidentDrawer() {
  const { data, drawerId, setDrawerId, setIncidentStatus } = useApp();
  const x = drawerId ? data.incidents.find((i) => i.id === drawerId) : null;
  const cam = x ? data.cameras.find((c) => c.id === x.camera) : null;
  const close = () => setDrawerId(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setDrawerId(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [setDrawerId]);

  return (
    <>
      <div className={`scrim ${x ? 'on' : ''}`} onClick={close} />
      <aside className={`drawer ${x ? 'on' : ''}`} aria-hidden={!x}>
        {x && (
          <>
            <div className="dh">
              <div><h3>{x.id}</h3><div style={{ color: 'var(--muted)', fontSize: 12 }}>{rel(data.now, x.ts)}</div></div>
              <button className="iconbtn" onClick={close} aria-label="Close"><Icon name="close" strokeWidth={2} /></button>
            </div>
            <div className="thumb"><IncidentThumb incident={x} /></div>
            <dl className="kv">
              <dt>Violation</dt><dd><span className="viol"><i style={{ background: ppeBy(x.ppe).color }} />{ppeBy(x.ppe).label}</span></dd>
              <dt>Severity</dt><dd><SeverityPill severity={x.severity} /></dd>
              <dt>Status</dt><dd><StatusPill status={x.status} /></dd>
              <dt>Camera</dt><dd>{cam.name} <span style={{ color: 'var(--muted)' }}>({cam.id})</span></dd>
              <dt>Zone</dt><dd>{cam.zone}</dd>
              <dt>Detected</dt><dd>{new Date(x.ts).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'medium', hour12: false })}</dd>
              <dt>Confidence</dt><dd>{Math.round(x.conf * 100)}%</dd>
              <dt>Track ID</dt><dd>#{x.track}</dd>
              <dt>Source</dt><dd>{x.source}</dd>
            </dl>
            <div className="dact">
              {x.status === 'open' && <button className="btn" onClick={() => setIncidentStatus(x.id, 'reviewed')}>Mark reviewed</button>}
              {x.status !== 'resolved'
                ? <button className="btn primary" onClick={() => setIncidentStatus(x.id, 'resolved')}>Resolve</button>
                : <button className="btn" onClick={() => setIncidentStatus(x.id, 'open')}>Reopen</button>}
            </div>
          </>
        )}
      </aside>
    </>
  );
}
