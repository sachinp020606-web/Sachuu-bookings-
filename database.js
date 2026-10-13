/* SQLite database + schema + seed data */
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'bookings.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT NOT NULL,
    email     TEXT UNIQUE NOT NULL,
    password  TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS movies (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    title    TEXT NOT NULL,
    rating   REAL DEFAULT 0,
    language TEXT,
    genre    TEXT
  );

  CREATE TABLE IF NOT EXISTS trailers (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    title     TEXT NOT NULL,
    youtubeId TEXT NOT NULL,
    meta      TEXT
  );

  CREATE TABLE IF NOT EXISTS offers (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    description TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER,
    movie      TEXT NOT NULL,
    seats      TEXT NOT NULL,
    total      INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    message    TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

/* ---------- Seed data (only if tables are empty) ---------- */
const seed = () => {
  if (db.prepare('SELECT COUNT(*) AS c FROM movies').get().c === 0) {
    const ins = db.prepare('INSERT INTO movies (title, rating, language, genre) VALUES (?, ?, ?, ?)');
    [
      ['Good Bad Ugly', 9.4, 'Tamil', 'Action | Thriller'],
      ['Leo',           9.2, 'Tamil', 'Action | Drama'],
      ['Coolie',        9.5, 'Tamil', 'Mass Entertainer'],
      ['Jailer 2',      9.3, 'Tamil', 'Action']
    ].forEach(r => ins.run(...r));
  }

  if (db.prepare('SELECT COUNT(*) AS c FROM trailers').get().c === 0) {
    const ins = db.prepare('INSERT INTO trailers (title, youtubeId, meta) VALUES (?, ?, ?)');
    [
      ['🎬 Good Bad Ugly', 'jl-sgSDwJHs', '⭐ Action | Thriller | Tamil'],
      ['🦁 Leo',           'Po3jStA673E', '⭐ Action | Drama | Tamil'],
      ['🔥 Coolie',        'EptnMYijPjc', '⭐ Mass Entertainer | Tamil']
    ].forEach(r => ins.run(...r));
  }

  if (db.prepare('SELECT COUNT(*) AS c FROM offers').get().c === 0) {
    const ins = db.prepare('INSERT INTO offers (title, description) VALUES (?, ?)');
    [
      ['🍿 Combo Offer',  'Buy 2 Movie Tickets & Get Popcorn + Pepsi FREE'],
      ['💳 Bank Offer',   'Get Flat 20% OFF Using SBI / HDFC Cards'],
      ['🎉 Student Offer','Students Get 15% Discount With Valid College ID']
    ].forEach(r => ins.run(...r));
  }
};
seed();

module.exports = db;