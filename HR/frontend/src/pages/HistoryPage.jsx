/**
 * pages/HistoryPage.jsx
 * Shows all past interview sessions with scores, comparison chart,
 * and role/mode filtering.
 */

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { listHistory, deleteHistory } from '../services/api.service';
import styles from './HistoryPage.module.css';

// ── Simple inline bar chart (no external lib needed) ──────────
const MiniChart = ({ results }) => {
  if (!results.length) return null;

  const max    = 10;
  const recent = [...results].reverse().slice(-10); // last 10, chronological

  return (
    <div className={styles.chart}>
      <p className={styles.chartTitle}>SCORE TREND — LAST {recent.length} SESSIONS</p>
      <div className={styles.chartBars}>
        {recent.map((r, i) => {
          const pct   = (r.score / max) * 100;
          const color = r.score >= 7 ? '#4ade80' : r.score >= 5 ? '#fb790b' : '#f87171';
          return (
            <div key={i} className={styles.barCol}>
              <span className={styles.barScore} style={{ color }}>{r.score.toFixed(1)}</span>
              <div className={styles.barTrack}>
                <motion.div
                  className={styles.barFill}
                  style={{ background: color }}
                  initial={{ height: 0 }}
                  animate={{ height: `${pct}%` }}
                  transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                />
              </div>
              <span className={styles.barLabel}>
                {new Date(r.savedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          );
        })}
      </div>
      {/* Average line marker */}
      <div className={styles.avgLine}>
        <span>AVG: {(recent.reduce((s, r) => s + r.score, 0) / recent.length).toFixed(1)}</span>
      </div>
    </div>
  );
};

// ── Result card ────────────────────────────────────────────────
const ResultCard = ({ result, onDelete, onExpand, isExpanded }) => {
  const scoreColor = result.score >= 7 ? '#4ade80' : result.score >= 5 ? '#fb790b' : '#f87171';
  const duration   = result.duration ? `${Math.floor(result.duration / 60)}m ${result.duration % 60}s` : '—';

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      layout
    >
      {/* Card header */}
      <div className={styles.cardHeader}>
        <div className={styles.cardLeft}>
          <div className={styles.scoreCircle} style={{ borderColor: scoreColor, color: scoreColor }}>
            {result.score.toFixed(1)}
          </div>
          <div>
            <p className={styles.cardRole}>{result.role}</p>
            <div className={styles.cardMeta}>
              <span className={`${styles.modeBadge} ${result.mode === 'test' ? styles.testBadge : styles.practiceBadge}`}>
                {result.mode}
              </span>
              <span className={styles.metaDot}>·</span>
              <span>{result.questionCount} questions</span>
              <span className={styles.metaDot}>·</span>
              <span>{duration}</span>
              <span className={styles.metaDot}>·</span>
              <span>{new Date(result.savedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className={styles.cardActions}>
          <button className={styles.expandBtn} onClick={() => onExpand(result.id)}>
            {isExpanded ? '▲ Hide' : '▼ Details'}
          </button>
          <button className={styles.deleteBtn} onClick={() => onDelete(result.id)} title="Delete">✕</button>
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && result.feedback && (
          <motion.div
            className={styles.cardBody}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <p className={styles.summary}>{result.feedback.summary}</p>

            {/* Dimension scores — compact 4-pill display */}
            {result.feedback.dimensionScores && (
              <div className={styles.dimPills}>
                {Object.entries(result.feedback.dimensionScores).map(([key, val]) => {
                  const label = { contentRelevance: 'Content', clarity: 'Clarity', confidence: 'Confidence', structure: 'Structure' }[key] || key;
                  const color = val >= 7 ? '#4ade80' : val >= 5 ? '#fb790b' : '#f87171';
                  return (
                    <div key={key} className={styles.dimPill}>
                      <span className={styles.dimPillLabel}>{label}</span>
                      <span className={styles.dimPillScore} style={{ color }}>{val}/10</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className={styles.swRow}>
              <div>
                <p className={styles.swHead} style={{ color: '#4ade80' }}>✓ Strengths</p>
                <ul className={styles.swList}>
                  {result.feedback.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div>
                <p className={styles.swHead} style={{ color: '#f87171' }}>✗ Weaknesses</p>
                <ul className={styles.swList}>
                  {result.feedback.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            </div>

            <div className={styles.suggestions}>
              {result.feedback.suggestions?.map((s, i) => (
                <div key={i} className={styles.suggestion}>
                  <span className={styles.sugArrow}>→</span>{s}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Main page ────────────────────────────────────────────────
const HistoryPage = ({ onBack }) => {
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [roleFilter, setRoleF]    = useState('all');
  const [modeFilter, setModeF]    = useState('all');
  const [expanded, setExpanded]   = useState(null);

  useEffect(() => {
    listHistory()
      .then((d) => setResults(d.results || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const allRoles = useMemo(() => {
    const r = new Set(results.map((x) => x.role));
    return ['all', ...r];
  }, [results]);

  const filtered = useMemo(() => {
    return results.filter((r) => {
      const roleOk = roleFilter === 'all' || r.role === roleFilter;
      const modeOk = modeFilter === 'all' || r.mode === modeFilter;
      return roleOk && modeOk;
    });
  }, [results, roleFilter, modeFilter]);

  const stats = useMemo(() => {
    if (!filtered.length) return null;
    const scores   = filtered.map((r) => r.score);
    const avg      = scores.reduce((a, b) => a + b, 0) / scores.length;
    const best     = Math.max(...scores);
    const latest   = filtered[0]?.score ?? 0;
    const improved = filtered.length >= 2
      ? (filtered[0].score - filtered[filtered.length - 1].score).toFixed(1)
      : null;
    return { avg: avg.toFixed(1), best: best.toFixed(1), latest: latest.toFixed(1), improved };
  }, [filtered]);

  const handleDelete = async (id) => {
    await deleteHistory(id).catch(console.error);
    setResults((prev) => prev.filter((r) => r.id !== id));
  };

  const handleExpand = (id) => setExpanded((prev) => (prev === id ? null : id));

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <div>
          <p className={styles.eyebrow}>PERFORMANCE HISTORY</p>
          <h1 className={styles.title}>Interview Results</h1>
        </div>
      </div>

      {loading && (
        <div className={styles.centered}>
          <div className={styles.spinner} />
          <p className={styles.loadText}>Loading your history…</p>
        </div>
      )}

      {error && <p className={styles.errorText}>Error: {error}</p>}

      {!loading && !error && results.length === 0 && (
        <div className={styles.emptyState}>
          <p className={styles.emptyIcon}>🎤</p>
          <p className={styles.emptyTitle}>No interviews yet</p>
          <p className={styles.emptyDesc}>Complete an interview to see your results here.</p>
          <button className={styles.emptyBtn} onClick={onBack}>Start an Interview →</button>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className={styles.content}>

          {/* Stats row */}
          {stats && (
            <motion.div className={styles.statsRow}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              {[
                { label: 'SESSIONS', value: filtered.length },
                { label: 'AVG SCORE', value: stats.avg },
                { label: 'BEST SCORE', value: stats.best },
                { label: 'LATEST', value: stats.latest },
                ...(stats.improved !== null
                  ? [{ label: 'IMPROVEMENT', value: `${stats.improved > 0 ? '+' : ''}${stats.improved}` }]
                  : []),
              ].map((s, i) => (
                <div key={i} className={styles.statCard}>
                  <p className={styles.statLabel}>{s.label}</p>
                  <p className={styles.statValue}>{s.value}</p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Chart */}
          <MiniChart results={filtered} />

          {/* Filters */}
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>ROLE</span>
              {allRoles.map((r) => (
                <button key={r}
                  className={`${styles.filterChip} ${roleFilter === r ? styles.filterActive : ''}`}
                  onClick={() => setRoleF(r)}>
                  {r === 'all' ? 'All Roles' : r}
                </button>
              ))}
            </div>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>MODE</span>
              {['all', 'practice', 'test'].map((m) => (
                <button key={m}
                  className={`${styles.filterChip} ${modeFilter === m ? styles.filterActive : ''}`}
                  onClick={() => setModeF(m)}>
                  {m === 'all' ? 'All' : m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Results list */}
          <motion.div className={styles.resultsList} layout>
            <AnimatePresence>
              {filtered.map((r) => (
                <ResultCard
                  key={r.id}
                  result={r}
                  onDelete={handleDelete}
                  onExpand={handleExpand}
                  isExpanded={expanded === r.id}
                />
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <p className={styles.noMatch}>No results match the current filter.</p>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;