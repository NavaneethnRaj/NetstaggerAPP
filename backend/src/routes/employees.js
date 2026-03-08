const express = require('express');
const pool = require('../db/mysql');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/uploads/:id/summary — summary stats for an upload
router.get('/:id/summary', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const [uploadRows] = await pool.query('SELECT id FROM uploads WHERE id = ? AND uploaded_by = ?', [id, req.user.id]);
        if (uploadRows.length === 0) return res.status(404).json({ error: 'Upload not found or access denied' });

        const [rows] = await pool.query(
            `SELECT COUNT(*) as totalRecords, SUM(ctc) as totalNetPayout, SUM(basic_pay * 0.2) as totalTax 
             FROM employees WHERE upload_id = ?`,
            [id]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error('Summary fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch summary data' });
    }
});

// GET /api/uploads/:id/employees — employee records for a specific upload
router.get('/:id/employees', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : null;

    try {
        // Check upload exists and belongs to the user
        const [uploadRows] = await pool.query('SELECT id FROM uploads WHERE id = ? AND uploaded_by = ?', [id, req.user.id]);
        if (uploadRows.length === 0) {
            return res.status(404).json({ error: 'Upload not found or access denied' });
        }

        let dataQuery, countQuery, queryParams;

        if (search) {
            dataQuery = `SELECT * FROM employees WHERE upload_id = ? AND (name LIKE ? OR employee_id LIKE ?) ORDER BY name LIMIT ? OFFSET ?`;
            countQuery = `SELECT COUNT(*) as total FROM employees WHERE upload_id = ? AND (name LIKE ? OR employee_id LIKE ?)`;
            queryParams = [id, search, search];
        } else {
            dataQuery = `SELECT * FROM employees WHERE upload_id = ? ORDER BY name LIMIT ? OFFSET ?`;
            countQuery = `SELECT COUNT(*) as total FROM employees WHERE upload_id = ?`;
            queryParams = [id];
        }

        const [rows] = await pool.query(dataQuery, [...queryParams, limit, offset]);
        const [[{ total }]] = await pool.query(countQuery, queryParams);

        res.json({
            data: rows,
            pagination: { page, limit, total: parseInt(total), totalPages: Math.ceil(total / limit) },
        });
    } catch (err) {
        console.error('Employee fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch employee records' });
    }
});

module.exports = router;
