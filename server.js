/* =========================================================
   Sachuu 💞 Bookings — Express backend
   Serves /public statically + JSON API on /api/*
========================================================= */
const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------- Static frontend ---------- */
app.use(express.static(path.join(__dirname, 'public')));

/* ---------- Helpers ---------- */
const hash = (pwd) => crypto.createHash('sha256').update(pwd).digest('hex');

/* =========================================================
   READ ENDPOINTS
========================================================= */
app.get('/api/movies', (_req, res) => {
  res.json(db.prepare('SELECT * FROM movies').all());
});

app.get('/api/trailers', (_req, res) => {
  res.json(db.prepare('SELECT * FROM trailers').all());
});

app.get('/api/offers', (_req, res) => {
  res.json(db.prepare('SELECT * FROM offers').all());
});

/* =========================================================
   AUTH
========================================================= */
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields are required' });

  try {
    const info = db.prepare(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)'
    ).run(name, email, hash(password));
    res.status(201).json({ id: info.lastInsertRowid, name, email });
  } catch (err) {
    if (String(err.message).includes('UNIQUE'))
      return res.status(409).json({ error: 'Email already registered' });
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?')
                 .get(email, hash(password));

  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  res.json({
    token: crypto.randomBytes(24).toString('hex'),
    user: { id: user.id, name: user.name, email: user.email }
  });
});

/* =========================================================
   BOOKINGS
========================================================= */
app.post('/api/bookings', (req, res) => {
  const { movie, seats, total, userId = null } = req.body || {};
  if (!movie || !Array.isArray(seats) || seats.length === 0)
    return res.status(400).json({ error: 'Movie and seats are required' });

  const info = db.prepare(
    'INSERT INTO bookings (user_id, movie, seats, total) VALUES (?, ?, ?, ?)'
  ).run(userId, movie, seats.join(','), total || 0);

  res.status(201).json({
    id: 'SACH-' + String(info.lastInsertRowid).padStart(5, '0'),
    movie,
    seats,
    total
  });
});

app.get('/api/bookings', (_req, res) => {
  res.json(db.prepare('SELECT * FROM bookings ORDER BY id DESC').all());
});

/* =========================================================
   CONTACT
========================================================= */
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message)
    return res.status(400).json({ error: 'All fields are required' });

  const info = db.prepare(
    'INSERT INTO messages (name, email, message) VALUES (?, ?, ?)'
  ).run(name, email, message);

  res.status(201).json({ id: info.lastInsertRowid, message: 'Message received' });
});

/* =========================================================
   SPA fallback — send index.html for unknown non-API routes
========================================================= */
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ---------- Start ---------- */
app.listen(PORT, () => {
  console.log(`🎬 Sachuu 💞 Bookings running → http://localhost:${PORT}`);
});