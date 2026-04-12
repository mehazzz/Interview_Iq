/**
 * routes/history.routes.js
 * Stores and retrieves past interview results for comparison.
 */
const express = require('express');
const router = express.Router();
const historyController = require('../controllers/history.controller');

// POST /api/history/save    — save a completed session's feedback
router.post('/save', historyController.saveResult);

// GET  /api/history         — list all saved results (optional ?role= filter)
router.get('/', historyController.listResults);

// GET  /api/history/:id     — get one result by id
router.get('/:id', historyController.getResult);

// DELETE /api/history/:id   — delete a result
router.delete('/:id', historyController.deleteResult);

module.exports = router;