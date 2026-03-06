CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS uploads (
    id VARCHAR(36) PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size INT NOT NULL,
    status VARCHAR(50) DEFAULT 'processing',
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(36) PRIMARY KEY,
    upload_id VARCHAR(36) NOT NULL,
    employee_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    basic_pay DECIMAL(10, 2) DEFAULT 0,
    variable_pay DECIMAL(10, 2) DEFAULT 0,
    allowance DECIMAL(10, 2) DEFAULT 0,
    bonus DECIMAL(10, 2) DEFAULT 0,
    ctc DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    FOREIGN KEY (upload_id) REFERENCES uploads(id) ON DELETE CASCADE
);

-- Seed user specific to Interview Task Requirements
-- Password is 'password123' hashed with bcrypt (salt rounds: 12)
INSERT IGNORE INTO users (name, email, password_hash, role)
VALUES ('Interview Evaluator', 'lusaibnetstager@gmail.com', '$2a$12$Kj.zH7Qv0T.Q3l1iG6QO7e9k.hM1y5H3wV/K3p5u8b1k.oF1L6D8C', 'admin');
