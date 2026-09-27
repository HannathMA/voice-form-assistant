/**
 * progress.js — Review & Export page (progress.html)
 * Loads session + form and renders the answers review table.
 */

document.addEventListener('DOMContentLoaded', async () => {
  updateNavLang();
  applyProgressTranslations();

  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('sessionId') || localStorage.getItem('vfa_session_id');
  const formId = localStorage.getItem('vfa_form_id');

  if (!sessionId) {
    showToast('No session found. Please fill a form first.', 'error');
    setTimeout(() => window.location.href = 'dashboard.html', 1500);
    return;
  }

  // ── Load data ────────────────────────────────────────────────────
  let session, form;
  try {
    session = await apiGetSession(sessionId);
    // session.formId may be populated or just an ID string
    const fId = session.formId?._id || session.formId || formId;
    if (session.formId?.fields) {
      form = session.formId; // populated
    } else {
      form = await apiGetForm(fId);
    }
  } catch (err) {
    showToast('Could not load review data: ' + err.message, 'error');
    return;
  }

  const fields = form.fields || [];
  const answers = session.answers || {};

  // ── Header ────────────────────────────────────────────────────────
  document.getElementById('form-title-display').textContent = form.formTitle || 'Form Completed!';

  // ── Stats ─────────────────────────────────────────────────────────
  const answered = fields.filter(f => answers[f.label] && answers[f.label] !== '').length;
  const empty = fields.length - answered;
  const pct = fields.length ? Math.round((answered / fields.length) * 100) : 0;

  document.getElementById('stat-total').textContent = fields.length;
  document.getElementById('stat-answered').textContent = answered;
  document.getElementById('stat-empty').textContent = empty;
  document.getElementById('stat-pct').textContent = pct + '%';

  // ── Completion banner sub-text ────────────────────────────────────
  const sub = document.getElementById('complete-sub');
  if (sub) {
    sub.textContent = empty === 0
      ? (t('completeSub') || 'All fields have been filled successfully.')
      : `${answered} / ${fields.length} ${t('statLabelAnswered') || 'Answered'}. ${empty} ${t('statLabelSkipped') || 'Skipped'}.`;
  }

  // ── Answers table ─────────────────────────────────────────────────
  const tbody = document.getElementById('answers-tbody');
  if (!tbody) return;

  if (!fields.length) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:40px;">No fields found.</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  fields.forEach((field, idx) => {
    const val = answers[field.label];
    const hasAnswer = val !== undefined && val !== '';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="color:var(--text-muted); font-size:0.9rem;">${idx + 1}</td>
      <td class="answer-field-name">
        ${escapeHTML(field.label)}
        ${field.required ? '<span style="color:var(--danger); margin-left:4px;" title="Required">*</span>' : ''}
      </td>
      <td class="${hasAnswer ? 'answer-value' : 'answer-empty'}">
        ${hasAnswer ? formatAnswer(field.type, val) : (t('notAnswered') || '—')}
      </td>
      <td>
        <button class="answer-edit-btn" data-field-idx="${idx}"
          aria-label="Edit answer for ${field.label}">
          ${t('editAnswerBtn') || '✏️ Edit'}
        </button>
      </td>`;
    tbody.appendChild(tr);
  });

  // Edit button → navigate back to that field
  document.querySelectorAll('.answer-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.fieldIdx);
      // Save target field index and navigate
      localStorage.setItem('vfa_jump_field', idx);
      window.location.href = `form.html?formId=${form._id}&sessionId=${sessionId}`;
    });
  });

  // ── Back to form link ─────────────────────────────────────────────
  const backLink = document.getElementById('back-to-form-link');
  if (backLink) {
    backLink.href = `form.html?formId=${form._id}&sessionId=${sessionId}`;
  }

  // ── Start new form ────────────────────────────────────────────────
  document.getElementById('start-new-btn')?.addEventListener('click', () => {
    localStorage.removeItem('vfa_form_id');
    localStorage.removeItem('vfa_session_id');
    window.location.href = 'dashboard.html';
  });

  // ── Helpers ───────────────────────────────────────────────────────
  function formatAnswer(type, value) {
    if (type === 'checkbox') {
      return value === 'true' ? `✅ ${t('yes') || 'Yes'}` : `❌ ${t('no') || 'No'}`;
    }
    return escapeHTML(value);
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
