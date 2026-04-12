/**
 * components/InterviewSetup/InterviewSetup.jsx
 * Role selection + Practice vs Test mode toggle.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './InterviewSetup.module.css';

const PRESET_ROLES = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Engineer',
  'Product Manager', 'UX Designer', 'Data Scientist',
  'DevOps Engineer', 'Marketing Manager',
];

const MODES = [
  {
    id: 'practice',
    label: 'PRACTICE',
    icon: '◎',
    desc: '8 adaptive questions · No timer · Instant feedback',
    color: 'var(--accent-orange)',
  },
  {
    id: 'test',
    label: 'TEST',
    icon: '◆',
    desc: '10 questions · Timed · Scored assessment',
    color: '#6b7fe3',
  },
];

const InterviewSetup = ({ onStart, isLoading, onViewTopics, onViewHistory }) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [customRole, setCustomRole]     = useState('');
  const [selectedMode, setMode]         = useState('practice');

  const activeRole = customRole.trim() || selectedRole;

  return (
    <motion.div className={styles.container}
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}>

      {/* Nav links */}
      <div className={styles.topNav}>
        <div className={styles.navLogo}>INTERVIEW<span>IQ</span></div>
        <div className={styles.navLinks}>
          <button className={styles.navLink} onClick={onViewHistory}>History</button>
          <button className={styles.navLink} onClick={() => activeRole && onViewTopics(activeRole)}>
            Prep Topics
          </button>
        </div>
      </div>

      {/* Hero */}
      <motion.div className={styles.hero} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className={styles.logo}>IQ</div>
        <h1 className={styles.title}>INTERVIEW<span className={styles.accent}>IQ</span></h1>
        <p className={styles.subtitle}>AI-powered interview simulation. Real questions. Honest feedback.</p>
      </motion.div>

      {/* Mode selector */}
      <motion.div className={styles.section} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <p className={styles.sectionLabel}>SELECT MODE</p>
        <div className={styles.modeGrid}>
          {MODES.map((m) => (
            <button
              key={m.id}
              className={`${styles.modeCard} ${selectedMode === m.id ? styles.modeActive : ''}`}
              style={selectedMode === m.id ? { '--mode-color': m.color } : {}}
              onClick={() => setMode(m.id)}
            >
              <span className={styles.modeIcon}>{m.icon}</span>
              <span className={styles.modeLabel}>{m.label}</span>
              <span className={styles.modeDesc}>{m.desc}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Role selector */}
      <motion.div className={styles.section} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <p className={styles.sectionLabel}>SELECT YOUR ROLE</p>
        <div className={styles.roleGrid}>
          {PRESET_ROLES.map((role) => (
            <button
              key={role}
              className={`${styles.roleChip} ${selectedRole === role && !customRole ? styles.activeChip : ''}`}
              onClick={() => { setSelectedRole(role); setCustomRole(''); }}
            >
              {role}
            </button>
          ))}
        </div>
        <div className={styles.divider}><span>or enter custom role</span></div>
        <input
          type="text"
          className={styles.customInput}
          placeholder="e.g. iOS Engineer, Growth Hacker…"
          value={customRole}
          onChange={(e) => { setCustomRole(e.target.value); setSelectedRole(''); }}
        />
      </motion.div>

      {/* CTAs */}
      <motion.div className={styles.ctaRow} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
        <motion.button
          className={styles.startBtn}
          disabled={!activeRole || isLoading}
          onClick={() => activeRole && onStart(activeRole, selectedMode)}
          whileHover={{ scale: activeRole ? 1.02 : 1 }}
          whileTap={{ scale: 0.97 }}
        >
          {isLoading
            ? <span className={styles.spinner} />
            : <>{selectedMode === 'test' ? '▶ START TEST' : '▶ START PRACTICE'}</>
          }
        </motion.button>

        {activeRole && (
          <motion.button className={styles.topicsBtn} onClick={() => onViewTopics(activeRole)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileHover={{ scale: 1.02 }}>
            📋 View Prep Topics
          </motion.button>
        )}
      </motion.div>

      {activeRole && !isLoading && (
        <p className={styles.roleConfirm}>
          Ready to interview: <strong>{activeRole}</strong> · <span className={styles.modeTag}>{selectedMode}</span>
        </p>
      )}
    </motion.div>
  );
};

export default InterviewSetup;