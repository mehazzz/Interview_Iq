/**
 * utils/userMiddleware.js
 * Reads x-user-id header (set by the frontend on every request) and
 * attaches it to req.userId. If absent, falls back to 'anonymous'.
 * Also auto-creates the user record on first encounter.
 */
const userStore = require('./userStore');

const userMiddleware = (req, res, next) => {
  const userId = req.headers['x-user-id'] || null;
  if (userId) {
    // find-or-create so the user record always exists
    userStore.findOrCreate(userId);
    req.userId = userId;
  } else {
    req.userId = null;
  }
  next();
};

module.exports = userMiddleware;