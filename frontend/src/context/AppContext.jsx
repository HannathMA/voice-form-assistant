import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LANGUAGES, TRANSLATIONS, getTranslation } from '../i18n/translations';
import { apiGetForm, apiGetSession, apiUpdateSession } from '../services/api';

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  // ── Language ───────────────────────────────────────────────────
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('vfa_lang') || 'en';
  });

  const setLanguage = useCallback((newLang) => {
    setLanguageState(newLang);
    localStorage.setItem('vfa_lang', newLang);
    const langObj = LANGUAGES.find(l => l.code === newLang);
    if (langObj) {
      localStorage.setItem('vfa_lang_name', langObj.name);
    }
  }, []);

  const currentLangObj = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  const t = useCallback((key) => {
    return getTranslation(language, key);
  }, [language]);

  // ── Active Step / View ─────────────────────────────────────────
  // 1: 'home', 2: 'upload', 3: 'form', 4: 'review'
  const [activeStep, setActiveStep] = useState(1);

  // ── User ID ────────────────────────────────────────────────────
  const [userId] = useState(() => {
    let id = localStorage.getItem('vfa_user_id');
    if (!id) {
      id = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      localStorage.setItem('vfa_user_id', id);
    }
    return id;
  });

  // ── Auto Speak (Voice Question Reading) ────────────────────────
  const [autoSpeak, setAutoSpeakState] = useState(() => {
    return localStorage.getItem('vfa_auto_speak') !== 'false';
  });

  const setAutoSpeak = useCallback((val) => {
    setAutoSpeakState(val);
    localStorage.setItem('vfa_auto_speak', val ? 'true' : 'false');
  }, []);

  // ── Form & Session Data ────────────────────────────────────────
  const [form, setForm] = useState(null);
  const [formId, setFormId] = useState(() => localStorage.getItem('vfa_form_id') || '');
  const [session, setSession] = useState(null);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('vfa_session_id') || '');
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  // ── Toast Notifications ────────────────────────────────────────
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Loading Overlay ────────────────────────────────────────────
  const [loading, setLoading] = useState({ active: false, message: 'Please wait…' });

  const showLoading = useCallback((message = 'Please wait…') => {
    setLoading({ active: true, message });
  }, []);

  const hideLoading = useCallback(() => {
    setLoading(prev => ({ ...prev, active: false }));
  }, []);

  // ── Update Answer locally & on backend ─────────────────────────
  const updateAnswer = useCallback((fieldLabel, val) => {
    setAnswers(prev => {
      const next = { ...prev, [fieldLabel]: val };
      return next;
    });
  }, []);

  const saveSessionProgress = useCallback(async (newIndex, nextAnswers = null, status = 'in_progress') => {
    if (!sessionId) return;
    try {
      const payloadAnswers = nextAnswers !== null ? nextAnswers : answers;
      await apiUpdateSession(sessionId, {
        answers: payloadAnswers,
        currentField: newIndex,
        status,
      });
    } catch (err) {
      console.warn('Auto-save session failed:', err.message);
    }
  }, [sessionId, answers]);

  // ── Jump to specific field in form wizard ──────────────────────
  const jumpToField = useCallback((index) => {
    setCurrentFieldIndex(index);
    setActiveStep(3);
  }, []);

  // ── Start a fresh form ─────────────────────────────────────────
  const resetForm = useCallback(() => {
    localStorage.removeItem('vfa_form_id');
    localStorage.removeItem('vfa_session_id');
    setForm(null);
    setFormId('');
    setSession(null);
    setSessionId('');
    setCurrentFieldIndex(0);
    setAnswers({});
    setActiveStep(2);
  }, []);

  // ── On initial mount: restore session/form from URL params or localStorage ──
  useEffect(() => {
    const initFromStorage = async () => {
      const params = new URLSearchParams(window.location.search);
      const urlFormId = params.get('formId') || params.get('id');
      const urlSessionId = params.get('sessionId');

      const targetFormId = urlFormId || formId;
      const targetSessionId = urlSessionId || sessionId;

      if (targetSessionId) {
        try {
          const sess = await apiGetSession(targetSessionId);
          setSession(sess);
          setSessionId(sess._id);
          localStorage.setItem('vfa_session_id', sess._id);

          const loadedForm = sess.formId?.fields
            ? sess.formId
            : await apiGetForm(sess.formId?._id || sess.formId || targetFormId);

          setForm(loadedForm);
          setFormId(loadedForm._id);
          localStorage.setItem('vfa_form_id', loadedForm._id);

          setAnswers(sess.answers || {});
          setCurrentFieldIndex(sess.currentField || 0);

          if (sess.status === 'completed') {
            setActiveStep(4);
          } else {
            setActiveStep(3);
          }
        } catch (e) {
          console.warn('Could not restore session:', e.message);
        }
      } else if (targetFormId) {
        try {
          const f = await apiGetForm(targetFormId);
          setForm(f);
          setFormId(f._id);
          localStorage.setItem('vfa_form_id', f._id);
          setActiveStep(3);
        } catch (e) {
          console.warn('Could not restore form:', e.message);
        }
      }
    };

    initFromStorage();
  }, []);

  const value = {
    language,
    setLanguage,
    currentLangObj,
    t,
    activeStep,
    setActiveStep,
    userId,
    autoSpeak,
    setAutoSpeak,
    form,
    setForm,
    formId,
    setFormId,
    session,
    setSession,
    sessionId,
    setSessionId,
    currentFieldIndex,
    setCurrentFieldIndex,
    answers,
    setAnswers,
    updateAnswer,
    saveSessionProgress,
    jumpToField,
    resetForm,
    toasts,
    showToast,
    removeToast,
    loading,
    showLoading,
    hideLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export { useApp } from './useApp';
export default AppContext;
