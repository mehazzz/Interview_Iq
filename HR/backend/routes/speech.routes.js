/**
 * routes/speech.routes.js
 * Handles speech-to-text transcription (Whisper or mock).
 */

const express = require('express');
const router = express.Router();
const speechController = require('../controllers/speech.controller');

// POST /api/speech/transcribe — accepts base64 audio, returns transcript text
router.post('/transcribe', speechController.transcribe);

module.exports = router;