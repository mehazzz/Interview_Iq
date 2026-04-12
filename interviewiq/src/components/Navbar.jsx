import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className={styles.nav}>
      <div className={styles.logo} onClick={() => navigate('/')}>
        INTERVIEW<span>IQ</span>
      </div>
      <div className={styles.links}>
        <a>About</a>
        <a>Features</a>
        <a>Pricing</a>
        <button className="btn-gold-outline" onClick={() => navigate('/login')}>
          GET STARTED
        </button>
      </div>
    </nav>
  );
}
