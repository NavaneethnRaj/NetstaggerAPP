require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const uploadsRoutes = require('./routes/uploads');
const employeesRoutes = require('./routes/employees');
const globalEmployeesRoutes = require('./routes/globalEmployees');
const socketService = require('./services/socketService');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize WebSockets
socketService.init(server);

// Middlewares
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));



// Serve uploaded files (for download)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/uploads', employeesRoutes);
app.use('/api/employees', globalEmployeesRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

server.listen(PORT, () => {
    console.log(`🚀 SalarySync backend running on port ${PORT}`);
});
