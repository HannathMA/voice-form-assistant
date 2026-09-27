const path = require('path');
const fs = require('fs');
const Form = require('../models/Form');
const User = require('../models/User');
const { detectFormFields, isGeminiKeyValid } = require('../services/geminiService');
const { isDbConnected, memoryStore } = require('../config/store');
const {
  FORM_TEMPLATES,
  isOpenAiKeyValid,
  generateFormImage,
  generateFilledFormImage,
} = require('../services/imageGenService');

/**
 * POST /api/forms/upload
 * Accepts a form image, runs live Gemini Vision detection, saves Form doc.
 */
const uploadAndDetect = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    const { userId, language, geminiApiKey } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required.' });
    }

    const currentLang = language || 'en';
    const apiKey = (req.headers['x-gemini-key'] || geminiApiKey || process.env.GEMINI_API_KEY || '').trim();

    // 1. Detect fields using Gemini Vision API
    const geminiResult = await detectFormFields(req.file, currentLang, apiKey);

    // 2. Relative image path
    const relativePath = req.file.path
      ? path.relative(path.join(__dirname, '../'), req.file.path).replace(/\\/g, '/')
      : 'uploads/' + (req.file.originalname || 'form.png');

    // 3. Persist form & user preference (DB or in-memory)
    let savedForm;

    if (isDbConnected()) {
      try {
        await User.findOneAndUpdate(
          { userId },
          { language: currentLang },
          { upsert: true, new: true }
        );

        savedForm = await Form.create({
          userId,
          formTitle: geminiResult.formTitle || 'Detected Form',
          imagePath: relativePath,
          fields: geminiResult.fields,
        });
      } catch (dbErr) {
        console.warn('DB write failed, falling back to memory store:', dbErr.message);
        memoryStore.saveUser({ userId, language: currentLang });
        savedForm = memoryStore.saveForm({
          userId,
          formTitle: geminiResult.formTitle || 'Detected Form',
          imagePath: relativePath,
          fields: geminiResult.fields,
        });
      }
    } else {
      memoryStore.saveUser({ userId, language: currentLang });
      savedForm = memoryStore.saveForm({
        userId,
        formTitle: geminiResult.formTitle || 'Detected Form',
        imagePath: relativePath,
        fields: geminiResult.fields,
      });
    }

    const imgUrl = '/' + (savedForm.imagePath || relativePath).replace(/^\/+/, '');

    res.status(201).json({
      success: true,
      formId: savedForm._id,
      formTitle: savedForm.formTitle,
      imageUrl: imgUrl,
      fields: savedForm.fields,
    });
  } catch (err) {
    console.error('uploadAndDetect error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Detection failed with Gemini API',
    });
  }
};

/**
 * GET /api/forms/:id
 */
const getFormById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isDbConnected()) {
      const form = memoryStore.getForm(id);
      if (!form) return res.status(404).json({ success: false, message: 'Form not found.' });
      return res.json({ success: true, form });
    }

    try {
      const form = await Form.findById(id);
      if (form) return res.json({ success: true, form });
    } catch {
      // Ignore cast errors and check memoryStore
    }

    const memForm = memoryStore.getForm(id);
    if (memForm) return res.json({ success: true, form: memForm });

    res.status(404).json({ success: false, message: 'Form not found.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/forms/config
 */
const getConfig = (req, res) => {
  res.json({
    success: true,
    hasGeminiKey: isGeminiKeyValid(process.env.GEMINI_API_KEY),
    hasSarvamKey: isGeminiKeyValid(process.env.SARVAM_API_KEY),
    hasOpenAiKey: isOpenAiKeyValid(process.env.OPENAI_API_KEY),
  });
};

/**
 * POST /api/forms/config
 */
const saveConfig = (req, res) => {
  try {
    const { geminiApiKey } = req.body;
    if (geminiApiKey && typeof geminiApiKey === 'string') {
      const trimmed = geminiApiKey.trim();
      process.env.GEMINI_API_KEY = trimmed;

      // Update .env file
      const envPath = path.join(__dirname, '../.env');
      if (fs.existsSync(envPath)) {
        let content = fs.readFileSync(envPath, 'utf8');
        if (/^GEMINI_API_KEY=.*$/m.test(content)) {
          content = content.replace(/^GEMINI_API_KEY=.*$/m, `GEMINI_API_KEY=${trimmed}`);
        } else {
          content += `\nGEMINI_API_KEY=${trimmed}`;
        }
        fs.writeFileSync(envPath, content, 'utf8');
      }
    }

    res.json({
      success: true,
      hasGeminiKey: isGeminiKeyValid(process.env.GEMINI_API_KEY),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/forms/generate-image
 * Body: { template?: string, prompt?: string, customKey?: string }
 */
const generateFormImageHandler = async (req, res) => {
  try {
    const { template, prompt, customKey } = req.body || {};
    const result = await generateFormImage({ template, prompt, customKey });
    res.status(201).json(result);
  } catch (err) {
    console.error('Image generation error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to generate form image with OpenAI',
    });
  }
};

/**
 * GET /api/forms/templates
 */
const getFormTemplatesHandler = (req, res) => {
  res.json({
    success: true,
    templates: Object.values(FORM_TEMPLATES),
  });
};

/**
 * POST /api/forms/generate-filled-form
 */
const generateFilledFormImageHandler = async (req, res) => {
  try {
    const { formTitle, answers, fields, customKey, imageUrl, imageBase64, formId } = req.body || {};
    let targetImagePath = null;

    if (imageUrl) {
      const cleanRel = imageUrl.replace(/^\/+/, '');
      const candidate = path.join(__dirname, '../', cleanRel);
      if (fs.existsSync(candidate)) {
        targetImagePath = candidate;
      }
    } else if (formId) {
      const formDoc = isDbConnected() ? await Form.findById(formId) : memoryStore.getForm(formId);
      if (formDoc && formDoc.imagePath) {
        const candidate = path.join(__dirname, '../', formDoc.imagePath.replace(/^\/+/, ''));
        if (fs.existsSync(candidate)) {
          targetImagePath = candidate;
        }
      }
    }

    const result = await generateFilledFormImage({
      formTitle,
      answers,
      fields,
      imagePath: targetImagePath,
      imageBase64,
      customKey,
    });
    res.status(201).json(result);
  } catch (err) {
    console.error('Filled form generation error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to generate filled form image with OpenAI',
    });
  }
};

module.exports = {
  uploadAndDetect,
  getFormById,
  getConfig,
  saveConfig,
  generateFormImageHandler,
  getFormTemplatesHandler,
  generateFilledFormImageHandler,
};

