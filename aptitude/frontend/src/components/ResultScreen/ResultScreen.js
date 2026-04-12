// src/components/ResultScreen/ResultScreen.js
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './ResultScreen.css';

const TOPIC_NAMES = {
  time_work:'Time & Work', speed_distance:'Time, Speed & Distance', profit_loss:'Profit & Loss',
  percentage:'Percentage', ratio_proportion:'Ratio & Proportion', averages:'Averages',
  number_system:'Number System', simplification:'Simplification',
  mixtures_alligations:'Mixtures & Alligations', permutations_combinations:'Permutations & Combinations',
  probability:'Probability', data_interpretation:'Data Interpretation',
  logical_reasoning:'Logical Reasoning', blood_relations:'Blood Relations',
  coding_decoding:'Coding-Decoding', series:'Series (Number/Alphabet)',
};
const TOPIC_ICONS = {
  time_work:'⚙️', speed_distance:'🚀', profit_loss:'💰', percentage:'📊',
  ratio_proportion:'⚖️', averages:'📈', number_system:'🔢', simplification:'🔣',
  mixtures_alligations:'🧪', permutations_combinations:'🔀', probability:'🎲',
  data_interpretation:'📉', logical_reasoning:'🧩', blood_relations:'👨‍👩‍👧‍👦',
  coding_decoding:'🔐', series:'🔗',
};

function ScoreRing({ pct, grade, gradeColor }) {
  const R = 64, circ = 2 * Math.PI * R, dash = circ * (pct / 100);
  return (
    <div className="score-ring-wrap">
      <svg viewBox="0 0 160 160" width="160" height="160">
        <circle cx="80" cy="80" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
        <circle cx="80" cy="80" r={R} fill="none" stroke={gradeColor} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 80 80)" style={{ transition: 'stroke-dasharray 1s ease' }}/>
      </svg>
      <div className="score-ring-inner">
        <span className="score-ring-pct display">{pct}%</span>
        <span className="score-ring-label condensed" style={{ color: gradeColor }}>{grade}</span>
      </div>
    </div>
  );
}

