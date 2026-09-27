const { textToSpeech, speechToText } = require('../services/sarvamService');

function isSarvamKeyConfigured() {
  const key = process.env.SARVAM_API_KEY;
  return Boolean(key && !key.includes('your_') && key.trim().length > 15);
}

/**
 * POST /api/voice/text-to-speech
 * Body: { text: string, language: string }
 * Returns: audio/wav binary
 */
const handleTextToSpeech = async (req, res) => {
  try {
    const { text, language } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'text is required.' });
    }

    if (!isSarvamKeyConfigured()) {
      return res.status(503).json({
        success: false,
        useBrowserTTS: true,
        message: 'SARVAM_API_KEY not configured. Using browser speech synthesis.',
      });
    }

    const audioBuffer = await textToSpeech(text, language || 'en');

    res.set({
      'Content-Type': 'audio/wav',
      'Content-Length': audioBuffer.length,
    });
    res.send(audioBuffer);
  } catch (err) {
    console.warn('TTS error (falling back to browser voice):', err.message);
    res.status(502).json({
      success: false,
      useBrowserTTS: true,
      message: 'Text-to-speech service unavailable. Falling back to browser voice.',
      detail: err.message,
    });
  }
};

/**
 * POST /api/voice/speech-to-text
 * Multipart: audio file in field "audio", body field "language"
 * Returns: { transcript: string }
 */
const handleSpeechToText = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No audio file uploaded.' });
    }

    const language = req.body.language || 'en';

    if (!isSarvamKeyConfigured()) {
      return res.status(503).json({
        success: false,
        useBrowserSTT: true,
        message: 'SARVAM_API_KEY not configured. Using browser speech recognition.',
      });
    }

    const transcript = await speechToText(
      req.file.buffer,
      language,
      req.file.mimetype,
      req.file.originalname
    );
    res.json({ success: true, transcript });
  } catch (err) {
    console.warn('STT error (falling back to browser recognition):', err.message);
    res.status(502).json({
      success: false,
      useBrowserSTT: true,
      message: 'Speech-to-text service unavailable. Falling back to browser recognition.',
      detail: err.message,
    });
  }
};

module.exports = { handleTextToSpeech, handleSpeechToText };
