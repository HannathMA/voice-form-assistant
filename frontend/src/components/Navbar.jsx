import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LANGUAGES } from '../i18n/translations';
import { Mic, Volume2, VolumeX, HelpCircle, Globe, ChevronDown, Check } from 'lucide-react';
import { speakGuidance, stopSpeaking } from '../services/voice';

export default function Navbar() {
  const {
    language,
    setLanguage,
    currentLangObj,
    activeStep,
    setActiveStep,
    autoSpeak,
    setAutoSpeak,
    t,
    showToast,
    form,
  } = useApp();

  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const handleVoiceHelp = async () => {
    stopSpeaking();
    const helpMsg = t('voiceHelpText');
    showToast(helpMsg, 'info');
    await speakGuidance(helpMsg, language);
  };

  const steps = [
    { num: 1, label: 'Language', available: true },
    { num: 2, label: 'Upload', available: true },
    { num: 3, label: 'Fill Form', available: !!form },
    { num: 4, label: 'Review', available: !!form },
  ];

  return (
    <header className="navbar-root">
      <div className="navbar-container">
        {/* Brand */}
        <div className="navbar-brand" onClick={() => setActiveStep(1)} role="button" tabIndex={0}>
          <div className="brand-icon-wrapper">
            <Mic className="brand-mic-icon" size={20} />
            <span className="brand-pulse-dot"></span>
          </div>
          <div className="brand-text">
            <span className="brand-title">VoiceForm<span className="brand-highlight">AI</span></span>
          </div>
        </div>

        {/* Step Indicator */}
        <nav className="navbar-stepper" aria-label="Wizard Steps">
          {steps.map((st, i) => (
            <React.Fragment key={st.num}>
              {i > 0 && <span className={`step-divider ${activeStep >= st.num ? 'active' : ''}`} />}
              <button
                className={`step-btn ${activeStep === st.num ? 'current' : ''} ${activeStep > st.num ? 'completed' : ''}`}
                onClick={() => st.available && setActiveStep(st.num)}
                disabled={!st.available}
                aria-current={activeStep === st.num ? 'step' : undefined}
              >
                <span className="step-num">{st.num}</span>
                <span className="step-name">{st.label}</span>
              </button>
            </React.Fragment>
          ))}
        </nav>

        {/* Actions */}
        <div className="navbar-actions">
          {/* Auto-read Toggle */}
          <button
            className={`action-pill-btn ${autoSpeak ? 'active' : ''}`}
            onClick={() => {
              const next = !autoSpeak;
              setAutoSpeak(next);
              if (!next) stopSpeaking();
              showToast(next ? t('autoReadOn') : t('autoReadOff'), 'info');
            }}
            title={autoSpeak ? t('autoReadOn') : t('autoReadOff')}
            aria-label="Toggle Auto Read Aloud"
          >
            {autoSpeak ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span className="btn-text-responsive">{autoSpeak ? 'Auto: ON' : 'Auto: OFF'}</span>
          </button>

          {/* Voice Help */}
          <button
            className="action-pill-btn voice-help-pill"
            onClick={handleVoiceHelp}
            title={t('voiceHelpBtn')}
            aria-label={t('voiceHelpBtn')}
          >
            <HelpCircle size={16} />
            <span className="btn-text-responsive">{t('voiceHelpBtn')}</span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="lang-dropdown-wrapper">
            <button
              className="lang-select-pill"
              onClick={() => setLangMenuOpen(prev => !prev)}
              aria-expanded={langMenuOpen}
              aria-haspopup="listbox"
            >
              <Globe size={16} className="text-teal" />
              <span className="lang-pill-name">{currentLangObj.nativeName}</span>
              <ChevronDown size={14} className={`chevron-icon ${langMenuOpen ? 'open' : ''}`} />
            </button>

            {langMenuOpen && (
              <div className="lang-menu-dropdown" role="listbox">
                {LANGUAGES.map((item) => (
                  <button
                    key={item.code}
                    className={`lang-menu-item ${language === item.code ? 'selected' : ''}`}
                    onClick={() => {
                      setLanguage(item.code);
                      setLangMenuOpen(false);
                      showToast(`${t('toastLang')} ${item.name}`, 'success');
                    }}
                    role="option"
                    aria-selected={language === item.code}
                  >
                    <span className="lang-item-flag">{item.flag}</span>
                    <div className="lang-item-labels">
                      <span className="lang-item-native">{item.nativeName}</span>
                      <span className="lang-item-eng">{item.name}</span>
                    </div>
                    {language === item.code && <Check size={16} className="text-teal ml-auto" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
