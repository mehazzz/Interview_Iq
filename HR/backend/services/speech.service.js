/**
 * services/speech.service.js
 * Speech-to-text transcription.
 * 
 * Strategy:
 * - If audio is provided AND Whisper key exists → use Whisper
 * - Otherwise → return the text passed directly (frontend used Web Speech API)
 * - Mock mode → return placeholder
 */

const config = require('../config/ai.config');

const MOCK_RESPONSES = [
  "I have around four years of experience in frontend development, primarily working with React and TypeScript.",
  "In my last role, I led a team of three engineers to rebuild our checkout flow, reducing load time by 40%.",
  "I handle conflicts by first understanding the other person's perspective, then finding common ground.",
  "I would architect it using a microservices approach with a React frontend and Node.js API gateway.",
  "My strongest skills are JavaScript, React, system design, and cross-functional communication.",
];

const transcribe = async (audio, mimeType = 'audio/webm', directText = null) => {
  // If frontend already transcribed via Web Speech API, just return that
  if (directText && directText.trim().length > 0) {
    return directText.trim();
  }

  // Mock mode
  if (config.mode === 'mock' || !config.whisper.apiKey) {
    await new Promise((r) => setTimeout(r, 600));
    return MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
  }

  // Real Whisper
  const OpenAI = require('openai');
  const client = new OpenAI({ apiKey: config.whisper.apiKey });
  const audioBuffer = Buffer.from(audio, 'base64');
  const { Blob } = require('buffer');
  const file = new File([audioBuffer], 'recording.webm', { type: mimeType });

  const transcription = await client.audio.transcriptions.create({
    file,
    model: config.whisper.model,
  });

  return transcription.text;
};

module.exports = { transcribe };