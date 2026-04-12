/**
 * config/ai.config.js
 * FIXED: Gemini model changed to gemini-1.5-flash (available on free tier)
 */
module.exports = {
  mode: process.env.AI_MODE || 'mock',

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini',   // cheaper than gpt-4o, still very capable
    temperature: 0.7,
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-1.5-flash',   // FREE tier friendly, fast, widely available
  },

  whisper: {
    apiKey: process.env.WHISPER_API_KEY || process.env.OPENAI_API_KEY,
    model: 'whisper-1',
  },

  interview: {
    maxQuestions: 8,
    weakAnswerThreshold: 4,
    strongAnswerThreshold: 7,
  },

  // Test mode: stricter, timed, scored like a real assessment
  test: {
    maxQuestions: 10,
    timePerQuestion: 120, // seconds
  },
};