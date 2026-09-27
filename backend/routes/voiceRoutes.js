const express = require('express');
const router = express.Router();
const { audioUpload } = require('../middleware/uploadMiddleware');
const {
  handleTextToSpeech,
  handleSpeechToText,
} = require('../controllers/voiceController');

// POST /api/voice/text-to-speech   — body: { text, language }
router.post('/text-to-speech', handleTextToSpeech);

// POST /api/voice/speech-to-text   — multipart audio file
router.post('/speech-to-text', audioUpload.single('audio'), handleSpeechToText);

module.exports = router;
