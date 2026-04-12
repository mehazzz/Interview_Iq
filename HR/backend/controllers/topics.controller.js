/**
 * controllers/topics.controller.js
 */
const aiService = require('../services/ai.service');

const getTopics = async (req, res, next) => {
  try {
    const { role } = req.query;
    if (!role) return res.status(400).json({ error: 'role query param is required' });
    const topics = await aiService.getTopicsForRole(role);
    res.json(topics);
  } catch (err) {
    next(err);
  }
};

module.exports = { getTopics };