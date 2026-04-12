// controllers/aptitude.controller.js

const ragService = require('../services/rag.service');
const { generateQuestions } = require('../services/questionGenerator.service');

/** GET /api/aptitude/topics */
const getAllTopics = (req, res) => {
  try {
    const topics = ragService.getAllTopics();
    res.json({ success: true, data: topics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/aptitude/learn/:topicId */
const getLearnContent = (req, res) => {
  try {
    const { topicId } = req.params;
    const content = ragService.getLearningContent(topicId);
    // Generate 2 example questions at easy difficulty for the learning panel
    const examples = generateQuestions(topicId, 'easy', 2);
    res.json({ success: true, data: { ...content, examples } });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

/** GET /api/aptitude/questions?topic=&difficulty=&count= */
const getQuestions = (req, res) => {
  try {
    const { topic, difficulty = 'medium', count = 5 } = req.query;
    if (!topic) return res.status(400).json({ success: false, message: 'topic is required' });
    const questions = generateQuestions(topic, difficulty, parseInt(count));
    res.json({ success: true, count: questions.length, data: questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** POST /api/aptitude/test/start */
const startTest = (req, res) => {
  try {
    const { topics = [], difficulty = 'medium', questionCount = 10, timeLimit = 15 } = req.body;
    if (!topics.length) return res.status(400).json({ success: false, message: 'Select at least one topic' });

    const perTopic = Math.ceil(questionCount / topics.length);
    const questions = topics.flatMap((t) =>
      generateQuestions(t, difficulty, perTopic)
    ).slice(0, questionCount);

    // Shuffle questions
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    res.json({
      success: true,
      data: {
        testId: `test_${Date.now()}`,
        timeLimit,
        questions,
        totalQuestions: questions.length,
        startedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** POST /api/aptitude/test/submit */
const submitTest = (req, res) => {
  try {
    const { answers, questions, timeTaken } = req.body;
    // answers: [{ questionId, selectedAnswer }]
    // questions: full question objects with correctAnswer

    let correct = 0;
    const weakTopics = {};
    const results = questions.map((q, idx) => {
      const userAnswer = answers[idx]?.selectedAnswer || null;
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) correct++;
      else {
        weakTopics[q.topic] = (weakTopics[q.topic] || 0) + 1;
      }
      return { ...q, userAnswer, isCorrect };
    });

    const score = correct;
    const total = questions.length;
    const accuracy = roundTo((correct / total) * 100);
    const sortedWeak = Object.entries(weakTopics)
      .sort((a, b) => b[1] - a[1])
      .map(([topic, missed]) => ({ topic, missed }));

    res.json({
      success: true,
      data: {
        score,
        total,
        accuracy,
        timeTaken,
        weakTopics: sortedWeak,
        results,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const roundTo = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

module.exports = { getAllTopics, getLearnContent, getQuestions, startTest, submitTest };