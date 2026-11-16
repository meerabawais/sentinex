const express = require('express');
const prisma = require('../db');
const asyncHandler = require('../lib/asyncHandler');
const { requireAuth, requireRole } = require('../middleware/auth');
const { incidentOut, cameraOut, checkOut, workerOut } = require('../lib/mappers');

const router = express.Router();
router.use(requireAuth);

const DAYS_LOADED = 60; // the dashboard compares the selected range with the previous one (up to 30 + 30 days)
const since = () => new Date(Date.now() - DAYS_LOADED * 24 * 3600e3);

/* GET /api/bootstrap — everything the dashboard needs in one request */
router.get('/bootstrap', asyncHandler(async (req, res) => {
  const from = since();
  const [cameras, incidents, checks, workers] = await Promise.all([
    prisma.camera.findMany({ orderBy: { id: 'asc' } }),
    prisma.incident.findMany({ where: { ts: { gte: from } }, orderBy: { ts: 'asc' } }),
    prisma.ppeCheck.findMany({ where: { hourStart: { gte: from } }, orderBy: { hourStart: 'asc' } }),
    prisma.worker.findMany({ orderBy: { id: 'asc' } })
  ]);
  res.json({
    now: Date.now(),
    cameras: cameras.map(cameraOut),
    incidents: incidents.map(incidentOut),
    checks: checks.map(checkOut),
    workers: workers.map(workerOut)
  });
}));

router.get('/cameras', asyncHandler(async (req, res) => {
  res.json((await prisma.camera.findMany({ orderBy: { id: 'asc' } })).map(cameraOut));
}));

router.get('/workers', asyncHandler(async (req, res) => {
  res.json((await prisma.worker.findMany({ orderBy: { id: 'asc' } })).map(workerOut));
}));

/* GET /api/incidents?from=ISO&to=ISO&camera=CAM-01&status=open&severity=high&limit=100 */
router.get('/incidents', asyncHandler(async (req, res) => {
  const { from, to, camera, status, severity } = req.query;
  const limit = Math.min(parseInt(req.query.limit, 10) || 200, 2000);
  const where = {};
  if (from || to) where.ts = { ...(from && { gte: new Date(from) }), ...(to && { lte: new Date(to) }) };
  if (camera) where.cameraId = String(camera);
  if (status) where.status = String(status);
  if (severity) where.severity = String(severity);
  const rows = await prisma.incident.findMany({ where, orderBy: { ts: 'desc' }, take: limit });
  res.json(rows.map(incidentOut));
}));

/* PATCH /api/incidents/:code  { status }  — admins and supervisors only */
router.patch('/incidents/:code', requireRole('ADMIN', 'SUPERVISOR'), asyncHandler(async (req, res) => {
  const { status } = req.body || {};
  if (!['open', 'reviewed', 'resolved'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  try {
    const row = await prisma.incident.update({ where: { code: req.params.code }, data: { status } });
    res.json(incidentOut(row));
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Incident not found' });
    throw e;
  }
}));

module.exports = router;
