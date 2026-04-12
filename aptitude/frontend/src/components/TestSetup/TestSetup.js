// src/components/TestSetup/TestSetup.js
import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import api from '../../utils/api';
import './TestSetup.css';

const FALLBACK_TOPICS = [
  { id: 'time_work',                 title: 'Time & Work',                 icon: '⚙️' },
  { id: 'speed_distance',            title: 'Speed & Distance',            icon: '🚀' },
  { id: 'profit_loss',               title: 'Profit & Loss',               icon: '💰' },
  { id: 'percentage',                title: 'Percentage',                  icon: '📊' },
  { id: 'ratio_proportion',          title: 'Ratio & Proportion',          icon: '⚖️' },
  { id: 'averages',                  title: 'Averages',                    icon: '📈' },
  { id: 'number_system',             title: 'Number System',               icon: '🔢' },
  { id: 'simplification',            title: 'Simplification',              icon: '🔣' },
  { id: 'mixtures_alligations',      title: 'Mixtures & Alligations',      icon: '🧪' },
  { id: 'permutations_combinations', title: 'Permutations & Combinations', icon: '🔀' },
  { id: 'probability',               title: 'Probability',                 icon: '🎲' },
  { id: 'data_interpretation',       title: 'Data Interpretation',         icon: '📉' },
  { id: 'logical_reasoning',         title: 'Logical Reasoning',           icon: '🧩' },
  { id: 'blood_relations',           title: 'Blood Relations',             icon: '👨‍👩‍👧‍👦' },
  { id: 'coding_decoding',           title: 'Coding-Decoding',            icon: '🔐' },
  { id: 'series',                    title: 'Series (Number/Alphabet)',    icon: '🔗' },
];

const Q_COUNTS  = [5, 10, 15, 20];
const TIME_OPTS = [5, 10, 15, 20];
const DIFFS     = ['easy', 'medium', 'hard'];

