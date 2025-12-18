const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'lottery.db');
const db = new sqlite3.Database(dbPath);

// Initialize database schema
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Ticket packs table
  db.run(`
    CREATE TABLE IF NOT EXISTS ticket_packs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      pack_size INTEGER NOT NULL,
      qr_code TEXT UNIQUE NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      user_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Daily sales table
  db.run(`
    CREATE TABLE IF NOT EXISTS daily_sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_date DATE NOT NULL,
      start_ticket_number INTEGER NOT NULL,
      end_ticket_number INTEGER,
      tickets_sold INTEGER,
      total_revenue DECIMAL(10, 2),
      pack_id INTEGER,
      user_id INTEGER,
      status TEXT DEFAULT 'open',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      closed_at DATETIME,
      FOREIGN KEY (pack_id) REFERENCES ticket_packs(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Tickets table for individual tracking
  db.run(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_number INTEGER NOT NULL,
      qr_code TEXT UNIQUE NOT NULL,
      pack_id INTEGER,
      price DECIMAL(10, 2) DEFAULT 1.00,
      status TEXT DEFAULT 'available',
      sold_at DATETIME,
      FOREIGN KEY (pack_id) REFERENCES ticket_packs(id)
    )
  `);
});

module.exports = db;
