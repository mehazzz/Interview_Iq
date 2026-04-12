/**
 * services/api.service.js
 *
 * Uses a RELATIVE baseURL (/api) so all requests go through CRA's proxy
 * (configured in package.json as "proxy": "http://localhost:5000").
 * This avoids CORS issues entirely — no matter what port the frontend runs on.
 */
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',   // ← relative, routed via CRA proxy to localhost:5000
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

// ── userId header injection ───────────────────────────────────
let _userId = null;

export const setUserId = (id) => { _userId = id; };

api.interceptors.request.use((config) => {
  if (_userId) config.headers['x-user-id'] = _userId;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err.response?.data?.error?.message ||
      err.response?.data?.error ||
      err.message ||
      'Network error';
    return Promise.reject(new Error(message));
  }
);

// ── User ─────────────────────────────────────────────────────
export const identifyUser = (userId, displayName) =>
  api.post('/user/identify', { userId, displayName });

// ── Interview ─────────────────────────────────────────────────
export const startInterview    = (role, mode)                  => api.post('/interview/start',   { role, mode });
export const submitAnswer      = (sessionId, ans)              => api.post('/interview/respond', { sessionId, answer: ans });
export const fetchNextQuestion = (sessionId)                   => api.post('/interview/next',    { sessionId });
export const endInterview      = (sessionId)                   => api.post('/interview/end',     { sessionId });
export const getAnswerHint     = (sessionId, question, answer) => api.post('/interview/hint',    { sessionId, question, answer });

// ── Feedback ──────────────────────────────────────────────────
export const generateFeedback = (sessionId) => api.post('/feedback/generate', { sessionId });

// ── Speech ────────────────────────────────────────────────────
export const transcribeText = (directText) => api.post('/speech/transcribe', { directText });

// ── Topics ────────────────────────────────────────────────────
export const getTopics = (role) => api.get(`/topics?role=${encodeURIComponent(role)}`);

// ── History ───────────────────────────────────────────────────
export const listHistory   = (role) => api.get(`/history${role ? `?role=${encodeURIComponent(role)}` : ''}`);
export const deleteHistory = (id)   => api.delete(`/history/${id}`);
export const saveHistory   = (data) => api.post('/history/save', data);

export default api;