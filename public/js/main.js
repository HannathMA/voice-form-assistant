/**
 * main.js — Home page (index.html)
 * Handles language selection and "Get Started" navigation.
 * Translations are provided by i18n.js (PAGE_STRINGS / t()).
 */

/** Apply translated strings to the home page UI */
function applyTranslations(lang) {
  const s = PAGE_STRINGS[lang] || PAGE_STRINGS.en;

  const badge = document.querySelector('.hero-badge');
  if (badge) badge.innerHTML = s.heroBadge;

  const title = document.querySelector('.hero-title');
  if (title) title.innerHTML = s.heroTitle;

  const subtitle = document.querySelector('.hero-subtitle');
  if (subtitle) subtitle.textContent = s.heroSubtitle;

  const sectionLabel = document.querySelector('.lang-section .section-label');
  if (sectionLabel) sectionLabel.textContent = s.langSectionLabel;

  const sectionTitle = document.getElementById('lang-heading');
  if (sectionTitle) sectionTitle.textContent = s.langSectionTitle;

  const sectionSub = document.querySelector('.lang-section .section-sub');
  if (sectionSub) sectionSub.textContent = s.langSectionSub;

  const ctaBtn = document.getElementById('get-started-btn');
  if (ctaBtn) ctaBtn.textContent = s.ctaBtn;

  const ctaNote = document.querySelector('.cta-section p');
  if (ctaNote) ctaNote.textContent = s.ctaNote;

  const featureItems = document.querySelectorAll('.feature-item');
  const featTexts = [s.feat1, s.feat2, s.feat3, s.feat4, s.feat5];
  featureItems.forEach((el, i) => {
    const icon = el.querySelector('.feature-icon');
    if (icon && featTexts[i]) {
      el.innerHTML = '';
      el.appendChild(icon);
      el.append(' ' + featTexts[i]);
    }
  });
}

// ── Page init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = getLang();
  updateNavLang();
  applyTranslations(savedLang);

  const langCards = document.querySelectorAll('.lang-card');
  const langReminder = document.getElementById('lang-reminder');
  const savedName = getLangName();

  // Restore previously selected language card
  langCards.forEach(card => {
    if (card.dataset.lang === savedLang) {
      card.classList.add('active');
      card.setAttribute('aria-pressed', 'true');
    } else {
      card.classList.remove('active');
      card.setAttribute('aria-pressed', 'false');
    }
  });

  if (langReminder) langReminder.textContent = savedName;

  // Language card click
  langCards.forEach(card => {
    card.addEventListener('click', () => {
      langCards.forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      card.classList.add('active');
      card.setAttribute('aria-pressed', 'true');

      const lang = card.dataset.lang;
      const name = card.dataset.name;
      localStorage.setItem('vfa_lang', lang);
      localStorage.setItem('vfa_lang_name', name);
      updateNavLang();
      applyTranslations(lang);
      if (langReminder) langReminder.textContent = name;
      const s = PAGE_STRINGS[lang] || PAGE_STRINGS.en;
      showToast(`${s.toastLang} ${name}`, 'success');
    });

    // Keyboard accessibility
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });
  });

  // Get Started → dashboard
  const getStartedBtn = document.getElementById('get-started-btn');
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', () => {
      window.location.href = 'dashboard.html';
    });
  }
});
