const express = require('express');
const pool = require('../db/mysql');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/employees — all employee records for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; // default to 50
    const offset = (page - 1) * limit;

    try {
        // Step 1: Get all upload IDs for the user
        const [uploadRows] = await pool.query('SELECT id FROM uploads WHERE uploaded_by = ?', [req.user.id]);

        if (uploadRows.length === 0) {
            return res.json({
                data: [],
                pagination: { page, limit, total: 0, totalPages: 0 },
            });
        }

        const uploadIds = uploadRows.map(row => row.id);

        // Step 2: Query employees using the composite index on (upload_id, employee_id)
        const query = `
            SELECT e.* 
            FROM employees e
            WHERE e.upload_id IN (?)
            ORDER BY e.upload_id, e.employee_id ASC
            LIMIT ? OFFSET ?
        `;

        const countQuery = `
            SELECT COUNT(*) as total 
            FROM employees e
            WHERE e.upload_id IN (?)
        `;

        const [rows] = await pool.query(query, [uploadIds, limit, offset]);
        const [[{ total }]] = await pool.query(countQuery, [uploadIds]);

        res.json({
            data: rows,
            pagination: { page, limit, total: parseInt(total), totalPages: Math.ceil(total / limit) },
        });
    } catch (err) {
        console.error('Global employee fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch employee records' });
    }
});

module.exports = router;
