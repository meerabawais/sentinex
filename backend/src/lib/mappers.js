/* Database rows -> the JSON shape the frontend uses. */
const WORKER_STATUS_OUT = { compliant: 'compliant', violation: 'violation', on_break: 'break', off_shift: 'off' };

const incidentOut = (i) => ({
  id: i.code, ts: i.ts.getTime(), camera: i.cameraId, ppe: i.ppe, severity: i.severity,
  status: i.status, conf: i.confidence, track: i.trackId, source: i.source
});
const cameraOut = (c) => ({ id: c.id, name: c.name, zone: c.zone, status: c.status });
const checkOut = (c) => ({ t: c.hourStart.getTime(), camera: c.cameraId, n: c.count });
const workerOut = (w) => ({
  id: w.id, name: w.name, role: w.jobRole, camera: w.cameraId, required: w.requiredPpe,
  status: WORKER_STATUS_OUT[w.status], seen: w.lastSeenAt.getTime(), missing: w.missingPpe
});
const userOut = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role });

module.exports = { incidentOut, cameraOut, checkOut, workerOut, userOut };
