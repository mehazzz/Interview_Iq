/**
 * routes/user.routes.js
 * Minimal user identity endpoints.
 */
const express = require('express');
const router  = express.Router();
const userController = require('../controllers/user.controller');

// POST /api/user/identify  — find-or-create user by userId + optional displayName
router.post('/identify', userController.identify);

// GET  /api/user/:userId   — get user profile
router.get('/:userId', userController.getUser);

module.exports = router;