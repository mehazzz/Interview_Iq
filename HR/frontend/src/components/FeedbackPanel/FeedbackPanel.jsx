/**
 * components/FeedbackPanel/FeedbackPanel.jsx
 *
 * Sections:
 *  1. Header (role, mode, ready badge)
 *  2. Score ring + summary
 *  3. Dimension scores (4 animated bars — content, clarity, confidence, structure)
 *  4. Strengths / Weaknesses grid
 *  5. Suggestions
 *  6. Per-question breakdown
 *  7. Action buttons (Restart + View History)
 */
import React from 'react';
import { motion } from 'framer-motion';
import styles from './FeedbackPanel.module.css';

// ── Score ring ────────────────────────────────────────────────
const ScoreRing = ({ score }) => {
  const pct  = (score / 10) * 100;
  const color = score >= 7 ? '#4ade80' : score >= 5 ? '#fb790b' : '#f87171';
  const r    = 34;
  const circ = 2 * Math.PI * r;
  return (
    <div className={styles.scoreRing}>
      <svg viewBox="0 0 80 80" className={styles.ringsvg}>
        <circle cx="40" cy="40" r={r} className={styles.ringBg} />
        <motion.circle
          cx="40" cy="40" r={r}
          className={styles.ringFill}
          style={{ stroke: color }}
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct / 100) }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className={styles.scoreNumber} style={{ color }}>
        <span>{score.toFixed(1)}</span>
        <small>/10</small>
      </div>
    </div>
  );
};

// ── Dimension bar ─────────────────────────────────────────────
const DIMENSION_META = {
  contentRelevance: { label: 'Content Relevance', desc: 'Did answers directly address the question?' },
  clarity:          { label: 'Clarity',           desc: 'Were answers structured and easy to follow?' },
  confidence:       { label: 'Confidence & Tone', desc: 'Did the candidate sound assured and professional?' },
  structure:        { label: 'Structure',          desc: 'Was there a logical flow (e.g. STAR method)?' },
};

const DimensionBar = ({ dimensionKey, score, index }) => {
  const meta  = DIMENSION_META[dimensionKey];
  const color = score >= 7 ? '#4ade80' : score >= 5 ? '#fb790b' : '#f87171';
  const pct   = `${(score / 10) * 100}%`;

  return (
    <motion.div
      className={styles.dimRow}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.08, ease: 'easeOut' }}
    >
      <div className={styles.dimHeader}>
        <span className={styles.dimLabel}>{meta.label}</span>
        <span className={styles.dimScore} style={{ color }}>{score}/10</span>
      </div>
      <div className={styles.dimTrack}>
        <motion.div
          className={styles.dimFill}
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: pct }}
          transition={{ duration: 0.8, delay: 0.2 + index * 0.08, ease: 'easeOut' }}
        />
      </div>
      <p className={styles.dimDesc}>{meta.desc}</p>
    </motion.div>
  );
};

const DimensionScores = ({ scores }) => {
  if (!scores) return null;
  const keys = ['contentRelevance', 'clarity', 'confidence', 'structure'];
  return (
    <div className={styles.dimensionsCard}>
      <p className={styles.sectionLabel}>EVALUATION DIMENSIONS</p>
      <div className={styles.dimGrid}>
        {keys.map((key, i) =>
          scores[key] != null
            ? <DimensionBar key={key} dimensionKey={key} score={scores[key]} index={i} />
            : null
        )}
      </div>
    </div>
  );
};

// ── Main panel ────────────────────────────────────────────────
const FeedbackPanel = ({ feedback, role, mode, onRestart, onViewHistory }) => {
  if (!feedback) return null;

  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
  const item    = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

  return (
    <motion.div className={styles.panel} initial="hidden" animate="visible" variants={stagger}>

      {/* ── Header ── */}
      <motion.div className={styles.header} variants={item}>
        <p className={styles.eyebrow}>INTERVIEW COMPLETE</p>
        <h2 className={styles.title}>Performance Report</h2>
        <div className={styles.headerMeta}>
          <span className={styles.roleTag}>{role}</span>
          {mode && (
            <span className={`${styles.modeTag} ${mode === 'test' ? styles.testTag : styles.practiceTag}`}>
              {mode}
            </span>
          )}
          {feedback.readyForInterview !== undefined && (
            <span
              className={styles.readyTag}
              style={{
                color:       feedback.readyForInterview ? '#4ade80' : '#f87171',
                borderColor: feedback.readyForInterview ? '#4ade80' : '#f87171',
              }}
            >
              {feedback.readyForInterview ? '✓ Interview Ready' : '⟳ Needs Practice'}
            </span>
          )}
        </div>
      </motion.div>

      {/* ── Overall score + summary ── */}
      <motion.div className={styles.scoreSection} variants={item}>
        <ScoreRing score={feedback.overallScore} />
        <p className={styles.summary}>{feedback.summary}</p>
      </motion.div>

      {/* ── 4-dimension breakdown ── */}
      {feedback.dimensionScores && (
        <motion.div variants={item}>
          <DimensionScores scores={feedback.dimensionScores} />
        </motion.div>
      )}

      {/* ── Strengths & Weaknesses ── */}
      <motion.div className={styles.swGrid} variants={item}>
        <div className={styles.swCard}>
          <p className={styles.swTitle} style={{ color: '#4ade80' }}>✓ Strengths</p>
          <ul className={styles.swList}>
            {feedback.strengths?.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
        <div className={styles.swCard}>
          <p className={styles.swTitle} style={{ color: '#f87171' }}>✗ Areas to Improve</p>
          <ul className={styles.swList}>
            {feedback.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      </motion.div>

      {/* ── Suggestions ── */}
      {feedback.suggestions?.length > 0 && (
        <motion.div className={styles.suggestions} variants={item}>
          <p className={styles.sectionLabel}>SUGGESTIONS</p>
          {feedback.suggestions.map((s, i) => (
            <div key={i} className={styles.suggestion}>
              <span className={styles.sugIcon}>→</span>
              <span>{s}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── Per-question breakdown ── */}
      {feedback.questionBreakdown?.length > 0 && (
        <motion.div className={styles.breakdown} variants={item}>
          <p className={styles.sectionLabel}>QUESTION BREAKDOWN</p>
          {feedback.questionBreakdown.map((q, i) => {
            const qColor = q.score >= 7 ? '#4ade80' : q.score >= 5 ? '#fb790b' : '#f87171';
            return (
              <div key={i} className={styles.bqCard}>
                <div className={styles.bqHeader}>
                  <span className={styles.bqNumber}>Q{i + 1}</span>
                  <span className={styles.bqScore} style={{ color: qColor }}>
                    {q.score}/10
                  </span>
                </div>
                <p className={styles.bqQ}>{q.question}</p>
                <p className={styles.bqFeedback}>{q.feedback}</p>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* ── Action buttons ── */}
      <motion.div className={styles.actions} variants={item}>
        <button className={styles.historyBtn} onClick={onViewHistory}>
          📊 View All Results
        </button>
        <button className={styles.restartBtn} onClick={onRestart}>
          ↺ New Interview
        </button>
      </motion.div>

    </motion.div>
  );
};

export default FeedbackPanel;