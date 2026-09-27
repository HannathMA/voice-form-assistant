/**
 * voice.js — Audio Synthesis & Recognition Service
 * Dual-layer voice engine:
 * 1. Sarvam AI Neural TTS/STT via backend API
 * 2. Instant fallback to Browser SpeechSynthesis and SpeechRecognition
 */
import { apiTextToSpeech, apiSpeechToText } from './api';

let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let currentAudio = null;
let cachedVoices = [];

// Pre-load voices if speech synthesis is supported
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
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
 * Stop any active audio playback or speech synthesis
 */
export function stopSpeaking() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {}
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

/**
 * Browser SpeechSynthesis fallback
 */
function speakWithBrowser(text, language) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve(false);
      return;
    }

    stopSpeaking();

    const utter = new SpeechSynthesisUtterance(text);
    const targetTag = LANG_TAG_MAP[language] || 'en-IN';
    utter.lang = targetTag;
    utter.rate = 0.95;
    utter.pitch = 1.0;

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
 * Speak question using Sarvam AI TTS, falling back to browser synthesis
 */
export async function speakQuestion(text, language, onStart, onEnd) {
  stopSpeaking();
  if (onStart) onStart();

  try {
    const audioBlob = await apiTextToSpeech(text, language);
    if (audioBlob && audioBlob.size > 100) {
      const audioUrl = URL.createObjectURL(audioBlob);
      currentAudio = new Audio(audioUrl);
      return new Promise((resolve) => {
        currentAudio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          currentAudio = null;
          if (onEnd) onEnd();
          resolve(true);
        };
        currentAudio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          currentAudio = null;
          speakWithBrowser(text, language).then(() => {
            if (onEnd) onEnd();
            resolve(true);
          });
        };
        currentAudio.play().catch(() => {
          speakWithBrowser(text, language).then(() => {
            if (onEnd) onEnd();
            resolve(true);
          });
        });
      });
    }
  } catch (err) {
    // Fall back to browser speech synthesis
  }

  const res = await speakWithBrowser(text, language);
  if (onEnd) onEnd();
  return res;
}

export async function speakGuidance(text, language) {
  return speakWithBrowser(text, language);
}

/**
 * Start recording audio from microphone
 */
export async function startRecording(onStatusChange) {
  if (isRecording) return;
  stopSpeaking();

  if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
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
      return true;
    } catch (err) {
      console.warn('Microphone access failed:', err.message);
    }
  }

  const hasWebSpeech = typeof window !== 'undefined' && (('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window));
  if (hasWebSpeech) {
    isRecording = true;
    if (onStatusChange) onStatusChange('recording');
    return true;
  }

  throw new Error('Microphone or Speech Recognition not available in this browser.');
}

/**
 * Stop recording and transcribe speech
 */
export async function stopRecording(language, onStatusChange) {
  if (!isRecording) return '';
  isRecording = false;

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
          // Fall through to browser speech recognition fallback
        }

        const fallback = await browserSTTFallback(language);
        if (onStatusChange) onStatusChange('done');
        resolve(fallback);
      };

      try {
        mediaRecorder.stop();
      } catch {
        resolve('');
      }
    });
  }

  if (onStatusChange) onStatusChange('processing');
  const directTranscript = await browserSTTFallback(language);
  if (onStatusChange) onStatusChange('done');
  return directTranscript;
}

/**
 * Browser Speech Recognition fallback
 */
function browserSTTFallback(language) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve('');
      return;
    }

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

      let resolved = false;

      recognition.onresult = (e) => {
        resolved = true;
        const transcript = e.results?.[0]?.[0]?.transcript || '';
        resolve(transcript);
      };

      recognition.onerror = () => {
        if (!resolved) {
          resolved = true;
          resolve('');
        }
      };

      recognition.onend = () => {
        if (!resolved) {
          resolved = true;
          resolve('');
        }
      };

      recognition.start();
    } catch (err) {
      console.warn('SpeechRecognition failed:', err);
      resolve('');
    }
  });
}

export function getIsRecording() {
  return isRecording;
}
