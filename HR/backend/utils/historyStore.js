/**
 * utils/historyStore.js
 * File-based history store. Each record carries userId for per-user filtering.
 */
const fs   = require('fs');
const path = require('path');

const DATA_DIR  = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'history.json');

if (!fs.existsSync(DATA_DIR))  fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([]));

const read  = () => { try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch { return []; } };
const write = (d) => fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2));

const historyStore = {
  save(record) {
    const all = read();
    all.unshift(record);        // newest first
    write(all);
    return record;
  },

  /**
   * @param {object} filters - { role?, userId? }
   */
  list({ role, userId } = {}) {
    let all = read();
    if (userId) all = all.filter(r => r.userId === userId);
    if (role)   all = all.filter(r => r.role   === role);
    return all;
  },

  getById(id) { return read().find(r => r.id === id) || null; },

  delete(id) {
    const all      = read();
    const filtered = all.filter(r => r.id !== id);
    write(filtered);
    return all.length !== filtered.length;
  },
};

module.exports = historyStore;