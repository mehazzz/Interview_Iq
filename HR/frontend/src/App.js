/**
 * App.js
 * Initialises user identity on mount via useUser().
 * No loading gate — identity resolves instantly from localStorage on return visits,
 * and the fallback (offline UUID) fires immediately if backend is unreachable.
 */
import React, { useEffect } from 'react';
import InterviewPage from './pages/InterviewPage';
import { v4 as uuidv4 } from 'uuid';
import { setUserId, identifyUser } from './services/api.service';
import './styles/globals.css';

// Initialise user identity without blocking render
const initUser = async () => {
  try {
    const STORAGE_KEY = 'interviewiq_user';
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : null;
    const userId      = parsed?.userId || uuidv4();
    const displayName = parsed?.displayName || 'Anonymous';

    // Set immediately from cache so API calls work before server responds
    setUserId(userId);

    // Then confirm/create on server in background
    const { user: serverUser } = await identifyUser(userId, displayName);
    setUserId(serverUser.userId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serverUser));
  } catch {
    // Backend unreachable — local UUID already set above, app works fine
  }
};

function App() {
  useEffect(() => {
    initUser();
  }, []);

  // Render immediately — no loading gate
  return <InterviewPage />;
}

export default App;