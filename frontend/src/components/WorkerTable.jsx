'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { WORKER_FILTERS, WORKER_STATUS, ppeBy } from '@/lib/constants';
import { hhmm, initials, rel } from '@/lib/utils';
import { SmallCheck, SmallCross } from './Icon';

/* One required-PPE chip: ok (worn), miss (missing) or na (worker is not on site). */
function PpeChip({ k, state }) {
  const p = ppeBy(k);
  return (
    <span className={`pc ${state}`}>
      <i style={{ background: p.color }} />{p.short}
      {state === 'ok' && <SmallCheck />}{state === 'miss' && <SmallCross />}
    </span>
  );
}

export default function WorkerTable({ workers }) {
  const { data } = useApp();
  const [filter, setFilter] = useState('all');
  const camBy = (id) => data.cameras.find((c) => c.id === id);
  const list = filter === 'all' ? workers
    : filter === 'onsite' ? workers.filter((w) => w.status === 'compliant' || w.status === 'violation')
    : workers.filter((w) => w.status === filter);

  return (
    <div className="card">
      <div className="ch">
        <div><h3>Worker roster</h3><div className="sub">Status as of {hhmm(data.now)} · PPE chips show the rules each worker must follow</div></div>
        <div className="chips">
          {WORKER_FILTERS.map(([k, l]) => <button key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{l}</button>)}
        </div>
      </div>
      <div className="tw">
        <table style={{ minWidth: 900 }}>
          <thead><tr><th>Worker</th><th>Role</th><th>Location</th><th>Status</th><th>PPE rules</th></tr></thead>
          <tbody>
            {list.map((w) => {
              const c = camBy(w.camera), live = w.status === 'compliant' || w.status === 'violation';
              return (
                <tr key={w.id} style={{ cursor: 'default' }}>
                  <td><div className="wk"><span className="av">{initials(w.name)}</span><div><b>{w.name}</b><small>{w.id}</small></div></div></td>
                  <td>{w.role}</td>
                  <td>
                    {w.status === 'off'
                      ? <><span style={{ color: 'var(--muted)' }}>Left site</span><span className="sub2">{rel(data.now, w.seen)}</span></>
                      : <>{c.name}<span className="sub2">{c.id} · {rel(data.now, w.seen)}</span></>}
                  </td>
                  <td><span className={`pill st-${w.status}`}>{WORKER_STATUS[w.status]}</span></td>
                  <td>
                    <div className="pcs">
                      {w.required.map((k) => <PpeChip key={k} k={k} state={!live ? 'na' : w.missing === k ? 'miss' : 'ok'} />)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="more"><span>Showing {list.length} of {workers.length} workers</span><span>Rules follow each worker&apos;s role and zone</span></div>
    </div>
  );
}
