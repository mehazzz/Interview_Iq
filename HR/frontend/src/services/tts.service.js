/**
 * services/tts.service.js
 * Text-to-speech using the browser's Web Speech API.
 * No API key required — works offline.
 */

let currentUtterance = null;

/**
 * Speak text aloud using browser TTS.
 * @param {string} text
 * @param {object} options
 * @param {Function} options.onStart
 * @param {Function} options.onEnd
 */
export const speak = (text, { onStart, onEnd } = {}) => {
  if (!window.speechSynthesis) {
    console.warn('TTS not supported in this browser');
    onEnd?.();
    return;
  }

  // Cancel any in-progress speech
  stop();

  const utterance = new SpeechSynthesisUtterance(text);
  currentUtterance = utterance;

  // Pick a natural-sounding voice
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(
    (v) => v.lang === 'en-US' && v.name.toLowerCase().includes('natural')
  ) || voices.find((v) => v.lang === 'en-US') || voices[0];

  if (preferred) utterance.voice = preferred;

  utterance.rate  = 0.95;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  utterance.onstart = () => onStart?.();
  utterance.onend   = () => { currentUtterance = null; onEnd?.(); };
  utterance.onerror = () => { currentUtterance = null; onEnd?.(); };

  window.speechSynthesis.speak(utterance);
};

/** Stop any current TTS playback */
export const stop = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
};

/** Whether TTS is currently speaking */
export const isSpeaking = () => window.speechSynthesis?.speaking ?? false;

/**
 * Wait for voices to load (Chrome loads them async).
 * Call this once on app startup.
 */
export const loadVoices = () =>
  new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length) return resolve(voices);
    window.speechSynthesis.onvoiceschanged = () =>
      resolve(window.speechSynthesis.getVoices());
  });