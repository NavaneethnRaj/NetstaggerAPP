const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const pool = require('../db/mysql');
const authMiddleware = require('../middleware/auth');
const processingQueue = require('../services/processingQueue');

const router = express.Router();

// Multer disk storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    fileFilter: (req, file, cb) => {
        const allowed = ['.xlsx', '.xls', '.csv'];
        if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
            cb(null, true);
        } else {
            cb(new Error('Only .xlsx, .xls, and .csv files are allowed'));
        }
    },
});

// Parse uploaded Excel/CSV and insert employee rows
// Logic moved to src/services/processingQueue.js for background processing
// POST /api/uploads — upload a file
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadId = uuidv4();

    try {
        await pool.query(
            'INSERT INTO uploads (id, file_name, original_name, file_size, status, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)',
            [uploadId, req.file.filename, req.file.originalname, req.file.size, 'processing', req.user.id]
        );

        // Process asynchronously using Background Queue
        processingQueue.addJob({
            uploadId: uploadId,
            filePath: req.file.path,
            originalName: req.file.originalname,
            userId: req.user.id
        });

        const [rows] = await pool.query('SELECT * FROM uploads WHERE id = ?', [uploadId]);
        res.status(202).json(rows[0]);
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// GET /api/uploads — list uploads (paginated)
router.get('/', authMiddleware, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const [rows] = await pool.query(
            `SELECT u.*, us.name as uploader_name 
       FROM uploads u 
       LEFT JOIN users us ON u.uploaded_by = us.id
       WHERE u.uploaded_by = ?
       ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
            [req.user.id, limit, offset]
        );
        const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM uploads WHERE uploaded_by = ?', [req.user.id]);

        res.json({
            data: rows,
            pagination: { page, limit, total: parseInt(total), totalPages: Math.ceil(total / limit) },
        });
    } catch (err) {
        console.error('List uploads error:', err);
        res.status(500).json({ error: 'Failed to fetch uploads' });
    }
});

// GET /api/uploads/:id — single upload details
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT u.*, us.name as uploader_name 
       FROM uploads u 
       LEFT JOIN users us ON u.uploaded_by = us.id
       WHERE u.id = ? AND u.uploaded_by = ?`,
            [req.params.id, req.user.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Upload not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch upload' });
    }
});

module.exports = router;
