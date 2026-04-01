const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, password, state, district, language } = req.body;
    if (!name || !phone || !password) return res.status(400).json({ error: 'Name, phone, and password are required' });

    const db = getDB();
    const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
    if (existing) return res.status(409).json({ error: 'Phone number already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const result = db.prepare(
      'INSERT INTO users (name, phone, email, password, state, district, language) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(name, phone, email || null, hashed, state || null, district || null, language || 'en');

    const token = jwt.sign({ id: result.lastInsertRowid, name, phone }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, user: { id: result.lastInsertRowid, name, phone, email, state, district, language: language || 'en' } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ error: 'Phone and password required' });

    const db = getDB();
    const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Incorrect password' });

    const token = jwt.sign({ id: user.id, name: user.name, phone: user.phone }, process.env.JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  const db = getDB();
  const user = db.prepare('SELECT id, name, phone, email, state, district, language, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

// Update profile
router.put('/profile', authenticateToken, (req, res) => {
  const { state, district, language } = req.body;
  const db = getDB();
  db.prepare('UPDATE users SET state = ?, district = ?, language = ? WHERE id = ?').run(state, district, language, req.user.id);
  res.json({ success: true });
});

module.exports = router;
