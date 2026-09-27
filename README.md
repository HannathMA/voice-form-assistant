# 🎙️ Voice-Based Form Filling Assistant

> **AI-powered voice assistant that turns paper forms into filled digital documents using voice in Indian languages & English.**

Fill any paper or digital form effortlessly using your voice — supporting **Malayalam, Hindi, Tamil, Telugu, and English**. Upload a photo or PDF of a form, let AI detect and translate every field, answer questions naturally with voice or keyboard, and export a pixel-perfect filled document.

---

## ⚡ Key Features

- ⚛️ **Modern React 19 Frontend**: Built with **React 19**, **Vite**, **Lucide Icons**, and responsive desktop/laptop UI architecture.
- 📸 **Vision AI Field Extraction**: Detects form fields, labels, input types, and coordinate bounding boxes using **Google Gemini Vision AI**.
- 🗣️ **Multilingual Dual-Layer Voice Engine**:
  - High-accuracy Text-to-Speech (TTS) & Speech-to-Text (STT) via **Sarvam AI** for Indian languages.
  - Seamless automatic browser **Web Speech API** fallback if no API key is present.
- 🎨 **Visual Form Overlay & AI Inpainting**:
  - Live pixel-perfect text placement directly over the original uploaded form canvas.
  - AI-assisted filled form generation powered by **OpenAI Image Generation (`gpt-image-1-mini`)**.
- 💾 **State Persistence**: Real-time progress auto-saving with **MongoDB** and session resumption.
- 🖨️ **Review & Export**: Interactive review table, inline editing for corrections, and instant Print / PDF export.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Lucide React, Canvas Confetti, Vanilla CSS Tokens |
| **Backend** | Node.js, Express 4, Mongoose, Multer (Memory Storage) |
| **AI / ML** | Google Gemini Vision (1.5 Flash), Sarvam AI (Speech), OpenAI (Image Gen) |
| **Database** | MongoDB / MongoDB Atlas |
| **Deployment** | Vercel (Native Serverless Functions & Static SPA Hosting) |

---

## 🚀 Quick Start

