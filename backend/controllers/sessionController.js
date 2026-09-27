const Session = require('../models/Session');
const { isDbConnected, memoryStore } = require('../config/store');

/**
 * POST /api/sessions
 * Body: { userId, formId }
 */
const createSession = async (req, res) => {
  try {
    let { userId, formId } = req.body;
    if (!userId || !formId) {
      return res.status(400).json({ success: false, message: 'userId and formId are required.' });
    }

    if (typeof formId === 'object' && formId !== null) {
      formId = formId._id || formId.id || String(formId);
    }

    if (isDbConnected()) {
      try {
        let session = await Session.findOne({ userId, formId, status: 'in_progress' });
        if (!session) {
          session = await Session.create({ userId, formId });
        }
        return res.status(201).json({ success: true, session });
      } catch (dbErr) {
        console.warn('DB session create failed, using memory store:', dbErr.message);
      }
    }

    // Offline / memory store fallback
    const session = memoryStore.createOrGetSession({ userId, formId });
    res.status(201).json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/sessions/:id
 * Body: { answers, currentField, status }
 */
const updateSession = async (req, res) => {
  try {
    const { answers, currentField, status } = req.body;
    const { id } = req.params;

    if (isDbConnected()) {
      try {
        const session = await Session.findById(id);
        if (session) {
          if (answers && typeof answers === 'object') {
            Object.entries(answers).forEach(([key, val]) => {
              session.answers.set(key, val);
            });
          }
          if (currentField !== undefined) session.currentField = currentField;
          if (status) session.status = status;

          await session.save();
          return res.json({ success: true, session });
        }
      } catch {
        // Fall back to memoryStore
      }
    }

    const session = memoryStore.updateSession(id, { answers, currentField, status });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/sessions/:id
 */
const getSession = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      try {
        const session = await Session.findById(id).populate('formId');
        if (session) {
          return res.json({ success: true, session });
        }
      } catch {
        // Fall back to memoryStore
      }
    }

    const session = memoryStore.getSession(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createSession, updateSession, getSession };
