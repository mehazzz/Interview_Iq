// src/App.js
import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Layout/Navbar';
import TopicSelector from './components/TopicSelector/TopicSelector';
import TopicView from './components/TopicSelector/TopicView';
import TestSetup from './components/TestSetup/TestSetup';
import TestMode from './components/TestMode/TestMode';
import ResultScreen from './components/ResultScreen/ResultScreen';
import './styles/global.css';

function AppContent() {
  const { state } = useApp();
  const { currentView } = state;

  const renderView = () => {
    switch (currentView) {
      case 'home':       return <TopicSelector />;
      case 'topic':      return <TopicView />;
      case 'practice':   return <TopicView />;
      case 'test_setup': return <TestSetup />;
      case 'test':       return <TestMode />;
      case 'result':     return <ResultScreen />;
      default:           return <TopicSelector />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        {renderView()}
      </main>
    </div>
  );
}

export default function App() {
  return <AppProvider><AppContent /></AppProvider>;
}