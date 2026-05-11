-- =============================================
-- EcoRevive — MySQL Database Setup Script
-- Run this file in MySQL Workbench or terminal
-- =============================================

-- 1. Create the database
CREATE DATABASE IF NOT EXISTS ecorevive;
USE ecorevive;

-- 2. Create the users table
CREATE TABLE IF NOT EXISTS users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  first_name   VARCHAR(100)        NOT NULL,
  last_name    VARCHAR(100)        NOT NULL,
  email        VARCHAR(255) UNIQUE NOT NULL,
  password     VARCHAR(255)        NOT NULL,      -- stored as bcrypt hash
  eco_points   INT DEFAULT 100,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Verify it was created
DESCRIBE users;

-- =============================================
-- (Optional) View all registered users
-- SELECT id, first_name, last_name, email, eco_points, created_at FROM users;
-- =============================================
