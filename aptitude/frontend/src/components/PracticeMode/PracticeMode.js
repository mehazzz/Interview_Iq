// src/components/PracticeMode/PracticeMode.js
import React, { useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { useQuestions } from '../../hooks/useQuestions';
import QuestionCard from '../QuestionCard/QuestionCard';
import './PracticeMode.css';

const DIFFICULTIES = ['easy', 'medium', 'hard', 'all'];

export default function PracticeMode() {
  const { state, navigate, goBack, canGoBack, setDifficulty, recordAnswer } = useApp();
  const { selectedTopic, difficulty, user } = state;
  const { streak, totalPracticed } = user;

  const { question, loading, error, unavailable, selectedOption, showExplanation, isCorrect, fetchNext, selectOption } = useQuestions();

  const effectiveDiff = difficulty === 'all' ? 'medium' : difficulty;

  const loadQuestion = useCallback(() => {
    if (selectedTopic?.id) fetchNext(selectedTopic.id, effectiveDiff);
  }, [selectedTopic, effectiveDiff, fetchNext]);

  useEffect(() => { loadQuestion(); }, [loadQuestion]);

  const handleSelect = (idx) => {
    if (!question) return;
    selectOption(idx);
    recordAnswer(question.topic, question.options[idx] === question.correctAnswer);
  };

  const handleBack = () => { if (canGoBack) goBack(); else navigate('topic'); };

  if (!selectedTopic) return (
    <div className="practice-no-topic">
      <div className="unavail-icon">📚</div>
      <p className="muted" style={{ marginBottom: '1rem' }}>No topic selected.</p>
      <button className="btn btn-primary" onClick={() => navigate('home')}>Choose a Topic</button>
    </div>
  );

  return (
    <div className="practice-mode">
      <div className="practice-header">
        <div className="practice-header-left">
          <button className="btn btn-ghost btn-sm" onClick={handleBack}>← Back</button>
          <div className="practice-topic-badge">
            <span>{selectedTopic.icon}</span>
            <span className="condensed">{selectedTopic.title}</span>
          </div>
        </div>
        <div className="practice-stats">
          <div className="pstat"><span className="pstat-val display orange">{streak}</span><span className="pstat-label condensed muted">Streak</span></div>
          <div className="pstat-divider" />
          <div className="pstat"><span className="pstat-val display">{totalPracticed}</span><span className="pstat-label condensed muted">Done</span></div>
        </div>
      </div>

      <div className="practice-controls">
        <div className="diff-group">
          <span className="condensed muted" style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Difficulty</span>
          <div className="diff-buttons">
            {DIFFICULTIES.map(d => (
              <button key={d} className={`diff-btn condensed ${difficulty === d ? 'active' : ''} ${d}`} onClick={() => setDifficulty(d)}>
                {d.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('test_setup')}>Switch to Test Mode →</button>
      </div>

      {streak >= 3 && (
        <div className={`streak-banner ${streak >= 10 ? 'legendary' : streak >= 5 ? 'hot' : ''}`}>
          <span className="streak-banner-fire">{streak >= 10 ? '🔥🔥🔥' : streak >= 5 ? '🔥🔥' : '🔥'}</span>
          <span className="condensed">{streak >= 10 ? 'LEGENDARY!' : streak >= 5 ? 'ON FIRE!' : 'GOOD STREAK!'} {streak} correct in a row</span>
        </div>
      )}

      {loading && (
        <div className="practice-loading">
          <div className="spinner" />
          <p className="muted condensed" style={{ letterSpacing: '2px', marginTop: '1rem' }}>GENERATING QUESTION...</p>
        </div>
      )}

      {!loading && unavailable && (
        <div className="content-unavailable card">
          <div className="unavail-icon">📭</div>
          <h3 className="condensed" style={{ letterSpacing: '2px', marginBottom: '0.5rem' }}>Content Not Available Yet</h3>
          <p className="muted" style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            No <strong style={{ color: 'var(--text)' }}>{difficulty}</strong> questions found for{' '}
            <strong style={{ color: 'var(--orange)' }}>{selectedTopic.title}</strong>. Try a different difficulty.
          </p>
          <div className="unavail-actions">
            {DIFFICULTIES.filter(d => d !== difficulty && d !== 'all').map(d => (
              <button key={d} className={`diff-btn condensed active ${d}`} onClick={() => setDifficulty(d)}>Try {d.toUpperCase()}</button>
            ))}
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="practice-error card">
          <div className="unavail-icon">⚠️</div>
          <h3 className="condensed" style={{ letterSpacing: '2px', marginBottom: '0.5rem', color: 'var(--danger)' }}>Connection Error</h3>
          <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>{error}</p>
          <p className="muted" style={{ fontSize: '0.78rem', marginBottom: '1rem' }}>
            Make sure the backend is running on <code style={{ color: 'var(--orange)' }}>localhost:5000</code>
          </p>
          <button className="btn btn-outline btn-sm" onClick={loadQuestion}>Retry</button>
        </div>
      )}

      {!loading && !error && !unavailable && question && (
        <div className="practice-content">
          <QuestionCard question={question} selectedOption={selectedOption} onSelectOption={handleSelect} showAnswer={showExplanation} />
          {showExplanation && (
            <div className="practice-result animate-fade-up">
              <div className={`result-indicator ${isCorrect ? 'correct' : 'wrong'}`}>
                <div className="result-icon">{isCorrect ? '✓' : '✗'}</div>
                <span className="condensed result-text">{isCorrect ? 'CORRECT!' : 'INCORRECT'}</span>
                {!isCorrect && <span className="result-answer muted">Answer: <span className="orange">{question.correctAnswer}</span></span>}
              </div>
              <button className="btn btn-primary btn-lg" onClick={loadQuestion}>Next Question →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}