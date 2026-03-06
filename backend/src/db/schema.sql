-- SalarySync Database Schema
CREATE DATABASE IF NOT EXISTS salarysync;
USE salarysync;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'hr', 'viewer') DEFAULT 'hr',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Uploads table
CREATE TABLE IF NOT EXISTS uploads (
  id VARCHAR(36) PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_size INT NOT NULL DEFAULT 0,
  status ENUM('processing', 'completed', 'error') DEFAULT 'processing',
  total_records INT DEFAULT 0,
  total_tax DECIMAL(15, 2) DEFAULT 0.00,
  total_net_pay DECIMAL(15, 2) DEFAULT 0.00,
  uploaded_by VARCHAR(36),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Employee records table (parsed from uploaded files)
CREATE TABLE IF NOT EXISTS employees (
  id VARCHAR(36) PRIMARY KEY,
  upload_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  base_salary DECIMAL(15, 2) DEFAULT 0.00,
  tax_deduction DECIMAL(15, 2) DEFAULT 0.00,
  net_pay DECIMAL(15, 2) DEFAULT 0.00,
  status ENUM('success', 'error', 'pending') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (upload_id) REFERENCES uploads(id) ON DELETE CASCADE
);

-- Seed default admin user (password: password123)
INSERT IGNORE INTO users (id, name, email, password_hash, role) VALUES (
  'usr-admin-001',
  'Sarah Jenkins',
  'admin@salarysync.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'admin'
);
