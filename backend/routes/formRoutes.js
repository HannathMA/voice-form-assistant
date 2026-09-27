const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/uploadMiddleware');
const {
  uploadAndDetect,
  getFormById,
  getConfig,
  saveConfig,
} = require('../controllers/formController');

// GET  /api/forms/config/status — check API key status
router.get('/config/status', getConfig);

// POST /api/forms/config/save   — save API key
router.post('/config/save', saveConfig);

// POST /api/forms/upload  — upload image + run Gemini detection
router.post('/upload', upload.single('formImage'), uploadAndDetect);

// GET  /api/forms/:id     — retrieve a saved form
router.get('/:id', getFormById);

module.exports = router;
