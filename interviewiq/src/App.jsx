import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import LandingPage from './pages/LandingPage';
import AuthPage    from './pages/AuthPage';
import Dashboard   from './pages/Dashboard';
import CodingModule from './components/CodingModule';

function PrivateRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ fontFamily:'var(--font-display)', fontSize:32, color:'var(--gold)', letterSpacing:4 }}>
        LOADING...
      </span>
    </div>
  );

  return (
    <Routes>
      <Route path="/"       element={<LandingPage />} />
      <Route path="/login"  element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
      <Route path="/dashboard/*" element={
        <PrivateRoute user={user}>
          <Dashboard user={user} />
        </PrivateRoute>
      } />
      <Route path="/coding" element={
        <PrivateRoute user={user}>
          <CodingModule userId={user?.uid} />
        </PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
