const axios = require('axios');

const SARVAM_BASE = 'https://api.sarvam.ai';

// Map our language codes to Sarvam BCP-47 codes
const LANGUAGE_MAP = {
  en: 'en-IN',
  ml: 'ml-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
};

/**
 * Convert text to speech using Sarvam AI.
 * @param {string} text      - The text to speak
 * @param {string} language  - Language code: en | ml | hi | ta | te
 * @returns {Promise<Buffer>} - Audio buffer (WAV)
 */
const textToSpeech = async (text, language = 'en') => {
  const langCode = LANGUAGE_MAP[language] || 'en-IN';

  const response = await axios.post(
    `${SARVAM_BASE}/text-to-speech`,
    {
      inputs: [text],
      target_language_code: langCode,
      speaker: 'meera',          // female voice; change to 'arjun' for male
      pitch: 0,
      pace: 1.0,
      loudness: 1.5,
      speech_sample_rate: 8000,
      enable_preprocessing: true,
      model: 'bulbul:v1',
    },
    {
      headers: {
        'api-subscription-key': process.env.SARVAM_API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );

  // Sarvam returns base64-encoded audio in response.data.audios[0]
  const base64Audio = response.data.audios?.[0];
  if (!base64Audio) throw new Error('Sarvam TTS returned no audio data');

  return Buffer.from(base64Audio, 'base64');
};

/**
 * Convert speech audio to text using Sarvam AI.
 * @param {Buffer} audioBuffer  - Raw audio buffer (WAV/WebM)
 * @param {string} language     - Language code: en | ml | hi | ta | te
 * @returns {Promise<string>}   - Transcript
 */
const speechToText = async (audioBuffer, language = 'en') => {
  const langCode = LANGUAGE_MAP[language] || 'en-IN';

  // Sarvam STT expects multipart/form-data with the audio file
  const FormData = require('form-data');
  const form = new FormData();
  form.append('file', audioBuffer, {
    filename: 'recording.wav',
    contentType: 'audio/wav',
  });
  form.append('language_code', langCode);
  form.append('model', 'saarika:v2');
  form.append('with_timestamps', 'false');

  const response = await axios.post(`${SARVAM_BASE}/speech-to-text`, form, {
    headers: {
      ...form.getHeaders(),
      'api-subscription-key': process.env.SARVAM_API_KEY,
    },
  });

  const transcript = response.data.transcript || '';
  return transcript.trim();
};

module.exports = { textToSpeech, speechToText };
