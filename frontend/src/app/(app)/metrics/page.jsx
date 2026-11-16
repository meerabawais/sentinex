'use client';
import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { PPE, RANGE_NAME } from '@/lib/constants';
import { buckets, bucketLabels } from '@/lib/analytics';
import PageHeader from '@/components/FilterBar';
import DonutChart from '@/components/DonutChart';
import BarChart from '@/components/BarChart';
import LineChart from '@/components/LineChart';
import Heatmap from '@/components/Heatmap';

export default function MetricsPage() {
  const { data, view, range, camera } = useApp();
  const b = useMemo(() => buckets(data, view, camera), [data, view, camera]);
  const labels = useMemo(() => bucketLabels(range, view.sp, b.length), [range, view, b.length]);

  const tot = view.cur.length;
  const count = (k) => view.cur.filter((x) => x.status === k).length;
  const comp = view.checksCur ? (1 - tot / view.checksCur) * 100 : 100;

  const violations = PPE.map((p) => ({ label: p.label, val: view.cur.filter((x) => x.ppe === p.k).length, color: p.color }));
  const vTotal = violations.reduce((s, i) => s + i.val, 0) || 1;
  violations.forEach((i) => { i.pct = Math.round((i.val / vTotal) * 100); });

  let last = 100;
  const rate = b.map((o) => { if (o.c > 0) last = (1 - o.v / o.c) * 100; return +last.toFixed(2); });
  const lo = Math.floor(Math.min(...rate) - 1), hi = Math.min(100, Math.ceil(Math.max(...rate) + 0.5));

  const zoneCount = {};
  view.cur.forEach((x) => { const z = data.cameras.find((c) => c.id === x.camera).zone; zoneCount[z] = (zoneCount[z] || 0) + 1; });
  const zones = Object.entries(zoneCount).sort((a, c) => c[1] - a[1]);
  const zMax = zones.length ? zones[0][1] : 1, zTot = zones.reduce((s, z) => s + z[1], 0) || 1;
  const zoneItems = zones.slice(0, 6).map(([label, val]) => ({
    label, val, pct: Math.round((val / zTot) * 100),
    color: val > zMax * 0.66 ? '#ff5b5b' : val > zMax * 0.33 ? '#ffb020' : '#2fd27a'
  }));

  return (
    <>
      <PageHeader title="Metrics" subtitle={`Compliance analytics · ${RANGE_NAME[range]}`} />

      <section className="grid g-met">
        <div className="card">
          <div className="ch"><h3>Overall compliance</h3></div>
          <DonutChart mid={comp.toFixed(1) + '%'} midSub="compliance" segments={[
            { label: 'Resolved', n: count('resolved'), color: '#2fd27a' },
            { label: 'Reviewed', n: count('reviewed'), color: '#ffb020' },
            { label: 'Open', n: count('open'), color: '#ff5b5b' }
          ]} />
          <div className="chiprow">
            <span className="pill st-open">Open: {count('open')}</span>
            <span className="pill st-resolved">Resolved: {count('resolved')}</span>
            <span className="pill st-reviewed">Reviewed: {count('reviewed')}</span>
          </div>
        </div>
        <div className="card">
          <div className="ch"><div><h3>Most common violation</h3><div className="sub">Missing PPE, {RANGE_NAME[range]}</div></div></div>
          <BarChart items={violations} h={260} />
        </div>
      </section>

      <section className="grid g-met2">
        <div className="card">
          <div className="ch"><div><h3>Compliance rate</h3><div className="sub">% of PPE checks passed</div></div></div>
          <LineChart labels={labels} h={250} ml={46} min={lo} max={Math.max(hi, lo + 2)} yf={(x) => Math.round(x * 10) / 10 + '%'}
            series={[{ name: 'Compliance', color: '#e6edf9', vals: rate, area: true }]} />
        </div>
        <div className="card">
          <div className="ch"><div><h3>Zone comparison</h3><div className="sub">Violations by zone</div></div></div>
          <BarChart items={zoneItems} h={260} />
        </div>
      </section>

      <section className="grid">
        <div className="card">
          <div className="ch"><div><h3>When violations happen</h3><div className="sub">Weekday × hour of day</div></div></div>
          <Heatmap incidents={view.cur} />
        </div>
      </section>
    </>
  );
}
