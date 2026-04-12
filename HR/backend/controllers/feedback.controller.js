/**
 * controllers/feedback.controller.js
 * Generates AI feedback and auto-saves to history with userId.
 */

const { v4: uuidv4 } = require('uuid');
const sessionStore   = require('../utils/sessionStore');
const aiService      = require('../services/ai.service');
const historyStore   = require('../utils/historyStore');

const generateFeedback = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });

    const session = sessionStore.get(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const feedback = await aiService.generateFeedback(
      session.role,
      session.history,
      session.mode || 'practice'
    );

    sessionStore.update(sessionId, { feedback, status: 'completed' });

    const duration = Math.round((Date.now() - (session.startedAt || Date.now())) / 1000);
    const saved = historyStore.save({
      id:            uuidv4(),
      userId:        session.userId || null,   // ← carry userId into history
      role:          session.role,
      mode:          session.mode || 'practice',
      feedback,
      duration,
      questionCount: session.questionIndex || 0,
      score:         feedback.overallScore || 0,
      savedAt:       new Date().toISOString(),
    });

    res.json({ feedback, role: session.role, mode: session.mode, historyId: saved.id });
  } catch (err) { next(err); }
};

module.exports = { generateFeedback };