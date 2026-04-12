/**
 * pages/InterviewPage.jsx
 * Main orchestrator — setup → interview → feedback.
 *
 * Black screen fix:
 *  - AnimatePresence no longer uses mode="wait" (was causing flash between views)
 *  - .fullscreen gets min-height so content never collapses
 *  - Loading state is explicit and visible
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import useInterview from '../hooks/useInterview';
import { loadVoices } from '../services/tts.service';

import InterviewSetup from '../components/InterviewSetup/InterviewSetup';
import ChatWindow     from '../components/ChatWindow/ChatWindow';
import AudioRecorder  from '../components/AudioRecorder/AudioRecorder';
import ProgressBar    from '../components/UI/ProgressBar';
import FeedbackPanel  from '../components/FeedbackPanel/FeedbackPanel';
import TopicsPage     from './TopicsPage';
import HistoryPage    from './HistoryPage';

import styles from './InterviewPage.module.css';

const VIEW = { SETUP: 'setup', TOPICS: 'topics', HISTORY: 'history', INTERVIEW: 'interview' };

const InterviewPage = () => {
  const [view, setView]             = useState(VIEW.SETUP);
  const [topicsRole, setTopicsRole] = useState('');

  const {
    status, messages,
    questionNumber, totalQuestions,
    feedback, error, isSpeaking, role, mode,
    start, submitAnswer, fetchNextQuestion, finish, loadFeedback, reset,
  } = useInterview();

  useEffect(() => { loadVoices().catch(() => {}); }, []);

  // Switch to interview view whenever the interview is in-progress
  useEffect(() => {
    if (['active', 'processing', 'awaiting_next', 'completed', 'feedback', 'loading'].includes(status)
        && status !== 'idle') {
      setView(VIEW.INTERVIEW);
    }
  }, [status]);

  const handleStart = (selectedRole, selectedMode) => {
    setView(VIEW.INTERVIEW);
    start(selectedRole, selectedMode);
  };

  const handleReset = () => {
    reset();
    setView(VIEW.SETUP);
  };

  const handleViewTopics = (r) => {
    setTopicsRole(r);
    setView(VIEW.TOPICS);
  };

  return (
    <div className={styles.page}>
      <div className={styles.blobOrange} />
      <div className={styles.blobBlue} />

      {/* No mode="wait" — prevents the black-screen flash between view transitions */}
      <AnimatePresence>

        {view === VIEW.SETUP && (
          <motion.div key="setup" className={styles.fullscreen}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}>
            <InterviewSetup
              onStart={handleStart}
              isLoading={status === 'loading'}
              onViewTopics={handleViewTopics}
              onViewHistory={() => setView(VIEW.HISTORY)}
            />
          </motion.div>
        )}

        {view === VIEW.TOPICS && (
          <motion.div key="topics" className={styles.fullscreen}
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
            <TopicsPage role={topicsRole} onBack={() => setView(VIEW.SETUP)} />
          </motion.div>
        )}

        {view === VIEW.HISTORY && (
          <motion.div key="history" className={styles.fullscreen}
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
            <HistoryPage onBack={() => setView(VIEW.SETUP)} />
          </motion.div>
        )}

        {view === VIEW.INTERVIEW && (
          <motion.div key="interview" className={styles.fullscreen}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}>

            {/* ── Loading ── */}
            {status === 'loading' && (
              <div className={styles.centered}>
                <div className={styles.loadSpinner} />
                <p className={styles.loadText}>Preparing your {mode} session…</p>
              </div>
            )}

            {/* ── Active / Processing / Awaiting next ── */}
            {(status === 'active' || status === 'processing' || status === 'awaiting_next') && (
              <div className={styles.interviewLayout}>
                <ProgressBar
                  current={questionNumber}
                  total={totalQuestions}
                  role={role}
                  mode={mode}
                />

                <ChatWindow
                  messages={messages}
                  isSpeaking={isSpeaking}
                  isProcessing={status === 'processing'}
                  awaitingNext={status === 'awaiting_next'}
                  onNext={fetchNextQuestion}
                  isPractice={mode === 'practice'}
                />

                {error && <div className={styles.errorBanner}>{error}</div>}

                {/* Mic — only when active and not speaking */}
                {status === 'active' && (
                  <AudioRecorder onAnswer={submitAnswer} disabled={isSpeaking} />
                )}

                {/* Processing bar — replaces mic while AI thinks */}
                {status === 'processing' && (
                  <div className={styles.processingBar}>
                    <span className={styles.processingDot} style={{ animationDelay: '0s' }} />
                    <span className={styles.processingDot} style={{ animationDelay: '0.15s' }} />
                    <span className={styles.processingDot} style={{ animationDelay: '0.3s' }} />
                    <span>Processing your answer…</span>
                  </div>
                )}

                {/* awaiting_next: no bar needed — Next button is inside ChatWindow */}

                <button className={styles.endBtn} onClick={finish}>End Interview</button>
              </div>
            )}

            {/* ── Completed ── */}
            {status === 'completed' && (
              <div className={styles.centered}>
                <div className={styles.completedIcon}>✓</div>
                <h2 className={styles.completedTitle}>Interview Complete</h2>
                <p className={styles.completedSub}>Well done! Ready to see your detailed report?</p>
                <motion.button className={styles.feedbackBtn} onClick={loadFeedback}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  View Feedback Report →
                </motion.button>
                <button className={styles.ghostBtn} onClick={handleReset}>
                  ↺ Start New Interview
                </button>
              </div>
            )}

            {/* ── Feedback ── */}
            {status === 'feedback' && (
              <div className={styles.feedbackLayout}>
                <FeedbackPanel
                  feedback={feedback}
                  role={role}
                  mode={mode}
                  onRestart={handleReset}
                  onViewHistory={() => setView(VIEW.HISTORY)}
                />
              </div>
            )}

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default InterviewPage;