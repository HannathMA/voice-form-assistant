const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/uploadMiddleware');
const {
  uploadAndDetect,
  getFormById,
  getConfig,
  saveConfig,
  generateFormImageHandler,
  getFormTemplatesHandler,
  generateFilledFormImageHandler,
} = require('../controllers/formController');

// GET  /api/forms/config/status — check API key status
router.get('/config/status', getConfig);

// POST /api/forms/config/save   — save API key
router.post('/config/save', saveConfig);

// GET  /api/forms/templates     — list built-in form templates
router.get('/templates', getFormTemplatesHandler);

// POST /api/forms/generate-image — generate a form image with OpenAI gpt-image-1-mini
router.post('/generate-image', generateFormImageHandler);

// POST /api/forms/generate-filled-form — generate filled form image with user answers
router.post('/generate-filled-form', generateFilledFormImageHandler);

// POST /api/forms/upload  — upload image + run Gemini detection
router.post('/upload', upload.single('formImage'), uploadAndDetect);

// GET  /api/forms/:id     — retrieve a saved form
router.get('/:id', getFormById);

module.exports = router;
