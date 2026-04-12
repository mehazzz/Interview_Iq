// src/components/TopicSelector/TopicSelector.js
import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import api from '../../utils/api';
import './TopicSelector.css';

const FALLBACK_TOPICS = [
  { id: 'time_work',                 title: 'Time & Work',                 icon: '⚙️' },
  { id: 'speed_distance',            title: 'Time, Speed & Distance',      icon: '🚀' },
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
  { id: 'coding_decoding',           title: 'Coding-Decoding',             icon: '🔐' },
  { id: 'series',                    title: 'Series (Number/Alphabet)',    icon: '🔗' },
];

export default function TopicSelector() {
  const { state, navigate, selectTopic, getTopicAccuracy, overallAccuracy } = useApp();
  const { user } = state;

  const [topics, setTopics]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTopics()
      .then(res => setTopics(res.success ? res.data : FALLBACK_TOPICS))
      .catch(() => setTopics(FALLBACK_TOPICS))
      .finally(() => setLoading(false));
  }, []);

  const handleTopicClick = (topic) => { selectTopic(topic); navigate('topic'); };

  // Weak score from persisted user data
  const getWeakScore = (topicId) => {
    const w = user.weakTopics[topicId];
    if (!w || w.attempts === 0) return 0;
    return Math.round((w.wrong / w.attempts) * 100);
  };

  const isCompleted = (topicId) => user.completedTopics.includes(topicId);

  return (
    <div className="topic-selector">

      {/* ── Hero ── */}
      <section className="hero-section animate-fade-up">
        <div className="hero-accent-line" />
        <div className="hero-tag condensed">RAG-Powered · Unlimited Questions · Dynamic Generation</div>
        <h1 className="hero-title display">
          MASTER<br /><span className="hero-title-accent">APTITUDE</span>
        </h1>
        <p className="hero-desc muted">
          16 quantitative topics. Infinite dynamically generated questions.
          Learn, practice, test — all powered by a lightweight RAG engine.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={() => navigate('test_setup')}>Take a Test</button>
          <button className="btn btn-outline btn-lg" onClick={() => navigate('home')}>Browse Topics</button>
        </div>

        {/* User stats (from localStorage) */}
        <div className="hero-stats">
          {[
            { label: 'Topics',     value: '16' },
            { label: 'Questions',  value: '∞' },
            { label: 'Practiced',  value: user.totalPracticed || '0' },
            { label: 'Accuracy',   value: overallAccuracy != null ? `${overallAccuracy}%` : '—' },
          ].map(s => (
            <div key={s.label} className="hero-stat">
              <span className="hero-stat-val display">{s.value}</span>
              <span className="hero-stat-label condensed muted">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Topics Grid ── */}
      <section className="topics-section">
        <div className="section-header flex-between">
          <div>
            <h2 className="section-title display">TOPICS</h2>
            <p className="muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Select a topic to learn, practice, or test
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('test_setup')}>
            Multi-topic test →
          </button>
        </div>

        {loading ? (
          <div className="topics-grid">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="topic-card-skeleton skeleton" style={{ height: '100px' }} />
            ))}
          </div>
        ) : (
          <div className="topics-grid">
            {topics.map((topic, idx) => {
              const weakScore  = getWeakScore(topic.id);
              const completed  = isCompleted(topic.id);
              const accuracy   = getTopicAccuracy(topic.id);
              return (
                <button
                  key={topic.id}
                  className={`topic-card animate-fade-up stagger-${Math.min((idx % 6) + 1, 6)}
                    ${weakScore > 40 ? 'topic-card--weak' : ''}
                    ${completed ? 'topic-card--done' : ''}
                  `}
                  onClick={() => handleTopicClick(topic)}
                >
                  <div className="topic-card-inner">
                    <div className="topic-card-top">
                      <span className="topic-icon">{topic.icon}</span>
                      {completed && <span className="topic-done-badge" title="Completed">✓</span>}
                    </div>
                    <span className="topic-name condensed">{topic.title}</span>
                    {/* Per-topic accuracy bar (from persisted data) */}
                    {accuracy !== null && (
                      <div className="topic-accuracy-row">
                        <div className="topic-accuracy-track">
                          <div className="topic-accuracy-fill"
                            style={{ width: `${accuracy}%`, background: accuracy >= 60 ? 'var(--success)' : accuracy >= 40 ? 'var(--warning)' : 'var(--danger)' }} />
                        </div>
                        <span className="topic-accuracy-label condensed">{accuracy}%</span>
                      </div>
                    )}
                    {weakScore > 40 && accuracy === null && (
                      <div className="topic-weak-indicator">
                        <div className="topic-weak-bar"
                          style={{ width: `${weakScore}%`, background: weakScore > 60 ? 'var(--danger)' : 'var(--warning)' }} />
                      </div>
                    )}
                  </div>
                  <div className="topic-card-hover-bg" />
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* ── How it works ── */}
      <section className="how-section">
        <h2 className="section-title display text-center" style={{ marginBottom: '2rem' }}>HOW IT WORKS</h2>
        <div className="how-grid">
          {[
            { step: '01', icon: '📖', title: 'LEARN', desc: 'Study concepts, formulas, and worked examples for any topic' },
            { step: '02', icon: '⚡', title: 'PRACTICE', desc: 'Infinite questions with instant feedback and step-by-step solutions' },
            { step: '03', icon: '🎯', title: 'TEST', desc: 'Timed tests across multiple topics with score report and weak area analysis' },
          ].map(item => (
            <div key={item.step} className="how-card card">
              <div className="how-step condensed muted">{item.step}</div>
              <div className="how-icon">{item.icon}</div>
              <h3 className="how-title condensed">{item.title}</h3>
              <p className="how-desc muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}