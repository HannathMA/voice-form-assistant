/**
 * formOverlay.js — Pixel-Perfect Form Filler
 *
 * Takes the user's EXACT uploaded form image and overlays the user's entered answers
 * directly into the designated field bounding boxes in authentic blue pen ink.
 * The resulting image is 100% identical to the uploaded form, with answers filled in.
 */

export async function generateExactFilledFormImage({ formImageSrc, fields = [], answers = {} }) {
  if (!formImageSrc) {
    throw new Error('No form image available to fill.');
  }

  // 1. Load the original uploaded image
  const img = await new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = (err) => reject(new Error('Failed to load original form image'));
    image.src = formImageSrc;
  });

  const width = img.naturalWidth || img.width || 1200;
  const height = img.naturalHeight || img.height || 1600;

  // 2. Create offscreen canvas with full original image resolution
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // 3. Draw the exact uploaded form as the background
  ctx.drawImage(img, 0, 0, width, height);

  // 4. Fill in each field answer
  let filledCount = 0;

  fields.forEach((field, idx) => {
    const rawVal = answers[field.label];
    if (rawVal === undefined || rawVal === null || String(rawVal).trim() === '') {
      return;
    }

    const answerStr = String(rawVal).trim();
    filledCount++;

    // Calculate box coordinates
    let boxX, boxY, boxW, boxH;

    if (Array.isArray(field.box_2d) && field.box_2d.length === 4) {
      const [ymin, xmin, ymax, xmax] = field.box_2d;
      boxX = (xmin / 1000) * width;
      boxY = (ymin / 1000) * height;
      boxW = ((xmax - xmin) / 1000) * width;
      boxH = ((ymax - ymin) / 1000) * height;
    } else {
      // Heuristic fallback if bounding box was not detected
      const totalFields = Math.max(fields.length, 1);
      const verticalStart = height * 0.22;
      const verticalEnd = height * 0.88;
      const step = (verticalEnd - verticalStart) / totalFields;
      boxX = width * 0.28;
      boxY = verticalStart + idx * step;
      boxW = width * 0.65;
      boxH = Math.min(step * 0.7, 44);
    }

    // Set authentic blue ballpoint pen ink styling
    ctx.save();
    ctx.fillStyle = '#0f3a8a'; // Authentic blue pen ink
    ctx.strokeStyle = '#0f3a8a';

    if (field.type === 'checkbox') {
      if (answerStr.toLowerCase() === 'true' || answerStr.toLowerCase() === 'yes' || answerStr === '1') {
        // Draw a neat handwritten blue checkmark
        const checkSize = Math.max(14, Math.min(boxW, boxH, 30));
        const centerX = boxX + boxW / 2;
        const centerY = boxY + boxH / 2;

        ctx.lineWidth = Math.max(2, Math.round(width / 600));
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(centerX - checkSize * 0.35, centerY);
        ctx.lineTo(centerX - checkSize * 0.05, centerY + checkSize * 0.3);
        ctx.lineTo(centerX + checkSize * 0.4, centerY - checkSize * 0.35);
        ctx.stroke();
      }
    } else {
      // Text / Number / Date / Select / Textarea
      const fontSize = Math.max(14, Math.min(Math.round(boxH * 0.72), 34));
      ctx.font = `600 ${fontSize}px "Segoe UI", "Arial", sans-serif`;

      // Official forms typically use uppercase block letters
      const displayText = (field.type === 'number' || field.type === 'date')
        ? answerStr
        : answerStr.toUpperCase();

      const paddingLeft = Math.max(6, boxW * 0.02);
      const textY = boxY + boxH * 0.72;
      const maxWidth = Math.max(50, boxW - paddingLeft * 2);

      // Check if character grid (e.g. PAN, Account number with wide box)
      const isGrid = (field.type === 'number' || field.label.toLowerCase().includes('pan') || field.label.toLowerCase().includes('account')) && displayText.length > 5;

      if (isGrid && boxW > displayText.length * fontSize * 1.5) {
        // Distribute characters across boxes
        const charStep = boxW / (displayText.length + 1);
        for (let i = 0; i < displayText.length; i++) {
          const char = displayText[i];
          const charX = boxX + paddingLeft + i * charStep;
          ctx.fillText(char, charX, textY);
        }
      } else {
        ctx.fillText(displayText, boxX + paddingLeft, textY, maxWidth);
      }
    }

    ctx.restore();
  });

  const dataUrl = canvas.toDataURL('image/png', 0.98);

  return {
    success: true,
    dataUrl,
    width,
    height,
    filledCount,
  };
}
