# 🎙️ Voice-Based Form Filling Assistant

Fill any paper form using your voice — in Malayalam, Hindi, Tamil, Telugu, or English.
Upload a photo, let AI detect the fields, then answer each question by speaking or typing.

---

## 🚀 Quick Start

### 1. Prerequisites
- [Node.js 18+](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally **or** a free [MongoDB Atlas](https://cloud.mongodb.com/) cluster

### 2. Clone / open the project
```bash
cd voice-form-assistant/backend
```

### 3. Install dependencies
```bash
npm install
```

### 4. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` and fill in your keys:

| Variable | Where to get it |
|---|---|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `SARVAM_API_KEY` | [Sarvam AI Dashboard](https://dashboard.sarvam.ai) |
| `MONGODB_URI` | Local: `mongodb://localhost:27017/voice-form-assistant` |

### 5. Start development servers
```bash
# Terminal 1: Start backend server (port 5000)
npm run dev:backend

# Terminal 2: Start React frontend Vite dev server (port 5173)
npm run dev:frontend
```

Or build the production React bundle into `frontend/dist` and `public`:
```bash
npm run build
npm start
```

### 6. Open in browser
- **React Development**: `http://localhost:5173`
- **Backend / Production**: `http://localhost:5000`

---

## 📂 Project Structure

```
voice-form-assistant/
├── frontend/                  ← Modern React SPA (Vite + React 19)
│   ├── src/
│   │   ├── components/        ← Navbar, HomeView, UploadView, FormWizardView, ReviewView, etc.
│   │   ├── context/           ← AppContext (state management for language, session, toasts)
│   │   ├── services/          ← api.js (backend fetch) & voice.js (TTS/STT dual-layer)
│   │   ├── i18n/              ← translations.js (en, ml, hi, ta, te)
│   │   ├── App.jsx & App.css  ← View orchestrator & styling
│   │   └── main.jsx & index.css ← Entry point & global tokens
│   ├── dist/                  ← Production React bundle
│   └── package.json           ← React dependencies & Vite config
│
├── public/                    ← Static production distribution
├── backend/
│   ├── server.js              ← Express entry point (serves API & frontend/dist)
│   ├── config/db.js           ← MongoDB connection
│   ├── models/                ← Mongoose models (User, Form, Session)
│   ├── routes/                ← API routes (/api/forms, /api/sessions, /api/voice)
│   ├── controllers/           ← Route handlers
│   │   ├── geminiService.js   ← Gemini Vision API
│   │   └── sarvamService.js   ← Sarvam TTS + STT
│   └── middleware/
│       └── uploadMiddleware.js ← Multer (image + audio)
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/forms/upload` | Upload image, detect fields with Gemini |
| `GET`  | `/api/forms/:id` | Get a saved form |
| `POST` | `/api/sessions` | Create a new filling session |
| `PUT`  | `/api/sessions/:id` | Save progress |
| `GET`  | `/api/sessions/:id` | Resume a session |
| `POST` | `/api/voice/text-to-speech` | `{text, language}` → audio WAV |
| `POST` | `/api/voice/speech-to-text` | Audio file → `{transcript}` |

---

## 🌐 Supported Languages

| Code | Language |
|------|----------|
| `en` | English |
| `ml` | Malayalam (മലയാളം) |
| `hi` | Hindi (हिन्दी) |
| `ta` | Tamil (தமிழ்) |
| `te` | Telugu (తెలుగు) |

---

## 🛡️ Security Notes

- API keys are **only** in `backend/.env` — never in frontend JS
- The `.env` file is gitignored
- Uploaded images are stored locally in `backend/uploads/`
- In production: add authentication, restrict CORS origin, use HTTPS

---

## 🧪 How It Works

1. **Home** — User selects their language. Saved to `localStorage`.
2. **Upload** — Drag-and-drop a form photo → sent to Express → Gemini Vision detects fields.
3. **Form** — One field at a time. Click 🔊 to hear the question, 🎙️ to speak, or type. Auto-saves to MongoDB.
4. **Review** — See all answers in a table. Click Edit to fix any field. Print / Save as PDF.

---

## ✅ Without API Keys

The app is still navigable without keys:
- **No Gemini key** → Upload still works; returns 2 placeholder fields (Full Name, Date of Birth).
- **No Sarvam key** → Voice buttons fall back to browser Web Speech API (Chrome only).
- **No MongoDB** → Server won't start; use a local MongoDB instance.
