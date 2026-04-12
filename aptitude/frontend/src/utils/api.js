// src/utils/api.js
const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/aptitude';

const fetchJSON = async (url, options = {}) => {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
  return res.json();
};

const api = {
  getTopics: () =>
    fetchJSON(`${BASE}/topics`),

  getLearnContent: (topicId) =>
    fetchJSON(`${BASE}/learn/${topicId}`),

  getQuestions: (topic, difficulty = 'medium', count = 5) =>
    fetchJSON(`${BASE}/questions?topic=${topic}&difficulty=${difficulty}&count=${count}`),

  startTest: ({ topics, difficulty, questionCount, timeLimit }) =>
    fetchJSON(`${BASE}/test/start`, {
      method: 'POST',
      body: JSON.stringify({ topics, difficulty, questionCount, timeLimit }),
    }),

  submitTest: ({ answers, questions, timeTaken }) =>
    fetchJSON(`${BASE}/test/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers, questions, timeTaken }),
    }),
};

export default api;