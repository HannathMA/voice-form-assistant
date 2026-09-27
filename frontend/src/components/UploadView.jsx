import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { apiUploadForm, apiCreateSession } from '../services/api';
import {
  UploadCloud,
  FileImage,
  Trash2,
  Sparkles,
  CheckCircle2,
  Lightbulb,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';

export default function UploadView() {
  const {
    language,
    currentLangObj,
    setActiveStep,
    userId,
    setForm,
    setFormId,
    setSession,
    setSessionId,
    setCurrentFieldIndex,
    setAnswers,
    t,
    showToast,
    showLoading,
    hideLoading,
  } = useApp();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WebP)', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('File too large. Maximum size is 10 MB.', 'error');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    showToast(t('imgSelected'), 'success');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDetectFields = async () => {
    if (!selectedFile) return;

    showLoading('Gemini Vision AI is analyzing your form… Detecting fields and questions…');
    try {
      const formData = new FormData();
      formData.append('formImage', selectedFile);
      formData.append('userId', userId);
      formData.append('language', language);

      const result = await apiUploadForm(formData);

      setForm({
        _id: result.formId,
        formTitle: result.formTitle,
        fields: result.fields,
        imageUrl: result.imageUrl,
      });
      setFormId(result.formId);
      localStorage.setItem('vfa_form_id', result.formId);

      // Create new session in MongoDB
      const newSession = await apiCreateSession(result.formId, userId);
      setSession(newSession);
      setSessionId(newSession._id);
      localStorage.setItem('vfa_session_id', newSession._id);

      setCurrentFieldIndex(0);
      setAnswers({});

      showToast(`Detected: "${result.formTitle}" (${result.fields.length} fields found)`, 'success');

      // Move smoothly to Step 3 Wizard
      setTimeout(() => {
        setActiveStep(3);
      }, 500);
    } catch (err) {
      showToast(err.message || 'AI detection failed. Please check your network and Gemini API key.', 'error');
    } finally {
      hideLoading();
    }
  };

  const tips = [t('tip1'), t('tip2'), t('tip3'), t('tip4'), t('tip5')];

  return (
    <div className="upload-view-container">
      {/* Header */}
      <div className="view-header-block">
        <span className="section-pill-tag">{t('dashStepLabel')}</span>
        <h1 className="view-main-title">{t('dashTitle')}</h1>
        <p className="view-sub-title">{t('dashSub')}</p>
      </div>

      <div className="upload-layout-grid">
        {/* Left Column: Dropzone & Actions */}
        <div className="upload-main-col">
          {/* Dropzone */}
          <div
            className={`dropzone-card ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden-file-input"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {!selectedFile ? (
              <div className="dropzone-empty-state">
                <div className="dropzone-icon-glow">
                  <UploadCloud size={40} className="text-teal" />
                </div>
                <h2 className="dropzone-title">{t('uploadTitle')}</h2>
                <p className="dropzone-sub">{t('uploadSub')}</p>
                <div className="dropzone-divider">
                  <span>{t('uploadOr')}</span>
                </div>
                <button
                  type="button"
                  className="browse-files-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <FileImage size={18} />
                  <span>{t('browseBtn')}</span>
                </button>
                <p className="dropzone-hint">{t('uploadHint')}</p>
              </div>
            ) : (
              <div className="preview-container" onClick={(e) => e.stopPropagation()}>
                <div className="preview-img-wrapper">
                  <img src={previewUrl} alt="Form preview" className="preview-img-element" />
                  <div className="preview-badge">
                    <CheckCircle2 size={16} className="text-teal" />
                    <span>Ready</span>
                  </div>
                </div>

                <div className="preview-info-row">
                  <div className="preview-meta">
                    <span className="preview-file-name">{selectedFile.name}</span>
                    <span className="preview-file-size">
                      {(selectedFile.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                  <button
                    type="button"
                    className="remove-img-btn"
                    onClick={handleRemoveImage}
                    title={t('removeBtn')}
                  >
                    <Trash2 size={16} />
                    <span>{t('removeBtn')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="detect-action-row">
            <button
              className="detect-btn-primary"
              disabled={!selectedFile}
              onClick={handleDetectFields}
            >
              <Sparkles size={20} className="sparkle-anim" />
              <span>{t('detectBtn')}</span>
              <ChevronRight size={20} />
            </button>
            <p className="detect-note-text">{t('detectNote')}</p>
          </div>
        </div>

        {/* Right Column: Tips & Context */}
        <div className="upload-side-col">
          {/* Current Language Pill Card */}
          <div className="side-card lang-reminder-card">
            <div className="side-card-header">
              <span className="side-card-title">{t('currentLangLabel')}</span>
              <button
                className="change-lang-link-btn"
                onClick={() => setActiveStep(1)}
              >
                <ArrowLeft size={14} />
                <span>{t('changeLang')}</span>
              </button>
            </div>
            <div className="active-lang-badge">
              <span className="lang-flag">{currentLangObj.flag}</span>
              <div>
                <span className="active-lang-native">{currentLangObj.nativeName}</span>
                <span className="active-lang-sub">
                  {t('currentLangNote')} {currentLangObj.name}
                </span>
              </div>
            </div>
          </div>

          {/* Tips Card */}
          <div className="side-card tips-card">
            <div className="tips-card-header">
              <Lightbulb size={20} className="text-amber" />
              <h2 className="tips-card-title">{t('tipsTitle')}</h2>
            </div>
            <ul className="tips-list">
              {tips.map((tip, idx) => (
                <li key={idx} className="tip-list-item">
                  <span className="tip-index">{idx + 1}</span>
                  <span className="tip-text">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
