import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';
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
} from 'lucide-react';

export default function ReviewView() {
  const { form, answers, jumpToField, setActiveStep, resetForm, t } = useApp();

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
    </div>
  );
}
