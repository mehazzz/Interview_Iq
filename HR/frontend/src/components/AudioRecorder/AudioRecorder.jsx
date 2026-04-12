/**
 * components/AudioRecorder/AudioRecorder.jsx
 * Uses Web Speech API for instant, zero-latency transcription.
 *
 * Flow: idle → recording (live text) → submitting (auto on stop) → idle
 * User can re-record while the answer is being processed (until AI responds).
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAudioRecorder from '../../hooks/useAudioRecorder';
import styles from './AudioRecorder.module.css';

const AudioRecorder = ({ onAnswer, disabled }) => {
  const {
    isRecording, transcript, interimText,
    error, isSupported, startRecording, stopRecording, reset,
  } = useAudioRecorder();

  const [phase, setPhase]         = useState('idle');   // idle | recording | submitting
  const [submitted, setSubmitted] = useState('');       // last submitted text (for re-record UX)
  const autoSubmitRef             = useRef(false);      // guard double-fire

  // Sync: when recording stops and we have a transcript → auto-submit
  useEffect(() => {
    if (!isRecording && transcript && phase === 'recording' && !autoSubmitRef.current) {
      autoSubmitRef.current = true;
      setPhase('submitting');
      setSubmitted(transcript);
      onAnswer(transcript);
    }
  }, [isRecording, transcript, phase, onAnswer]);

  // Reset guard when phase goes back to idle (parent set disabled=false again)
  useEffect(() => {
    if (!disabled && phase === 'submitting') {
      // Parent finished processing → go back to idle
      setPhase('idle');
      autoSubmitRef.current = false;
      reset();
    }
  }, [disabled, phase, reset]);

  const handleStart = () => {
    autoSubmitRef.current = false;
    reset();
    setSubmitted('');
    setPhase('recording');
    startRecording();
  };

  const handleStop = () => {
    stopRecording();
    // auto-submit fires via useEffect above; if no speech detected → back to idle
    setTimeout(() => {
      if (!transcript) {
        setPhase('idle');
        autoSubmitRef.current = false;
      }
    }, 500);
  };

  // Re-record: cancel the in-flight answer — only possible while parent is processing
  const handleReRecord = () => {
    autoSubmitRef.current = false;
    reset();
    setSubmitted('');
    setPhase('recording');
    startRecording();
  };

  const liveDisplay = interimText || transcript;

  return (
    <div className={styles.wrapper}>
      {!isSupported && (
        <p className={styles.unsupported}>
          ⚠ Voice input requires Chrome. Type your answer in the box above.
        </p>
      )}

      <AnimatePresence mode="wait">

        {/* ── IDLE ── */}
        {phase === 'idle' && (
          <motion.div key="idle" className={styles.idleState}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
            <button
              className={styles.micBtn}
              onClick={handleStart}
              disabled={disabled}
              aria-label="Start recording"
            >
              <MicIcon />
            </button>
            <p className={styles.hint}>
              {disabled ? 'AI is thinking…' : 'Tap to speak your answer'}
            </p>
          </motion.div>
        )}

        {/* ── RECORDING ── */}
        {phase === 'recording' && (
          <motion.div key="recording" className={styles.recordingState}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <div className={styles.pulseRing} />
            <button
              className={`${styles.micBtn} ${styles.recording}`}
              onClick={handleStop}
              aria-label="Stop and submit"
            >
              <StopIcon />
            </button>

            {liveDisplay ? (
              <motion.div className={styles.liveTranscript}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <span className={styles.liveLabel}>LIVE</span>
                <p>{liveDisplay}</p>
              </motion.div>
            ) : (
              <p className={styles.hint}>Listening… speak clearly, then tap ■ to stop</p>
            )}
          </motion.div>
        )}

        {/* ── SUBMITTING ── */}
        {phase === 'submitting' && (
          <motion.div key="submitting" className={styles.submittingState}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

            <div className={styles.submittedPreview}>
              <span className={styles.submittedLabel}>SUBMITTED</span>
              <p className={styles.submittedText}>{submitted}</p>
            </div>

            <div className={styles.submittingRow}>
              <div className={styles.processingPill}>
                <span className={styles.processingDot} />
                <span className={styles.processingDot} style={{ animationDelay: '0.2s' }} />
                <span className={styles.processingDot} style={{ animationDelay: '0.4s' }} />
                <span>AI is analysing…</span>
              </div>

              <button className={styles.reRecordBtn} onClick={handleReRecord} title="Re-record answer">
                ↺ Re-record
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

const MicIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
  </svg>
);

const StopIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="6" width="12" height="12" rx="2"/>
  </svg>
);

export default AudioRecorder;