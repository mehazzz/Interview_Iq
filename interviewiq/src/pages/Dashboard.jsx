import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { MOCK_HISTORY, MODULE_TOPICS, DASH_STATS, MODULES_CONFIG } from '../data/mockData';
import styles from './Dashboard.module.css';

// ── helpers ──
const scoreColor = s => s >= 80 ? styles.good : s >= 65 ? styles.mid : styles.low;
const badgeClass  = m => m === 'Aptitude' ? styles.badgeA : m === 'HR' ? styles.badgeH : styles.badgeC;

// ── SUB-VIEWS ──

function HomeView({ onModuleClick }) {
  return (
    <div className="fade-in">
      <div className={styles.header}>
        <h1 className={styles.greeting}>WELCOME BACK, <span className={styles.gold}>CHAMP</span></h1>
        <p className={styles.sub}>You're on a 4-day streak. Keep it going!</p>
      </div>

      <div className={styles.statsRow}>
        {DASH_STATS.map(s => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statNum}>{s.num}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.modulesRow}>
        {MODULES_CONFIG.map(m => (
          <div key={m.key} className={styles.moduleCard} onClick={() => onModuleClick(m.key)}>
            <div className={styles.moduleIcon}>{m.icon}</div>
            <div className={styles.moduleName}>{m.key}</div>
            <p className={styles.moduleDesc}>{m.desc}</p>
            <div className={styles.bar}><div className={styles.fill} style={{ width: `${m.progress}%` }} /></div>
            <div className={styles.progressRow}><span>Progress</span><span>{m.progress}%</span></div>
            <span className={styles.continueLink}>CONTINUE →</span>
          </div>
        ))}
      </div>

      <RecentTable rows={MOCK_HISTORY.slice(0, 3)} />
    </div>
  );
}

function PrepView({ module, onBack }) {
  const topics = MODULE_TOPICS[module] || [];
  const icons  = { Aptitude: '🧮', HR: '🤝', Coding: '💻' };
  const tags   = { Aptitude: 'QUANTITATIVE & LOGICAL', HR: 'BEHAVIOURAL & SOFT SKILLS', Coding: 'ALGORITHMS & DSA' };
  return (
    <div className="fade-in">
      <button className={styles.backBtn} onClick={onBack}>← BACK TO DASHBOARD</button>
      <div className={styles.header}>
        <div className={styles.prepTag}>{tags[module]}</div>
        <h1 className={styles.greeting}>{icons[module]}  {module.toUpperCase()} PREP</h1>
      </div>
      <div className={styles.topicsGrid}>
        {topics.map(t => (
          <div key={t.name} className={styles.topicCard}>
            <div>
              <div className={styles.topicName}>{t.name}</div>
              <div className={styles.topicCount}>{t.count}</div>
            </div>
            <span className={styles.chevron}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryView() {
  return (
    <div className="fade-in">
      <div className={styles.header}>
        <h1 className={styles.greeting}>SESSION <span className={styles.gold}>HISTORY</span></h1>
        <p className={styles.sub}>All your past practice sessions</p>
      </div>
      <RecentTable rows={MOCK_HISTORY} full />
    </div>
  );
}

function AnalyticsView() {
  return (
    <div className="fade-in">
      <div className={styles.header}>
        <h1 className={styles.greeting}>YOUR <span className={styles.gold}>ANALYTICS</span></h1>
        <p className={styles.sub}>Performance snapshot across all modules</p>
      </div>
      <div className={styles.statsRow}>
        {[{n:'82%',l:'AVG APTITUDE'},{n:'74%',l:'AVG HR'},{n:'67%',l:'AVG CODING'},{n:'12',l:'SESSIONS'}].map(s => (
          <div key={s.l} className={styles.statCard}>
            <div className={styles.statNum}>{s.n}</div>
            <div className={styles.statLabel}>{s.l}</div>
          </div>
        ))}
      </div>
      <div className={styles.analyticsBox}>
        <div className={styles.analyticsTitle}>Module Progress</div>
        {MODULES_CONFIG.map(m => (
          <div key={m.key} className={styles.analyticRow}>
            <div className={styles.analyticLabel}><span>{m.key}</span><span className={styles.gold}>{m.progress}%</span></div>
            <div className={styles.bar} style={{height:6}}><div className={styles.fill} style={{width:`${m.progress}%`}}/></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentTable({ rows, full }) {
  return (
    <div className={styles.tableBox}>
      <div className={styles.tableTitle}>
        {full ? 'All Sessions' : 'Recent Activity'}
      </div>
      <table className={styles.table}>
        <thead>
          <tr>{['DATE','MODULE','TOPIC','SCORE', ...(full?['TIME']:[])].map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{r.date}</td>
              <td><span className={`${styles.badge} ${badgeClass(r.module)}`}>{r.module}</span></td>
              <td>{r.topic}</td>
              <td className={scoreColor(r.score)}>{r.score}%</td>
              {full && <td style={{color:'var(--muted)'}}>{r.time}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── SIDEBAR NAV ──
const NAV_ITEMS = [
  { id: 'home',      icon: '', label: 'Dashboard' },
  { id: 'Aptitude',  icon: '', label: 'Aptitude' },
  { id: 'HR',        icon: '', label: 'HR Round' },
  { id: 'Coding',    icon: '', label: 'Coding' },
  { id: 'history',   icon: '', label: 'History' },
  { id: 'analytics', icon: '', label: 'Analytics' },
];

// ── MAIN DASHBOARD ──
export default function Dashboard({ user }) {
  const [active, setActive] = useState('home');
  const navigate = useNavigate();

  const handleLogout = () => signOut(auth);

  const initials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
    : user?.email?.[0]?.toUpperCase() || 'U';

  // Coding nav item → go to /coding route directly
  const handleNavClick = (id) => {
    if (id === 'Coding') {
      navigate('/coding');
    } else if (id === 'Aptitude') {
      window.open('http://localhost:3001', '_blank');
    } else if (id === 'HR') {
      window.open('http://localhost:3002', '_blank');
    } else {
      setActive(id);
    }
  };

  const renderContent = () => {
    if (active === 'history')   return <HistoryView />;
    if (active === 'analytics') return <AnalyticsView />;
    return <HomeView onModuleClick={id => handleNavClick(id)} />;
  };

  return (
    <div className={styles.layout}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>IIQ</div>
        <nav className={styles.sidebarNav}>
          {NAV_ITEMS.map(item => (
            <div
              key={item.id}
              className={`${styles.navItem} ${active === item.id ? styles.navActive : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>
        <div className={styles.sidebarUser}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user?.displayName || user?.email?.split('@')[0] || 'User'}</div>
            <div className={styles.userRole}>Candidate</div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">⏻</button>
        </div>
      </aside>

      {/* MAIN */}
      <main className={styles.main}>
        {renderContent()}
      </main>
    </div>
  );
}
