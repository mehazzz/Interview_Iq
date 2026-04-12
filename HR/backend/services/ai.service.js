/**
 * services/ai.service.js
 * Main AI service — routes calls to the configured provider.
 * Fixes: Gemini model name (gemini-1.5-flash), JSON extraction, error handling.
 */

const config = require('../config/ai.config');
const mockAI = require('./mockAI.service');
const {
  systemPrompt,
  nextQuestionPrompt,
  openingQuestionPrompt,
  feedbackPrompt,
  topicsPrompt,
  answerHintPrompt,
} = require('../utils/promptBuilder');

// ── Helpers ───────────────────────────────────────────────────
/**
 * Strips markdown fences and extracts the first valid JSON block.
 */
const extractJSON = (text) => {
  let clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const firstBrace = clean.search(/[{[]/);
  const lastBrace  = Math.max(clean.lastIndexOf('}'), clean.lastIndexOf(']'));
  if (firstBrace !== -1 && lastBrace !== -1) {
    clean = clean.slice(firstBrace, lastBrace + 1);
  }
  return JSON.parse(clean);
};

// ── OpenAI ────────────────────────────────────────────────────
const callOpenAI = async (messages) => {
  const OpenAI = require('openai');
  const client = new OpenAI({ apiKey: config.openai.apiKey });
  const response = await client.chat.completions.create({
    model: config.openai.model,
    temperature: config.openai.temperature,
    messages,
    response_format: { type: 'json_object' },
  });
  return extractJSON(response.choices[0].message.content);
};

// ── Gemini ────────────────────────────────────────────────────
const callGemini = async (systemText, userText) => {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  // gemini-1.5-flash is free-tier friendly and fast
  const model = genAI.getGenerativeModel({ model: config.gemini.model });
  const prompt = `${systemText}\n\n${userText}\n\nRespond ONLY with valid JSON. No markdown. No explanation.`;
  const result = await model.generateContent(prompt);
  return extractJSON(result.response.text());
};

// ── Public API ────────────────────────────────────────────────

const getOpeningQuestion = async (role, sessionId = '') => {
  if (config.mode === 'mock') return mockAI.getNextQuestion(role, 0, 6, sessionId);
  const messages = [
    { role: 'system', content: systemPrompt(role) },
    { role: 'user',   content: openingQuestionPrompt(role) },
  ];
  if (config.mode === 'openai') return callOpenAI(messages);
  if (config.mode === 'gemini') return callGemini(systemPrompt(role), openingQuestionPrompt(role));
  throw new Error(`Unknown AI_MODE: ${config.mode}`);
};

/**
 * @param {string} role
 * @param {Array}  history        full conversation so far (includes latest user answer)
 * @param {string} latestAnswer   the answer just given
 * @param {number} questionIndex
 * @param {string} sessionId      used by mock to shuffle questions per session
 */
const getNextQuestion = async (role, history, latestAnswer, questionIndex, sessionId = '') => {
  if (config.mode === 'mock') {
    return mockAI.getNextQuestion(
      role,
      questionIndex,
      mockAI.scoreAnswer(latestAnswer),
      sessionId
    );
  }

  // For real AI: send system prompt + full conversation history.
  // The history already contains the latest user answer, so we just ask
  // the AI what to ask next — no extra user turn needed.
  const messages = [
    { role: 'system', content: systemPrompt(role) },
    // Map our history roles to OpenAI roles (both use 'assistant'/'user')
    ...history.map((h) => ({ role: h.role, content: h.content })),
    // Explicit instruction turn so the model knows what to return
    {
      role: 'user',
      content: `Based on the conversation above, generate the next interview question.
Evaluate the last candidate answer and set answerQualityScore (0-10).
If score < 4, set isFollowUp: true and ask a targeted follow-up.
If score >= 4, advance to the next logical question for a ${role}.
Return only valid JSON matching the schema.`,
    },
  ];

  if (config.mode === 'openai') return callOpenAI(messages);
  if (config.mode === 'gemini') return callGemini(
    systemPrompt(role),
    `Conversation so far:\n${history.map(h => `${h.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${h.content}`).join('\n')}\n\nGenerate the next interview question. Evaluate the last answer (answerQualityScore 0-10). If score < 4 ask a follow-up. Return only valid JSON.`
  );
  throw new Error(`Unknown AI_MODE: ${config.mode}`);
};

const generateFeedback = async (role, history, mode = 'practice') => {
  if (config.mode === 'mock') return mockAI.generateFeedback(role, history, mode);
  const messages = [
    { role: 'system', content: systemPrompt(role) },
    { role: 'user',   content: feedbackPrompt(role, history, mode) },
  ];
  if (config.mode === 'openai') return callOpenAI(messages);
  if (config.mode === 'gemini') return callGemini(systemPrompt(role), feedbackPrompt(role, history, mode));
  throw new Error(`Unknown AI_MODE: ${config.mode}`);
};

const getTopicsForRole = async (role) => {
  if (config.mode === 'mock') return mockAI.getTopicsForRole(role);
  const prompt = topicsPrompt(role);
  const sys = 'You are a senior HR expert and career coach. Return only valid JSON, no markdown.';
  const messages = [{ role: 'system', content: sys }, { role: 'user', content: prompt }];
  if (config.mode === 'openai') return callOpenAI(messages);
  if (config.mode === 'gemini') return callGemini(sys, prompt);
  throw new Error(`Unknown AI_MODE: ${config.mode}`);
};

/**
 * Get a coaching hint for a single answer (practice mode only).
 * @param {string} role
 * @param {string} question  - the question that was asked
 * @param {string} answer    - the candidate's answer
 */
const getAnswerHint = async (role, question, answer) => {
  if (config.mode === 'mock') return mockAI.generateAnswerHint(question, answer);

  const sys  = `You are a friendly interview coach for "${role}". Return only valid JSON, no markdown.`;
  const user = answerHintPrompt(question, answer, role);
  const messages = [{ role: 'system', content: sys }, { role: 'user', content: user }];

  if (config.mode === 'openai') return callOpenAI(messages);
  if (config.mode === 'gemini') return callGemini(sys, user);
  throw new Error(`Unknown AI_MODE: ${config.mode}`);
};

module.exports = { getOpeningQuestion, getNextQuestion, generateFeedback, getTopicsForRole, getAnswerHint };