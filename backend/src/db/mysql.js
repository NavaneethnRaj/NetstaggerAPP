const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'salarysync',
    password: process.env.DB_PASSWORD || 'salarysync_pass',
    database: process.env.DB_NAME || 'salarysync',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
});

// Test the connection
async function testConnection() {
    try {
        const conn = await pool.getConnection();
        console.log('✅ MySQL connected successfully');
        conn.release();
    } catch (err) {
        console.error('❌ MySQL connection failed:', err.message);
        // Retry after 3 seconds (MySQL container may still be starting)
        setTimeout(testConnection, 3000);
    }
}

testConnection();

module.exports = pool;
