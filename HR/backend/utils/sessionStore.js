/**
 * utils/sessionStore.js
 * File-backed session store. Sessions are keyed by sessionId and carry userId.
 * Survives server restarts. Replace with Redis/Mongo for production.
 */
const fs   = require('fs');
const path = require('path');

const DATA_DIR  = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'sessions.json');

if (!fs.existsSync(DATA_DIR))  fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({}));

const read  = () => { try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch { return {}; } };
const write = (d) => fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2));

const sessionStore = {
  create(sessionId, data) {
    const all = read();
    all[sessionId] = { ...data, createdAt: Date.now() };
    write(all);
    return all[sessionId];
  },
  get(sessionId)          { return read()[sessionId] || null; },
  has(sessionId)          { return !!read()[sessionId]; },
  update(sessionId, updates) {
    const all = read();
    if (!all[sessionId]) return null;
    all[sessionId] = { ...all[sessionId], ...updates, updatedAt: Date.now() };
    write(all);
    return all[sessionId];
  },
  delete(sessionId) {
    const all = read();
    const existed = !!all[sessionId];
    delete all[sessionId];
    write(all);
    return existed;
  },
  listByUser(userId) { return Object.values(read()).filter(s => s.userId === userId); },
};

module.exports = sessionStore;