import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import styles from './LandingPage.module.css';

const STATS = [
  { num: '50K+', label: 'USERS PLACED' },
  { num: '94%',  label: 'SUCCESS RATE' },
  { num: '3K+',  label: 'QUESTIONS' },
];

const FEATURES = [
  { icon: '⚡', title: 'Adaptive Practice',       desc: 'AI adjusts difficulty based on your performance, focusing on your weak spots automatically.' },
  { icon: '📊', title: 'Deep Analytics',           desc: 'Track every session with detailed reports, score trends, and topic-level breakdowns.' },
  { icon: '🎯', title: 'Real Interview Patterns',  desc: 'Questions curated from top MNCs and startups, updated with the latest patterns.' },
];

const MODULES = [
  { num: '01', name: 'APTITUDE', desc: 'Quantitative ability, logical reasoning, data interpretation — crack every written test.' },
  { num: '02', name: 'HR ROUND', desc: 'Behavioural questions, STAR technique, salary negotiations — own every HR conversation.' },
  { num: '03', name: 'CODING',   desc: 'DSA, algorithms, system design — with live code editor and instant AI feedback.' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <Navbar />

      {/* ── HERO ── */}
      <section className={styles.hero}>
        {/* Atmosphere layers */}
        <div className={styles.heroBg} />
        <div className={styles.heroGrid} />

        {/* Abstract figure glow — homage to MIDWAM silhouette */}
        <div className={styles.heroFigure} />

        {/* Bottom content bar */}
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <div className={styles.tag}>
              <span className={styles.dot} />
              AI-POWERED INTERVIEW PREP
            </div>

            <h1 className={styles.heroTitle}>
              ACE YOUR <span className={styles.gold}>NEXT</span><br />INTERVIEW
            </h1>

            <p className={styles.heroSub}>
              Master Aptitude, HR, and Coding rounds with intelligent practice sessions,
              real-time feedback, and personalized performance tracking.
            </p>

            <div className={styles.heroCta}>
              <button className={styles.btnPrimary} onClick={() => navigate('/login')}>
                START PREPARING
              </button>
              <button className={styles.btnOutline}>WATCH DEMO</button>
            </div>
          </div>

          {/* Stats */}
          <div className={styles.heroRight}>
            {STATS.map((s, i) => (
              <div key={s.label} className={styles.statCard} style={{ animationDelay: `${0.5 + i * 0.1}s` }}>
                <div className={styles.statNum}>{s.num}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className={styles.scrollHint}>
          <div className={styles.scrollLine} />
          <span className={styles.scrollText}>SCROLL</span>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className={styles.features}>
        <div className={styles.sectionTag}>WHY INTERVIEWIQ</div>
        <h2 className={styles.sectionTitle}>BUILT TO<br />GET YOU HIRED</h2>

        <div className={styles.featGrid}>
          {FEATURES.map(f => (
            <div key={f.title} className={styles.featItem}>
              <div className={styles.featIcon}>{f.icon}</div>
              <h3 className={styles.featTitle}>{f.title}</h3>
              <p className={styles.featDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MODULES ── */}
      <section className={styles.modulesSection}>
        <div className={styles.sectionTag}>PREP MODULES</div>
        <h2 className={styles.sectionTitle}>THREE PILLARS<br />OF PREP</h2>

        <div className={styles.modulesGrid}>
          {MODULES.map(m => (
            <div key={m.num} className={styles.moduleCard} onClick={() => navigate('/login')}>
              <span className={styles.moduleNum}>{m.num}</span>
              <div className={styles.moduleName}>{m.name}</div>
              <p className={styles.moduleDesc}>{m.desc}</p>
              <div className={styles.moduleArrow}>→</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}