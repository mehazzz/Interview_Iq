/**
 * components/ChatWindow/ChatWindow.jsx
 *
 * Practice mode:
 *   - HintCard shown after user answer (collapsible feedback only — no button inside)
 *   - "Next Question →" button rendered at the BOTTOM of the window, always visible
 * Test mode:
 *   - No hints, no Next button
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ChatWindow.module.css';

const DIFFICULTY_COLORS = {
  easy:   '#4ade80',
  medium: '#fb790b',
  hard:   '#f87171',
};

const SCORE_COLORS = {
  Excellent:    '#4ade80',
  Good:         '#fb790b',
  Fair:         '#facc15',
  'Needs Work': '#f87171',
};

// ── Hint card — feedback only, NO button inside ───────────────
const HintCard = ({ hint }) => {
  const [open, setOpen] = useState(true);
  const color = SCORE_COLORS[hint.scoreLabel] || '#fb790b';

  return (
    <motion.div
      className={styles.hintCard}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{ '--hint-color': color }}
    >
      {/* Header — always visible, click to collapse */}
      <button className={styles.hintHeader} onClick={() => setOpen(p => !p)}>
        <div className={styles.hintLeft}>
          <span className={styles.hintIcon}>✦</span>
          <span className={styles.hintLabel}>PRACTICE FEEDBACK</span>
          <span className={styles.hintScore} style={{ color, borderColor: color }}>
            {hint.scoreLabel} · {hint.score}/10
          </span>
        </div>
        <span className={`${styles.hintChevron} ${open ? styles.hintChevronOpen : ''}`}>›</span>
      </button>

      {/* Body — collapsible */}
      {open && (
        <div className={styles.hintBody}>
          <div className={styles.hintRow}>
            <span className={styles.hintRowIcon} style={{ color: '#4ade80' }}>✓</span>
            <span className={styles.hintRowText}>{hint.whatWorked}</span>
          </div>
          <div className={styles.hintRow}>
            <span className={styles.hintRowIcon} style={{ color: '#f87171' }}>↑</span>
            <span className={styles.hintRowText}>{hint.improve}</span>
          </div>
          {hint.tips?.length > 0 && (
            <div className={styles.hintTips}>
              {hint.tips.map((tip, i) => (
                <div key={i} className={styles.hintTip}>
                  <span className={styles.tipBullet}>→</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          )}
          {hint.examplePhrase && (
            <div className={styles.examplePhrase}>
              <span className={styles.exampleLabel}>EXAMPLE PHRASING</span>
              <p>{hint.examplePhrase}</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

// ── Message bubble ────────────────────────────────────────────
const Message = ({ message, isLatest, isPractice }) => {
  const isAI = message.role === 'assistant';

  return (
    <>
      <motion.div
        className={`${styles.message} ${isAI ? styles.aiMessage : styles.userMessage}`}
        initial={{ opacity: 0, y: 14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className={`${styles.avatar} ${isAI ? styles.aiAvatar : styles.userAvatar}`}>
          {isAI ? 'AI' : 'YOU'}
        </div>
        <div className={styles.bubble}>
          <p className={styles.text}>{message.content}</p>
          {isAI && message.meta?.intent && (
            <div className={styles.meta}>
              {message.meta.isFollowUp && (
                <span className={styles.badge} style={{ background: 'rgba(251,121,11,0.15)', color: '#fb790b' }}>
                  ↩ follow-up
                </span>
              )}
              <span className={styles.badge}>{message.meta.intent}</span>
              {message.meta.difficulty && (
                <span className={styles.badge} style={{
                  color:      DIFFICULTY_COLORS[message.meta.difficulty],
                  background: `${DIFFICULTY_COLORS[message.meta.difficulty]}18`,
                }}>
                  {message.meta.difficulty}
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Hint card — only on the latest user message in practice mode */}
      {!isAI && isPractice && isLatest && message.meta?.hint && (
        <HintCard hint={message.meta.hint} />
      )}
    </>
  );
};

// ── Main window ───────────────────────────────────────────────
const ChatWindow = ({ messages, isSpeaking, isProcessing, awaitingNext, onNext, isPractice }) => {
  const bottomRef              = useRef(null);
  const [loadingNext, setLoading] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing, awaitingNext]);

  // Reset spinner when next question arrives
  useEffect(() => {
    if (!awaitingNext) setLoading(false);
  }, [awaitingNext]);

  const handleNext = () => {
    setLoading(true);
    onNext();
  };

  const lastUserIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') return i;
    }
    return -1;
  })();

  return (
    <div className={styles.window}>
      {/* Messages */}
      {messages.map((msg, idx) => (
        <Message
          key={msg.id}
          message={msg}
          isLatest={idx === lastUserIndex}
          isPractice={isPractice}
        />
      ))}

      {/* Speaking waveform */}
      {isSpeaking && (
        <motion.div className={styles.speakingIndicator}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className={styles.soundWave}>
            {[...Array(5)].map((_, i) => (
              <span key={i} className={styles.bar} style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
          <span>AI is speaking…</span>
        </motion.div>
      )}

      {/* Thinking dots */}
      {isProcessing && !isSpeaking && (
        <motion.div className={styles.thinking} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <span className={styles.dot} style={{ animationDelay: '0s' }} />
          <span className={styles.dot} style={{ animationDelay: '0.2s' }} />
          <span className={styles.dot} style={{ animationDelay: '0.4s' }} />
        </motion.div>
      )}

      {/* ── NEXT QUESTION BUTTON ── always visible at bottom of chat when awaiting */}
      {isPractice && awaitingNext && (
        <motion.div
          className={styles.nextQuestionBar}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <motion.button
            className={styles.nextQuestionBtn}
            onClick={handleNext}
            disabled={loadingNext}
            whileHover={{ scale: loadingNext ? 1 : 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {loadingNext ? (
              <>
                <span className={styles.nextSpinner} />
                Fetching next question…
              </>
            ) : (
              <>
                Next Question
                <span className={styles.nextArrow}>→</span>
              </>
            )}
          </motion.button>
        </motion.div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default ChatWindow;