export default function TestSetup() {
  const { state, navigate, toggleTestTopic, setTestConfig, setDifficulty, startTest } = useApp();
  const { testConfig, difficulty, user } = state;
  const weakTopics = user?.weakTopics || {};

  const [topics, setTopics]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [allTopics, setAllTopics] = useState([]);

  useEffect(() => {
    api.getTopics()
      .then(r => setAllTopics(r.success ? r.data : FALLBACK_TOPICS))
      .catch(() => setAllTopics(FALLBACK_TOPICS));
  }, []);

  const topWeakIds = Object.entries(weakTopics)
    .sort((a, b) => (b[1].wrong / (b[1].attempts || 1)) - (a[1].wrong / (a[1].attempts || 1)))
    .slice(0, 3)
    .map(([id]) => id);

  const handleSelectAll = () => {
    const all = allTopics.map(t => t.id);
    setTestConfig({ topics: testConfig.topics.length === all.length ? [] : all });
  };

  const handleSelectWeak = () => {
    if (topWeakIds.length) setTestConfig({ topics: topWeakIds });
  };

  const handleLaunch = async () => {
    if (!testConfig.topics.length) return;
    setLoading(true);
    try {
      const res = await api.startTest({
        topics: testConfig.topics,
        difficulty,
        questionCount: testConfig.questionCount,
        timeLimit: testConfig.timeLimit,
      });
      if (res.success) {
        startTest({ ...res.data, timeLimit: testConfig.timeLimit });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = testConfig.topics.length;
  const estimatedTime = testConfig.timeLimit;

  return (
    <div className="test-setup">
      <div className="test-setup-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('home')}>← Back</button>
        <div>
          <h1 className="display" style={{ fontSize: '2rem', letterSpacing: '4px' }}>CONFIGURE TEST</h1>
          <p className="muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Select topics, difficulty, and time limit
          </p>
        </div>
      </div>

      <div className="test-setup-grid">
        {/* ── Left: Topic Selection ── */}
        <div className="setup-panel">
          <div className="setup-panel-header">
            <h3 className="condensed">SELECT TOPICS</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {topWeakIds.length > 0 && (
                <button className="btn btn-danger-outline btn-sm" onClick={handleSelectWeak}>
                  Weak Topics
                </button>
              )}
              <button className="btn btn-ghost btn-sm" onClick={handleSelectAll}>
                {selectedCount === allTopics.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          <div className="topic-select-grid">
            {allTopics.map(topic => {
              const isSelected = testConfig.topics.includes(topic.id);
              const isWeak = topWeakIds.includes(topic.id);
              return (
                <button
                  key={topic.id}
                  className={`topic-select-card ${isSelected ? 'selected' : ''} ${isWeak ? 'weak' : ''}`}
                  onClick={() => toggleTestTopic(topic.id)}
                >
                  <span className="topic-select-icon">{topic.icon}</span>
                  <span className="topic-select-name condensed">{topic.title}</span>
                  {isWeak && <span className="topic-weak-dot" title="Weak area" />}
                  {isSelected && <span className="topic-check">✓</span>}
                </button>
              );
            })}
          </div>

          <div className="selection-summary condensed muted">
            {selectedCount} topic{selectedCount !== 1 ? 's' : ''} selected
          </div>
        </div>

        {/* ── Right: Settings ── */}
        <div className="setup-settings">
          {/* Difficulty */}
          <div className="settings-group card">
            <h4 className="settings-group-title condensed">DIFFICULTY</h4>
            <div className="settings-options">
              {DIFFS.map(d => (
                <button
                  key={d}
                  className={`settings-opt condensed ${difficulty === d ? `active ${d}` : ''}`}
                  onClick={() => setDifficulty(d)}
                >
                  <span className="settings-opt-icon">
                    {d === 'easy' ? '🟢' : d === 'medium' ? '🟡' : '🔴'}
                  </span>
                  {d.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Questions */}
          <div className="settings-group card">
            <h4 className="settings-group-title condensed">QUESTIONS</h4>
            <div className="settings-options">
              {Q_COUNTS.map(n => (
                <button
                  key={n}
                  className={`settings-opt condensed ${testConfig.questionCount === n ? 'active medium' : ''}`}
                  onClick={() => setTestConfig({ questionCount: n })}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Time Limit */}
          <div className="settings-group card">
            <h4 className="settings-group-title condensed">TIME LIMIT</h4>
            <div className="settings-options">
              {TIME_OPTS.map(t => (
                <button
                  key={t}
                  className={`settings-opt condensed ${testConfig.timeLimit === t ? 'active medium' : ''}`}
                  onClick={() => setTestConfig({ timeLimit: t })}
                >
                  {t} min
                </button>
              ))}
            </div>
          </div>

          {/* Summary card */}
          <div className="test-summary card">
            <h4 className="condensed muted" style={{ fontSize: '0.7rem', letterSpacing: '2px', marginBottom: '1rem' }}>
              TEST SUMMARY
            </h4>
            <div className="summary-rows">
              <div className="summary-row">
                <span className="muted">Topics</span>
                <span className="orange condensed">{selectedCount}</span>
              </div>
              <div className="summary-row">
                <span className="muted">Questions</span>
                <span className="condensed">{testConfig.questionCount}</span>
              </div>
              <div className="summary-row">
                <span className="muted">Difficulty</span>
                <span className={`condensed badge badge-${difficulty}`}>{difficulty}</span>
              </div>
              <div className="summary-row">
                <span className="muted">Duration</span>
                <span className="condensed">{estimatedTime} min</span>
              </div>
              <div className="summary-row">
                <span className="muted">Per question</span>
                <span className="condensed">
                  ~{Math.floor((estimatedTime * 60) / testConfig.questionCount)}s
                </span>
              </div>
            </div>

            <button
              className="btn btn-primary btn-full"
              style={{ marginTop: '1.25rem' }}
              disabled={selectedCount === 0 || loading}
              onClick={handleLaunch}
            >
              {loading ? (
                <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Generating...</>
              ) : (
                `LAUNCH TEST →`
              )}
            </button>

            {selectedCount === 0 && (
              <p className="muted text-center" style={{ fontSize: '0.78rem', marginTop: '0.5rem' }}>
                Select at least one topic to continue
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}