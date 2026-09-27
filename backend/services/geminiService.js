const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

function isGeminiKeyValid(key) {
  return Boolean(key && !key.includes('your_') && key.trim().length > 15);
}

/**
 * Analyse a form image using Gemini Vision API and return structured field data.
 * @param {string} imagePath   - Absolute path to the uploaded image file
 * @param {string} language    - Language code: en | ml | hi | ta | te
 * @param {string} [customKey] - Optional custom Gemini API key passed from request
 * @returns {Promise<{formTitle: string, fields: Array}>}
 */
const detectFormFields = async (imageInput, language = 'en', customKey = null) => {
  const activeKey = (customKey || process.env.GEMINI_API_KEY || '').trim();

  if (!isGeminiKeyValid(activeKey)) {
    throw new Error(
      'Gemini API key is not configured in Vercel Environment Variables. Please add GEMINI_API_KEY in Vercel Settings -> Environment Variables.'
    );
  }

  const genAI = new GoogleGenerativeAI(activeKey);

  // Convert image to base64
  let base64Image;
  let mimeType = 'image/jpeg';

  if (imageInput && imageInput.buffer) {
    base64Image = imageInput.buffer.toString('base64');
    mimeType = imageInput.mimetype || 'image/jpeg';
  } else if (Buffer.isBuffer(imageInput)) {
    base64Image = imageInput.toString('base64');
  } else if (typeof imageInput === 'string' && fs.existsSync(imageInput)) {
    const imageData = fs.readFileSync(imageInput);
    base64Image = imageData.toString('base64');
    mimeType = imageInput.match(/\.(png|gif|webp)$/i)
      ? `image/${imageInput.split('.').pop().toLowerCase()}`
      : 'image/jpeg';
  } else {
    throw new Error('No valid image data was provided for AI detection.');
  }

  const prompt = `You are an expert AI form digitizer and OCR assistant.
Carefully examine the attached form image. Extract all detectable fields and their exact input box locations. Return ONLY a valid JSON object (no markdown formatting, no code fences, no explanations).

Preferred language: "${language}".
If the form has text or labels in Malayalam, Hindi, Tamil, Telugu, or English, extract the exact labels as printed.

Format:
{
  "formTitle": "Detected title of the form",
  "fields": [
    {
      "label": "Exact label or question as printed on the form",
      "type": "text | number | date | select | checkbox | textarea",
      "box_2d": [ymin, xmin, ymax, xmax],
      "options": ["option 1", "option 2"],
      "required": false
    }
  ]
}

Rules for box_2d:
- "box_2d" MUST be an array of 4 integers [ymin, xmin, ymax, xmax] on a 0 to 1000 normalized scale.
- It specifies the EXACT designated blank input box, rectangle, line, or square grid on the image where the user's answer should be written.
- ymin is the top edge (0-1000), xmin is left edge (0-1000), ymax is bottom edge (0-1000), xmax is right edge (0-1000).

Field type rules:
- "type" MUST be one of: "text", "number", "date", "select", "checkbox", "textarea".
- Use "select" if there are multiple options / dropdowns / checkboxes acting as choices, and populate "options".
- Use "checkbox" for single tick boxes (e.g. declarations, agreements).
- Use "date" for date of birth, expiry date, dates.
- Use "number" for phone numbers, account numbers, Aadhaar, PIN code, age.
- Use "textarea" for address or multi-line questions.
- Extract all fields visible on the form in sequential top-to-bottom order.`;

  const modelsToTry = [
    'gemini-3-flash-preview',
    'gemini-3.8-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-pro-preview',
    'gemini-flash-latest',
    'gemini-pro-latest',
  ];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`📡 Calling Gemini API (${modelName}) to detect form fields...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([
        { inlineData: { data: base64Image, mimeType } },
        prompt,
      ]);

      const responseText = result.response.text().trim();
      let cleaned = responseText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
        cleaned = cleaned.slice(firstBrace, lastBrace + 1);
      }

      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed.fields) && parsed.fields.length > 0) {
        console.log(`✅ Gemini (${modelName}) successfully detected ${parsed.fields.length} fields!`);
        return parsed;
      }
    } catch (err) {
      console.warn(`⚠️ Model ${modelName} call failed:`, err.message);
      lastError = err;
    }
  }

  // Fallback to OpenAI Vision (gpt-4o-mini) if Gemini models are quota-limited or fail
  const openAiKey = (process.env.OPENAI_API_KEY || '').trim();
  if (openAiKey && openAiKey.length > 20) {
    try {
      console.log('🔄 Attempting fallback OCR detection with OpenAI Vision (gpt-4o-mini)...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openAiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mimeType};base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      const data = await response.json();
      if (response.ok && data.choices?.[0]?.message?.content) {
        const parsed = JSON.parse(data.choices[0].message.content);
        if (Array.isArray(parsed.fields) && parsed.fields.length > 0) {
          console.log(`✅ OpenAI Vision successfully detected ${parsed.fields.length} fields!`);
          return parsed;
        }
      }
    } catch (openAiErr) {
      console.warn('⚠️ OpenAI Vision fallback error:', openAiErr.message);
    }
  }

  throw new Error(`Vision AI error: ${lastError ? lastError.message : 'No fields could be detected from the form'}`);
};

module.exports = { detectFormFields, isGeminiKeyValid };
