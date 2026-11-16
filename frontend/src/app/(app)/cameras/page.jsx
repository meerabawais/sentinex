'use client';
import { useApp } from '@/context/AppContext';
import { RANGE_NAME } from '@/lib/constants';
import PageHeader from '@/components/FilterBar';
import Scene from '@/components/Scene';

const STATUS_COLOR = { online: 'var(--good)', idle: 'var(--warn)', offline: 'var(--muted)' };

export default function CamerasPage() {
  const { data, view, range } = useApp();
  return (
    <>
      <PageHeader title="Cameras" subtitle={`${data.cameras.length} registered · violations in ${RANGE_NAME[range]}`} showCamera={false} />
      <div className="camgrid">
        {data.cameras.map((c, i) => {
          const n = data.incidents.filter((x) => x.camera === c.id && x.ts >= view.sp.start).length;
          return (
            <div className="card camc" key={c.id}>
              <div className="livewrap">
                {c.status === 'offline' ? <div className="nosig">NO SIGNAL</div> : <Scene index={i} />}
                {c.status !== 'offline' && <span className="chip live"><i />LIVE</span>}
              </div>
              <div className="meta">
                <div><b>{c.name}</b><small>{c.id} · {c.zone}</small></div>
                <div style={{ textAlign: 'right' }}>
                  <span className="st" style={{ color: STATUS_COLOR[c.status] }}><i style={{ background: STATUS_COLOR[c.status] }} />{c.status[0].toUpperCase() + c.status.slice(1)}</span>
                  <small style={{ display: 'block' }}>{n} violations</small>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
