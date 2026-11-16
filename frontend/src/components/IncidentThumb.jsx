import { ppeBy } from '@/lib/constants';
import { clockStr } from '@/lib/utils';

const BOX = { helmet: [138, 36, 44, 34], vest: [126, 92, 68, 54], gloves: [100, 118, 24, 18], goggles: [142, 52, 36, 14], shoes: [126, 148, 68, 18] };

/* Mock detection frame for one incident (box position depends on the missing PPE). */
export default function IncidentThumb({ incident: x }) {
  const p = ppeBy(x.ppe), b = BOX[x.ppe];
  const lw = p.label.length * 6 + 36, ly = b[1] - 19 < 2 ? b[1] + b[3] + 2 : b[1] - 19;
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id="thumbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a2233" /><stop offset="1" stopColor="#0b1018" /></linearGradient></defs>
      <rect width="320" height="180" fill="url(#thumbg)" />
      <path d="M0 150h320M0 118h320" stroke="#ffffff10" />
      <g fill="#3a4559"><circle cx="160" cy="53" r="17" /><path d="M122 166c0-36 14-62 38-62s38 26 38 62Z" /><circle cx="112" cy="127" r="8" /><circle cx="208" cy="127" r="8" /></g>
      <rect x={b[0]} y={b[1]} width={b[2]} height={b[3]} rx="4" fill="none" stroke="#ff5b5b" strokeWidth="2" />
      <rect x={b[0]} y={ly} width={lw} height="17" rx="4" fill="#ff5b5b" />
      <text x={b[0] + 6} y={ly + 12} fill="#fff" fontSize="10" fontWeight="700" fontFamily="system-ui">{p.label} {x.conf.toFixed(2)}</text>
      <text x="10" y="174" fill="#ffffff80" fontSize="9" fontFamily="ui-monospace,monospace">{x.camera} · {clockStr(x.ts)} · track #{x.track}</text>
      <circle cx="302" cy="16" r="4" fill="#ff5b5b" />
      <text x="270" y="19.5" fill="#ffffffa0" fontSize="9" fontFamily="ui-monospace,monospace">REC</text>
    </svg>
  );
}
