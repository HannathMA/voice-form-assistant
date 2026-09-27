/**
 * api.js — API client for VoiceForm AI backend
 */

export const getApiBase = () => {
  // 1. Check runtime localStorage override
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('vfa_api_base');
    if (saved && saved.trim()) return saved.trim().replace(/\/$/, '');
  }

  // 2. If running on Vercel deployment or behind Vite proxy (port 5173), use relative /api
  if (typeof window !== 'undefined') {
    const loc = window.location;
    if (
      loc.hostname.endsWith('.vercel.app') ||
      loc.port === '5173' ||
      !loc.port
    ) {
      return '';
    }
  }

  // 3. Environment variable or Vercel production domain
  if (import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }

  return 'https://voice-form-assistant.vercel.app';
};

export const API_BASE = getApiBase();

async function safeJsonFetch(url, options = {}) {
  let res;
  try {
    res = await fetch(url, options);
  } catch (err) {
    throw new Error(
      `Cannot connect to backend server at ${API_BASE || 'localhost:5000'}. Please ensure the backend is running.`
    );
  }

  let data;
  try {
    data = await res.json();
  } catch {
    const rawText = await res.text().catch(() => '');
    throw new Error(rawText || `Server returned error (${res.status} ${res.statusText})`);
  }

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

// ── Upload form image ──────────────────────────────────────────────
export async function apiUploadForm(formData, customKey = '') {
  const headers = {};
  if (customKey && customKey.trim()) {
    headers['x-gemini-key'] = customKey.trim();
  }
  return await safeJsonFetch(`${API_BASE}/api/forms/upload`, {
    method: 'POST',
    headers,
    body: formData, // multipart/form-data
  });
}

// ── Gemini configuration status ────────────────────────────────────
export async function apiGetConfigStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/forms/config/status`);
    return await res.json();
  } catch {
    return { success: false, hasGeminiKey: false };
  }
}

export async function apiSaveGeminiKey(key) {
  return await safeJsonFetch(`${API_BASE}/api/forms/config/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ geminiApiKey: key }),
  });
}

// ── Get form by ID ─────────────────────────────────────────────────
export async function apiGetForm(formId) {
  const data = await safeJsonFetch(`${API_BASE}/api/forms/${formId}`);
  return data.form;
}

// ── Create new session ─────────────────────────────────────────────
export async function apiCreateSession(formId, userId) {
  const data = await safeJsonFetch(`${API_BASE}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, formId }),
  });
  return data.session;
}

// ── Update session progress ────────────────────────────────────────
export async function apiUpdateSession(sessionId, payload) {
  const data = await safeJsonFetch(`${API_BASE}/api/sessions/${sessionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return data.session;
}

// ── Get session details ────────────────────────────────────────────
export async function apiGetSession(sessionId) {
  const data = await safeJsonFetch(`${API_BASE}/api/sessions/${sessionId}`);
  return data.session;
}

// ── Text-to-Speech (Sarvam AI API) ─────────────────────────────────
export async function apiTextToSpeech(text, language) {
  let res;
  try {
    res = await fetch(`${API_BASE}/api/voice/text-to-speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language }),
    });
  } catch {
    throw new Error(`Cannot connect to voice server at ${API_BASE || 'localhost:5000'}.`);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'TTS service error');
  }
  return await res.blob(); // WAV Blob
}

// ── Speech-to-Text (Sarvam AI API) ─────────────────────────────────
export async function apiSpeechToText(audioBlob, language) {
  const fd = new FormData();
  fd.append('audio', audioBlob, 'recording.wav');
  fd.append('language', language);
  const data = await safeJsonFetch(`${API_BASE}/api/voice/speech-to-text`, {
    method: 'POST',
    body: fd,
  });
  return data.transcript;
}
