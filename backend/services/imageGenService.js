const fs = require('fs');
const path = require('path');

const FORM_TEMPLATES = {
  bank_kyc: {
    id: 'bank_kyc',
    name: 'State Bank KYC Form',
    description: 'Personal details, PAN, Aadhaar, address & photo box',
    prompt:
      'A realistic, clean, official Bank KYC Details Updation form on a bright white printed A4 sheet, top header titled KYC DETAILS UPDATION STATE BANK. Clear printed sections with labeled empty input boxes and square character grids: 1. Personal Details (Name, Father Name, Account No, Date of Birth, Residential Status checkboxes, Passport photo box on top right), 2. Identification Information (PAN No with boxed letters, Aadhaar No), 3. Address Details (Line 1, District, PIN Code, State), 4. Contact Details (Mobile No, Email ID), 5. Applicant Declaration with date and signature area. Black printed text, neat rectangular boxes, high resolution, straight top-down scan document photography.',
  },
  bank_account: {
    id: 'bank_account',
    name: 'Bank Account Opening Form',
    description: 'Account type, personal info, nominee & branch details',
    prompt:
      'A clean official Bank Account Opening Form document on bright white paper with sections for Customer Full Name, Date of Birth, Gender, Occupation, Annual Income, Identification (PAN, Aadhaar), Address, Contact Number, and Signature box. Clear printed borders, top-down scan.',
  },
  college_admission: {
    id: 'college_admission',
    name: 'College Admission Form',
    description: 'Student name, course, qualifications & contact',
    prompt:
      'A formal College Admission Registration Form document on clean white sheet with fields for Student Name, Date of Birth, Parent or Guardian Name, Course Applied For, Qualifying Exam Marks, Address, Phone, Email, and Declaration with signature. Professional clean layout.',
  },
  loan_application: {
    id: 'loan_application',
    name: 'Loan Application Form',
    description: 'Applicant details, income, loan amount & declaration',
    prompt:
      'A formal Personal Loan Application Form document with Applicant Details, Employment Type, Monthly Income, Loan Amount Requested, Existing EMIs, Address, and Declaration. Official banking layout with clear input boxes.',
  },
  job_application: {
    id: 'job_application',
    name: 'Employment Application Form',
    description: 'Candidate info, position applied for & qualifications',
    prompt:
      'A professional Job Application Form document with Applicant Name, Position Applied For, Work Experience, Education Qualifications, Contact Number, Email, and Signature with date. Clean document scan.',
  },
};

function isOpenAiKeyValid(key) {
  return Boolean(key && !key.includes('your_') && key.trim().length > 20);
}

/**
 * Generate a form image using OpenAI gpt-image-1-mini.
 * @param {object} options
 * @param {string} [options.template] - Template key from FORM_TEMPLATES
 * @param {string} [options.prompt]   - Custom user prompt
 * @param {string} [options.customKey] - Optional user-provided OpenAI API key
 */
async function generateFormImage({ template = 'bank_kyc', prompt = '', customKey = '' }) {
  const activeKey = (customKey || process.env.OPENAI_API_KEY || '').trim();

  if (!isOpenAiKeyValid(activeKey)) {
    throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY in backend/.env');
  }

  let finalPrompt = '';
  if (template && FORM_TEMPLATES[template]) {
    finalPrompt = FORM_TEMPLATES[template].prompt;
    if (prompt && prompt.trim()) {
      finalPrompt += ` Additional details: ${prompt.trim()}`;
    }
  } else if (prompt && prompt.trim()) {
    finalPrompt = `A clean, official document scan of a printed paper form: ${prompt.trim()}. High contrast black text on white paper with labeled empty input boxes and clear sections.`;
  } else {
    finalPrompt = FORM_TEMPLATES.bank_kyc.prompt;
  }

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${activeKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1-mini',
      prompt: finalPrompt,
      n: 1,
    }),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error?.message || `OpenAI Image Generation error (${response.status})`);
  }

  const b64 = data.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error('OpenAI did not return image data');
  }

  // Ensure uploads directory exists
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filename = `generated-form-${Date.now()}.png`;
  const filePath = path.join(uploadsDir, filename);
  const imageBuffer = Buffer.from(b64, 'base64');
  fs.writeFileSync(filePath, imageBuffer);

  const relativeUrl = `/uploads/${filename}`;
  const dataUrl = `data:image/png;base64,${b64}`;

  return {
    success: true,
    filename,
    relativeUrl,
    imageUrl: relativeUrl,
    dataUrl,
    sizeBytes: imageBuffer.length,
    prompt: finalPrompt,
  };
}

/**
 * Generate a filled form document image with user-entered answers using OpenAI.
 * Uses OpenAI images/edits on the user's uploaded form image if available,
 * ensuring the generated image exactly matches the uploaded form.
 *
 * @param {object} options
 * @param {string} [options.formTitle]  - Title of the form
 * @param {object} [options.answers]    - Map of field label -> user answer
 * @param {Array}  [options.fields]     - Array of field definitions
 * @param {string} [options.imagePath]  - Local path to the uploaded form image
 * @param {string} [options.customKey]  - Optional custom OpenAI key
 */
