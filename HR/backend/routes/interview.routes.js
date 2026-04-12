/**
 * routes/interview.routes.js
 * All endpoints related to interview session management.
 */

const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interview.controller');

// POST /api/interview/start       — creates a new session
router.post('/start', interviewController.startInterview);

// POST /api/interview/respond     — submit answer; in practice mode returns hint only (no next Q)
router.post('/respond', interviewController.handleResponse);

// POST /api/interview/next        — practice mode only: fetch next question on demand
router.post('/next', interviewController.fetchNextQuestion);

// POST /api/interview/hint        — get coaching hint for last answer (practice mode)
router.post('/hint', interviewController.getAnswerHint);

// GET  /api/interview/:sessionId  — get current session state
router.get('/:sessionId', interviewController.getSession);

// POST /api/interview/end         — explicitly close a session
router.post('/end', interviewController.endInterview);

module.exports = router;