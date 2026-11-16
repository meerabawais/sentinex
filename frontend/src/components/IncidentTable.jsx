'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { INCIDENT_FILTERS, ppeBy } from '@/lib/constants';
import { cap, clockStr, fmt, rel } from '@/lib/utils';
import { SeverityPill, StatusPill } from './Pill';

export default function IncidentTable({ incidents }) {
  const { data, incidentFilter, setIncidentFilter, setDrawerId } = useApp();
  const [rows, setRows] = useState(10);
  const camBy = (id) => data.cameras.find((c) => c.id === id);
  const list = incidents.slice().reverse().filter((x) => incidentFilter === 'all' || x.status === incidentFilter);
  const shown = list.slice(0, rows);

  return (
    <div className="card">
      <div className="ch">
        <div><h3>Incident log</h3><div className="sub">Newest first · click a row for details</div></div>
        <div className="tbl-tools">
          <div className="chips">
            {INCIDENT_FILTERS.map((k) => (
              <button key={k} className={incidentFilter === k ? 'on' : ''} onClick={() => { setIncidentFilter(k); setRows(10); }}>{cap(k)}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="tw">
        <table>
          <thead><tr><th>Incident</th><th>Violation</th><th>Camera / zone</th><th>Severity</th><th>Confidence</th><th>Status</th></tr></thead>
          <tbody>
            {shown.length ? shown.map((x) => {
              const p = ppeBy(x.ppe), c = camBy(x.camera);
              return (
                <tr key={x.id} onClick={() => setDrawerId(x.id)}>
                  <td><span className="id">{x.id}</span><span className="sub2">{rel(data.now, x.ts)} · {clockStr(x.ts)}</span></td>
                  <td><span className="viol"><i style={{ background: p.color }} />{p.label}</span></td>
                  <td>{c.name}<span className="sub2">{c.id} · {c.zone}</span></td>
                  <td><SeverityPill severity={x.severity} /></td>
                  <td style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text2)' }}>{Math.round(x.conf * 100)}%</td>
                  <td><StatusPill status={x.status} /></td>
                </tr>
              );
            }) : <tr><td colSpan={6}><div className="empty">No incidents match these filters.</div></td></tr>}
          </tbody>
        </table>
      </div>
      <div className="more">
        <span>Showing {Math.min(rows, list.length)} of {fmt(list.length)}</span>
        {list.length > rows && <button className="btn" onClick={() => setRows(rows + 10)}>Show more</button>}
      </div>
    </div>
  );
}
