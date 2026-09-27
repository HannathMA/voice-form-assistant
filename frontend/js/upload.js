/**
 * upload.js — Dashboard page (dashboard.html)
 * Handles drag-and-drop upload, image preview, Gemini API key configuration,
 * and live AI form detection trigger.
 */

document.addEventListener('DOMContentLoaded', () => {
  updateNavLang();
  applyDashboardTranslations();

  const langReminder = document.getElementById('lang-reminder');
  if (langReminder) langReminder.textContent = getLangName();

  const uploadZone  = document.getElementById('upload-zone');
  const fileInput   = document.getElementById('file-input');
  const previewArea = document.getElementById('preview-area');
  const previewImg  = document.getElementById('preview-img');
  const fileNameEl  = document.getElementById('file-name-display');
  const fileSizeEl  = document.getElementById('file-size-display');
  const removeBtn   = document.getElementById('remove-img-btn');
  const detectBtn   = document.getElementById('detect-btn');

  // ── Gemini API Key Configuration ───────────────────────────────
  const apiKeyBadge = document.getElementById('api-key-badge');
  const keyInput    = document.getElementById('gemini-key-input');
  const saveKeyBtn  = document.getElementById('save-key-btn');
  let hasActiveApiKey = false;

  async function refreshApiKeyStatus() {
    const localKey = localStorage.getItem('vfa_gemini_key') || '';
    if (localKey && keyInput && !keyInput.value) {
      keyInput.value = localKey;
    }

    const config = await apiGetConfigStatus();
    hasActiveApiKey = Boolean(config.hasGeminiKey || (localKey && localKey.length > 15));

    const keyCard = document.getElementById('api-key-card');
    if (config.hasGeminiKey && keyCard) {
      // When GEMINI_API_KEY is configured in Vercel/server environment, hide the key input card completely!
      keyCard.style.display = 'none';
    } else if (apiKeyBadge) {
      if (hasActiveApiKey) {
        apiKeyBadge.textContent = '🟢 AI Vision Active';
        apiKeyBadge.style.background = 'rgba(0, 212, 170, 0.2)';
        apiKeyBadge.style.color = 'var(--accent)';
      } else {
        apiKeyBadge.textContent = '⚠️ Key Needed';
        apiKeyBadge.style.background = 'rgba(255, 193, 7, 0.2)';
        apiKeyBadge.style.color = '#ffc107';
      }
    }
  }

  refreshApiKeyStatus();

  saveKeyBtn?.addEventListener('click', async () => {
    const val = keyInput?.value?.trim();
    if (!val || val.length < 15) {
      showToast('Please enter a valid Gemini API key (from Google AI Studio)', 'warning');
      return;
    }
    localStorage.setItem('vfa_gemini_key', val);
    try {
      await apiSaveGeminiKey(val);
    } catch {}
    await refreshApiKeyStatus();
    showToast('Gemini API key saved! Live AI detection is active.', 'success');
  });

  let selectedFile = null;

  // ── Drag and Drop ──────────────────────────────────────────────
  ['dragenter', 'dragover'].forEach(ev => {
    uploadZone.addEventListener(ev, (e) => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
  });
  ['dragleave', 'drop'].forEach(ev => {
    uploadZone.addEventListener(ev, (e) => { e.preventDefault(); uploadZone.classList.remove('drag-over'); });
  });
  uploadZone.addEventListener('drop', (e) => {
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFileSelect(file);
  });

  // Click anywhere on zone (except file input itself) opens browser
  uploadZone.addEventListener('click', (e) => {
    if (e.target !== fileInput) fileInput.click();
  });
  uploadZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
  });

  // ── File input change ──────────────────────────────────────────
  fileInput.addEventListener('change', () => {
    if (fileInput.files?.[0]) handleFileSelect(fileInput.files[0]);
  });

  function handleFileSelect(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file (JPG, PNG, WebP)', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('File too large. Maximum size is 10 MB.', 'error');
      return;
    }
    selectedFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      previewArea.classList.add('visible');
      detectBtn.disabled = false;
    };
    reader.readAsDataURL(file);

    // File info
    fileNameEl.textContent = `📄 ${file.name}`;
    fileSizeEl.textContent = `📦 ${(file.size / 1024).toFixed(0)} KB`;

    uploadZone.querySelector('.upload-icon').textContent = '✅';
    uploadZone.querySelector('.upload-title').textContent = t('imgSelected');
  }

  // ── Remove image ───────────────────────────────────────────────
  removeBtn?.addEventListener('click', () => {
    selectedFile = null;
    fileInput.value = '';
    previewImg.src = '';
    previewArea.classList.remove('visible');
    detectBtn.disabled = true;
    uploadZone.querySelector('.upload-icon').textContent = '📄';
    uploadZone.querySelector('.upload-title').textContent = t('uploadTitle');
  });

  // ── Detect fields using live Gemini Vision API ───────────────────
  detectBtn?.addEventListener('click', async () => {
    if (!selectedFile) return;

    const localKey = localStorage.getItem('vfa_gemini_key') || '';
    if (!hasActiveApiKey && !localKey) {
      showToast('Please enter your Google Gemini API key to detect form fields using AI.', 'warning');
      keyInput?.focus();
      document.getElementById('api-key-card')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    showSpinner('Detecting form fields with Gemini Vision AI… This takes 5–15 seconds.');
    detectBtn.disabled = true;

    try {
      const formData = new FormData();
      formData.append('formImage', selectedFile);
      formData.append('userId', getUserId());
      formData.append('language', getLang());
      if (localKey) {
        formData.append('geminiApiKey', localKey);
      }

      const result = await apiUploadForm(formData);

      // Persist for use in form.html
      localStorage.setItem('vfa_form_id', result.formId);
      showToast(`AI Detected: "${result.formTitle}" — ${result.fields.length} fields found!`, 'success');

      // Create session
      const session = await apiCreateSession(result.formId);
      localStorage.setItem('vfa_session_id', session._id);

      setTimeout(() => {
        window.location.href = `form.html?formId=${result.formId}&sessionId=${session._id}`;
      }, 800);

    } catch (err) {
      showToast(err.message || 'AI detection failed. Please check your Gemini API key.', 'error');
      detectBtn.disabled = false;
    } finally {
      hideSpinner();
    }
  });
});
