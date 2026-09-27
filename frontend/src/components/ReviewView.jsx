import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';
import { apiGenerateFilledForm } from '../services/api';
import { generateExactFilledFormImage } from '../services/formOverlay';
import {
  CheckCircle2,
  AlertCircle,
  Edit3,
  Printer,
  PlusCircle,
  ArrowLeft,
  Award,
  Layers,
  Sparkles,
  Download,
  Maximize2,
  X,
  Loader2,
  FileCheck2,
  RotateCw,
  Zap,
} from 'lucide-react';

export default function ReviewView() {
  const { form, answers, jumpToField, setActiveStep, resetForm, t, showToast } = useApp();

  const [activeMode, setActiveMode] = useState('openai'); // 'openai' | 'instant'
  const [aiImage, setAiImage] = useState(null);
  const [instantImage, setInstantImage] = useState(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isGeneratingInstant, setIsGeneratingInstant] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const autoFilledRef = useRef(false);
  const fields = form?.fields || [];

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00d4aa', '#3b82f6', '#a855f7', '#fbbf24'],
      });
    } catch {}
  }, []);

  const answeredCount = fields.filter(
    (f) => answers[f.label] !== undefined && answers[f.label] !== ''
  ).length;
  const skippedCount = fields.length - answeredCount;
  const completionPct = fields.length
    ? Math.round((answeredCount / fields.length) * 100)
    : 0;

  // Generate original filled form using OpenAI API
  const handleGenerateWithOpenAI = useCallback(async () => {
    setIsGeneratingAi(true);
    try {
      showToast('Generating filled form with OpenAI using your uploaded form…', 'info');
      const imgSrc = form?.imageUrl || localStorage.getItem('vfa_form_img') || '';
      const base64 = form?.imageDataUrl || localStorage.getItem('vfa_form_base64') || '';

      const result = await apiGenerateFilledForm({
        formTitle: form?.formTitle || 'Official Form',
        answers,
        fields,
        imageUrl: imgSrc,
        imageBase64: base64,
        formId: form?._id || '',
      });

      if (result && (result.dataUrl || result.imageUrl)) {
        setAiImage(result);
        setActiveMode('openai');
        showToast('✨ Original filled form generated with OpenAI!', 'success');
      } else {
        throw new Error('No image returned by OpenAI');
      }
    } catch (err) {
      console.error('OpenAI filled form error:', err);
      showToast(err.message || 'OpenAI generation failed. Switching to instant view…', 'error');
      // If OpenAI call fails, generate instant overlay as backup
      handleGenerateInstant();
    } finally {
      setIsGeneratingAi(false);
    }
  }, [form, answers, fields, showToast]);

  // Generate Instant Client-side Overlay as fast fallback
  const handleGenerateInstant = useCallback(async () => {
    const imgSrc = form?.imageUrl || localStorage.getItem('vfa_form_img');
    if (!imgSrc) return;

    setIsGeneratingInstant(true);
    try {
      const result = await generateExactFilledFormImage({
        formImageSrc: imgSrc,
        fields,
        answers,
      });
      setInstantImage(result);
      setActiveMode('instant');
      showToast('⚡ Instant form filled with your data!', 'success');
    } catch (err) {
      console.warn('Instant fill error:', err.message);
    } finally {
      setIsGeneratingInstant(false);
    }
  }, [form?.imageUrl, fields, answers, showToast]);

  // Auto-generate using OpenAI when arriving at Review screen with answers
  useEffect(() => {
    if (!autoFilledRef.current && answeredCount > 0) {
      autoFilledRef.current = true;
      handleGenerateWithOpenAI();
    }
  }, [answeredCount, handleGenerateWithOpenAI]);

  const currentDisplayImage = activeMode === 'openai' ? aiImage : instantImage;
  const currentImgUrl = currentDisplayImage?.dataUrl || currentDisplayImage?.imageUrl;

  const handleDownload = () => {
    if (!currentImgUrl) return;
    const link = document.createElement('a');
    link.href = currentImgUrl;
    const modeTag = activeMode === 'openai' ? 'openai-filled' : 'instant-filled';
    const formName = (form?.formTitle || 'form').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `${formName}-${modeTag}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Download started!', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDisplayAnswer = (type, val) => {
    if (val === undefined || val === '') {
      return <span className="text-muted-italic">{t('emptyAnswer')}</span>;
    }
    if (type === 'checkbox') {
      return val === 'true' ? (
        <span className="badge-ans-yes">✅ {t('yes')}</span>
      ) : (
        <span className="badge-ans-no">❌ {t('no')}</span>
      );
    }
    return <span className="ans-text">{val}</span>;
  };

  return (
    <div className="review-view-container">
      {/* Celebration Header */}
      <div className="review-celebration-card">
        <div className="celebration-badge-glow">
          <Award size={36} className="text-teal" />
        </div>
        <div className="celebration-content">
          <span className="section-pill-tag">{t('progressStepLabel')}</span>
          <h1 className="celebration-title">{form?.formTitle || t('progressTitle')}</h1>
          <p className="celebration-sub">
            {skippedCount === 0
              ? t('completeSub')
              : `${answeredCount} / ${fields.length} ${t('statLabelAnswered')}. ${skippedCount} ${t('statLabelSkipped')}.`}
          </p>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="review-stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">{t('statLabelTotal')}</span>
            <Layers size={18} className="text-teal" />
          </div>
          <span className="stat-card-value">{fields.length}</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">{t('statLabelAnswered')}</span>
            <CheckCircle2 size={18} className="text-emerald" />
          </div>
          <span className="stat-card-value text-emerald">{answeredCount}</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">{t('statLabelSkipped')}</span>
            <AlertCircle size={18} className="text-amber" />
          </div>
          <span className="stat-card-value text-amber">{skippedCount}</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">{t('statLabelComplete')}</span>
            <Sparkles size={18} className="text-teal" />
          </div>
          <span className="stat-card-value text-teal">{completionPct}%</span>
        </div>
      </div>

      {/* OpenAI Original Filled Form Section */}
      <div className="filled-form-card">
        <div className="filled-form-card-header">
          <div className="filled-form-icon-wrap">
            <FileCheck2 size={24} className="text-teal" />
          </div>
          <div style={{ flex: 1 }}>
            <div className="filled-form-badge-row">
              <h2 className="filled-form-title">Original Filled Form Document</h2>
              <span className="ai-model-tag">
                {activeMode === 'openai' ? 'OpenAI gpt-image-1-mini' : 'Instant Overlay'}
              </span>
            </div>
            <p className="filled-form-desc">
              Your original uploaded form filled with your entered data using the OpenAI API key.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="form-preview-tabs" style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={`view-fullscreen-btn ${activeMode === 'openai' ? 'active-tab-glow' : ''}`}
              onClick={() => {
                setActiveMode('openai');
                if (!aiImage) handleGenerateWithOpenAI();
              }}
              style={{
                borderColor: activeMode === 'openai' ? 'var(--accent)' : 'var(--border-light)',
                background: activeMode === 'openai' ? 'var(--accent-light)' : 'rgba(255,255,255,0.05)',
                color: activeMode === 'openai' ? 'var(--accent)' : 'var(--text-secondary)',
              }}
            >
              <Sparkles size={14} />
              <span>OpenAI Filled Form</span>
            </button>

            <button
              type="button"
              className={`view-fullscreen-btn ${activeMode === 'instant' ? 'active-tab-glow' : ''}`}
              onClick={() => {
                setActiveMode('instant');
                if (!instantImage) handleGenerateInstant();
              }}
              style={{
                borderColor: activeMode === 'instant' ? 'var(--accent)' : 'var(--border-light)',
                background: activeMode === 'instant' ? 'var(--accent-light)' : 'rgba(255,255,255,0.05)',
                color: activeMode === 'instant' ? 'var(--accent)' : 'var(--text-secondary)',
              }}
            >
              <Zap size={14} />
              <span>Instant View</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {(isGeneratingAi || isGeneratingInstant) && (
          <div className="filled-form-loading-state">
            <Loader2 size={36} className="spin-anim text-teal" />
            <div className="loading-state-text">
              <div className="loading-title">
                {isGeneratingAi
                  ? 'OpenAI is filling your original uploaded form…'
                  : 'Overlaying answers onto your original form…'}
              </div>
              <div className="loading-sub">
                Writing your {answeredCount} answers in blue ink into the designated boxes. Please wait ~10–15 seconds.
              </div>
            </div>
          </div>
        )}

        {/* Empty State when no image is ready */}
        {!currentDisplayImage && !isGeneratingAi && !isGeneratingInstant && (
          <div className="filled-form-empty-state">
            <div className="empty-state-copy">
              <span className="empty-state-headline">Generate your filled form using OpenAI</span>
              <p className="empty-state-sub">
                Fills your {answeredCount} entered details directly into your original uploaded form using the OpenAI API key.
              </p>
            </div>
            <button
              type="button"
              className="generate-filled-btn"
              onClick={handleGenerateWithOpenAI}
            >
              <Sparkles size={18} />
              <span>Generate Filled Form with OpenAI</span>
            </button>
          </div>
        )}

        {/* Preview State when Image is ready */}
        {currentDisplayImage && !isGeneratingAi && !isGeneratingInstant && (
          <div className="filled-form-preview-grid">
            <div
              className="filled-form-thumb-wrapper"
              onClick={() => setIsModalOpen(true)}
              title="Click to view full size"
            >
              <img
                src={currentImgUrl}
                alt="Filled Form Document"
                className="filled-form-thumb-img"
              />
              <div className="thumb-zoom-overlay">
                <Maximize2 size={24} />
                <span>Click to Expand Fullscreen</span>
              </div>
            </div>

            <div className="filled-form-info-panel">
              <div className="filled-status-badge">
                <CheckCircle2 size={16} className="text-emerald" />
                <span>
                  {activeMode === 'openai'
                    ? 'Original Form Filled by OpenAI'
                    : 'Original Form Filled (Instant)'}
                </span>
              </div>
              <h3 className="filled-doc-title">{form?.formTitle || 'Filled Form Document'}</h3>
              <p className="filled-doc-meta">
                {activeMode === 'openai'
                  ? `Your original uploaded form filled by OpenAI (gpt-image-1-mini) with ${currentDisplayImage.entriesCount || answeredCount} answers written inside the designated boxes in clear blue pen ink.`
                  : `Your original uploaded form with ${currentDisplayImage.filledCount || answeredCount} answers written inside the designated boxes in clear blue pen ink.`}
              </p>

              <div className="filled-actions-col">
                <button
                  type="button"
                  className="download-filled-btn"
                  onClick={handleDownload}
                >
                  <Download size={18} />
                  <span>Download Filled Form (PNG)</span>
                </button>

                <div className="secondary-actions-row">
                  <button
                    type="button"
                    className="view-fullscreen-btn"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <Maximize2 size={16} />
                    <span>View Fullscreen</span>
                  </button>

                  <button
                    type="button"
                    className="regenerate-filled-btn"
                    onClick={handleGenerateWithOpenAI}
                  >
                    <RotateCw size={16} />
                    <span>Regenerate with OpenAI</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Answers Table */}
      <div className="review-table-card">
        <div className="table-card-header">
          <h2 className="table-card-title">{t('answersTitle')}</h2>
          <button
            type="button"
            className="return-wizard-link"
            onClick={() => setActiveStep(3)}
          >
            <ArrowLeft size={16} />
            <span>{t('editAnswersLink')}</span>
          </button>
        </div>

        <div className="table-responsive-wrapper">
          <table className="review-data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>{t('thIndex')}</th>
                <th>{t('thField')}</th>
                <th>{t('thAnswer')}</th>
                <th style={{ width: '120px', textAlign: 'center' }}>{t('thEdit')}</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((f, idx) => {
                const val = answers[f.label];
                return (
                  <tr key={idx} className="review-table-row">
                    <td className="row-index-cell">{idx + 1}</td>
                    <td className="row-field-cell">
                      <span className="field-name-text">{f.label}</span>
                      {f.required && <span className="text-rose font-bold ml-1">*</span>}
                    </td>
                    <td className="row-answer-cell">
                      {formatDisplayAnswer(f.type, val)}
                    </td>
                    <td className="row-action-cell" style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="edit-field-btn"
                        onClick={() => jumpToField(idx)}
                        title={`Edit ${f.label}`}
                      >
                        <Edit3 size={14} />
                        <span>{t('editAnswerBtn')}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="review-actions-toolbar">
        <button type="button" className="btn-secondary" onClick={handlePrint}>
          <Printer size={18} />
          <span>{t('printBtn')}</span>
        </button>

        <button type="button" className="btn-primary" onClick={resetForm}>
          <PlusCircle size={18} />
          <span>{t('newFormBtn')}</span>
        </button>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isModalOpen && currentImgUrl && (
        <div className="image-lightbox-modal" onClick={() => setIsModalOpen(false)}>
          <div className="lightbox-content-box" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-top-bar">
              <span className="lightbox-title">
                {form?.formTitle || 'Filled Form Document'}
                <span style={{ fontSize: '0.8rem', color: '#a5b4fc', marginLeft: '10px' }}>
                  ({activeMode === 'openai' ? 'OpenAI Filled Form' : 'Instant View'})
                </span>
              </span>
              <div className="lightbox-btns">
                <button
                  type="button"
                  className="lightbox-action-btn"
                  onClick={handleDownload}
                  title="Download Image"
                >
                  <Download size={18} />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  className="lightbox-close-btn"
                  onClick={() => setIsModalOpen(false)}
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="lightbox-image-scroll">
              <img
                src={currentImgUrl}
                alt="Filled Form High Resolution"
                className="lightbox-full-img"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
