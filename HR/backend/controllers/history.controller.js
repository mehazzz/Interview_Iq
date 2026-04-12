/**
 * controllers/history.controller.js
 * History is now filtered by userId from the x-user-id header.
 */
const { v4: uuidv4 } = require('uuid');
const historyStore   = require('../utils/historyStore');

/**
 * GET /api/history?role=...
 * Returns only results belonging to req.userId.
 */
const listResults = (req, res, next) => {
  try {
    const { role } = req.query;
    const results  = historyStore.list({ role: role || undefined, userId: req.userId || undefined });
    res.json({ results, total: results.length });
  } catch (err) { next(err); }
};

/**
 * POST /api/history/save  (manual save, rarely used — feedback auto-saves)
 */
const saveResult = (req, res, next) => {
  try {
    const { role, mode, feedback, duration, questionCount } = req.body;
    if (!role || !feedback) {
      return res.status(400).json({ error: 'role and feedback are required' });
    }
    const record = historyStore.save({
      id:            uuidv4(),
      userId:        req.userId || null,
      role,
      mode:          mode || 'practice',
      feedback,
      duration:      duration || 0,
      questionCount: questionCount || 0,
      score:         feedback.overallScore || 0,
      savedAt:       new Date().toISOString(),
    });
    res.status(201).json(record);
  } catch (err) { next(err); }
};

const getResult = (req, res, next) => {
  try {
    const result = historyStore.getById(req.params.id);
    if (!result) return res.status(404).json({ error: 'Result not found' });
    res.json(result);
  } catch (err) { next(err); }
};

const deleteResult = (req, res, next) => {
  try {
    const deleted = historyStore.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Result not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { next(err); }
};

module.exports = { saveResult, listResults, getResult, deleteResult };