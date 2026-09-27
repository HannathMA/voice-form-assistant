const path = require('path');
const dotenv = require('dotenv');

// Ensure environment variables are loaded from backend/.env or root .env
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
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
const distDir = path.join(__dirname, '../frontend/dist');
const publicDir = path.join(__dirname, '../public');
const staticDir = fs.existsSync(distDir) ? distDir : publicDir;
app.use(express.static(staticDir));

// ── API Routes ─────────────────────────────────────────────────
app.use('/api/forms', formRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/voice', voiceRoutes);

// ── Catch-all for non-API routes ──────────────────────────────
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: `API route not found: ${req.method} ${req.originalUrl}` });
  }
  const indexPath = path.join(staticDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(404).send('Not Found');
});

// ── Global error handler ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ── Start server (only when run directly, not when required by serverless lambda) ──
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
