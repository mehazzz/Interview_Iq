/**
 * InterviewIQ Coding Module — Backend Proxy Server
 *
 * Proxies requests to Judge0 so your RapidAPI key stays server-side.
 *
 * Usage:
 *   npm install express cors node-fetch dotenv
 *   JUDGE0_API_KEY=your_key node server.js
 *
 * Endpoints:
 *   POST /api/execute   { sourceCode, languageId, stdin? }  → ExecutionResult
 *   GET  /api/health
 */

require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

// ── Config ────────────────────────────────────────────────────────────────────
const JUDGE0_BASE = process.env.JUDGE0_BASE_URL || 'https://judge0-ce.p.rapidapi.com';
const API_KEY     = process.env.JUDGE0_API_KEY;
const API_HOST    = process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com';

if (!API_KEY) {
  console.warn('⚠  JUDGE0_API_KEY not set — execution will fail');
}

const J0_HEADERS = {
  'Content-Type':    'application/json',
  'X-RapidAPI-Key':  API_KEY  || '',
  'X-RapidAPI-Host': API_HOST,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function poll(token, retries = 25, delay = 700) {
  for (let i = 0; i < retries; i++) {
    await sleep(delay);
    const res = await fetch(
      `${JUDGE0_BASE}/submissions/${token}?base64_encoded=false&fields=status,stdout,stderr,compile_output,time,memory`,
      { headers: J0_HEADERS }
    );
    if (!res.ok) continue;
    const data = await res.json();
    const sid  = data.status?.id;
    if (sid === 1 || sid === 2) continue; // In Queue / Processing
    return data;
  }
  throw new Error('Execution timed out after polling');
}

// ── Routes ────────────────────────────────────────────────────────────────────

app.get('/api/health', (_, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));

/**
 * POST /api/execute
 * Body: { sourceCode: string, languageId: number, stdin?: string }
 */
app.post('/api/execute', async (req, res) => {
  const { sourceCode, languageId, stdin = '' } = req.body;

  if (!sourceCode || !languageId) {
    return res.status(400).json({ error: 'sourceCode and languageId are required' });
  }

  try {
    // 1. Submit
    const submitRes = await fetch(
      `${JUDGE0_BASE}/submissions?base64_encoded=false&wait=false`,
      {
        method: 'POST',
        headers: J0_HEADERS,
        body: JSON.stringify({
          source_code:     sourceCode,
          language_id:     languageId,
          stdin,
          cpu_time_limit:  5,
          memory_limit:    131072,
        }),
      }
    );

    if (!submitRes.ok) {
      const text = await submitRes.text();
      return res.status(502).json({ error: `Judge0 submission failed: ${text}` });
    }

    const { token } = await submitRes.json();

    // 2. Poll
    const result = await poll(token);

    return res.json({
      status:        result.status?.description || 'Unknown',
      statusId:      result.status?.id,
      stdout:        result.stdout        || '',
      stderr:        result.stderr        || '',
      compileOutput: result.compile_output || '',
      time:          result.time,
      memory:        result.memory,
      accepted:      result.status?.id === 3,
    });
  } catch (err) {
    console.error('Execute error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  InterviewIQ API server running on http://localhost:${PORT}`);
  console.log(`   Judge0 base: ${JUDGE0_BASE}`);
  console.log(`   API key set: ${!!API_KEY}`);
});
