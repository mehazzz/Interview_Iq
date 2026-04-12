/**
 * hooks/useUser.js
 *
 * Manages the anonymous user identity stored in localStorage.
 * On first visit: generates a UUID, calls POST /api/user/identify, stores in localStorage.
 * On return visits: rehydrates from localStorage, re-identifies with the server.
 *
 * The userId is injected into every axios request via the x-user-id header
 * (see services/api.service.js — setUserId() is called once here).
 */

import { useState, useEffect } from 'react';
import { v4 as uuidv4 }       from 'uuid';
import { identifyUser, setUserId } from '../services/api.service';

const STORAGE_KEY = 'interviewiq_user';

const useUser = () => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Try to rehydrate from localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        const parsed = stored ? JSON.parse(stored) : null;

        const userId      = parsed?.userId || uuidv4();
        const displayName = parsed?.displayName || 'Anonymous';

        // Register/confirm with backend
        const { user: serverUser } = await identifyUser(userId, displayName);

        // Inject into all future axios calls
        setUserId(serverUser.userId);

        // Persist locally
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serverUser));
        setUser(serverUser);
      } catch (err) {
        // If backend is down, still set a local userId so the app works offline
        const fallback = { userId: uuidv4(), displayName: 'Anonymous' };
        setUserId(fallback.userId);
        setUser(fallback);
        console.warn('useUser: backend unreachable, using local identity', err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  /** Update the display name locally and on the server */
  const updateDisplayName = async (displayName) => {
    if (!user) return;
    const updated = { ...user, displayName };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setUser(updated);
    await identifyUser(user.userId, displayName).catch(() => {});
  };

  return { user, loading, updateDisplayName };
};

export default useUser;