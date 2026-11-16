'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useClock } from '@/hooks/useClock';
import Scene from './Scene';

/* "Live analysis" panel. The picture is a simulated frame until the real detector (UC-07) is connected. */
export default function LiveFeedCard() {
  const { data } = useApp();
  const now = useClock();
  const [idx, setIdx] = useState(0);
  const cams = data.cameras.filter((c) => c.status !== 'offline');
  const cam = cams[idx % cams.length];
  return (
    <div className="card">
      <div className="ch">
        <div><h3>Live analysis — {cam.id}</h3><div className="sub">{cam.name} · {cam.zone}</div></div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="tabs">
            {cams.slice(0, 4).map((c, i) => (
              <button key={c.id} className={i === idx % cams.length ? 'on' : ''} onClick={() => setIdx(i)}>{c.id}</button>
            ))}
          </div>
          <span className="online"><i />Online</span>
        </div>
      </div>
      <div className="livewrap">
        <Scene index={idx} />
        <span className="chip live"><i />LIVE</span>
        <span className="chip time">{now ? now.toLocaleTimeString('en-US', { hour12: false }) : '--:--:--'}</span>
        <span className="chip cam">{cam.id} · YOLO + ByteTrack</span>
        <span className="chip fps">24 FPS · 41 ms</span>
      </div>
    </div>
  );
}
