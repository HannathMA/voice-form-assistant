const express = require('express');
const router = express.Router();
const {
  createSession,
  updateSession,
  getSession,
} = require('../controllers/sessionController');

// POST /api/sessions        — create a new session
router.post('/', createSession);

// PUT  /api/sessions/:id    — update answers + currentField
router.put('/:id', updateSession);

// GET  /api/sessions/:id    — resume / fetch session
router.get('/:id', getSession);

module.exports = router;
