// src/context/AppContext.js
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

const AppContext = createContext(null);

const LS_USER_KEY = 'interviewiq_user';
const LS_PREF_KEY = 'interviewiq_prefs';

function loadLS(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function saveLS(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

const DEFAULT_USER = {
  userId: 'guest',
  streak: 0,
  bestStreak: 0,
  totalPracticed: 0,
  totalCorrect: 0,
  completedTopics: [],
  weakTopics: {},
  topicProgress: {},
  testHistory: [],
  lastActiveDate: null,
};

const initialState = {
  currentView:   'home',
  viewHistory:   [],
  selectedTopic: null,
  difficulty:    loadLS(LS_PREF_KEY, {}).difficulty || 'medium',
  testConfig:    { topics: [], questionCount: 10, timeLimit: 10 },
  activeTest:    null,
  testAnswers:   {},
  lastResult:    null,
  user:          loadLS(LS_USER_KEY, DEFAULT_USER),
};

function reducer(state, action) {
  switch (action.type) {
    case 'NAVIGATE': {
      const push = !['home'].includes(state.currentView);
      return { ...state, currentView: action.payload, viewHistory: push ? [...state.viewHistory, state.currentView].slice(-10) : state.viewHistory };
    }
    case 'GO_BACK': {
      const prev = state.viewHistory[state.viewHistory.length - 1] || 'home';
      return { ...state, currentView: prev, viewHistory: state.viewHistory.slice(0, -1) };
    }
    case 'SELECT_TOPIC':  return { ...state, selectedTopic: action.payload };
    case 'SET_DIFFICULTY': return { ...state, difficulty: action.payload };
    case 'SET_TEST_CONFIG': return { ...state, testConfig: { ...state.testConfig, ...action.payload } };
    case 'TOGGLE_TEST_TOPIC': {
      const { topics } = state.testConfig;
      const exists = topics.includes(action.payload);
      return { ...state, testConfig: { ...state.testConfig, topics: exists ? topics.filter(t => t !== action.payload) : [...topics, action.payload] } };
    }
    case 'START_TEST':
      return { ...state, activeTest: action.payload, testAnswers: {}, currentView: 'test', viewHistory: [...state.viewHistory, state.currentView].slice(-10) };
    case 'ANSWER_QUESTION':
      return { ...state, testAnswers: { ...state.testAnswers, [action.payload.index]: action.payload.optionIndex } };
    case 'SET_RESULT':  return { ...state, lastResult: action.payload };
    case 'RESET_TEST':  return { ...state, activeTest: null, testAnswers: {}, lastResult: null };

    case 'RECORD_ANSWER': {
      const { topicId, isCorrect } = action.payload;
      const u = state.user;
      const tp = u.topicProgress[topicId] || { attempted: 0, correct: 0 };
      const we = u.weakTopics[topicId] || { attempts: 0, wrong: 0 };
      const newStreak = isCorrect ? u.streak + 1 : 0;
      const newProg = { attempted: tp.attempted + 1, correct: tp.correct + (isCorrect ? 1 : 0) };
      const completed = [...u.completedTopics];
      if (isCorrect && newProg.correct >= 5 && !completed.includes(topicId)) completed.push(topicId);
      return {
        ...state,
        user: {
          ...u,
          streak: newStreak,
          bestStreak: Math.max(u.bestStreak, newStreak),
          totalPracticed: u.totalPracticed + 1,
          totalCorrect:   u.totalCorrect + (isCorrect ? 1 : 0),
          topicProgress:  { ...u.topicProgress, [topicId]: newProg },
          weakTopics:     { ...u.weakTopics, [topicId]: { attempts: we.attempts + 1, wrong: isCorrect ? we.wrong : we.wrong + 1 } },
          completedTopics: completed,
          lastActiveDate:  new Date().toISOString(),
        },
      };
    }

    case 'RECORD_TEST_RESULT': {
      const result = action.payload;
      const u = state.user;
      const newWeak = { ...u.weakTopics };
      (result.results || []).forEach(r => {
        const w = newWeak[r.topic] || { attempts: 0, wrong: 0 };
        newWeak[r.topic] = { attempts: w.attempts + 1, wrong: r.isCorrect ? w.wrong : w.wrong + 1 };
      });
      return {
        ...state,
        user: {
          ...u,
          weakTopics:  newWeak,
          testHistory: [{ date: new Date().toISOString(), score: result.score, total: result.total, accuracy: result.accuracy }, ...u.testHistory].slice(0, 20),
          lastActiveDate: new Date().toISOString(),
        },
      };
    }

    case 'RESET_USER_DATA': return { ...state, user: { ...DEFAULT_USER, userId: state.user.userId } };
    case 'SET_USER_ID':     return { ...state, user: { ...state.user, userId: action.payload } };
    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => { saveLS(LS_USER_KEY, state.user); }, [state.user]);
  useEffect(() => { saveLS(LS_PREF_KEY, { difficulty: state.difficulty }); }, [state.difficulty]);

  const navigate        = useCallback((v) => dispatch({ type: 'NAVIGATE', payload: v }), []);
  const goBack          = useCallback(() => dispatch({ type: 'GO_BACK' }), []);
  const selectTopic     = useCallback((t) => dispatch({ type: 'SELECT_TOPIC', payload: t }), []);
  const setDifficulty   = useCallback((d) => dispatch({ type: 'SET_DIFFICULTY', payload: d }), []);
  const setTestConfig   = useCallback((c) => dispatch({ type: 'SET_TEST_CONFIG', payload: c }), []);
  const toggleTestTopic = useCallback((id) => dispatch({ type: 'TOGGLE_TEST_TOPIC', payload: id }), []);
  const answerQuestion  = useCallback((i, oi) => dispatch({ type: 'ANSWER_QUESTION', payload: { index: i, optionIndex: oi } }), []);
  const startTest       = useCallback((d) => dispatch({ type: 'START_TEST', payload: d }), []);
  const setResult       = useCallback((r) => dispatch({ type: 'SET_RESULT', payload: r }), []);
  const resetTest       = useCallback(() => dispatch({ type: 'RESET_TEST' }), []);
  const recordAnswer    = useCallback((topicId, isCorrect) => dispatch({ type: 'RECORD_ANSWER', payload: { topicId, isCorrect } }), []);
  const recordTestResult = useCallback((r) => dispatch({ type: 'RECORD_TEST_RESULT', payload: r }), []);
  const resetUserData   = useCallback(() => dispatch({ type: 'RESET_USER_DATA' }), []);
  const setUserId       = useCallback((id) => dispatch({ type: 'SET_USER_ID', payload: id }), []);

  const getTopicAccuracy = useCallback((topicId) => {
    const p = state.user.topicProgress[topicId];
    if (!p || p.attempted === 0) return null;
    return Math.round((p.correct / p.attempted) * 100);
  }, [state.user]);

  const getWeakTopicIds = useCallback(() =>
    Object.entries(state.user.weakTopics)
      .filter(([, w]) => w.attempts > 0 && (w.wrong / w.attempts) > 0.4)
      .sort((a, b) => (b[1].wrong / b[1].attempts) - (a[1].wrong / a[1].attempts))
      .map(([id]) => id),
    [state.user]);

  const overallAccuracy = state.user.totalPracticed > 0
    ? Math.round((state.user.totalCorrect / state.user.totalPracticed) * 100)
    : null;

  return (
    <AppContext.Provider value={{
      state, dispatch,
      navigate, goBack, canGoBack: state.viewHistory.length > 0,
      selectTopic, setDifficulty,
      setTestConfig, toggleTestTopic, answerQuestion, startTest, setResult, resetTest,
      recordAnswer, recordTestResult, resetUserData, setUserId,
      getTopicAccuracy, getWeakTopicIds, overallAccuracy,
      // backward-compat aliases
      updateStreak: recordAnswer,
      trackWeakTopic: recordAnswer,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};