'use client';
import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { D, PPE, RANGE_NAME, USE_DEMO } from '@/lib/constants';
import { buckets, bucketLabels } from '@/lib/analytics';
import { fmt } from '@/lib/utils';
import PageHeader from '@/components/FilterBar';
import StatTile from '@/components/StatTile';
import LiveFeedCard from '@/components/LiveFeedCard';
import AlertsCard from '@/components/AlertsCard';
import LineChart from '@/components/LineChart';
import DonutChart from '@/components/DonutChart';
import RankedBars from '@/components/RankedBars';
import Ring from '@/components/Ring';
import { Delta } from '@/components/Pill';

const COMPLIANCE_RINGS = [['Compliance', '#3b82f6', '#6d5cf0'], ['Resolution', '#1fb383', '#7be0a8'], ['Reviewed', '#e8672f', '#ffb020'], ['Cameras up', '#e0568a', '#ff8fb5']];
const SYSTEM_RINGS = [['CPU', 45, 'load 2.3', '#3b82f6', '#7aa8ff'], ['GPU mem', 62, '7.4 / 12 GB', '#1fb383', '#7be0a8'], ['Storage', 78, '2.1 / 3 TB', '#e8672f', '#ffb020'], ['Throughput', 71, '24 fps', '#6d5cf0', '#b3a6ff']];

export default function DashboardPage() {
  const { data, view, range, camera } = useApp();
  const b = useMemo(() => buckets(data, view, camera), [data, view, camera]);
  const labels = useMemo(() => bucketLabels(range, view.sp, b.length), [range, view, b.length]);

  const tot = view.cur.length, prev = view.prev.length;
  const pct = prev ? Math.round(((tot - prev) / prev) * 100) : 0;
  const alerts24 = data.incidents.filter((x) => x.ts >= data.now - D && view.inCam(x)).length;
  const openHigh = view.cur.filter((x) => x.status === 'open' && x.severity === 'high').length;
  const online = data.cameras.filter((c) => c.status === 'online').length;
  const comp = view.checksCur ? (1 - tot / view.checksCur) * 100 : 100;
  const resolved = tot ? (view.cur.filter((x) => x.status === 'resolved').length / tot) * 100 : 0;
  const reviewed = tot ? (view.cur.filter((x) => x.status !== 'open').length / tot) * 100 : 0;
  const ringPct = [comp, resolved, reviewed, (online / data.cameras.length) * 100];
  const hotspots = data.cameras.map((c) => ({ label: c.name, n: view.cur.filter((x) => x.camera === c.id).length })).sort((a, c) => c.n - a.n).slice(0, 6);

  return (
    <>
      <PageHeader title="Safety Overview" subtitle={`PPE compliance monitoring · ${RANGE_NAME[range]}`} demo={USE_DEMO} />

      <section className="grid g4">
        <StatTile label="Total cameras" value={data.cameras.length} foot={`${data.cameras.length} registered`} />
        <StatTile label="Active cameras" value={online} foot={`${data.cameras.filter((c) => c.status === 'idle').length} idle · ${data.cameras.filter((c) => c.status === 'offline').length} offline`} />
        <StatTile label="Alerts today" value={alerts24} foot={`${openHigh} high severity open`} led={openHigh ? 'bad' : 'ok'} />
        <StatTile label="Total detections" value={fmt(view.checksCur)} foot={`PPE checks · ${RANGE_NAME[range]}`} />
      </section>

      <section className="grid g-live"><LiveFeedCard /><AlertsCard /></section>

      <section className="grid g-trend">
        <div className="card">
          <div className="ch">
            <div>
              <h3>Safety performance trends</h3>
              <div className="sub">{range === '24h' ? 'Hourly' : 'Daily'} · {RANGE_NAME[range]} · {fmt(tot)} violations <Delta value={pct} goodWhenDown /></div>
            </div>
            <div className="legend">
              <span><i className="sw" style={{ background: 'var(--s1)' }} />Violations</span>
              <span><i className="sw" style={{ background: 'var(--s2)' }} />High severity</span>
              <span><i className="sw" style={{ background: 'var(--s3)' }} />Resolved</span>
            </div>
          </div>
          <LineChart labels={labels} series={[
            { name: 'Violations', color: '#3987e5', vals: b.map((o) => o.v), area: true },
            { name: 'High severity', color: '#e8672f', vals: b.map((o) => o.high) },
            { name: 'Resolved', color: '#1fb383', vals: b.map((o) => o.res) }
          ]} />
        </div>
        <div className="card">
          <div className="ch"><div><h3>Violation type breakdown</h3><div className="sub">Share by missing PPE</div></div></div>
          <DonutChart mid={fmt(tot)} midSub="violations"
            segments={PPE.map((p) => ({ label: p.short, n: view.cur.filter((x) => x.ppe === p.k).length, color: p.color }))} />
        </div>
      </section>

      <section className="grid g3">
        <div className="card">
          <div className="ch"><div><h3>Key compliance metrics</h3><div className="sub">{RANGE_NAME[range]}</div></div></div>
          <div className="rings">
            {COMPLIANCE_RINGS.map(([l, c1, c2], i) => (
              <div className="rg" key={l}><Ring pct={ringPct[i]} c1={c1} c2={c2} center={Math.round(ringPct[i]) + '%'} /><span>{l}</span></div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="ch"><div><h3>Hotspot zones</h3><div className="sub">Violations per camera</div></div></div>
          <RankedBars rows={hotspots} />
        </div>
        <div className="card">
          <div className="ch"><div><h3>System status</h3><div className="sub">Inference server · simulated</div></div></div>
          <div className="rings">
            {SYSTEM_RINGS.map(([l, p, s, c1, c2]) => (
              <div className="rg" key={l}><Ring pct={p} c1={c1} c2={c2} center={p + '%'} sub={s} /><span>{l}</span></div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
