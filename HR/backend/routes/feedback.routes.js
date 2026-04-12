/**
 * routes/feedback.routes.js
 * Endpoint to generate end-of-interview feedback report.
 */

const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');

// POST /api/feedback/generate — accepts sessionId, returns full feedback
router.post('/generate', feedbackController.generateFeedback);

module.exports = router;