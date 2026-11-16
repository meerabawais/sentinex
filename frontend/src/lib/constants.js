export const H = 3600e3;
export const D = 24 * H;

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export const USE_DEMO = process.env.NEXT_PUBLIC_USE_DEMO === 'true';

/* Missing-PPE types. `color` is used by charts, `v` is the matching CSS variable for HTML elements. */
export const PPE = [
  { k: 'helmet',  label: 'No Helmet',       short: 'Helmet', v: '--s1', color: '#3987e5' },
  { k: 'vest',    label: 'No Vest',         short: 'Vest',   v: '--s2', color: '#e8672f' },
  { k: 'gloves',  label: 'No Gloves',       short: 'Gloves', v: '--s3', color: '#1fb383' },
  { k: 'goggles', label: 'No Goggles',      short: 'Goggles',v: '--s4', color: '#e0a100' },
  { k: 'shoes',   label: 'No Safety Shoes', short: 'Shoes',  v: '--s5', color: '#e0568a' }
];
export const ppeBy = (k) => PPE.find((p) => p.k === k);

export const UNIT = { '24h': [24, H], '7d': [7, D], '30d': [30, D] };
export const RANGE_NAME = { '24h': 'last 24 hours', '7d': 'last 7 days', '30d': 'last 30 days' };
export const RANGES = [['24h', '24 h'], ['7d', '7 days'], ['30d', '30 days']];

export const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dash' },
  { href: '/incidents', label: 'Incidents', icon: 'inc' },
  { href: '/workers',   label: 'Workers',   icon: 'users' },
  { href: '/metrics',   label: 'Metrics',   icon: 'met' },
  { href: '/cameras',   label: 'Cameras',   icon: 'cam' },
  { href: null,         label: 'Video Analysis', icon: 'vid', tag: 'Soon' }
];
export const TITLES = {
  '/dashboard': 'Safety Dashboard', '/incidents': 'Incidents', '/workers': 'Workers',
  '/metrics': 'Metrics', '/cameras': 'Cameras'
};

export const WORKER_STATUS = { compliant: 'Compliant', violation: 'Violation', break: 'On break', off: 'Off shift' };
export const WORKER_FILTERS = [
  ['all', 'All'], ['onsite', 'On site'], ['compliant', 'Compliant'],
  ['violation', 'Violation'], ['break', 'On break'], ['off', 'Off shift']
];
export const INCIDENT_FILTERS = ['all', 'open', 'reviewed', 'resolved'];
