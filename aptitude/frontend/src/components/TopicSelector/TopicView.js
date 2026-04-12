// src/components/TopicSelector/TopicView.js
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import NotesPanel from '../NotesPanel/NotesPanel';
import PracticeMode from '../PracticeMode/PracticeMode';
import './TopicView.css';

const MODES = [
  { id: 'learn',    label: 'Learn',    icon: '📖' },
  { id: 'practice', label: 'Practice', icon: '⚡' },
];

export default function TopicView() {
  const { state, navigate } = useApp();
  const { selectedTopic } = state;
  const [activeMode, setActiveMode] = useState('learn');

  if (!selectedTopic) {
    navigate('home');
    return null;
  }

  return (
    <div className="topic-view">
      {/* Back + Topic header */}
      <div className="topic-view-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('home')}>← Topics</button>
        <div className="topic-view-title">
          <span className="topic-view-icon">{selectedTopic.icon}</span>
          <h1 className="display" style={{ fontSize: '1.8rem', letterSpacing: '3px' }}>
            {selectedTopic.title}
          </h1>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('test_setup')}>
          Test Mode →
        </button>
      </div>

      {/* Mode tabs */}
      <div className="topic-mode-tabs">
        {MODES.map(m => (
          <button
            key={m.id}
            className={`topic-mode-tab condensed ${activeMode === m.id ? 'active' : ''}`}
            onClick={() => setActiveMode(m.id)}
          >
            <span>{m.icon}</span>
            {m.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="topic-view-content" key={activeMode}>
        {activeMode === 'learn'    && <NotesPanel topic={selectedTopic} />}
        {activeMode === 'practice' && <PracticeMode />}
      </div>
    </div>
  );
}