function HistoryPanel({ history }) {
  if (!history?.length) return (
    <div className="notes-empty" style={{ padding: '1.5rem', textAlign: 'center' }}>
      <p className="muted">No past tests yet. Your history will appear here after each test.</p>
    </div>
  );
  return (
    <div className="history-list">
      {history.map((h, i) => {
        const d = new Date(h.date);
        const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
        const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        const color = h.accuracy >= 75 ? 'var(--success)' : h.accuracy >= 50 ? 'var(--orange)' : 'var(--danger)';
        return (
          <div key={i} className="history-item">
            <div className="history-rank condensed muted">#{i + 1}</div>
            <div className="history-score display" style={{ color }}>{h.accuracy}%</div>
            <div className="history-detail">
              <span className="condensed" style={{ fontSize: '0.8rem' }}>{h.score}/{h.total} correct</span>
              <span className="muted" style={{ fontSize: '0.72rem' }}>{dateStr} · {timeStr}</span>
            </div>
            <div className={`badge badge-${h.accuracy >= 75 ? 'easy' : h.accuracy >= 50 ? 'medium' : 'hard'}`}
              style={{ marginLeft: 'auto' }}>
              {h.accuracy >= 75 ? 'GREAT' : h.accuracy >= 50 ? 'OK' : 'RETRY'}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ResultScreen() {
  const { state, navigate, resetTest, selectTopic, resetUserData } = useApp();
  const { lastResult, user } = state;
  const [reviewTab, setReviewTab]   = useState('all');
  const [showAll, setShowAll]       = useState(false);
  const [activeSection, setSection] = useState('result'); // result | history

  if (!lastResult) return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
      <p className="muted" style={{ marginBottom: '1rem' }}>No result found.</p>
      <button className="btn btn-primary" onClick={() => navigate('home')}>Go Home</button>
    </div>
  );

  const { score, total, accuracy, timeTaken, weakTopics, results } = lastResult;
  const grade = accuracy >= 90 ? 'OUTSTANDING' : accuracy >= 75 ? 'EXCELLENT' : accuracy >= 60 ? 'GOOD' : accuracy >= 45 ? 'AVERAGE' : 'NEEDS WORK';
  const gradeColor = accuracy >= 75 ? 'var(--success)' : accuracy >= 50 ? 'var(--orange)' : 'var(--danger)';
  const minutes = Math.floor(timeTaken / 60);
  const secs    = timeTaken % 60;
  const timeStr = `${minutes}m ${String(secs).padStart(2, '0')}s`;
  const maxMissed = weakTopics[0]?.missed || 1;

  const filteredResults = results.filter(r =>
    reviewTab === 'all' ? true : reviewTab === 'correct' ? r.isCorrect : !r.isCorrect
  );
  const displayResults = showAll ? filteredResults : filteredResults.slice(0, 6);

  const handlePracticeWeak = () => {
    const topicId = weakTopics[0]?.topic;
    if (!topicId) return;
    selectTopic({ id: topicId, title: TOPIC_NAMES[topicId] || topicId, icon: TOPIC_ICONS[topicId] || '📚' });
    navigate('practice');
  };

  // Build per-topic breakdown
  const topicMap = {};
  results.forEach(r => {
    if (!topicMap[r.topic]) topicMap[r.topic] = { correct: 0, total: 0 };
    topicMap[r.topic].total++;
    if (r.isCorrect) topicMap[r.topic].correct++;
  });
  const multiTopic = Object.keys(topicMap).length > 1;

  return (
    <div className="result-screen animate-fade-in">

      {/* ── Section switcher ── */}
      <div className="result-section-tabs">
        {[['result','📊 Results'],['history','🕐 History']].map(([id, label]) => (
          <button key={id} className={`result-section-tab condensed ${activeSection === id ? 'active' : ''}`}
            onClick={() => setSection(id)}>{label}</button>
        ))}
      </div>

      {/* ══════════ HISTORY VIEW ══════════ */}
      {activeSection === 'history' && (
        <div className="result-body">
          <div className="result-section card">
            <div className="result-section-header" style={{ marginBottom: '1rem' }}>
              <h3 className="display" style={{ fontSize: '1.3rem', letterSpacing: '3px' }}>TEST HISTORY</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="condensed muted" style={{ fontSize: '0.75rem' }}>
                  {user.testHistory.length} test(s) completed
                </span>
                {user.testHistory.length > 0 && (
                  <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.72rem', color: 'var(--danger)' }}
                    onClick={() => { if (window.confirm('Clear all history?')) resetUserData(); }}>
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Overall stats row */}
            {user.totalPracticed > 0 && (
              <div className="history-stats-row">
                {[
                  { label: 'Total Practiced', value: user.totalPracticed },
                  { label: 'Overall Accuracy', value: user.totalPracticed > 0 ? `${Math.round(user.totalCorrect / user.totalPracticed * 100)}%` : '—' },
                  { label: 'Best Streak', value: user.bestStreak },
                  { label: 'Topics Done', value: user.completedTopics.length },
                ].map(s => (
                  <div key={s.label} className="history-stat">
                    <span className="display orange" style={{ fontSize: '1.6rem', letterSpacing: '2px' }}>{s.value}</span>
                    <span className="condensed muted" style={{ fontSize: '0.65rem', letterSpacing: '1px', textTransform: 'uppercase' }}>{s.label}</span>
                  </div>
                ))}
              </div>
            )}

            <HistoryPanel history={user.testHistory} />
          </div>

          <div className="result-actions">
            <button className="btn btn-primary" onClick={() => { resetTest(); navigate('test_setup'); }}>New Test</button>
            <button className="btn btn-ghost" onClick={() => navigate('home')}>← Home</button>
          </div>
        </div>
      )}

      {/* ══════════ RESULT VIEW ══════════ */}
      {activeSection === 'result' && (
        <>
          {/* Score hero */}
          <div className="result-hero">
            <div className="result-hero-bg" />
            <div className="result-hero-content">
              <div className="condensed muted" style={{ fontSize: '0.7rem', letterSpacing: '4px', marginBottom: '1rem' }}>TEST COMPLETE</div>
              <ScoreRing pct={accuracy} grade={grade} gradeColor={gradeColor} />
              <div className="result-stats-row">
                {[
                  { label: 'Correct',   value: score,         color: 'var(--success)' },
                  { label: 'Wrong',     value: total - score, color: 'var(--danger)'  },
                  { label: 'Total',     value: total,         color: 'var(--text)'    },
                  { label: 'Time Used', value: timeStr,       color: 'var(--orange)'  },
                ].map(s => (
                  <div key={s.label} className="result-stat">
                    <span className="result-stat-val display" style={{ color: s.color }}>{s.value}</span>
                    <span className="result-stat-label condensed muted">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="result-body">

            {/* Weak areas */}
            {weakTopics.length > 0 && (
              <div className="result-section card">
                <div className="result-section-header">
                  <h3 className="display" style={{ fontSize: '1.3rem', letterSpacing: '3px', color: 'var(--danger)' }}>WEAK AREAS</h3>
                  <span className="condensed muted" style={{ fontSize: '0.75rem' }}>Focus here next</span>
                </div>
                <div className="weak-list">
                  {weakTopics.map(({ topic, missed }) => (
                    <div key={topic} className="weak-row">
                      <span className="weak-icon">{TOPIC_ICONS[topic] || '📚'}</span>
                      <span className="weak-name condensed">{TOPIC_NAMES[topic] || topic}</span>
                      <div className="weak-bar-track">
                        <div className="weak-bar-fill" style={{ width: `${Math.round((missed / maxMissed) * 100)}%` }} />
                      </div>
                      <span className="weak-count orange condensed">{missed} missed</span>
                    </div>
                  ))}
                </div>
                <button className="btn btn-danger-outline btn-sm" style={{ marginTop: '1rem' }} onClick={handlePracticeWeak}>
                  Practice Weakest Topic →
                </button>
              </div>
            )}

            {/* Per-topic breakdown */}
            {multiTopic && (
              <div className="result-section card">
                <h3 className="display" style={{ fontSize: '1.3rem', letterSpacing: '3px', marginBottom: '1rem' }}>BY TOPIC</h3>
                <div className="topic-perf-grid">
                  {Object.entries(topicMap).map(([tid, { correct, total: t }]) => {
                    const pct = Math.round((correct / t) * 100);
                    return (
                      <div key={tid} className="topic-perf-card">
                        <span className="topic-perf-icon">{TOPIC_ICONS[tid] || '📚'}</span>
                        <span className="topic-perf-name condensed">{TOPIC_NAMES[tid] || tid}</span>
                        <span className="topic-perf-score condensed" style={{ color: pct >= 60 ? 'var(--success)' : 'var(--danger)' }}>{correct}/{t}</span>
                        <div className="topic-perf-bar">
                          <div className="topic-perf-fill" style={{ width: `${pct}%`, background: pct >= 60 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Answer review */}
            <div className="result-section card">
              <div className="result-section-header" style={{ marginBottom: '1rem' }}>
                <h3 className="display" style={{ fontSize: '1.3rem', letterSpacing: '3px' }}>REVIEW</h3>
                <div className="review-tabs">
                  {[['all','All'],['correct','✓ Correct'],['wrong','✗ Wrong']].map(([id, label]) => (
                    <button key={id} className={`review-tab condensed ${reviewTab === id ? 'active' : ''}`}
                      onClick={() => { setReviewTab(id); setShowAll(false); }}>{label}</button>
                  ))}
                </div>
              </div>

              <div className="review-list">
                {displayResults.map((r, i) => (
                  <div key={r.id || i} className={`review-item ${r.isCorrect ? 'correct' : 'wrong'}`}>
                    <div className={`review-status ${r.isCorrect ? 'correct' : 'wrong'}`}>{r.isCorrect ? '✓' : '✗'}</div>
                    <div className="review-body">
                      <div className="review-q-text">{r.question}</div>
                      <div className="review-meta">
                        {!r.isCorrect && (
                          <>
                            <span className="review-user muted">Your answer: <span style={{ color: 'var(--danger)' }}>{r.userAnswer || 'Not answered'}</span></span>
                            <span className="review-correct">Correct: <span className="orange">{r.correctAnswer}</span></span>
                          </>
                        )}
                        <span className={`badge badge-${r.difficulty} review-badge`}>{r.difficulty}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredResults.length > 6 && !showAll && (
                <button className="btn btn-ghost btn-sm btn-full" style={{ marginTop: '1rem' }} onClick={() => setShowAll(true)}>
                  Show all {filteredResults.length} questions
                </button>
              )}
              {filteredResults.length === 0 && (
                <p className="muted text-center" style={{ padding: '1.5rem' }}>No questions in this category.</p>
              )}
            </div>

            {/* Actions */}
            <div className="result-actions">
              <button className="btn btn-primary btn-lg" onClick={() => { resetTest(); navigate('test_setup'); }}>Take New Test</button>
              {weakTopics.length > 0 && (
                <button className="btn btn-outline" onClick={handlePracticeWeak}>Practice Weak Topics</button>
              )}
              <button className="btn btn-ghost btn-sm" onClick={() => setSection('history')}>View History 🕐</button>
              <button className="btn btn-ghost" onClick={() => { resetTest(); navigate('home'); }}>← Home</button>
            </div>

          </div>
        </>
      )}
    </div>
  );
}