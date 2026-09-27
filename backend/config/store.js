const mongoose = require('mongoose');
const crypto = require('crypto');

// Generate 24-character hex ID (compatible with MongoDB ObjectId format)
function generateId() {
  return crypto.randomBytes(12).toString('hex');
}

// In-memory data store for offline / local mode when MongoDB is not running
const formsMap = new Map();
const sessionsMap = new Map();
const usersMap = new Map();

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

const memoryStore = {
  // Form operations
  saveForm({ userId, formTitle, imagePath, fields }) {
    const id = generateId();
    const form = {
      _id: id,
      userId,
      formTitle: formTitle || 'Detected Form',
      imagePath: imagePath || '',
      fields: fields || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    formsMap.set(id, form);
    return form;
  },

  getForm(id) {
    return formsMap.get(String(id)) || null;
  },

  // User operations
  saveUser({ userId, language }) {
    const existing = usersMap.get(userId) || { userId, createdAt: new Date() };
    existing.language = language || 'en';
    existing.updatedAt = new Date();
    usersMap.set(userId, existing);
    return existing;
  },

  // Session operations
  createOrGetSession({ userId, formId }) {
    // Check if an in-progress session already exists
    for (const session of sessionsMap.values()) {
      if (session.userId === userId && String(session.formId) === String(formId) && session.status === 'in_progress') {
        return this.getSession(session._id);
      }
    }
    const id = generateId();
    const newSession = {
      _id: id,
      userId,
      formId,
      answers: {},
      currentField: 0,
      status: 'in_progress',
      createdAt: new Date(),
      updatedAt: new Date(),
      save() {
        this.updatedAt = new Date();
        sessionsMap.set(this._id, this);
        return Promise.resolve(this);
      },
    };
    sessionsMap.set(id, newSession);
    return this.getSession(id);
  },

  updateSession(id, { answers, currentField, status }) {
    const session = sessionsMap.get(String(id));
    if (!session) return null;

    if (!session.answers || typeof session.answers !== 'object' || session.answers instanceof Map) {
      session.answers = session.answers instanceof Map ? Object.fromEntries(session.answers) : {};
    }

    if (answers && typeof answers === 'object') {
      if (answers instanceof Map) {
        answers.forEach((val, key) => { session.answers[key] = val; });
      } else {
        Object.entries(answers).forEach(([key, val]) => {
          session.answers[key] = val;
        });
      }
    }
    if (currentField !== undefined) session.currentField = currentField;
    if (status) session.status = status;
    session.updatedAt = new Date();
    sessionsMap.set(String(id), session);
    return this.getSession(id);
  },

  getSession(id) {
    const session = sessionsMap.get(String(id));
    if (!session) return null;

    // Convert answers Map to plain object for JSON serialization if needed
    const answersObj = session.answers instanceof Map
      ? Object.fromEntries(session.answers)
      : (session.answers && typeof session.answers === 'object' ? { ...session.answers } : {});

    // Populate formId if form exists
    const form = formsMap.get(String(session.formId));

    return {
      _id: session._id,
      userId: session.userId,
      formId: form || session.formId,
      answers: answersObj,
      currentField: session.currentField || 0,
      status: session.status || 'in_progress',
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  },

  listSessions(userId) {
    const list = [];
    for (const session of sessionsMap.values()) {
      if (session.userId === userId) {
        list.push(this.getSession(session._id));
      }
    }
    return list;
  },
};

module.exports = { isDbConnected, memoryStore };
