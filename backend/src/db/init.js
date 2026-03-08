const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

async function initDb() {
    console.log('Initializing SQLite database...');
    const dbPath = path.join(__dirname, '../../salarysync.sqlite');

    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'hr',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS uploads (
      id TEXT PRIMARY KEY,
      file_name TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_size INTEGER NOT NULL DEFAULT 0,
      status TEXT DEFAULT 'processing',
      total_records INTEGER DEFAULT 0,
      total_tax REAL DEFAULT 0.00,
      total_net_pay REAL DEFAULT 0.00,
      uploaded_by TEXT,
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      upload_id TEXT NOT NULL,
      employee_id TEXT NOT NULL,
      name TEXT NOT NULL,
      base_salary REAL DEFAULT 0.00,
      tax_deduction REAL DEFAULT 0.00,
      net_pay REAL DEFAULT 0.00,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (upload_id) REFERENCES uploads(id) ON DELETE CASCADE
    );
  `);

    // Seed default admin
    const adminEmail = 'admin@salarysync.com';
    const existingAdmin = await db.get('SELECT id FROM users WHERE email = ?', [adminEmail]);

    if (!existingAdmin) {
        const passwordHash = await bcrypt.hash('password123', 10);
        await db.run(
            'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
            ['usr-admin-001', 'Sarah Jenkins', adminEmail, passwordHash, 'admin']
        );
        console.log('✅ Admin user seeded (admin@salarysync.com / password123)');
    }

    console.log('✅ SQLite database initialized successfully');
    await db.close();
}

initDb().catch(err => {
    console.error('Failed to initialize db:', err);
    process.exit(1);
});