async function generateFilledFormImage({ formTitle = 'Official Application Form', answers = {}, fields = [], imagePath = null, imageBase64 = null, customKey = '' }) {
  const activeKey = (customKey || process.env.OPENAI_API_KEY || '').trim();

  if (!isOpenAiKeyValid(activeKey)) {
    throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY in backend/.env or Vercel Environment Variables.');
  }

  // Format all answers into clean entries
  const entries = [];
  if (fields && fields.length > 0) {
    fields.forEach((f) => {
      const val = answers[f.label];
      if (val !== undefined && String(val).trim()) {
        entries.push(`${f.label}: ${String(val).trim()}`);
      }
    });
  } else {
    Object.entries(answers).forEach(([k, v]) => {
      if (v !== undefined && String(v).trim()) {
        entries.push(`${k}: ${String(v).trim()}`);
      }
    });
  }

  const entriesList = entries.slice(0, 20).join(', ');
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    try {
      fs.mkdirSync(uploadsDir, { recursive: true });
    } catch {}
  }

  let b64 = null;

  // ── Strategy A: Edit the exact uploaded form image via OpenAI images/edits ──
  let fileBuffer = null;
  let ext = 'png';

  if (imageBase64 && typeof imageBase64 === 'string') {
    const cleanB64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    fileBuffer = Buffer.from(cleanB64, 'base64');
    if (imageBase64.includes('image/jpeg') || imageBase64.includes('image/jpg')) {
      ext = 'jpeg';
    }
  } else if (imagePath && fs.existsSync(imagePath)) {
    fileBuffer = fs.readFileSync(imagePath);
    ext = path.extname(imagePath).toLowerCase() === '.png' ? 'png' : 'jpeg';
  }

  if (fileBuffer) {
    try {
      console.log(`🎨 Using OpenAI images/edits on uploaded form (${(fileBuffer.length / 1024).toFixed(0)} KB)...`);

      const formData = new FormData();
      formData.append('image', new Blob([fileBuffer], { type: `image/${ext}` }), `form.${ext}`);
      formData.append(
        'prompt',
        `A high-resolution document scan of this exact form. Fill in the user's entered answers neatly inside their corresponding blank rectangular input boxes and lines using clear blue pen ink: ${entriesList}. Maintain the exact form layout, headers, logos, and printed text unchanged.`
      );
      formData.append('model', 'gpt-image-1-mini');

      const editResponse = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${activeKey}`,
        },
        body: formData,
      });

      const editData = await editResponse.json();
      if (editResponse.ok && editData.data?.[0]?.b64_json) {
        b64 = editData.data[0].b64_json;
        console.log('✅ OpenAI images/edits successfully filled the exact uploaded form!');
      } else {
        console.warn('⚠️ OpenAI images/edits returned non-200, falling back to generation:', editData.error?.message || editResponse.status);
      }
    } catch (editErr) {
      console.warn('⚠️ OpenAI images/edits call failed, falling back:', editErr.message);
    }
  }

  // ── Strategy B: Fallback to OpenAI images/generations ──
  if (!b64) {
    console.log('🎨 Generating filled form scan via OpenAI images/generations...');
    const prompt = `A realistic, high-resolution top-down document scan of an official printed paper form titled "${formTitle || 'Official Form'}". The form has neatly handwritten entries in clear blue pen ink inside the designated rectangular input boxes, grids, and lines for each field: ${entriesList}. High contrast black printed field labels, realistic blue ink handwriting inside character boxes and fields, authentic official paper document photography with signature line at the bottom.`;

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${activeKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1-mini',
        prompt: prompt,
        n: 1,
      }),
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error?.message || `OpenAI Image Generation error (${response.status})`);
    }

    b64 = data.data?.[0]?.b64_json;
  }

  if (!b64) {
    throw new Error('OpenAI did not return image data');
  }

  const filename = `filled-form-${Date.now()}.png`;
  const filePath = path.join(uploadsDir, filename);
  const imageBuffer = Buffer.from(b64, 'base64');
  fs.writeFileSync(filePath, imageBuffer);

  const relativeUrl = `/uploads/${filename}`;
  const dataUrl = `data:image/png;base64,${b64}`;

  return {
    success: true,
    filename,
    relativeUrl,
    imageUrl: relativeUrl,
    dataUrl,
    sizeBytes: imageBuffer.length,
    formTitle,
    entriesCount: entries.length,
    isExactFormEdit: Boolean(imagePath && fs.existsSync(imagePath)),
  };
}

module.exports = {
  FORM_TEMPLATES,
  isOpenAiKeyValid,
  generateFormImage,
  generateFilledFormImage,
};

