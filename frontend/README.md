# 🎙️ Voice Form Assistant — React Frontend

A modern, accessible, multilingual Single-Page Application (SPA) built with **React 19** and **Vite** for the Voice-Based Form Filling Assistant.

---

## ⚡ Overview

The frontend guides users through filling out any paper or digital form:
1. **Language Selection**: Choose preferred interface and voice language (English, Malayalam, Hindi, Tamil, Telugu).
2. **Form Upload / Template**: Upload an image, choose a built-in template, or generate a form template using AI.
3. **Interactive Voice Wizard**: Form fields are presented one question at a time. The assistant reads each question aloud using TTS, and users can respond via microphone (STT) or typing.
4. **Review & Visual Overlay**: Review answers, view pixel-perfect text overlays on the original form image, generate AI-inpainted filled documents, or export/print to PDF.

---

## 🏗️ Architecture

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx         # Header navigation, language picker, and progress indicator
│   │   ├── HomeView.jsx       # Welcome landing, language selector, and quick start
│   │   ├── UploadView.jsx     # Form image uploader, template cards, and AI generation
│   │   ├── FormWizardView.jsx # Step-by-step voice-guided question & answer wizard
│   │   ├── ReviewView.jsx     # Answers summary table, canvas overlay, and export
│   │   ├── LoadingOverlay.jsx # Interactive loader states
│   │   └── ToastContainer.jsx # Toast alerts and status messages
│   ├── context/
│   │   ├── AppContext.jsx     # Global state (current view, form data, session, voice state)
│   │   └── useApp.js          # Convenient hook for consuming AppContext
│   ├── services/
│   │   ├── api.js             # Centralized HTTP client for backend REST API
│   │   ├── voice.js           # Dual-layer audio engine (Sarvam AI API + Web Speech API fallback)
│   │   └── formOverlay.js     # HTML5 Canvas pixel-perfect form overlay generator
│   ├── i18n/
│   │   └── translations.js    # UI strings for en, ml, hi, ta, te
│   ├── App.jsx                # Main view router and layout
│   ├── App.css                # Styled components and UI theme
│   ├── main.jsx               # React 19 entry point
│   └── index.css              # Global CSS variables and typography tokens
├── public/                    # Static assets (favicons, SVG icons)
├── package.json               # Frontend dependencies & scripts
└── vite.config.js             # Vite build & development proxy configuration
```

---

## 🚀 Getting Started

### Development
From the root workspace directory:
```bash
npm run dev:frontend
```
Or directly inside the `frontend/` directory:
```bash
npm install
npm run dev
```

The Vite dev server starts at `http://localhost:5173` with full Hot Module Replacement (HMR). API calls to `/api` are automatically proxied to the backend running at `http://localhost:5000`.

### Production Build
```bash
npm run build
```
Builds optimized production assets to `frontend/dist`.
