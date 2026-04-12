// src/components/Layout/Navbar.js
import React from 'react';
import { useApp } from '../../context/AppContext';
import './Navbar.css';

export default function Navbar() {
  const { state, navigate, goBack, canGoBack, resetTest } = useApp();
  const { currentView, user } = state;
  const { streak, totalPracticed } = user;

  const handleHome = () => { resetTest(); navigate('home'); };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="navbar-logo" onClick={handleHome}>
          <span className="logo-interview">INTERVIEW</span>
          <span className="logo-iq">IQ</span>
        </button>
        <div className="navbar-tagline hide-mobile">Dynamic Aptitude System</div>
      </div>

      <div className="navbar-center hide-mobile">
        <button className={`nav-link ${currentView === 'home' ? 'active' : ''}`} onClick={handleHome}>Topics</button>
        <button className={`nav-link ${currentView === 'test_setup' ? 'active' : ''}`} onClick={() => navigate('test_setup')}>Test Mode</button>
        {canGoBack && currentView !== 'home' && (
          <button className="nav-link" onClick={goBack}>← Back</button>
        )}
      </div>

      <div className="navbar-right">
        {/* Live streak — from persisted user data */}
        {totalPracticed > 0 && (
          <div className="streak-badge" title={`Current streak: ${streak}`}>
            <span className="streak-fire">🔥</span>
            <span className="streak-num">{streak}</span>
            <span className="streak-label hide-mobile">streak</span>
          </div>
        )}
        <button className="btn btn-primary btn-sm hide-mobile" onClick={() => navigate('test_setup')}>
          Take Test
        </button>
      </div>
    </nav>
  );
}