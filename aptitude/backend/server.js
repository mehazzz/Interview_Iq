// server.js
const express = require('express');
const cors = require('cors');
const aptitudeRoutes = require('./routes/aptitude.routes');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use('/api/aptitude', aptitudeRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'InterviewIQ API' }));

app.listen(PORT, () => console.log(`🚀 InterviewIQ API running on port ${PORT}`));
module.exports = app;