/**
 * api.js — API client for VoiceForm AI backend
 */

export const getApiBase = () => {
  // 1. Check runtime localStorage override
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('vfa_api_base');
    if (saved && saved.trim()) return saved.trim().replace(/\/$/, '');
  }

  // 2. If running locally (localhost, 127.0.0.1) or on Vercel deployment, use relative ''
  if (typeof window !== 'undefined') {
    const loc = window.location;
    if (
      loc.hostname === 'localhost' ||
      loc.hostname === '127.0.0.1' ||
      loc.hostname.endsWith('.vercel.app') ||
      !loc.port
    ) {
      return '';
    }
  }

  // 3. Environment variable or Vercel production domain
  if (import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }

  return '';
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

// ── Form templates ─────────────────────────────────────────────────
export async function apiGetFormTemplates() {
  try {
    const data = await safeJsonFetch(`${API_BASE}/api/forms/templates`);
    return data.templates || [];
  } catch {
    return [
      { id: 'bank_kyc', name: 'State Bank KYC Form', description: 'Personal details, PAN, Aadhaar, address & photo box' },
      { id: 'bank_account', name: 'Bank Account Opening Form', description: 'Account type, personal info, nominee & branch details' },
      { id: 'college_admission', name: 'College Admission Form', description: 'Student name, course, qualifications & contact' },
      { id: 'loan_application', name: 'Loan Application Form', description: 'Applicant details, income, loan amount & declaration' },
      { id: 'job_application', name: 'Employment Application Form', description: 'Candidate info, position applied for & qualifications' },
    ];
  }
}

// ── Generate form image using OpenAI ──────────────────────────────
export async function apiGenerateFormImage({ template = 'bank_kyc', prompt = '', customKey = '' }) {
  const activeKey = (customKey || (typeof window !== 'undefined' ? localStorage.getItem('vfa_openai_key') : '') || '').trim();
  return await safeJsonFetch(`${API_BASE}/api/forms/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ template, prompt, customKey: activeKey }),
  });
}

// ── Generate filled form image using OpenAI with user-entered data ─
export async function apiGenerateFilledForm({ formTitle = '', answers = {}, fields = [], imageUrl = '', imageBase64 = '', formId = '', customKey = '' }) {
  const activeKey = (customKey || (typeof window !== 'undefined' ? localStorage.getItem('vfa_openai_key') : '') || '').trim();
  return await safeJsonFetch(`${API_BASE}/api/forms/generate-filled-form`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ formTitle, answers, fields, imageUrl, imageBase64, formId, customKey: activeKey }),
  });
}

// ── Config Status & Save ───────────────────────────────────────────
export async function apiGetConfig() {
  return await safeJsonFetch(`${API_BASE}/api/forms/config/status`);
}

export async function apiSaveConfig(payload) {
  return await safeJsonFetch(`${API_BASE}/api/forms/config/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
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
  let ext = 'webm';
  if (audioBlob.type) {
    if (audioBlob.type.includes('wav')) ext = 'wav';
    else if (audioBlob.type.includes('mp4')) ext = 'mp4';
    else if (audioBlob.type.includes('ogg')) ext = 'ogg';
    else if (audioBlob.type.includes('webm')) ext = 'webm';
  }
  fd.append('audio', audioBlob, `recording.${ext}`);
  fd.append('language', language);
  const data = await safeJsonFetch(`${API_BASE}/api/voice/speech-to-text`, {
    method: 'POST',
    body: fd,
  });
  return data.transcript;
}
