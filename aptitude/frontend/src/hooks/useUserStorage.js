// src/hooks/useUserStorage.js
// Persists user progress, streak, and weak topics in localStorage
// Structure: { userId, streak, totalPracticed, completedTopics, weakTopics, history }

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'interviewiq_user';

const DEFAULT_DATA = {
  userId: null,
  streak: 0,
  bestStreak: 0,
  totalPracticed: 0,
  totalCorrect: 0,
  completedTopics: [],          // topic IDs where user got ≥5 correct
  weakTopics: {},               // { topicId: { attempts, wrong } }
  testHistory: [],              // [{ date, score, total, accuracy, topics }]
  topicProgress: {},            // { topicId: { attempted, correct } }
  lastActiveDate: null,
};

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DATA };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_DATA, ...parsed };
  } catch {
    return { ...DEFAULT_DATA };
  }
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('InterviewIQ: Could not save to localStorage', e);
  }
}

export function useUserStorage(userId = 'guest') {
  const [userData, setUserData] = useState(() => {
    const stored = loadFromStorage();
    // If userId changed (new login), keep history but update userId
    return { ...stored, userId };
  });

  // Persist every time userData changes
  useEffect(() => {
    saveToStorage(userData);
  }, [userData]);

  // ── Update streak after each answer ──
  const recordAnswer = useCallback((topicId, isCorrect) => {
    setUserData(prev => {
      const topicProg = prev.topicProgress[topicId] || { attempted: 0, correct: 0 };
      const newTopicProg = {
        ...topicProg,
        attempted: topicProg.attempted + 1,
        correct: topicProg.correct + (isCorrect ? 1 : 0),
      };

      const weakEntry = prev.weakTopics[topicId] || { attempts: 0, wrong: 0 };
      const newWeak = {
        attempts: weakEntry.attempts + 1,
        wrong: isCorrect ? weakEntry.wrong : weakEntry.wrong + 1,
      };

      const newStreak = isCorrect ? prev.streak + 1 : 0;
      const newBestStreak = Math.max(prev.bestStreak, newStreak);

      // Mark topic as completed if ≥5 correct answers
      const completedTopics = [...prev.completedTopics];
      if (isCorrect && newTopicProg.correct >= 5 && !completedTopics.includes(topicId)) {
        completedTopics.push(topicId);
      }

      return {
        ...prev,
        streak: newStreak,
        bestStreak: newBestStreak,
        totalPracticed: prev.totalPracticed + 1,
        totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
        topicProgress: { ...prev.topicProgress, [topicId]: newTopicProg },
        weakTopics: { ...prev.weakTopics, [topicId]: newWeak },
        completedTopics,
        lastActiveDate: new Date().toISOString(),
      };
    });
  }, []);

  // ── Save a completed test result ──
  const recordTestResult = useCallback((result) => {
    setUserData(prev => {
      const entry = {
        date: new Date().toISOString(),
        score: result.score,
        total: result.total,
        accuracy: result.accuracy,
        topics: result.weakTopics?.map(w => w.topic) || [],
      };

      // Also update weak topics from test results
      const newWeakTopics = { ...prev.weakTopics };
      (result.results || []).forEach(r => {
        const w = newWeakTopics[r.topic] || { attempts: 0, wrong: 0 };
        newWeakTopics[r.topic] = {
          attempts: w.attempts + 1,
          wrong: r.isCorrect ? w.wrong : w.wrong + 1,
        };
      });

      const history = [entry, ...prev.testHistory].slice(0, 20); // keep last 20

      return {
        ...prev,
        testHistory: history,
        weakTopics: newWeakTopics,
        lastActiveDate: new Date().toISOString(),
      };
    });
  }, []);

  // ── Reset all data (useful for testing) ──
  const resetUserData = useCallback(() => {
    const fresh = { ...DEFAULT_DATA, userId };
    setUserData(fresh);
    saveToStorage(fresh);
  }, [userId]);

  // ── Computed helpers ──
  const getTopicAccuracy = useCallback((topicId) => {
    const p = userData.topicProgress[topicId];
    if (!p || p.attempted === 0) return null;
    return Math.round((p.correct / p.attempted) * 100);
  }, [userData]);

  const getWeakTopicIds = useCallback(() => {
    return Object.entries(userData.weakTopics)
      .filter(([, w]) => w.attempts > 0 && (w.wrong / w.attempts) > 0.4)
      .sort((a, b) => (b[1].wrong / b[1].attempts) - (a[1].wrong / a[1].attempts))
      .map(([id]) => id);
  }, [userData]);

  const overallAccuracy = userData.totalPracticed > 0
    ? Math.round((userData.totalCorrect / userData.totalPracticed) * 100)
    : null;

  return {
    userData,
    recordAnswer,
    recordTestResult,
    resetUserData,
    getTopicAccuracy,
    getWeakTopicIds,
    overallAccuracy,
  };
}