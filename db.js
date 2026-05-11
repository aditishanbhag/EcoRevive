// ============================================
// db.js — MySQL Connection Pool
// ============================================

const mysql = require('mysql2/promise');

// 👇 Change these to match your MySQL setup
const pool = mysql.createPool({
  host:     'localhost',   // e.g. 'localhost' or your server IP
  user:     'root',        // your MySQL username
  password: '@Aamds0401',            // your MySQL password
  database: 'ecorevive',  // the database name (we'll create it below)
  waitForConnections: true,
  connectionLimit:   10,
});

module.exports = pool;

/*
  ── HOW TO SET UP THE DATABASE ──────────────────────────────
  Run these SQL commands in MySQL Workbench or the terminal:

  CREATE DATABASE IF NOT EXISTS ecorevive;
  USE ecorevive;

  CREATE TABLE IF NOT EXISTS users (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    first_name   VARCHAR(100)        NOT NULL,
    last_name    VARCHAR(100)        NOT NULL,
    email        VARCHAR(255) UNIQUE NOT NULL,
    password     VARCHAR(255)        NOT NULL,   -- stored as bcrypt hash
    eco_points   INT DEFAULT 100,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ─────────────────────────────────────────────────────────────
*/
