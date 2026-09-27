import React from 'react';
import { useApp } from '../context/AppContext';
import { LANGUAGES } from '../i18n/translations';
import {
  Mic,
  FileScan,
  Sparkles,
  BookmarkCheck,
  Printer,
  ArrowRight,
  Languages,
  CheckCircle2,
} from 'lucide-react';
import { speakGuidance } from '../services/voice';

export default function HomeView() {
  const { language, setLanguage, setActiveStep, t, showToast } = useApp();

  const handleLanguageSelect = (langCode, langName) => {
    setLanguage(langCode);
    const toastPrefix = t('toastLang');
    showToast(`${toastPrefix} ${langName}`, 'success');

    // Quick audio confirmation greeting in selected language
    const greetings = {
      en: 'Welcome! Let’s fill your form.',
      ml: 'സ്വാഗതം! നമുക്ക് ഫോം പൂരിപ്പിക്കാം.',
      hi: 'नमस्ते! आइए आपका फ़ॉर्म भरें।',
      ta: 'வணக்கம்! உங்கள் படிவத்தை நிரப்புவோம்.',
      te: 'స్వాగతం! మీ ఫారమ్‌ను నింపుదాం.',
    };
    if (greetings[langCode]) {
      speakGuidance(greetings[langCode], langCode);
    }
  };

  const featureCards = [
    {
      icon: <Mic className="feat-card-icon" size={24} />,
      title: t('feat1'),
      desc: 'Speak naturally in Malayalam, Hindi, Tamil, Telugu or English.',
    },
    {
      icon: <FileScan className="feat-card-icon" size={24} />,
      title: t('feat2'),
      desc: 'Bank vouchers, admission forms, affidavits or applications.',
    },
    {
      icon: <Sparkles className="feat-card-icon" size={24} />,
      title: t('feat3'),
      desc: 'Gemini Vision AI reads and structures all fields automatically.',
    },
    {
      icon: <BookmarkCheck className="feat-card-icon" size={24} />,
      title: t('feat4'),
      desc: 'Your answers auto-save securely as you answer each question.',
    },
    {
      icon: <Printer className="feat-card-icon" size={24} />,
      title: t('feat5'),
      desc: 'Review everything in a clean table and export to print/PDF.',
    },
  ];

  return (
    <div className="home-view-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <Sparkles size={16} className="hero-badge-icon" />
          <span>{t('heroBadge')}</span>
        </div>

        <h1 className="hero-title">
          {t('heroTitle').replace('Voice', '')}
          <span className="hero-gradient-text">
            {language === 'en' ? 'Voice' : ''}
          </span>
        </h1>

        <p className="hero-subtitle">{t('heroSubtitle')}</p>

        {/* Feature Pills Grid */}
        <div className="feature-grid">
          {featureCards.map((feat, idx) => (
            <div key={idx} className="feature-card">
              <div className="feature-icon-container">{feat.icon}</div>
              <div className="feature-text-block">
                <h2 className="feature-title">{feat.title}</h2>
                <p className="feature-desc">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Step 1 Language Section */}
      <section className="language-selector-section" aria-labelledby="lang-section-title">
        <div className="section-header-block">
          <span className="section-pill-tag">{t('langSectionLabel')}</span>
          <h2 id="lang-section-title" className="section-main-heading">
            {t('langSectionTitle')}
          </h2>
          <p className="section-sub-heading">{t('langSectionSub')}</p>
        </div>

        <div className="lang-cards-grid" role="radiogroup" aria-label="Language options">
          {LANGUAGES.map((item) => {
            const isSelected = language === item.code;
            return (
              <div
                key={item.code}
                className={`lang-option-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleLanguageSelect(item.code, item.name)}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleLanguageSelect(item.code, item.name);
                  }
                }}
              >
                <div className="lang-card-top">
                  <span className="lang-card-flag">{item.flag}</span>
                  {isSelected && (
                    <span className="lang-card-check">
                      <CheckCircle2 size={18} className="text-teal" />
                    </span>
                  )}
                </div>

                <div className="lang-card-body">
                  <span className="lang-card-native">{item.nativeName}</span>
                  <span className="lang-card-english">{item.name}</span>
                </div>

                <div className="lang-card-glow-bg"></div>
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="hero-cta-wrapper">
          <button
            className="hero-cta-button"
            onClick={() => setActiveStep(2)}
            aria-label="Get Started and Upload Form"
          >
            <span>{t('ctaBtn')}</span>
            <ArrowRight size={20} className="cta-arrow" />
          </button>
          <p className="hero-cta-subtext">{t('ctaNote')}</p>
        </div>
      </section>
    </div>
  );
}
