/**
 * hooks/useInterview.js
 *
 * Status machine:
 *   idle → loading → active → processing → (practice: awaiting_next | test: active) → completed → feedback
 *
 * Practice mode:
 *   submitAnswer() → sets status='awaiting_next', attaches hint to last user message
 *   fetchNextQuestion() → sets status='active', adds next AI question
 *
 * Test mode:
 *   submitAnswer() → immediate next question, stays 'active' throughout
 */

import { useState, useCallback, useRef } from 'react';
import {
  startInterview    as apiStart,
  submitAnswer      as apiSubmit,
  fetchNextQuestion as apiNext,
  endInterview      as apiEnd,
  generateFeedback  as apiFeedback,
} from '../services/api.service';
import { speak, stop as stopTTS } from '../services/tts.service';

const useInterview = () => {
  const [status, setStatus]            = useState('idle');
  const [sessionId, setSessionId]      = useState(null);
  const [questionNumber, setQNumber]   = useState(0);
  const [totalQuestions, setTotal]     = useState(8);
  const [messages, setMessages]        = useState([]);
  const [feedback, setFeedback]        = useState(null);
  const [error, setError]              = useState(null);
  const [isSpeaking, setIsSpeaking]    = useState(false);
  const [mode, setMode]                = useState('practice');

  const roleRef           = useRef('');
  const startTimeRef      = useRef(null);
  const lastQuestionRef   = useRef('');  // tracks the current question text for hint lookup

  // ── helpers ──────────────────────────────────────────────

  const addMessage = (role, content, meta = {}) =>
    setMessages(prev => [...prev, { role, content, meta, id: Date.now() + Math.random() }]);

  /** Patch the hint onto the most-recent user message without re-rendering everything */
  const attachHintToLastUserMsg = (hint) => {
    setMessages(prev => {
      const copy = [...prev];
      for (let i = copy.length - 1; i >= 0; i--) {
        if (copy[i].role === 'user') {
          copy[i] = { ...copy[i], meta: { ...copy[i].meta, hint } };
          break;
        }
      }
      return copy;
    });
  };

  const speakQuestion = useCallback((text) => {
    setIsSpeaking(true);
    speak(text, {
      onStart: () => setIsSpeaking(true),
      onEnd:   () => setIsSpeaking(false),
    });
  }, []);

  // ── public actions ────────────────────────────────────────

  const start = useCallback(async (role, selectedMode = 'practice') => {
    try {
      setError(null);
      setStatus('loading');
      setMessages([]);
      setFeedback(null);
      roleRef.current      = role;
      startTimeRef.current = Date.now();
      setMode(selectedMode);

      const data = await apiStart(role, selectedMode);

      setSessionId(data.sessionId);
      setQNumber(data.questionNumber);
      setTotal(data.totalQuestions);
      setStatus('active');

      lastQuestionRef.current = data.question.question;
      addMessage('assistant', data.question.question, {
        intent:     data.question.intent,
        difficulty: data.question.difficulty,
      });
      speakQuestion(data.question.question);
    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  }, [speakQuestion]);

  /**
   * Submit the user's answer.
   *
   * Practice mode:
   *   - backend returns { awaitingNext: true, hint }
   *   - we attach the hint and set status='awaiting_next'
   *   - does NOT add a new AI message yet
   *
   * Test mode:
   *   - backend returns { question, done } immediately as before
   */
  const submitAnswer = useCallback(async (answerText) => {
    if (!sessionId || status !== 'active') return;
    try {
      setStatus('processing');
      stopTTS();
      setIsSpeaking(false);

      addMessage('user', answerText);

      const data = await apiSubmit(sessionId, answerText);

      if (data.done) {
        setStatus('completed');
        return;
      }

      if (data.awaitingNext) {
        // ── PRACTICE MODE: show hint, wait for user to click Next ──
        if (data.hint) attachHintToLastUserMsg(data.hint);
        setStatus('awaiting_next');
        return;
      }

      // ── TEST MODE: next question already returned ──
      setQNumber(data.questionNumber);
      setStatus('active');

      lastQuestionRef.current = data.question.question;
      addMessage('assistant', data.question.question, {
        intent:     data.question.intent,
        difficulty: data.question.difficulty,
        isFollowUp: data.question.isFollowUp,
      });
      speakQuestion(data.question.question);
    } catch (err) {
      setError(err.message);
      setStatus('active');
    }
  }, [sessionId, status, speakQuestion]);

  /**
   * Practice mode only — called when user clicks "Next Question".
   * Fetches the next question from the backend and resumes the interview.
   */
  const fetchNextQuestion = useCallback(async () => {
    if (!sessionId || status !== 'awaiting_next') return;
    try {
      setStatus('processing');

      const data = await apiNext(sessionId);

      if (data.done) {
        setStatus('completed');
        return;
      }

      setQNumber(data.questionNumber);
      setStatus('active');

      lastQuestionRef.current = data.question.question;
      addMessage('assistant', data.question.question, {
        intent:     data.question.intent,
        difficulty: data.question.difficulty,
        isFollowUp: data.question.isFollowUp,
      });
      speakQuestion(data.question.question);
    } catch (err) {
      setError(err.message);
      setStatus('awaiting_next'); // revert so user can retry
    }
  }, [sessionId, status, speakQuestion]);

  const finish = useCallback(async () => {
    if (!sessionId) return;
    stopTTS();
    setIsSpeaking(false);
    await apiEnd(sessionId).catch(console.error);
    setStatus('completed');
  }, [sessionId]);

  const loadFeedback = useCallback(async () => {
    if (!sessionId) return;
    try {
      setStatus('loading');
      const data = await apiFeedback(sessionId);
      setFeedback(data.feedback);
      setStatus('feedback');
    } catch (err) {
      setError(err.message);
      setStatus('completed');
    }
  }, [sessionId]);

  const reset = useCallback(() => {
    stopTTS();
    setStatus('idle');
    setSessionId(null);
    setQNumber(0);
    setMessages([]);
    setFeedback(null);
    setError(null);
    setIsSpeaking(false);
    roleRef.current         = '';
    startTimeRef.current    = null;
    lastQuestionRef.current = '';
  }, []);

  return {
    status,
    sessionId,
    questionNumber,
    totalQuestions,
    messages,
    feedback,
    error,
    isSpeaking,
    mode,
    role: roleRef.current,
    // actions
    start,
    submitAnswer,
    fetchNextQuestion,
    finish,
    loadFeedback,
    reset,
  };
};

export default useInterview;