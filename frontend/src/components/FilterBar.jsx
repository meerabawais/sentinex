'use client';
import { useApp } from '@/context/AppContext';
import { RANGES } from '@/lib/constants';

export function RangeSwitch() {
  const { range, setRange } = useApp();
  return (
    <div className="seg" role="group" aria-label="Time range">
      {RANGES.map(([k, l]) => (
        <button key={k} className={range === k ? 'on' : ''} onClick={() => setRange(k)}>{l}</button>
      ))}
    </div>
  );
}

export function CameraSelect() {
  const { data, camera, setCamera } = useApp();
  return (
    <select className="select" aria-label="Camera" value={camera} onChange={(e) => setCamera(e.target.value)}>
      <option value="all">All cameras</option>
      {data.cameras.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
    </select>
  );
}

/* Page title + subtitle, with the range / camera filters on the right. */
export default function PageHeader({ title, subtitle, demo, showRange = true, showCamera = true }) {
  return (
    <div className="top">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}{demo && <span className="demo">DEMO DATA</span>}</p>
      </div>
      <div className="tools">
        {showRange && <RangeSwitch />}
        {showCamera && <CameraSelect />}
      </div>
    </div>
  );
}
