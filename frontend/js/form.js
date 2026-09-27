/**
 * form.js — Form filling page (form.html)
 * Loads form + session, renders questions, handles voice guidance, navigation and auto-save.
 */

document.addEventListener('DOMContentLoaded', async () => {
  updateNavLang();
  applyFormTranslations();

  // ── Load IDs from URL or localStorage ──────────────────────────
  const params = new URLSearchParams(window.location.search);
  let formId = params.get('formId') || params.get('id') || localStorage.getItem('vfa_form_id');
  let sessionId = params.get('sessionId') || localStorage.getItem('vfa_session_id');

  let form = null;
  let session = null;
  let currentIndex = 0;
  const language = getLang();

  // ── Fetch form and session ─────────────────────────────────────
  showSpinner('Loading your form…');
  try {
    if (sessionId && !formId) {
      session = await apiGetSession(sessionId);
      form = session.formId?.fields ? session.formId : await apiGetForm(session.formId?._id || session.formId);
      formId = form._id;
    } else if (formId && !sessionId) {
      [form, session] = await Promise.all([apiGetForm(formId), apiCreateSession(formId)]);
      sessionId = session._id;
    } else if (formId && sessionId) {
      [form, session] = await Promise.all([apiGetForm(formId), apiGetSession(sessionId)]);
    } else {
      hideSpinner();
      showToast('No form found. Please upload a form first.', 'error');
      setTimeout(() => window.location.href = 'dashboard.html', 1500);
      return;
    }

    localStorage.setItem('vfa_form_id', formId);
    localStorage.setItem('vfa_session_id', sessionId);

    currentIndex = session.currentField || 0;

    // Check if coming from "Edit" in review page
    const jumpField = localStorage.getItem('vfa_jump_field');
    if (jumpField !== null) {
      currentIndex = parseInt(jumpField, 10) || 0;
      localStorage.removeItem('vfa_jump_field');
    }

    hideSpinner();
  } catch (err) {
    hideSpinner();
    showToast('Could not load form: ' + err.message, 'error');
    return;
  }

  const fields = form.fields || [];
  const answers = new Map(Object.entries(session.answers || {}));

  // Ensure currentIndex is in bounds
  if (currentIndex >= fields.length && fields.length > 0) {
    currentIndex = 0;
  }

  // ── Voice Assistance Controls ──────────────────────────────────
  let autoSpeak = localStorage.getItem('vfa_auto_speak') !== 'false'; // default ON
  const autoSpeakBtn = document.getElementById('auto-speak-btn');
  const voiceHelpBtn = document.getElementById('voice-help-btn');
  let speechTimer = null;

  function updateAutoSpeakUI() {
    if (!autoSpeakBtn) return;
    autoSpeakBtn.textContent = autoSpeak
      ? (t('autoReadOn') || '🔊 Auto-read: ON')
      : (t('autoReadOff') || '🔈 Auto-read: OFF');

    if (autoSpeak) {
      autoSpeakBtn.classList.add('active');
      autoSpeakBtn.setAttribute('aria-pressed', 'true');
    } else {
      autoSpeakBtn.classList.remove('active');
      autoSpeakBtn.setAttribute('aria-pressed', 'false');
    }
  }
  updateAutoSpeakUI();

  autoSpeakBtn?.addEventListener('click', () => {
    autoSpeak = !autoSpeak;
    localStorage.setItem('vfa_auto_speak', autoSpeak ? 'true' : 'false');
    updateAutoSpeakUI();
    if (!autoSpeak) {
      VoiceModule.stopSpeaking();
      clearTimeout(speechTimer);
    } else {
      speakCurrentQuestion();
    }
  });

  voiceHelpBtn?.addEventListener('click', async () => {
    VoiceModule.stopSpeaking();
    clearTimeout(speechTimer);
    const helpText = t('voiceHelpText') || 'Welcome to VoiceForm! Click Listen to hear questions, and Record Answer to speak your response.';
    showToast(helpText, 'info');
    await VoiceModule.speakGuidance(helpText, language);
  });

  function speakCurrentQuestion() {
    clearTimeout(speechTimer);
    VoiceModule.stopSpeaking();
    const field = fields[currentIndex];
    if (!field) return;

    const prefix = t('speakQuestionPrefix') || 'Question';
    const textToSpeak = `${prefix} ${currentIndex + 1}: ${field.label}. ${getHint(field.type)}`;

    speechTimer = setTimeout(() => {
      const statusEl = document.getElementById('voice-status');
      if (statusEl) statusEl.textContent = t('speakingStatus');
      VoiceModule.speakQuestion(textToSpeak, language).finally(() => {
        if (statusEl) statusEl.textContent = '';
      });
    }, 450);
  }

  // ── Update page header ─────────────────────────────────────────
  document.getElementById('form-title-display').textContent = form.formTitle || 'Form';
  renderSidebar();
  renderQuestion();

  // ── Render sidebar ─────────────────────────────────────────────
  function renderSidebar() {
    const list = document.getElementById('sidebar-list');
    if (!list) return;
    list.innerHTML = '';
    fields.forEach((field, idx) => {
      const item = document.createElement('div');
      item.className = 'field-sidebar-item';
      if (idx === currentIndex) item.classList.add('current');
      if (answers.has(field.label)) item.classList.add('answered');

      item.innerHTML = `
        <span class="field-sidebar-dot"></span>
        <span>${escapeHTML(field.label)}</span>
      `;
      item.addEventListener('click', () => {
        VoiceModule.stopSpeaking();
        clearTimeout(speechTimer);
        saveCurrentAnswer();
        currentIndex = idx;
        renderQuestion();
        renderSidebar();
      });
      list.appendChild(item);
    });
  }

  // ── Update progress bar ────────────────────────────────────────
  function updateProgress() {
    const pct = fields.length ? Math.round(((currentIndex + 1) / fields.length) * 100) : 0;
    document.getElementById('progress-label').textContent = `${t('fieldOf')} ${currentIndex + 1} / ${fields.length}`;
    document.getElementById('progress-pct').textContent = `${pct}%`;
    const bar = document.getElementById('progress-bar');
    bar.style.width = `${pct}%`;
    document.getElementById('progress-bar-wrapper').setAttribute('aria-valuenow', pct);
  }

  // ── Render current question ────────────────────────────────────
  function renderQuestion() {
    if (!fields.length) {
      document.getElementById('question-card').innerHTML =
        '<p style="text-align:center; color:var(--text-muted); padding:40px;">No fields found in this form.</p>';
      return;
    }

    updateProgress();
    renderSidebar();

    const field = fields[currentIndex];
    const savedAnswer = answers.get(field.label) || '';
    const isRequired = field.required;

    let inputHTML = '';

    switch (field.type) {
      case 'text':
      case 'number':
      case 'date':
        inputHTML = `
          <div class="answer-input-wrapper">
            <input
              type="${field.type}"
              id="field-input"
              class="form-input"
              value="${escapeHTML(savedAnswer)}"
              placeholder="${field.type === 'date' ? '' : t('hintDefault')}"
              aria-label="${escapeHTML(field.label)}"
              autocomplete="off"
            />
          </div>`;
        break;

      case 'textarea':
        inputHTML = `
          <div class="answer-input-wrapper">
            <textarea
              id="field-input"
              class="form-textarea"
              placeholder="${t('hintDefault')}"
              aria-label="${escapeHTML(field.label)}"
              rows="4"
            >${escapeHTML(savedAnswer)}</textarea>
          </div>`;
        break;

      case 'select':
        if (field.options && field.options.length <= 6) {
          // Render as clickable tiles
          inputHTML = `
            <div class="option-tiles" role="group" aria-label="${escapeHTML(field.label)}">
              ${field.options.map(opt => `
                <button class="option-tile ${savedAnswer === opt ? 'selected' : ''}"
                  data-value="${escapeHTML(opt)}"
                  aria-pressed="${savedAnswer === opt}"
                  aria-label="Select ${escapeHTML(opt)}">
                  ${escapeHTML(opt)}
                </button>`).join('')}
            </div>
            <input type="hidden" id="field-input" value="${escapeHTML(savedAnswer)}" />`;
        } else {
          inputHTML = `
            <select id="field-input" class="form-select" aria-label="${escapeHTML(field.label)}">
              <option value="">${t('selectPlaceholder')}</option>
              ${field.options.map(opt =>
                `<option value="${escapeHTML(opt)}" ${savedAnswer === opt ? 'selected' : ''}>${escapeHTML(opt)}</option>`
              ).join('')}
            </select>`;
        }
        break;

      case 'checkbox':
        inputHTML = `
          <label class="checkbox-wrapper">
            <input type="checkbox" id="field-input"
              ${savedAnswer === 'true' ? 'checked' : ''}
              aria-label="${escapeHTML(field.label)}" />
            <span>${escapeHTML(field.label)}</span>
          </label>`;
        break;

      default:
        inputHTML = `
          <div class="answer-input-wrapper">
            <input type="text" id="field-input" class="form-input"
              value="${escapeHTML(savedAnswer)}"
              placeholder="${t('hintDefault')}"
              aria-label="${escapeHTML(field.label)}" />
          </div>`;
    }

    document.getElementById('question-card').innerHTML = `
      <p class="question-number">
        ${t('questionOf')} ${currentIndex + 1} / ${fields.length}
        ${isRequired ? '<span class="required-star" aria-label="required">*</span>' : ''}
      </p>
      <h2 class="question-text" id="question-heading">${escapeHTML(field.label)}</h2>
      <p class="question-hint" id="question-hint">
        ${getHint(field.type)}
      </p>

      <!-- Voice controls -->
      <div class="voice-controls">
        <button class="voice-btn voice-btn-listen" id="listen-btn"
          aria-label="Listen to the question">
          ${t('listenBtn')}
        </button>
        <button class="voice-btn voice-btn-record" id="record-btn"
          aria-label="Record your answer by voice">
          ${t('recordBtn')}
        </button>
        <span class="voice-status" id="voice-status" aria-live="polite"></span>
      </div>

      <!-- Answer area -->
      <div class="answer-area">
        ${inputHTML}
      </div>`;

    // Attach option tile logic
    document.querySelectorAll('.option-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        document.querySelectorAll('.option-tile').forEach(t => {
          t.classList.remove('selected');
          t.setAttribute('aria-pressed', 'false');
        });
        tile.classList.add('selected');
        tile.setAttribute('aria-pressed', 'true');
        const hidden = document.getElementById('field-input');
        if (hidden) hidden.value = tile.dataset.value;
      });
    });

    // Attach voice button listeners
    attachVoiceListeners(field);

    // Prev/Next state
    document.getElementById('prev-btn').disabled = currentIndex === 0;
    document.getElementById('next-btn').textContent =
      currentIndex === fields.length - 1 ? t('finishBtn') : t('nextBtn');

    // Auto-focus input
    const inp = document.getElementById('field-input');
    if (inp && field.type !== 'checkbox') setTimeout(() => inp.focus(), 100);

    // If auto-read is enabled, speak the question
    if (autoSpeak) {
      speakCurrentQuestion();
    }
  }

  // ── Voice button logic ─────────────────────────────────────────
  function attachVoiceListeners(field) {
    const listenBtn = document.getElementById('listen-btn');
    const recordBtn = document.getElementById('record-btn');
    const statusEl  = document.getElementById('voice-status');

    // Listen button: speaks question and hint
    listenBtn?.addEventListener('click', async () => {
      listenBtn.disabled = true;
      speakCurrentQuestion();
      setTimeout(() => {
        listenBtn.disabled = false;
      }, 1000);
    });

    // Record button (toggle)
    recordBtn?.addEventListener('click', async () => {
      VoiceModule.stopSpeaking();
      clearTimeout(speechTimer);

      if (!VoiceModule.getIsRecording()) {
        // Start recording
        recordBtn.classList.add('recording');
        recordBtn.textContent = t('stopRecBtn');
        statusEl.textContent = t('listeningStatus');
        await VoiceModule.startRecording((status) => {
          if (status === 'recording') statusEl.textContent = t('listeningStatus');
        });
      } else {
        // Stop and process
        recordBtn.disabled = true;
        statusEl.textContent = t('processingStatus');
        const transcript = await VoiceModule.stopRecording(language, (status) => {
          if (status === 'processing') statusEl.textContent = t('processSpeech');
          if (status === 'done') statusEl.textContent = '';
        });

        recordBtn.classList.remove('recording');
        recordBtn.textContent = t('recordBtn');
        recordBtn.disabled = false;

        if (transcript) {
          fillTranscript(field.type, transcript);
          showToast(`Heard: "${transcript}"`, 'success');
          statusEl.textContent = `✅ "${transcript}"`;
        } else {
          statusEl.textContent = t('noHear');
        }
      }
    });
  }

  function fillTranscript(type, transcript) {
    const inp = document.getElementById('field-input');
    if (!inp) return;

    if (type === 'checkbox') {
      const lower = transcript.toLowerCase();
      inp.checked = lower.includes('yes') || lower.includes('true') || lower.includes('അതെ') || lower.includes('हाँ') || lower.includes('ஆம்') || lower.includes('అవును');
    } else if (type === 'select') {
      // Try to find matching option tile
      document.querySelectorAll('.option-tile').forEach(tile => {
        if (tile.dataset.value.toLowerCase().includes(transcript.toLowerCase())) {
          tile.click();
        }
      });
      // Also try native select
      if (inp.tagName === 'SELECT') {
        Array.from(inp.options).forEach(opt => {
          if (opt.text.toLowerCase().includes(transcript.toLowerCase())) {
            inp.value = opt.value;
          }
        });
      }
    } else {
      inp.value = transcript;
    }
  }

  // ── Save current answer to local map ──────────────────────────
  function saveCurrentAnswer() {
    const field = fields[currentIndex];
    if (!field) return;
    const inp = document.getElementById('field-input');
    if (!inp) return;

    let value;
    if (field.type === 'checkbox') {
      value = inp.checked ? 'true' : 'false';
    } else {
      value = inp.value.trim();
    }
    if (value) answers.set(field.label, value);
  }

  // ── Persist session to backend ─────────────────────────────────
  async function persistSession(newIndex, status = 'in_progress') {
    try {
      await apiUpdateSession(sessionId, {
        answers: Object.fromEntries(answers),
        currentField: newIndex,
        status,
      });
    } catch (err) {
      console.warn('Auto-save failed:', err.message);
    }
  }

  // ── Navigation buttons ─────────────────────────────────────────
  document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentIndex === 0) return;
    VoiceModule.stopSpeaking();
    clearTimeout(speechTimer);
    saveCurrentAnswer();
    currentIndex--;
    persistSession(currentIndex);
    renderQuestion();
  });

  document.getElementById('next-btn').addEventListener('click', async () => {
    VoiceModule.stopSpeaking();
    clearTimeout(speechTimer);
    saveCurrentAnswer();

    if (currentIndex === fields.length - 1) {
      // Finished
      await persistSession(currentIndex, 'completed');
      showToast(t('formCompletedToast') || 'Form completed! 🎉', 'success');
      setTimeout(() => {
        window.location.href = `progress.html?sessionId=${sessionId}`;
      }, 800);
      return;
    }

    await persistSession(currentIndex + 1);
    currentIndex++;
    renderQuestion();
  });

  document.getElementById('skip-btn').addEventListener('click', async () => {
    if (currentIndex === fields.length - 1) return;
    VoiceModule.stopSpeaking();
    clearTimeout(speechTimer);
    await persistSession(currentIndex + 1);
    currentIndex++;
    renderQuestion();
  });

  // ── Helpers ────────────────────────────────────────────────────
  function getHint(type) {
    const hints = {
      text:     t('hintText'),
      number:   t('hintNumber'),
      date:     t('hintDate'),
      select:   t('hintSelect'),
      checkbox: t('hintCheckbox'),
      textarea: t('hintTextarea'),
    };
    return hints[type] || t('hintDefault');
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
});
