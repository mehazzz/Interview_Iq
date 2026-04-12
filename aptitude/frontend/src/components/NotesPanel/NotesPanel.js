// src/components/NotesPanel/NotesPanel.js
import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import api from '../../utils/api';
import './NotesPanel.css';

export default function NotesPanel({ topic }) {
  const { navigate, goBack, canGoBack, selectTopic } = useApp();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [activeTab, setActiveTab] = useState('concepts');

  useEffect(() => {
    if (!topic?.id) return;
    setLoading(true); setError(null); setContent(null);
    api.getLearnContent(topic.id)
      .then(res => { if (res.success) setContent(res.data); else setError('Content unavailable for this topic.'); })
      .catch(() => setError('Could not load content. Check backend connection.'))
      .finally(() => setLoading(false));
  }, [topic]);

  // Fixed: Practice button selects topic then navigates
  const handleStartPractice = () => {
    if (topic) selectTopic(topic);
    navigate('practice');
  };

  // Fixed: Back button uses history stack
  const handleBack = () => { if (canGoBack) goBack(); else navigate('home'); };

  const tabs = [
    { id: 'concepts', label: 'Concepts' },
    { id: 'formulas', label: 'Formulas' },
    { id: 'examples', label: 'Examples' },
  ];

  if (loading) return (
    <div className="notes-panel">
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '80px', marginBottom: '1rem', borderRadius: '8px' }} />)}
    </div>
  );

  if (error) return (
    <div className="notes-panel">
      <div className="notes-back-row">
        <button className="btn btn-ghost btn-sm" onClick={handleBack}>← Back</button>
      </div>
      <div className="notes-error card">
        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📭</div>
        <h3 className="condensed" style={{ letterSpacing: '2px', marginBottom: '0.5rem' }}>Content Not Available Yet</h3>
        <p className="muted" style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>{error}</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-outline btn-sm" onClick={handleStartPractice}>⚡ Try Practice Mode Instead</button>
          <button className="btn btn-ghost btn-sm" onClick={handleBack}>← Go Back</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="notes-panel animate-fade-in">
      {/* Header with working Back + Practice buttons */}
      <div className="notes-header">
        <div className="notes-topic-info">
          <button className="btn btn-ghost btn-sm" onClick={handleBack} style={{ marginRight: '0.5rem' }}>← Back</button>
          <span className="notes-icon">{topic.icon}</span>
          <div>
            <h2 className="notes-title display">{topic.title}</h2>
            <p className="notes-subtitle muted condensed">Learning Mode</p>
          </div>
        </div>
        <div className="notes-header-actions">
          <button className="btn btn-outline btn-sm" onClick={handleStartPractice}>⚡ Practice</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('test_setup')}>🎯 Test</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="notes-tabs">
        {tabs.map(tab => (
          <button key={tab.id} className={`notes-tab condensed ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="notes-content animate-fade-in" key={activeTab}>

        {activeTab === 'concepts' && (
          <div className="concepts-panel">
            {content?.concepts?.length > 0 ? (
              <ul className="concept-list">
                {content.concepts.map((c, i) => (
                  <li key={i} className="concept-item animate-fade-up" style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}>
                    <span className="concept-dot" />{c}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="notes-empty">
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
                <p className="muted">Concepts not available yet for this topic.</p>
                <button className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }} onClick={handleStartPractice}>
                  Go to Practice Mode →
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'formulas' && (
          <div className="formulas-panel">
            {content?.formulas?.length > 0 ? (
              content.formulas.map((f, i) => (
                <div key={i} className="formula-card animate-fade-up" style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}>
                  <div className="formula-name condensed">{f.name}</div>
                  <div className="formula-equation mono">{f.formula}</div>
                  <div className="formula-desc muted">{f.desc || f.description}</div>
                </div>
              ))
            ) : (
              <div className="notes-empty">
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔣</div>
                <p className="muted">No specific formulas — this topic relies on logical reasoning and pattern recognition.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="examples-panel">
            {content?.examples?.length > 0 ? (
              content.examples.map((ex, i) => (
                <div key={i} className="example-card animate-fade-up" style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}>
                  <div className="example-label condensed">Example {i + 1}</div>
                  <div className="example-question">{ex.question}</div>
                  <div className="example-answer">
                    <span className="condensed muted" style={{ fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Answer:&nbsp;</span>
                    <span style={{ color: 'var(--orange)' }}>{ex.correctAnswer}</span>
                  </div>
                  {ex.explanation && (
                    <div className="example-explanation">
                      <div className="explanation-label condensed">Solution</div>
                      <pre className="explanation-text">{ex.explanation}</pre>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="notes-empty">
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
                <p className="muted">Examples are generated dynamically in Practice mode.</p>
                <button className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }} onClick={handleStartPractice}>
                  Go to Practice →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="notes-cta">
        <p className="muted" style={{ fontSize: '0.9rem' }}>Ready to test your understanding?</p>
        <button className="btn btn-primary btn-full" onClick={handleStartPractice}>Start Practicing →</button>
      </div>
    </div>
  );
}