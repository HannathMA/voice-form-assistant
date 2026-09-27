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

### 5. Start the server
```bash
npm start          # production
npm run dev        # development (auto-restart with nodemon)
```

### 6. Open in browser
```
http://localhost:5000
```

---

## 📂 Project Structure

```
voice-form-assistant/
├── frontend/                  ← Static HTML/CSS/JS (served by Express)
│   ├── index.html             ← Home: language selection
│   ├── dashboard.html         ← Upload form
│   ├── form.html              ← Voice-guided form filling
│   ├── progress.html          ← Review & export
│   ├── css/
│   │   ├── style.css          ← Global design system
│   │   └── form.css           ← Form-page styles
│   └── js/
│       ├── api.js             ← All API calls (shared)
│       ├── main.js            ← Home page logic
│       ├── upload.js          ← Upload page logic
│       ├── form.js            ← Form filling wizard
│       ├── voice.js           ← TTS + STT module
│       └── progress.js        ← Review page logic
│
└── backend/
    ├── server.js              ← Express entry point
    ├── config/db.js           ← MongoDB connection
    ├── models/                ← Mongoose models (User, Form, Session)
    ├── routes/                ← API routes
    ├── controllers/           ← Route handlers
    ├── services/
    │   ├── geminiService.js   ← Gemini Vision API
    │   └── sarvamService.js   ← Sarvam TTS + STT
    └── middleware/
        └── uploadMiddleware.js ← Multer (image + audio)
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
