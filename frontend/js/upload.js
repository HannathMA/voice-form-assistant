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

    showSpinner('Detecting form fields with Gemini Vision AI… This takes 5–15 seconds.');
    detectBtn.disabled = true;

    try {
      const formData = new FormData();
      formData.append('formImage', selectedFile);
      formData.append('userId', getUserId());
      formData.append('language', getLang());

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
