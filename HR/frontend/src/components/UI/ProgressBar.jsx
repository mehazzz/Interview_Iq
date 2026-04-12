/**
 * components/UI/ProgressBar.jsx
 */
import React from 'react';
import { motion } from 'framer-motion';
import styles from './ProgressBar.module.css';

const ProgressBar = ({ current, total, role, mode }) => {
  const percentage = Math.min(100, (current / total) * 100);
  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <div className={styles.left}>
          <span className={styles.role}>{role}</span>
          {mode && (
            <span className={`${styles.modePill} ${mode === 'test' ? styles.testPill : styles.practicePill}`}>
              {mode}
            </span>
          )}
        </div>
        <span className={styles.count}>{current} <span className={styles.sep}>/</span> {total}</span>
      </div>
      <div className={styles.track}>
        <motion.div className={styles.fill}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;