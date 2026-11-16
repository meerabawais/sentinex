import { UNIT, H, PPE } from './constants';

/* Everything the pages need for the selected range + camera, computed from the raw data. */
export function computeView(data, range, camera) {
  const [n, u] = UNIT[range];
  const end = data.now;
  const sp = { n, u, end, start: end - n * u, pstart: end - 2 * n * u };
  const inCam = (x) => camera === 'all' || x.camera === camera;
  const cur = data.incidents.filter((x) => x.ts >= sp.start && inCam(x));
  const prev = data.incidents.filter((x) => x.ts >= sp.pstart && x.ts < sp.start && inCam(x));
  const checks = (a, b) => data.checks.filter((c) => c.t + H > a && c.t < b && inCam(c)).reduce((s, c) => s + c.n, 0);
  return { sp, cur, prev, inCam, checksCur: checks(sp.start, end), checksPrev: checks(sp.pstart, sp.start) };
}

/* One bucket per hour (24h range) or per day (7d / 30d). */
export function buckets(data, view, camera) {
  const { sp, cur, inCam } = view;
  const b = Array.from({ length: sp.n }, () => ({ v: 0, high: 0, res: 0, c: 0, ppe: Object.fromEntries(PPE.map((p) => [p.k, 0])) }));
  const ix = (t) => Math.max(0, Math.min(sp.n - 1, Math.floor((t - sp.start) / sp.u)));
  cur.forEach((x) => {
    const o = b[ix(x.ts)];
    o.v++; o.ppe[x.ppe]++;
    if (x.severity === 'high') o.high++;
    if (x.status === 'resolved') o.res++;
  });
  data.checks.forEach((c) => {
    if (c.t + H > sp.start && c.t < sp.end && inCam(c)) b[ix(c.t + H / 2)].c += c.n;
  });
  return b;
}

export function bucketLabel(range, sp, i, long) {
  const t = sp.start + i * sp.u;
  if (range === '24h') return String(new Date(t).getHours()).padStart(2, '0') + ':00';
  return new Date(t).toLocaleDateString('en-US', long ? { weekday: 'short', month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric' });
}
export const bucketLabels = (range, sp, n) =>
  Array.from({ length: n }, (_, i) => ({ short: bucketLabel(range, sp, i), long: bucketLabel(range, sp, i, true) }));

/* weekday (Mon..Sun) x hour-of-day grid of violation counts */
export function heatGrid(incidents) {
  const g = Array.from({ length: 7 }, () => Array(24).fill(0));
  incidents.forEach((x) => { const d = new Date(x.ts); g[(d.getDay() + 6) % 7][d.getHours()]++; });
  return g;
}
