const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDB } = require('./database/db');
const authRoutes = require('./routes/auth');
const cropRoutes = require('./routes/crop');
const diseaseRoutes = require('./routes/disease');
const chatRoutes = require('./routes/chat');
const weatherRoutes = require('./routes/weather');
const pestRoutes = require('./routes/pest');
const marketRoutes = require('./routes/market');
const fertilizerRoutes = require('./routes/fertilizer');

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
    console.error('❌ Missing JWT_SECRET in environment. Set JWT_SECRET before starting.');
    process.exit(1);
}

// Middleware
const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:4173'].filter(Boolean);
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Init DB
initDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/crop', cropRoutes);
app.use('/api/disease', diseaseRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/pest', pestRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/fertilizer', fertilizerRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'AgroGuardian API Running', version: '1.0.0' }));

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    if (err.message && err.message.includes('Not allowed by CORS')) {
        return res.status(403).json({ error: err.message });
    }
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🌱 AgroGuardian Backend running on http://localhost:${PORT}`);
    });
}

module.exports = app;