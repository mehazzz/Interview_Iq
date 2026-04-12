/**
 * utils/userStore.js
 * File-backed user registry.
 * Each user identified by a UUID generated client-side on first visit.
 */
const fs   = require('fs');
const path = require('path');

const DATA_DIR  = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'users.json');

if (!fs.existsSync(DATA_DIR))  fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({}));

const read  = () => { try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch { return {}; } };
const write = (d) => fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2));

const userStore = {
  findOrCreate(userId, displayName = 'Anonymous') {
    const all = read();
    if (all[userId]) return all[userId];
    const user = { userId, displayName, createdAt: new Date().toISOString() };
    all[userId] = user;
    write(all);
    return user;
  },
  get(userId) { return read()[userId] || null; },
  list()      { return Object.values(read()); },
};

module.exports = userStore;