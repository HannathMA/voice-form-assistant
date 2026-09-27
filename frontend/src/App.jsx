import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import UploadView from './components/UploadView';
import FormWizardView from './components/FormWizardView';
import ReviewView from './components/ReviewView';
import ToastContainer from './components/ToastContainer';
import LoadingOverlay from './components/LoadingOverlay';
import './App.css';

function MainContent() {
  const { activeStep } = useApp();

  return (
    <div className="app-shell">
      <Navbar />

      <main className="main-content-area">
        {activeStep === 1 && <HomeView />}
        {activeStep === 2 && <UploadView />}
        {activeStep === 3 && <FormWizardView />}
        {activeStep === 4 && <ReviewView />}
      </main>

      <footer className="app-footer">
        <div className="footer-inner">
          <p className="footer-text">
            🎙️ <strong>VoiceForm AI</strong> — Fill any paper form with your voice in Malayalam, Hindi, Tamil, Telugu & English.
          </p>
          <p className="footer-subtext">
            Powered by Google Gemini Vision AI & Sarvam Voice AI
          </p>
        </div>
      </footer>

      <ToastContainer />
      <LoadingOverlay />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