### 1. Prerequisites
- [Node.js 18+](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/try/download/community) locally **or** a free [MongoDB Atlas](https://cloud.mongodb.com/) cluster

### 2. Clone & Install Dependencies
Clone the repository and install dependencies from the root directory (npm workspaces handles both root, backend, and React frontend):

```bash
git clone https://github.com/HannathMA/voice-form-assistant.git
cd voice-form-assistant
npm install
```

### 3. Configure Environment Variables
Copy the example environment file for the backend:

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and provide your keys:

```env
# Google Gemini API (Field Detection)
GEMINI_API_KEY=your_gemini_api_key_here

# Sarvam AI API (Indian Language TTS & STT)
SARVAM_API_KEY=your_sarvam_api_key_here

# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/voice-form-assistant

# OpenAI API Key (Optional: Filled Form Inpainting / Generation)
OPENAI_API_KEY=your_openai_key_here

# Express Server Port
PORT=5000
```

*(Optional)* If you run the frontend independently against a remote backend, configure `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

### 4. Start Development Servers

Run both the Express backend and the Vite React frontend:

```bash
# Terminal 1: Start Express backend (port 5000)
npm run dev:backend

# Terminal 2: Start React frontend with Vite HMR (port 5173)
npm run dev:frontend
```

Open **`http://localhost:5173`** in your browser to start using the app.

---

## 📦 Production Build & Deployment

To build the React application for production:

```bash
# Builds frontend with Vite and copies distribution assets to public/
npm run build

# Start the unified Express production server
npm start
```

### Deploying to Vercel
The repository is pre-configured for zero-config Vercel deployment:
- `vercel.json` routes `/api/*` to the Express serverless function in `api/index.js`.
- The static React SPA is served directly from `public/`.
- Just set your environment variables (`GEMINI_API_KEY`, `SARVAM_API_KEY`, `MONGODB_URI`, `OPENAI_API_KEY`) in your Vercel Project Settings.

---

## 📂 Project Structure

```
voice-form-assistant/
├── frontend/                     ← Modern React SPA (Vite + React 19)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        ← Navigation, language picker, progress bar
│   │   │   ├── HomeView.jsx      ← Hero landing, language selection
│   │   │   ├── UploadView.jsx    ← Form image upload, sample templates, AI gen prompt
│   │   │   ├── FormWizardView.jsx← One-by-one voice/text form field filling wizard
│   │   │   ├── ReviewView.jsx    ← Answers table, form overlay, print & export
│   │   │   ├── LoadingOverlay.jsx← Processing indicators
│   │   │   └── ToastContainer.jsx← Notifications & toast alerts
│   │   ├── context/
│   │   │   ├── AppContext.jsx    ← Central state (active view, form data, answers)
│   │   │   └── useApp.js         ← Custom hook for app context
│   │   ├── services/
│   │   │   ├── api.js            ← Unified backend API requests
│   │   │   ├── voice.js          ← Sarvam AI + Web Speech API dual-layer engine
│   │   │   └── formOverlay.js    ← Pixel-perfect canvas overlay renderer
│   │   ├── i18n/
│   │   │   └── translations.js   ← Localized strings (en, ml, hi, ta, te)
│   │   ├── App.jsx & App.css     ← View router and styled UI system
│   │   └── main.jsx & index.css  ← React DOM root & design tokens
│   ├── dist/                     ← Compiled production bundle
│   ├── vite.config.js            ← Vite config with API proxy
│   └── package.json              ← React dependencies
│
├── backend/
│   ├── server.js                 ← Express entry point & static SPA fallback
│   ├── config/db.js              ← MongoDB connection logic
│   ├── models/                   ← Mongoose schemas (Form, Session, User)
│   ├── routes/
│   │   ├── formRoutes.js         ← /api/forms (upload, detect, templates, filled-image)
│   │   ├── sessionRoutes.js      ← /api/sessions (save, resume progress)
│   │   └── voiceRoutes.js        ← /api/voice (TTS audio synthesis & STT transcription)
│   ├── controllers/
│   │   ├── formController.js     ← Form management and image generation
│   │   ├── sessionController.js  ← Session persistence
│   │   └── voiceController.js    ← Speech processing
│   ├── services/
│   │   ├── geminiService.js      ← Gemini Vision prompt & field parsing
│   │   ├── sarvamService.js      ← Sarvam REST API integration
│   │   └── imageGenService.js    ← OpenAI image generation and inpainting
│   └── middleware/
│       └── uploadMiddleware.js   ← Multer memory storage (serverless compatible)
│
├── api/
│   └── index.js                  ← Vercel serverless entry point
├── public/                       ← Production distribution served by Vercel & Express
├── vercel.json                   ← Serverless rewrite configuration
└── package.json                  ← Root npm workspace & build scripts
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/forms/upload` | Upload form image and detect fields with Gemini Vision |
| `GET` | `/api/forms/:id` | Retrieve saved form structure and fields |
| `GET` | `/api/forms/templates` | List pre-configured demo form templates |
| `POST` | `/api/forms/generate-image` | Generate a synthetic form template with OpenAI |
| `POST` | `/api/forms/generate-filled-form` | Generate filled form image with user answers |
| `POST` | `/api/sessions` | Create a new form-filling session |
| `PUT` | `/api/sessions/:id` | Update and auto-save filled answers |
| `GET` | `/api/sessions/:id` | Retrieve existing session to resume |
| `POST` | `/api/voice/text-to-speech` | Synthesize speech audio in selected Indian language |
| `POST` | `/api/voice/speech-to-text` | Transcribe voice recording into text |

---

## 🌐 Supported Languages

| Code | Language | Native Name | TTS / STT Support |
|---|---|---|---|
| `en` | English | English | ✅ Sarvam AI & Web Speech |
| `ml` | Malayalam | മലയാളം | ✅ Sarvam AI & Web Speech |
| `hi` | Hindi | हिन्दी | ✅ Sarvam AI & Web Speech |
| `ta` | Tamil | தமிழ் | ✅ Sarvam AI & Web Speech |
| `te` | Telugu | తెలుగు | ✅ Sarvam AI & Web Speech |

---

## 🛡️ License

MIT License. Contributions and feedback are welcome!
