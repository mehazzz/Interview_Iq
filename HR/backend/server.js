/**
 * InterviewIQ Backend Server
 */
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const morgan     = require('morgan');

const interviewRoutes = require('./routes/interview.routes');
const feedbackRoutes  = require('./routes/feedback.routes');
const speechRoutes    = require('./routes/speech.routes');
const topicsRoutes    = require('./routes/topics.routes');
const historyRoutes   = require('./routes/history.routes');
const userRoutes      = require('./routes/user.routes');
const errorHandler    = require('./utils/errorHandler');
const userMiddleware  = require('./utils/userMiddleware');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3002' }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Attach req.userId from x-user-id header on every request
app.use(userMiddleware);

app.get('/', (req, res) => res.send('InterviewIQ Backend Running 🚀'));
app.get('/health', (req, res) => res.json({ status: 'ok', mode: process.env.AI_MODE || 'mock', timestamp: new Date() }));

app.use('/api/user',      userRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/feedback',  feedbackRoutes);
app.use('/api/speech',    speechRoutes);
app.use('/api/topics',    topicsRoutes);
app.use('/api/history',   historyRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 InterviewIQ backend running on http://localhost:${PORT}`);
  console.log(`📋 Mode: ${process.env.AI_MODE || 'mock'}`);
});

module.exports = app;