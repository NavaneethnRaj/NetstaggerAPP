const express = require('express');
const pool = require('../db/mysql');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/employees — all employee records for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || '';
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
        const searchPattern = `%${search}%`;

        // Step 2: Query employees
        let query = `
            SELECT e.* 
            FROM employees e
            WHERE e.upload_id IN (?)
        `;
        let countQuery = `
            SELECT COUNT(*) as total 
            FROM employees e
            WHERE e.upload_id IN (?)
        `;

        const params = [uploadIds];
        const countParams = [uploadIds];

        if (search) {
            const searchFilter = ` AND (e.name LIKE ? OR e.employee_id LIKE ?)`;
            query += searchFilter;
            countQuery += searchFilter;
            params.push(searchPattern, searchPattern);
            countParams.push(searchPattern, searchPattern);
        }

        query += ` ORDER BY e.upload_id, e.employee_id ASC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const [rows] = await pool.query(query, params);
        const [[{ total }]] = await pool.query(countQuery, countParams);

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
