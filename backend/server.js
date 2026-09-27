require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// ── Route imports ──────────────────────────────────────────────
const formRoutes = require('./routes/formRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const voiceRoutes = require('./routes/voiceRoutes');

// ── Connect to MongoDB ─────────────────────────────────────────
connectDB();

const app = express();

// ── Middleware ─────────────────────────────────────────────────
app.use(cors({
  origin: '*', // restrict in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// ── Serve uploaded images statically ──────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Serve frontend statically ──────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));

// ── API Routes ─────────────────────────────────────────────────
app.use('/api/forms', formRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/voice', voiceRoutes);

// ── Catch-all: serve index.html for non-API routes ────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── Global error handler ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ── Start server ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
