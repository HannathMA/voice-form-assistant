import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  Volume2,
  Mic,
  Square,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Circle,
  HelpCircle,
  Calendar,
  Hash,
  Type,
  ListFilter,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import {
  speakQuestion,
  stopSpeaking,
  startRecording,
  stopRecording,
  getIsRecording,
} from '../services/voice';

export default function FormWizardView() {
  const {
    language,
    form,
    answers,
    updateAnswer,
    currentFieldIndex,
    setCurrentFieldIndex,
    setActiveStep,
    saveSessionProgress,
    autoSpeak,
    t,
    showToast,
  } = useApp();

  const fields = form?.fields || [];
  const currentField = fields[currentFieldIndex] || null;

  const [voiceStatus, setVoiceStatus] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRec, setIsRec] = useState(false);
  const [localVal, setLocalVal] = useState('');

  const inputRef = useRef(null);
  const timerRef = useRef(null);

  // Sync local input value when field or answers change
  useEffect(() => {
    if (currentField) {
      setLocalVal(answers[currentField.label] || '');
      setVoiceStatus('');
    }
  }, [currentFieldIndex, currentField, answers]);

  // Read question aloud helper
  const handleSpeakQuestion = useCallback(() => {
    if (!currentField) return;
    clearTimeout(timerRef.current);
    stopSpeaking();

    const prefix = t('speakQuestionPrefix');
    const hint = getFieldHint(currentField.type);
    const textToSpeak = `${prefix} ${currentFieldIndex + 1}: ${currentField.label}. ${hint}`;

    setVoiceStatus(t('speakingStatus'));
    setIsSpeaking(true);

    speakQuestion(
      textToSpeak,
      language,
      () => setIsSpeaking(true),
      () => {
        setIsSpeaking(false);
        setVoiceStatus('');
      }
    );
  }, [currentField, currentFieldIndex, language, t]);

  // Auto-read whenever question index changes (if autoSpeak is enabled)
  useEffect(() => {
    if (autoSpeak && currentField) {
      timerRef.current = setTimeout(() => {
        handleSpeakQuestion();
      }, 400);
    }
    return () => {
      clearTimeout(timerRef.current);
      stopSpeaking();
    };
  }, [currentFieldIndex, autoSpeak, handleSpeakQuestion]);

  // Recording toggle handler
  const handleToggleRecord = async () => {
    clearTimeout(timerRef.current);
    stopSpeaking();
    setIsSpeaking(false);

    if (!isRec) {
      // Start recording
      try {
        await startRecording((status) => {
          if (status === 'recording') {
            setIsRec(true);
            setVoiceStatus(t('listeningStatus'));
          }
        });
        setIsRec(true);
        setVoiceStatus(t('listeningStatus'));
      } catch (err) {
        showToast(err.message, 'error');
        setIsRec(false);
        setVoiceStatus('');
      }
    } else {
      // Stop and transcribe
      setIsRec(false);
      setVoiceStatus(t('processingStatus'));

      try {
        const transcript = await stopRecording(language, (status) => {
          if (status === 'processing') setVoiceStatus(t('processSpeech'));
          if (status === 'done') setVoiceStatus('');
        });

        if (transcript && transcript.trim()) {
          applyTranscriptToField(transcript.trim());
          showToast(`Heard: "${transcript}"`, 'success');
          setVoiceStatus(`✅ "${transcript}"`);
        } else {
          setVoiceStatus(t('noHear'));
        }
      } catch (err) {
        setVoiceStatus(t('noHear'));
      }
    }
  };

  // Interpret speech transcript into the current field type
  const applyTranscriptToField = (transcript) => {
    if (!currentField) return;
    const type = currentField.type;

    if (type === 'checkbox') {
      const lower = transcript.toLowerCase();
      const isYes =
        lower.includes('yes') ||
        lower.includes('true') ||
        lower.includes('അതെ') ||
        lower.includes('ഉണ്ട്') ||
        lower.includes('हाँ') ||
        lower.includes('ஆம்') ||
        lower.includes('அవును');
      const val = isYes ? 'true' : 'false';
      setLocalVal(val);
      updateAnswer(currentField.label, val);
      saveSessionProgress(currentFieldIndex, { ...answers, [currentField.label]: val });
    } else if (type === 'select' && currentField.options) {
      // Try to find matching option
      const match = currentField.options.find(
        (opt) =>
          opt.toLowerCase().includes(transcript.toLowerCase()) ||
          transcript.toLowerCase().includes(opt.toLowerCase())
      );
      const val = match || transcript;
      setLocalVal(val);
      updateAnswer(currentField.label, val);
      saveSessionProgress(currentFieldIndex, { ...answers, [currentField.label]: val });
    } else {
      setLocalVal(transcript);
      updateAnswer(currentField.label, transcript);
      saveSessionProgress(currentFieldIndex, { ...answers, [currentField.label]: transcript });
    }
  };

  // Value change from manual typing
  const handleInputChange = (val) => {
    setLocalVal(val);
    if (currentField) {
      updateAnswer(currentField.label, val);
    }
  };

  // Navigation handlers
  const handleNext = async () => {
    stopSpeaking();
    clearTimeout(timerRef.current);

    // Save current field
    const updatedAnswers = { ...answers, [currentField.label]: localVal };
    updateAnswer(currentField.label, localVal);

    if (currentFieldIndex >= fields.length - 1) {
      // Complete!
      await saveSessionProgress(currentFieldIndex, updatedAnswers, 'completed');
      showToast(t('formCompletedToast'), 'success');
      setActiveStep(4);
    } else {
      const nextIndex = currentFieldIndex + 1;
      await saveSessionProgress(nextIndex, updatedAnswers, 'in_progress');
      setCurrentFieldIndex(nextIndex);
    }
  };

  const handlePrev = async () => {
    if (currentFieldIndex <= 0) return;
    stopSpeaking();
    clearTimeout(timerRef.current);

    const updatedAnswers = { ...answers, [currentField.label]: localVal };
    updateAnswer(currentField.label, localVal);

    const prevIndex = currentFieldIndex - 1;
    await saveSessionProgress(prevIndex, updatedAnswers, 'in_progress');
    setCurrentFieldIndex(prevIndex);
  };

  const handleSkip = async () => {
    if (currentFieldIndex >= fields.length - 1) {
      setActiveStep(4);
      return;
    }
    stopSpeaking();
    clearTimeout(timerRef.current);

    const nextIndex = currentFieldIndex + 1;
    await saveSessionProgress(nextIndex, answers, 'in_progress');
    setCurrentFieldIndex(nextIndex);
  };

  const handleJumpToField = async (index) => {
    stopSpeaking();
    clearTimeout(timerRef.current);
    if (currentField) {
      updateAnswer(currentField.label, localVal);
      await saveSessionProgress(index, { ...answers, [currentField.label]: localVal }, 'in_progress');
    }
    setCurrentFieldIndex(index);
  };

  const getFieldHint = (type) => {
    switch (type) {
      case 'text':
        return t('hintText');
      case 'number':
        return t('hintNumber');
      case 'date':
        return t('hintDate');
      case 'select':
        return t('hintSelect');
      case 'checkbox':
        return t('hintCheckbox');
      case 'textarea':
        return t('hintTextarea');
      default:
        return t('hintDefault');
    }
  };

  if (!fields.length) {
    return (
      <div className="empty-wizard-card">
        <p>No fields found in this form.</p>
        <button className="btn-primary" onClick={() => setActiveStep(2)}>
          Upload a Form
        </button>
      </div>
    );
  }

  const progressPct = Math.round(((currentFieldIndex + 1) / fields.length) * 100);
  const isLastField = currentFieldIndex === fields.length - 1;

  return (
    <div className="wizard-layout-container">
      {/* Top Header & Progress */}
      <div className="wizard-top-bar">
        <div className="wizard-title-block">
          <h1 className="wizard-form-title">{form?.formTitle || 'Form'}</h1>
          <span className="wizard-step-badge">
            {t('fieldOf')} {currentFieldIndex + 1} / {fields.length}
          </span>
        </div>

        <div className="wizard-progress-bar-wrapper">
          <div className="wizard-progress-track">
            <div
              className="wizard-progress-fill"
              style={{ width: `${progressPct}%` }}
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
            ></div>
          </div>
          <span className="wizard-progress-pct">{progressPct}%</span>
        </div>
      </div>

      {/* Main Grid: Sidebar + Question Card */}
      <div className="wizard-main-grid">
        {/* Left Sidebar: Field Navigator */}
        <aside className="wizard-sidebar" aria-label={t('allFields')}>
          <div className="wizard-sidebar-header">
            <span className="sidebar-header-title">{t('allFields')}</span>
            <span className="sidebar-count-chip">{fields.length}</span>
          </div>

          <div className="sidebar-fields-list">
            {fields.map((f, idx) => {
              const isCurrent = idx === currentFieldIndex;
              const hasAnswer = answers[f.label] !== undefined && answers[f.label] !== '';
              return (
                <button
                  key={idx}
                  className={`sidebar-field-item ${isCurrent ? 'active' : ''} ${hasAnswer ? 'answered' : ''}`}
                  onClick={() => handleJumpToField(idx)}
                >
                  <span className="sidebar-item-dot">
                    {hasAnswer ? (
                      <CheckCircle size={14} className="text-teal" />
                    ) : (
                      <Circle size={14} />
                    )}
                  </span>
                  <span className="sidebar-item-label">{f.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Area: Interactive Question Card */}
        <main className="wizard-question-col">
          <div className="question-card-box">
            {/* Meta row */}
            <div className="question-meta-row">
              <span className="question-counter-pill">
                {t('questionOf')} {currentFieldIndex + 1}
              </span>
              {currentField.required ? (
                <span className="badge-required">{t('requiredBadge')} *</span>
              ) : (
                <span className="badge-optional">{t('optionalBadge')}</span>
              )}
            </div>

            {/* Question Heading */}
            <h2 className="question-heading-text">{currentField.label}</h2>

            {/* Hint */}
            <p className="question-hint-text">{getFieldHint(currentField.type)}</p>

            {/* Voice Control Buttons */}
            <div className="voice-controls-row">
              {/* Listen button */}
              <button
                type="button"
                className={`voice-action-btn listen-btn ${isSpeaking ? 'active' : ''}`}
                onClick={handleSpeakQuestion}
                aria-label="Listen to question"
              >
                <Volume2 size={18} className={isSpeaking ? 'audio-wave-anim' : ''} />
                <span>{t('listenBtn')}</span>
              </button>

              {/* Record button */}
              <button
                type="button"
                className={`voice-action-btn record-btn ${isRec ? 'recording' : ''}`}
                onClick={handleToggleRecord}
                aria-label={isRec ? t('stopRecBtn') : t('recordBtn')}
              >
                {isRec ? <Square size={16} fill="currentColor" /> : <Mic size={18} />}
                <span>{isRec ? t('stopRecBtn') : t('recordBtn')}</span>
              </button>

              {/* Live status badge */}
              {voiceStatus && (
                <div className="voice-live-status-pill" aria-live="polite">
                  <span className="pulse-ping"></span>
                  <span>{voiceStatus}</span>
                </div>
              )}
            </div>

            {/* Dynamic Input Component */}
            <div className="question-input-wrapper">
              {/* Type: Text, Number, Date */}
              {(currentField.type === 'text' ||
                currentField.type === 'number' ||
                currentField.type === 'date') && (
                <div className="input-group-styled">
                  <div className="input-type-icon">
                    {currentField.type === 'date' && <Calendar size={18} />}
                    {currentField.type === 'number' && <Hash size={18} />}
                    {currentField.type === 'text' && <Type size={18} />}
                  </div>
                  <input
                    ref={inputRef}
                    type={currentField.type}
                    className="styled-form-input"
                    value={localVal}
                    placeholder={currentField.type === 'date' ? '' : t('hintDefault')}
                    onChange={(e) => handleInputChange(e.target.value)}
                    autoFocus
                  />
                </div>
              )}

              {/* Type: Textarea */}
              {currentField.type === 'textarea' && (
                <textarea
                  ref={inputRef}
                  className="styled-form-textarea"
                  rows={4}
                  value={localVal}
                  placeholder={t('hintTextarea')}
                  onChange={(e) => handleInputChange(e.target.value)}
                  autoFocus
                />
              )}

              {/* Type: Select */}
              {currentField.type === 'select' && (
                <div>
                  {currentField.options && currentField.options.length <= 6 ? (
                    <div className="option-tiles-grid" role="group" aria-label={currentField.label}>
                      {currentField.options.map((opt, i) => {
                        const isSelected = localVal === opt;
                        return (
                          <button
                            key={i}
                            type="button"
                            className={`option-tile-btn ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              handleInputChange(opt);
                              saveSessionProgress(currentFieldIndex, {
                                ...answers,
                                [currentField.label]: opt,
                              });
                            }}
                          >
                            <span>{opt}</span>
                            {isSelected && <CheckCircle size={16} className="text-teal" />}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <select
                      className="styled-form-select"
                      value={localVal}
                      onChange={(e) => handleInputChange(e.target.value)}
                    >
                      <option value="">{t('selectPlaceholder')}</option>
                      {currentField.options?.map((opt, i) => (
                        <option key={i} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Type: Checkbox */}
              {currentField.type === 'checkbox' && (
                <label className="checkbox-tile-card">
                  <input
                    type="checkbox"
                    className="styled-checkbox-input"
                    checked={localVal === 'true'}
                    onChange={(e) => handleInputChange(e.target.checked ? 'true' : 'false')}
                  />
                  <div className="checkbox-tile-content">
                    <span className="checkbox-title">{currentField.label}</span>
                    <span className="checkbox-status-text">
                      {localVal === 'true' ? `✅ ${t('yes')}` : `❌ ${t('no')}`}
                    </span>
                  </div>
                </label>
              )}
            </div>

            {/* Wizard Navigation Footer */}
            <div className="wizard-nav-footer">
              <button
                type="button"
                className="nav-btn prev-nav-btn"
                disabled={currentFieldIndex === 0}
                onClick={handlePrev}
              >
                <ArrowLeft size={16} />
                <span>{t('prevBtn')}</span>
              </button>

              <button
                type="button"
                className="nav-btn skip-nav-btn"
                disabled={isLastField}
                onClick={handleSkip}
              >
                <span>{t('skipBtn')}</span>
              </button>

              <button
                type="button"
                className={`nav-btn next-nav-btn ${isLastField ? 'finish-btn' : ''}`}
                onClick={handleNext}
              >
                <span>{isLastField ? t('finishBtn') : t('nextBtn')}</span>
                {!isLastField && <ArrowRight size={16} />}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
