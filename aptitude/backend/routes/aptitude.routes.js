// routes/aptitude.routes.js

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/aptitude.controller');

router.get('/topics', ctrl.getAllTopics);
router.get('/learn/:topicId', ctrl.getLearnContent);
router.get('/questions', ctrl.getQuestions);
router.post('/test/start', ctrl.startTest);
router.post('/test/submit', ctrl.submitTest);

module.exports = router;