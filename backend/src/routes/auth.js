const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const asyncHandler = require('../lib/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const { userOut } = require('../lib/mappers');

const router = express.Router();
const sign = (user) => jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '12h' });

/* POST /api/auth/login  { email, password } */
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  const user = await prisma.user.findUnique({ where: { email: String(email).trim().toLowerCase() } });
  const ok = user && (await bcrypt.compare(String(password), user.passwordHash));
  if (!ok) return res.status(401).json({ error: 'Wrong email or password' });
  res.json({ token: sign(user), user: userOut(user) });
}));

/* POST /api/auth/card  { cardId }  — "Scan login card" */
router.post('/card', asyncHandler(async (req, res) => {
  const { cardId } = req.body || {};
  const user = cardId ? await prisma.user.findUnique({ where: { cardId: String(cardId) } }) : null;
  if (!user) return res.status(401).json({ error: 'Login card not recognised' });
  res.json({ token: sign(user), user: userOut(user) });
}));

/* GET /api/auth/me */
router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(401).json({ error: 'Account no longer exists' });
  res.json({ user: userOut(user) });
}));

module.exports = router;
