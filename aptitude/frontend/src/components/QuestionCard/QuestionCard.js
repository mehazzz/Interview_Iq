// src/components/QuestionCard/QuestionCard.js
import React from 'react';
import './QuestionCard.css';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function QuestionCard({
  question,
  selectedOption,
  onSelectOption,
  showAnswer = false,
  questionNumber,
  totalQuestions,
  disabled = false,
}) {
  if (!question) return null;

  const getOptionState = (idx) => {
    if (!showAnswer && selectedOption === idx) return 'selected';
    if (showAnswer) {
      const isCorrectOpt = question.options[idx] === question.correctAnswer;
      if (isCorrectOpt) return 'correct';
      if (idx === selectedOption) return 'wrong';
    }
    return '';
  };

  return (
    <div className="question-card card animate-fade-up">
      {/* Meta row */}
      <div className="qcard-meta">
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className={`badge badge-${question.difficulty}`}>{question.difficulty}</span>
          <span className="badge badge-topic">{question.topicTitle || question.topic}</span>
        </div>
        {questionNumber && (
          <span className="qcard-counter condensed muted">
            {questionNumber} / {totalQuestions}
          </span>
        )}
      </div>

      {/* Question text */}
      <p className="qcard-text">{question.question}</p>

      {/* Options */}
      <div className="qcard-options">
        {question.options.map((opt, idx) => {
          const state = getOptionState(idx);
          return (
            <button
              key={idx}
              className={`option-btn ${state}`}
              onClick={() => !disabled && !showAnswer && onSelectOption?.(idx)}
              disabled={disabled || (showAnswer && state === '')}
            >
              <span className={`option-label ${state}`}>{OPTION_LABELS[idx]}</span>
              <span className="option-text">{opt.replace(/^[ABCD]\)\s*/, '')}</span>
              {state === 'correct' && <span className="option-icon">✓</span>}
              {state === 'wrong'   && <span className="option-icon">✗</span>}
            </button>
          );
        })}
      </div>

      {/* Explanation (shown after answer) */}
      {showAnswer && question.explanation && (
        <div className="qcard-explanation animate-fade-up">
          <div className="explanation-header condensed">
            <span className="explanation-icon">💡</span>
            SOLUTION
          </div>
          <pre className="explanation-body">{question.explanation}</pre>
        </div>
      )}
    </div>
  );
}