/**
 * controllers/speech.controller.js
 * POST /api/speech/transcribe
 * Body: { audio?: base64, mimeType?, directText?: string }
 */
const speechService = require('../services/speech.service');

const transcribe = async (req, res, next) => {
  try {
    const { audio, mimeType, directText } = req.body;
    if (!audio && !directText) {
      return res.status(400).json({ error: 'audio or directText is required' });
    }
    const transcript = await speechService.transcribe(audio, mimeType, directText);
    res.json({ transcript });
  } catch (err) {
    next(err);
  }
};

module.exports = { transcribe };