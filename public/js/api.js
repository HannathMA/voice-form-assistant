/**
 * api.js — Centralised API helper
 * All fetch() calls to the backend go through here.
 */

// Determine API_BASE dynamically: if served directly by Express use same origin, otherwise fallback to http://localhost:5000
const API_BASE = (() => {
  const loc = window.location;
  if (
    loc.protocol.startsWith('http') &&
    loc.origin &&
    loc.origin !== 'null' &&
    loc.port !== '5500' &&
    loc.port !== '5501' &&
    loc.port !== '5502' &&
    loc.port !== '3000' &&
    loc.port !== '5173' &&
    loc.port !== '8080'
  ) {
    return loc.origin;
  }
  return 'http://localhost:5000';
})();

// ── Generic safe fetch helper ────────────────────────────────────
async function safeJsonFetch(url, options = {}) {
  let res;
  try {
    res = await fetch(url, options);
  } catch (netErr) {
    throw new Error(
      `Cannot connect to backend server at ${API_BASE}. Please ensure the backend is running (run 'npm start' in the backend folder).`
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

// ── Toast helper ─────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { success: '✅', error: '❌', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || '📢'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ── Spinner helpers ───────────────────────────────────────────────
function showSpinner(text = 'Please wait…') {
  const s = document.getElementById('spinner');
  const t = document.getElementById('spinner-text');
  if (s) { s.classList.add('active'); if (t) t.textContent = text; }
}
function hideSpinner() {
  const s = document.getElementById('spinner');
  if (s) s.classList.remove('active');
}

// ── Language helpers ──────────────────────────────────────────────
function getLang() { return localStorage.getItem('vfa_lang') || 'en'; }
function getLangName() { return localStorage.getItem('vfa_lang_name') || 'English'; }
function getLangNativeName(lang) {
  const map = {
    en: 'English',
    ml: 'മലയാളം',
    hi: 'हिन्दी',
    ta: 'தமிழ்',
    te: 'తెలుగు',
  };
  return map[lang || getLang()] || getLangName();
}
function getUserId() {
  let id = localStorage.getItem('vfa_user_id');
  if (!id) {
    id = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    localStorage.setItem('vfa_user_id', id);
  }
  return id;
}
function updateNavLang() {
  const lang = getLang();
  const labelEl = document.getElementById('nav-lang-label');
  if (labelEl && typeof PAGE_STRINGS !== 'undefined' && PAGE_STRINGS[lang]?.navLangLabel) {
    labelEl.textContent = PAGE_STRINGS[lang].navLangLabel;
  }
  const el = document.getElementById('nav-lang-display');
  if (el) el.textContent = getLangNativeName(lang);
}

// ── API: Upload form image ────────────────────────────────────────
async function apiUploadForm(formData) {
  const customKey = localStorage.getItem('vfa_gemini_key') || '';
  const headers = {};
  if (customKey) {
    headers['x-gemini-key'] = customKey.trim();
  }
  return await safeJsonFetch(`${API_BASE}/api/forms/upload`, {
    method: 'POST',
    headers,
    body: formData, // multipart — DO NOT set Content-Type header
  });
}

// ── API: Config & API key helpers ─────────────────────────────────
async function apiGetConfigStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/forms/config/status`);
    return await res.json();
  } catch {
    return { success: false, hasGeminiKey: false };
  }
}

async function apiSaveGeminiKey(key) {
  return await safeJsonFetch(`${API_BASE}/api/forms/config/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ geminiApiKey: key }),
  });
}

// ── API: Get form ─────────────────────────────────────────────────
async function apiGetForm(formId) {
  const data = await safeJsonFetch(`${API_BASE}/api/forms/${formId}`);
  return data.form;
}

// ── API: Create session ───────────────────────────────────────────
async function apiCreateSession(formId) {
  const data = await safeJsonFetch(`${API_BASE}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: getUserId(), formId }),
  });
  return data.session;
}

// ── API: Update session ───────────────────────────────────────────
async function apiUpdateSession(sessionId, payload) {
  const data = await safeJsonFetch(`${API_BASE}/api/sessions/${sessionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return data.session;
}

// ── API: Get session ──────────────────────────────────────────────
async function apiGetSession(sessionId) {
  const data = await safeJsonFetch(`${API_BASE}/api/sessions/${sessionId}`);
  return data.session;
}

// ── API: Text-to-Speech (returns audio Blob) ──────────────────────
async function apiTextToSpeech(text, language) {
  let res;
  try {
    res = await fetch(`${API_BASE}/api/voice/text-to-speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language }),
    });
  } catch {
    throw new Error(`Cannot connect to voice server at ${API_BASE}.`);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'TTS service error');
  }
  return await res.blob(); // audio/wav blob
}

// ── API: Speech-to-Text (returns transcript string) ───────────────
async function apiSpeechToText(audioBlob, language) {
  const fd = new FormData();
  fd.append('audio', audioBlob, 'recording.wav');
  fd.append('language', language);
  const data = await safeJsonFetch(`${API_BASE}/api/voice/speech-to-text`, {
    method: 'POST',
    body: fd,
  });
  return data.transcript;
}
