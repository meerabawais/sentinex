/*
  Fills the database with demo data: users, cameras, ~60 days of incidents and PPE checks, and workers.
  Run with:  npm run db:seed   (safe to re-run — it replaces the demo data and refreshes the timestamps)
*/
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const H = 3600e3, D = 24 * H;
const PPE = ['helmet', 'vest', 'gloves', 'goggles', 'shoes'];

async function insertInChunks(model, rows, size = 1000) {
  for (let i = 0; i < rows.length; i += size) await model.createMany({ data: rows.slice(i, i + size) });
}

async function main() {
  const NOW = Date.now();
  let seed = 20261113;
  const R = () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pois = (l) => { const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= R(); } while (p > L); return k - 1; };

  const cameras = [
    { id: 'CAM-01', name: 'Main Gate',       zone: 'Entry',      status: 'online',  w: .8,  bias: { helmet: 1.2, vest: 1.4, gloves: .4, goggles: .3, shoes: 1 } },
    { id: 'CAM-02', name: 'Assembly Line A', zone: 'Production', status: 'online',  w: 1.2, bias: { helmet: 1, vest: .8, gloves: 1.4, goggles: 1, shoes: .8 } },
    { id: 'CAM-03', name: 'Assembly Line B', zone: 'Production', status: 'online',  w: 1,   bias: { helmet: 1, vest: .9, gloves: 1.3, goggles: 1, shoes: .9 } },
    { id: 'CAM-04', name: 'Welding Bay',     zone: 'Hot work',   status: 'online',  w: 1.1, bias: { helmet: .8, vest: .5, gloves: 1.4, goggles: 2.6, shoes: .9 } },
    { id: 'CAM-05', name: 'Loading Dock',    zone: 'Logistics',  status: 'online',  w: 1.3, bias: { helmet: 1.1, vest: 2.2, gloves: .7, goggles: .2, shoes: 1.4 } },
    { id: 'CAM-06', name: 'Scaffold East',   zone: 'Site',       status: 'idle',    w: 1.5, bias: { helmet: 2.6, vest: 1.1, gloves: .5, goggles: .2, shoes: 1 } },
    { id: 'CAM-07', name: 'Warehouse',       zone: 'Storage',    status: 'online',  w: .7,  bias: { helmet: .9, vest: 1.4, gloves: .6, goggles: .2, shoes: 1.6 } },
    { id: 'CAM-08', name: 'Chemical Store',  zone: 'Hazmat',     status: 'offline', w: .5,  bias: { helmet: .7, vest: .6, gloves: 2, goggles: 2.2, shoes: 1 } }
  ];
  const sevP = { helmet: [.62, .3], vest: [.25, .5], gloves: [.05, .3], goggles: [.3, .5], shoes: [.08, .32] };
  const base = { helmet: .32, vest: .26, gloves: .18, goggles: .14, shoes: .1 };

  const t0 = Math.floor(NOW / H) * H - (60 * 24 - 1) * H;
  const incidents = [], checks = [];
  for (let i = 0; i < 60 * 24; i++) {
    const t = t0 + i * H, d = new Date(t), hr = d.getHours(), dow = d.getDay();
    const shift = hr >= 6 && hr < 9 ? .9 : hr >= 9 && hr < 17 ? 1 : hr >= 17 && hr < 22 ? .55 : .06;
    const day = dow === 0 ? .3 : dow === 6 ? .6 : 1, trend = 1.3 - .45 * (i / (60 * 24));
    for (const c of cameras) {
      checks.push({ cameraId: c.id, hourStart: new Date(t), count: Math.round(shift * day * c.w * (22 + R() * 10)) });
      const n = pois(.5 * shift * day * c.w * trend);
      for (let j = 0; j < n; j++) {
        const ts = Math.min(t + R() * H, NOW - 1000);
        let tot = 0;
        const wts = PPE.map((k) => { const w = base[k] * c.bias[k]; tot += w; return w; });
        let x = R() * tot, ppe = PPE[0];
        for (let q = 0; q < PPE.length; q++) { if ((x -= wts[q]) <= 0) { ppe = PPE[q]; break; } }
        const sp = sevP[ppe], y = R(), severity = y < sp[0] ? 'high' : y < sp[0] + sp[1] ? 'medium' : 'low';
        const age = (NOW - ts) / D, z = R();
        const status = age < 1 ? (z < .7 ? 'open' : z < .9 ? 'reviewed' : 'resolved')
          : age < 3 ? (z < .25 ? 'open' : z < .6 ? 'reviewed' : 'resolved')
          : (z < .03 ? 'open' : z < .15 ? 'reviewed' : 'resolved');
        incidents.push({
          ts: new Date(ts), cameraId: c.id, ppe, severity, status,
          confidence: +(.52 + R() * .46).toFixed(2), trackId: 1 + Math.floor(R() * 420), source: 'clip_' + (1 + Math.floor(R() * 24)) + '.mp4'
        });
      }
    }
  }
  incidents.sort((a, b) => a.ts - b.ts).forEach((x, i) => { x.code = 'INC-' + (1000 + i); });

  const roles = [
    ['Welder', 'CAM-04', ['helmet', 'goggles', 'gloves', 'shoes']], ['Machine Operator', 'CAM-02', ['helmet', 'gloves', 'goggles', 'shoes']],
    ['Assembler', 'CAM-03', ['helmet', 'gloves', 'shoes']], ['Rigger', 'CAM-06', ['helmet', 'vest', 'gloves', 'shoes']],
    ['Forklift Driver', 'CAM-05', ['helmet', 'vest', 'shoes']], ['Loader', 'CAM-05', ['helmet', 'vest', 'gloves', 'shoes']],
    ['Warehouse Associate', 'CAM-07', ['helmet', 'vest', 'shoes']], ['Chemical Handler', 'CAM-08', ['helmet', 'goggles', 'gloves', 'shoes']],
    ['Security Guard', 'CAM-01', ['vest', 'shoes']], ['QC Inspector', 'CAM-02', ['helmet', 'goggles', 'shoes']]
  ];
  const names = ['Ali Raza', 'Usman Tariq', 'Bilal Ahmed', 'Hamza Sheikh', 'Ahmed Khan', 'Imran Hussain', 'Faisal Mehmood', 'Zain Abbas', 'Kamran Akbar', 'Saad Iqbal', 'Hassan Raza', 'Naveed Anjum',
    'Adeel Qureshi', 'Rizwan Haider', 'Shahid Mahmood', 'Tariq Aziz', 'Junaid Malik', 'Asif Javed', 'Farhan Siddiqui', 'Waqas Ahmad', 'Danish Butt', 'Salman Farooq', 'Noman Ali', 'Haris Rauf'];
  const st = [...Array(11).fill('compliant'), ...Array(4).fill('violation'), ...Array(3).fill('on_break'), ...Array(6).fill('off_shift')];
  for (let i = st.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [st[i], st[j]] = [st[j], st[i]]; }
  const workers = names.map((name, i) => {
    const r = roles[i % roles.length], status = st[i];
    const seen = NOW - (status === 'off_shift' ? (2 + R() * 7) * H : status === 'on_break' ? (8 + R() * 32) * 60000 : (0.3 + R() * 4) * 60000);
    return {
      id: 'W-' + (101 + i), name, jobRole: r[0], cameraId: r[1], requiredPpe: r[2], status,
      missingPpe: status === 'violation' ? r[2][Math.floor(R() * r[2].length)] : null, lastSeenAt: new Date(seen)
    };
  });

  console.log('Clearing old demo data…');
  await prisma.incident.deleteMany();
  await prisma.ppeCheck.deleteMany();
  await prisma.worker.deleteMany();
  await prisma.camera.deleteMany();

  console.log('Writing users, cameras, workers…');
  await prisma.user.upsert({
    where: { email: 'admin@sentinex.com' }, update: {},
    create: { email: 'admin@sentinex.com', name: 'Admin', passwordHash: await bcrypt.hash('admin123', 10), role: 'ADMIN', cardId: 'DEMO-CARD-001' }
  });
  await prisma.user.upsert({
    where: { email: 'viewer@sentinex.com' }, update: {},
    create: { email: 'viewer@sentinex.com', name: 'Viewer', passwordHash: await bcrypt.hash('viewer123', 10), role: 'VIEWER' }
  });
  await prisma.camera.createMany({ data: cameras.map(({ id, name, zone, status }) => ({ id, name, zone, status })) });
  await prisma.worker.createMany({ data: workers });

  console.log(`Writing ${checks.length} PPE-check rows…`);
  await insertInChunks(prisma.ppeCheck, checks, 2000);
  console.log(`Writing ${incidents.length} incidents…`);
  await insertInChunks(prisma.incident, incidents, 1000);

  console.log('\nDone. Sign in with:');
  console.log('  admin@sentinex.com  / admin123   (can resolve incidents)');
  console.log('  viewer@sentinex.com / viewer123  (read-only)');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
