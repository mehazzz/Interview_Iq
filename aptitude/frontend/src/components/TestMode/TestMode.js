// src/components/TestMode/TestMode.js
import React, { useEffect, useCallback, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useTimer } from '../../hooks/useTimer';
import Timer from '../Timer/Timer';
import QuestionCard from '../QuestionCard/QuestionCard';
import './TestMode.css';

export default function TestMode() {
  const { state, answerQuestion, setResult, recordTestResult, navigate } = useApp();
  const { activeTest, testAnswers } = state;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [submitted, setSubmitted]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const questions     = activeTest?.questions || [];
  const totalSeconds  = (activeTest?.timeLimit || 10) * 60;
  const answeredCount = Object.keys(testAnswers).length;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleExpire = useCallback(() => { if (!submitted) doSubmit(); }, [submitted]);

  const { formatted, percentLeft, isWarning, isDanger, start, stop } = useTimer(totalSeconds, handleExpire);

  useEffect(() => { start(); return () => stop(); }, []); // eslint-disable-line

  const doSubmit = useCallback(() => {
    if (submitted) return;
    stop();
    setSubmitted(true);
    setShowConfirm(false);

    const elapsed = Math.round((1 - percentLeft / 100) * totalSeconds);

    let correct = 0;
    const weakMap = {};
    const results = questions.map((q, i) => {
      const selectedIdx = testAnswers[i];
      const userAnswer  = selectedIdx !== undefined ? q.options[selectedIdx] : null;
      const isCorrect   = userAnswer === q.correctAnswer;
      if (isCorrect) correct++;
      else weakMap[q.topic] = (weakMap[q.topic] || 0) + 1;
      return { ...q, userAnswer, isCorrect, selectedIndex: selectedIdx };
    });

    const weakTopics = Object.entries(weakMap)
      .sort((a, b) => b[1] - a[1])
      .map(([topic, missed]) => ({ topic, missed }));

    const resultData = {
      score: correct,
      total: questions.length,
      accuracy: Math.round((correct / questions.length) * 100),
      timeTaken: elapsed,
      weakTopics,
      results,
    };

    // Persist to localStorage AND set in-memory result
    recordTestResult(resultData);
    setResult(resultData);
    navigate('result');
  }, [submitted, testAnswers, questions, totalSeconds, percentLeft, stop, setResult, recordTestResult, navigate]);

  if (!activeTest || !questions.length) return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
      <p className="muted" style={{ marginBottom: '1rem' }}>No active test. Configure one first.</p>
      <button className="btn btn-primary" onClick={() => navigate('test_setup')}>Configure Test</button>
    </div>
  );

  const current = questions[currentIdx];

  return (
    <div className="test-mode">
      <Timer
        formatted={formatted}
        percentLeft={percentLeft}
        isWarning={isWarning}
        isDanger={isDanger}
        answeredCount={answeredCount}
        totalCount={questions.length}
      />

      {/* Navigation dots */}
      <div className="test-nav-dots">
        {questions.map((_, i) => (
          <button
            key={i}
            className={`nav-dot condensed ${i === currentIdx ? 'current' : ''} ${testAnswers[i] !== undefined ? 'answered' : ''}`}
            onClick={() => setCurrentIdx(i)}
            title={`Q${i + 1}${testAnswers[i] !== undefined ? ' ✓' : ''}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question */}
      <div className="test-question-wrap">
        <QuestionCard
          question={current}
          selectedOption={testAnswers[currentIdx]}
          onSelectOption={(idx) => answerQuestion(currentIdx, idx)}
          showAnswer={false}
          questionNumber={currentIdx + 1}
          totalQuestions={questions.length}
        />

        <div className="test-nav-bar">
          <button className="btn btn-ghost" disabled={currentIdx === 0} onClick={() => setCurrentIdx(i => i - 1)}>
            ← Previous
          </button>
          <div className="test-nav-center">
            {testAnswers[currentIdx] === undefined && (
              <span className="unanswered-hint condensed muted">Not answered yet</span>
            )}
          </div>
          {currentIdx < questions.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setCurrentIdx(i => i + 1)}>Next →</button>
          ) : (
            <button className="btn btn-success" onClick={() => setShowConfirm(true)}>Submit Test</button>
          )}
        </div>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-modal card animate-fade-up">
            <h3 className="display" style={{ fontSize: '1.5rem', letterSpacing: '3px', marginBottom: '0.75rem' }}>SUBMIT TEST?</h3>
            <div className="confirm-stats">
              <div className="confirm-stat">
                <span className="display orange" style={{ fontSize: '2rem' }}>{answeredCount}</span>
                <span className="condensed muted">Answered</span>
              </div>
              <div className="confirm-stat">
                <span className="display" style={{ fontSize: '2rem', color: 'var(--danger)' }}>{questions.length - answeredCount}</span>
                <span className="condensed muted">Unanswered</span>
              </div>
            </div>
            {questions.length - answeredCount > 0 && (
              <p className="muted" style={{ fontSize: '0.85rem', textAlign: 'center', marginBottom: '1rem' }}>
                {questions.length - answeredCount} unanswered question(s) will be marked incorrect.
              </p>
            )}
            <div className="confirm-actions">
              <button className="btn btn-ghost" onClick={() => setShowConfirm(false)}>Go Back</button>
              <button className="btn btn-success" onClick={doSubmit}>Confirm Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}