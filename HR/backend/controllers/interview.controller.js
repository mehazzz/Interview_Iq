/**
 * controllers/interview.controller.js
 *
 * Practice mode:
 *   POST /respond → save answer + return hint, status='awaiting_next'
 *   POST /next    → generate next question on demand
 *
 * Test mode:
 *   POST /respond → generate + return next question immediately
 *
 * All sessions are tagged with req.userId from the x-user-id header.
 */

const { v4: uuidv4 } = require('uuid');
const sessionStore   = require('../utils/sessionStore');
const aiService      = require('../services/ai.service');
const config         = require('../config/ai.config');

// ── POST /api/interview/start ─────────────────────────────────
const startInterview = async (req, res, next) => {
  try {
    const { role, mode = 'practice' } = req.body;
    if (!role) return res.status(400).json({ error: 'role is required' });

    const maxQuestions = mode === 'test'
      ? config.test.maxQuestions
      : config.interview.maxQuestions;

    const sessionId      = uuidv4();
    const firstQuestion  = await aiService.getOpeningQuestion(role, sessionId);

    const session = sessionStore.create(sessionId, {
      sessionId,
      userId:          req.userId,   // ← tag with user
      role,
      mode,
      status:          'active',
      questionIndex:   1,
      maxQuestions,
      startedAt:       Date.now(),
      currentQuestion: firstQuestion.question,
      history:         [{ role: 'assistant', content: firstQuestion.question }],
      scores:          [],
    });

    res.json({
      sessionId:      session.sessionId,
      question:       firstQuestion,
      questionNumber: 1,
      totalQuestions: maxQuestions,
      mode,
    });
  } catch (err) { next(err); }
};

// ── POST /api/interview/respond ───────────────────────────────
const handleResponse = async (req, res, next) => {
  try {
    const { sessionId, answer } = req.body;
    if (!sessionId || !answer) {
      return res.status(400).json({ error: 'sessionId and answer are required' });
    }

    const session = sessionStore.get(sessionId);
    if (!session)                    return res.status(404).json({ error: 'Session not found' });
    if (session.status !== 'active') return res.status(400).json({ error: 'Session is not active' });

    const updatedHistory = [...session.history, { role: 'user', content: answer }];
    const isLastQuestion = session.questionIndex >= session.maxQuestions;

    if (isLastQuestion) {
      sessionStore.update(sessionId, { history: updatedHistory, status: 'completed' });
      return res.json({ done: true, sessionId });
    }

    // ── PRACTICE: save answer + hint, pause for user to click Next ──
    if (session.mode === 'practice') {
      const [hint] = await Promise.all([
        aiService.getAnswerHint(session.role, session.currentQuestion, answer).catch(() => null),
        Promise.resolve(sessionStore.update(sessionId, {
          history:       updatedHistory,
          status:        'awaiting_next',
          pendingAnswer: answer,
          scores:        [...session.scores, 0],
        })),
      ]);
      return res.json({
        done:           false,
        awaitingNext:   true,
        hint:           hint || null,
        questionNumber: session.questionIndex,
        totalQuestions: session.maxQuestions,
      });
    }

    // ── TEST: immediate next question ────────────────────────
    const nextQ = await aiService.getNextQuestion(
      session.role, updatedHistory, answer, session.questionIndex, sessionId
    );
    const finalHistory = [...updatedHistory, { role: 'assistant', content: nextQ.question }];

    sessionStore.update(sessionId, {
      history:         finalHistory,
      questionIndex:   session.questionIndex + 1,
      currentQuestion: nextQ.question,
      scores:          [...session.scores, nextQ.answerQualityScore ?? 0],
    });

    res.json({
      question:       nextQ,
      questionNumber: session.questionIndex + 1,
      totalQuestions: session.maxQuestions,
      done:           false,
      awaitingNext:   false,
    });
  } catch (err) { next(err); }
};

// ── POST /api/interview/next (practice only) ──────────────────
const fetchNextQuestion = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });

    const session = sessionStore.get(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.mode !== 'practice') {
      return res.status(400).json({ error: '/next is only available in practice mode' });
    }
    if (session.status !== 'awaiting_next') {
      return res.status(400).json({ error: 'Session is not awaiting next question' });
    }

    const nextQ = await aiService.getNextQuestion(
      session.role, session.history, session.pendingAnswer, session.questionIndex, sessionId
    );
    const finalHistory = [...session.history, { role: 'assistant', content: nextQ.question }];

    sessionStore.update(sessionId, {
      history:         finalHistory,
      questionIndex:   session.questionIndex + 1,
      currentQuestion: nextQ.question,
      status:          'active',
      pendingAnswer:   null,
      scores:          session.scores.map((s, i) =>
        i === session.scores.length - 1 ? (nextQ.answerQualityScore ?? 0) : s
      ),
    });

    res.json({
      question:       nextQ,
      questionNumber: session.questionIndex + 1,
      totalQuestions: session.maxQuestions,
      done:           false,
    });
  } catch (err) { next(err); }
};

// ── POST /api/interview/hint ──────────────────────────────────
const getAnswerHint = async (req, res, next) => {
  try {
    const { sessionId, question, answer } = req.body;
    if (!sessionId || !question || !answer) {
      return res.status(400).json({ error: 'sessionId, question, and answer are required' });
    }
    const session = sessionStore.get(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.mode === 'test') return res.json({ hint: null });

    const hint = await aiService.getAnswerHint(session.role, question, answer);
    res.json({ hint });
  } catch (err) { next(err); }
};

// ── GET /api/interview/:sessionId ─────────────────────────────
const getSession = (req, res) => {
  const session = sessionStore.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session);
};

// ── POST /api/interview/end ───────────────────────────────────
const endInterview = (req, res) => {
  const { sessionId } = req.body;
  const session = sessionStore.get(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  sessionStore.update(sessionId, { status: 'completed' });
  res.json({ message: 'Interview ended', sessionId });
};

module.exports = { startInterview, handleResponse, fetchNextQuestion, getAnswerHint, getSession, endInterview };