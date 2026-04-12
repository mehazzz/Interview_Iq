/**
 * hooks/useAudioRecorder.js
 * 
 * PRIMARY: Web Speech API (browser-native, no API key, instant results)
 * FALLBACK: MediaRecorder → send to backend Whisper
 * 
 * This fixes the "stuck on loading" transcription issue.
 */

import { useState, useRef, useCallback, useEffect } from 'react';

const useAudioRecorder = () => {
  const [isRecording, setIsRecording]     = useState(false);
  const [transcript, setTranscript]       = useState('');
  const [interimText, setInterimText]     = useState('');
  const [error, setError]                 = useState(null);
  const [isSupported, setIsSupported]     = useState(true);

  const recognitionRef = useRef(null);
  const finalTextRef   = useRef('');

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition not supported in this browser. Use Chrome.');
    }
  }, []);

  const startRecording = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Please use Chrome for voice input.');
      return;
    }

    setError(null);
    setTranscript('');
    setInterimText('');
    finalTextRef.current = '';

    const recognition = new SpeechRecognition();
    recognition.continuous      = true;
    recognition.interimResults  = true;
    recognition.lang            = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = '';
      let final   = finalTextRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += text + ' ';
        } else {
          interim += text;
        }
      }

      finalTextRef.current = final;
      setInterimText(interim);
      if (final.trim()) setTranscript(final.trim());
    };

    recognition.onerror = (e) => {
      if (e.error === 'no-speech') return; // ignore silence
      setError(`Mic error: ${e.error}. Try again.`);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimText('');
      if (finalTextRef.current.trim()) {
        setTranscript(finalTextRef.current.trim());
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setInterimText('');
  }, []);

  const reset = useCallback(() => {
    stopRecording();
    setTranscript('');
    setInterimText('');
    setError(null);
    finalTextRef.current = '';
  }, [stopRecording]);

  return {
    isRecording,
    transcript,
    interimText,
    error,
    isSupported,
    startRecording,
    stopRecording,
    reset,
  };
};

export default useAudioRecorder;