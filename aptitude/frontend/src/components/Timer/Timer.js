// src/components/Timer/Timer.js
import React from 'react';
import './Timer.css';

export default function Timer({ formatted, percentLeft, isWarning, isDanger, answeredCount, totalCount }) {
  const timerClass = isDanger ? 'danger' : isWarning ? 'warning' : '';

  return (
    <div className={`timer-bar ${timerClass}`}>
      <div className="timer-left-section">
        <div className="timer-label condensed">Time Remaining</div>
        <div className={`timer-display display ${timerClass}`}>{formatted}</div>
      </div>

      <div className="timer-progress-wrap">
        <div className="timer-progress-track">
          <div
            className={`timer-progress-fill ${timerClass}`}
            style={{ width: `${percentLeft}%` }}
          />
        </div>
        {isWarning && !isDanger && (
          <div className="timer-warning-msg condensed">⚠ Less than 3 minutes remaining</div>
        )}
        {isDanger && (
          <div className="timer-danger-msg condensed">🔴 Last minute!</div>
        )}
      </div>

      <div className="timer-right-section">
        <div className="timer-label condensed">Progress</div>
        <div className="timer-progress-count display">
          <span className="orange">{answeredCount}</span>
          <span className="muted" style={{ fontSize: '1rem' }}>/{totalCount}</span>
        </div>
      </div>
    </div>
  );
}