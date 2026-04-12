/**
 * controllers/user.controller.js
 * Mock auth — no passwords. Client generates a UUID and we persist it.
 */
const { v4: uuidv4 } = require('uuid');
const userStore = require('../utils/userStore');

/**
 * POST /api/user/identify
 * Body: { userId?, displayName? }
 * Returns the user record. Creates it if it doesn't exist yet.
 */
const identify = (req, res, next) => {
  try {
    const { userId, displayName } = req.body;
    const id   = userId || uuidv4();
    const user = userStore.findOrCreate(id, displayName || 'Anonymous');
    res.json({ user });
  } catch (err) { next(err); }
};

const getUser = (req, res, next) => {
  try {
    const user = userStore.get(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) { next(err); }
};

module.exports = { identify, getUser };