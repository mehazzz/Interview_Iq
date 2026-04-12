/**
 * pages/TopicsPage.jsx
 * Shows preparation topics for the selected role.
 * Categorised by priority with resource links.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTopics } from '../services/api.service';
import styles from './TopicsPage.module.css';

const PRIORITY_META = {
  high:   { label: 'HIGH',   color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  medium: { label: 'MEDIUM', color: '#fb790b', bg: 'rgba(251,121,11,0.1)'  },
  low:    { label: 'LOW',    color: '#4ade80', bg: 'rgba(74,222,128,0.08)' },
};

const TopicsPage = ({ role, onBack }) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [open, setOpen]       = useState({});

  useEffect(() => {
    if (!role) return;
    setLoading(true);
    getTopics(role)
      .then((d) => {
        setData(d);
        // auto-open high priority categories
        const initial = {};
        d.categories?.forEach((c, i) => { if (c.priority === 'high') initial[i] = true; });
        setOpen(initial);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [role]);

  const toggle = (i) => setOpen((prev) => ({ ...prev, [i]: !prev[i] }));

  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
  const item    = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <div>
          <p className={styles.eyebrow}>PREPARATION GUIDE</p>
          <h1 className={styles.title}>{role}</h1>
        </div>
        {data && (
          <div className={styles.prepTime}>
            <span className={styles.prepIcon}>⏱</span>
            <div>
              <p className={styles.prepLabel}>ESTIMATED PREP</p>
              <p className={styles.prepValue}>{data.estimatedPrepTime}</p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {loading && (
        <div className={styles.centered}>
          <div className={styles.spinner} />
          <p className={styles.loadText}>Generating your prep guide…</p>
        </div>
      )}

      {error && (
        <div className={styles.centered}>
          <p className={styles.errorText}>Failed to load topics: {error}</p>
          <button className={styles.retryBtn} onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {data && !loading && (
        <motion.div className={styles.content} variants={stagger} initial="hidden" animate="visible">

          {/* Priority legend */}
          <motion.div className={styles.legend} variants={item}>
            {Object.entries(PRIORITY_META).map(([key, val]) => (
              <span key={key} className={styles.legendItem} style={{ color: val.color }}>
                <span style={{ background: val.color }} className={styles.legendDot} /> {val.label}
              </span>
            ))}
          </motion.div>

          {/* Categories */}
          {data.categories?.map((cat, i) => {
            const meta = PRIORITY_META[cat.priority] || PRIORITY_META.low;
            return (
              <motion.div key={i} className={styles.categoryCard} variants={item}>
                <button
                  className={styles.categoryHeader}
                  onClick={() => toggle(i)}
                  style={{ '--cat-color': meta.color }}
                >
                  <div className={styles.catLeft}>
                    <span className={styles.priorityBadge} style={{ color: meta.color, background: meta.bg }}>
                      {meta.label}
                    </span>
                    <span className={styles.catName}>{cat.name}</span>
                    <span className={styles.topicCount}>{cat.topics.length} topics</span>
                  </div>
                  <span className={`${styles.chevron} ${open[i] ? styles.chevronOpen : ''}`}>›</span>
                </button>

                <AnimatePresence>
                  {open[i] && (
                    <motion.div
                      className={styles.categoryBody}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: 'easeOut' }}
                    >
                      <div className={styles.topicsGrid}>
                        {cat.topics.map((topic, j) => (
                          <span key={j} className={styles.topicChip}>{topic}</span>
                        ))}
                      </div>
                      {cat.resources?.length > 0 && (
                        <div className={styles.resources}>
                          <p className={styles.resourcesLabel}>RESOURCES</p>
                          {cat.resources.map((r, j) => (
                            <span key={j} className={styles.resource}>📎 {r}</span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {/* Tips */}
          {data.tips?.length > 0 && (
            <motion.div className={styles.tipsCard} variants={item}>
              <p className={styles.tipsTitle}>💡 PRO TIPS</p>
              {data.tips.map((tip, i) => (
                <div key={i} className={styles.tip}>
                  <span className={styles.tipNum}>{String(i + 1).padStart(2, '0')}</span>
                  <span>{tip}</span>
                </div>
              ))}
            </motion.div>
          )}

          {/* CTA */}
          <motion.div className={styles.ctaArea} variants={item}>
            <p className={styles.ctaText}>Feeling ready?</p>
            <button className={styles.ctaBtn} onClick={onBack}>Start Your Interview →</button>
          </motion.div>

        </motion.div>
      )}
    </div>
  );
};

export default TopicsPage;