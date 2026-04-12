/**
 * routes/topics.routes.js
 * Returns preparation topics for a given role.
 */
const express = require('express');
const router = express.Router();
const topicsController = require('../controllers/topics.controller');

// GET /api/topics?role=Frontend+Developer
router.get('/', topicsController.getTopics);

module.exports = router;