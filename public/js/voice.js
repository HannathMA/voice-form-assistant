/**
 * voice.js — Voice module for Voice Form Assistant
 * Provides Text-to-Speech (TTS) and Speech-to-Text (STT)
 * Uses Sarvam AI when available with instantaneous, zero-delay fallback
 * to the browser Web Speech API (speechSynthesis & SpeechRecognition).
 */

const VoiceModule = (() => {
  let mediaRecorder = null;
  let audioChunks = [];
  let isRecording = false;
  let currentAudio = null;
  let cachedVoices = [];

  // Pre-load voices if speech synthesis is supported
  if ('speechSynthesis' in window) {
    cachedVoices = window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
    };
  }

  const LANG_TAG_MAP = {
    en: 'en-IN',
    ml: 'ml-IN',
    hi: 'hi-IN',
    ta: 'ta-IN',
    te: 'te-IN',
  };

  /**
   * Stop any active audio or speech synthesis immediately.
   */
  function stopSpeaking() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Speak using browser SpeechSynthesis with best voice matching.
   */
  function speakWithBrowser(text, language) {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported in this browser.');
        resolve(false);
        return;
      }

      stopSpeaking();

      const utter = new SpeechSynthesisUtterance(text);
      const targetTag = LANG_TAG_MAP[language] || 'en-IN';
      utter.lang = targetTag;
      utter.rate = 0.95;
      utter.pitch = 1.0;

      // Select closest matching voice
      const voices = cachedVoices.length ? cachedVoices : window.speechSynthesis.getVoices();
      if (voices && voices.length) {
        const exactMatch = voices.find(v => v.lang === targetTag || v.lang.replace('_', '-') === targetTag);
        const prefixMatch = voices.find(v => v.lang.startsWith(language));
        const indianEng = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en_IN'));
        utter.voice = exactMatch || prefixMatch || indianEng || voices[0];
      }

      utter.onend = () => resolve(true);
      utter.onerror = (e) => {
        console.warn('Browser speech synthesis error:', e);
        resolve(false);
      };

      window.speechSynthesis.speak(utter);
    });
  }

  /**
   * Speak a question aloud in the requested language.
   * Uses Sarvam AI TTS if configured, otherwise browser speech synthesis.
   * @param {string} text - Text to speak
   * @param {string} language - en | ml | hi | ta | te
   */
  async function speakQuestion(text, language) {
    stopSpeaking();

    try {
      const audioBlob = await apiTextToSpeech(text, language);
      if (audioBlob && audioBlob.size > 100) {
        const audioUrl = URL.createObjectURL(audioBlob);
        currentAudio = new Audio(audioUrl);
        currentAudio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          currentAudio = null;
        };
        await currentAudio.play();
        return;
      }
    } catch {
      // Fallback silently to browser SpeechSynthesis
    }

    await speakWithBrowser(text, language);
  }

  /**
   * Speak instructional guidance aloud.
   */
  async function speakGuidance(text, language) {
    return speakWithBrowser(text, language);
  }

  // ── Speech-to-Text ──────────────────────────────────────────────
  async function startRecording(onStatusChange) {
    if (isRecording) return;
    stopSpeaking();

    // Check if Web Speech Recognition is natively supported
    const hasWebSpeech = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);

    // If getUserMedia is available, record audio buffer
    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunks = [];
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunks.push(e.data);
        };

        mediaRecorder.start(250);
        isRecording = true;
        if (onStatusChange) onStatusChange('recording');
        return;
      } catch (err) {
        console.warn('Microphone access for MediaRecorder:', err.message);
      }
    }

    if (hasWebSpeech) {
      isRecording = true;
      if (onStatusChange) onStatusChange('recording');
    } else {
      showToast('Microphone or Speech Recognition not available.', 'error');
    }
  }

  async function stopRecording(language, onStatusChange) {
    if (!isRecording) return null;
    isRecording = false;

    // If mediaRecorder was active, try backend STT first then browser fallback
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      return new Promise((resolve) => {
        mediaRecorder.onstop = async () => {
          try {
            mediaRecorder.stream?.getTracks().forEach(t => t.stop());
          } catch {}

          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          audioChunks = [];

          if (onStatusChange) onStatusChange('processing');

          try {
            const transcript = await apiSpeechToText(audioBlob, language);
            if (transcript) {
              if (onStatusChange) onStatusChange('done');
              resolve(transcript);
              return;
            }
          } catch {
            // Fall back to Web Speech API
          }

          const fallbackTranscript = await browserSTTFallback(language);
          if (onStatusChange) onStatusChange('done');
          resolve(fallbackTranscript);
        };
        mediaRecorder.stop();
      });
    }

    // Direct browser recognition fallback
    if (onStatusChange) onStatusChange('processing');
    const directTranscript = await browserSTTFallback(language);
    if (onStatusChange) onStatusChange('done');
    return directTranscript;
  }

  /**
   * Browser Web Speech API fallback for speech recognition.
   */
  function browserSTTFallback(language) {
    return new Promise((resolve) => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        resolve('');
        return;
      }

      try {
        const recognition = new SpeechRecognition();
        const targetTag = LANG_TAG_MAP[language] || 'en-IN';
        recognition.lang = targetTag;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        let gotResult = false;

        recognition.onresult = (e) => {
          gotResult = true;
          const transcript = e.results?.[0]?.[0]?.transcript || '';
          resolve(transcript);
        };

        recognition.onerror = () => {
          if (!gotResult) resolve('');
        };

        recognition.onend = () => {
          if (!gotResult) resolve('');
        };

        recognition.start();
      } catch (err) {
        console.warn('SpeechRecognition start failed:', err);
        resolve('');
      }
    });
  }

  function getIsRecording() {
    return isRecording;
  }

  return {
    speakQuestion,
    speakGuidance,
    stopSpeaking,
    startRecording,
    stopRecording,
    getIsRecording,
  };
})();
