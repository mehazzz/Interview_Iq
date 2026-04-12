/**
 * services/mockAI.service.js
 * Mock AI responses for development/testing without API keys.
 *
 * FIX: questions are now shuffled per session using the sessionId as seed,
 * so each interview gets a different order and questions don't repeat in
 * the same predictable cycle.
 */

const QUESTION_BANK = {
  default: [
    { question: "Tell me about yourself and your background.", intent: "Icebreaker / background", difficulty: "easy" },
    { question: "What are your core technical strengths?", intent: "Self-awareness", difficulty: "easy" },
    { question: "Describe a challenging project you led. What was your approach?", intent: "Leadership / problem solving", difficulty: "medium" },
    { question: "How do you handle disagreements with teammates or managers?", intent: "Conflict resolution", difficulty: "medium" },
    { question: "Walk me through how you'd architect a scalable web application.", intent: "Technical depth", difficulty: "hard" },
    { question: "Tell me about a time you failed. What did you learn?", intent: "Growth mindset", difficulty: "medium" },
    { question: "How do you stay up-to-date with technology trends?", intent: "Continuous learning", difficulty: "easy" },
    { question: "Where do you see yourself in 3–5 years?", intent: "Career goals", difficulty: "easy" },
    { question: "How do you prioritise competing deadlines?", intent: "Time management", difficulty: "medium" },
    { question: "Describe a time you had to learn something quickly under pressure.", intent: "Adaptability", difficulty: "medium" },
  ],
  "Frontend Developer": [
    { question: "Tell me about yourself and your frontend experience.", intent: "Background", difficulty: "easy" },
    { question: "Explain the difference between `==` and `===` in JavaScript.", intent: "JS fundamentals", difficulty: "easy" },
    { question: "How does React's virtual DOM work and why is it beneficial?", intent: "React knowledge", difficulty: "medium" },
    { question: "Describe your approach to CSS architecture for large applications.", intent: "CSS at scale", difficulty: "medium" },
    { question: "How would you optimise a slow React application?", intent: "Performance", difficulty: "hard" },
    { question: "Explain the concept of closures in JavaScript with a real example.", intent: "JS depth", difficulty: "hard" },
    { question: "How do you ensure accessibility in your frontend work?", intent: "a11y awareness", difficulty: "medium" },
    { question: "Tell me about a complex UI challenge you solved.", intent: "Problem solving", difficulty: "hard" },
    { question: "What's the difference between `useMemo` and `useCallback` in React?", intent: "React hooks depth", difficulty: "hard" },
    { question: "How do you handle state management in large React apps?", intent: "Architecture", difficulty: "medium" },
  ],
  "Backend Developer": [
    { question: "Walk me through your backend experience and stack preferences.", intent: "Background", difficulty: "easy" },
    { question: "What's the difference between SQL and NoSQL databases?", intent: "DB fundamentals", difficulty: "easy" },
    { question: "How would you design a REST API for a social media platform?", intent: "API design", difficulty: "medium" },
    { question: "Explain how you'd handle authentication and authorization in a Node app.", intent: "Security", difficulty: "medium" },
    { question: "Describe strategies for scaling a backend under high load.", intent: "Scalability", difficulty: "hard" },
    { question: "How do you handle database migrations without downtime?", intent: "DevOps awareness", difficulty: "hard" },
    { question: "Walk me through how you'd debug a production memory leak.", intent: "Debugging", difficulty: "hard" },
    { question: "What's your approach to API versioning?", intent: "API design", difficulty: "medium" },
  ],
  "Full Stack Engineer": [
    { question: "How do you decide which problems to solve on the frontend vs backend?", intent: "Architecture thinking", difficulty: "medium" },
    { question: "Describe a full-stack feature you built end-to-end.", intent: "Experience", difficulty: "easy" },
    { question: "How do you handle CORS and security between frontend and backend?", intent: "Security", difficulty: "medium" },
    { question: "What's your approach to API contract design between frontend and backend?", intent: "API design", difficulty: "medium" },
    { question: "How do you manage environment configuration across environments?", intent: "DevOps", difficulty: "easy" },
    { question: "Describe your experience with real-time features like WebSockets.", intent: "Real-time systems", difficulty: "hard" },
    { question: "How would you architect a system that needs to scale to 1M users?", intent: "Scalability", difficulty: "hard" },
    { question: "What monitoring and observability tools do you use?", intent: "Production awareness", difficulty: "medium" },
  ],
};

const FOLLOW_UP_QUESTIONS = [
  "That's interesting — can you walk me through a concrete example of that?",
  "Can you elaborate on that? I'd love more specific details about your role.",
  "How did that decision ultimately impact the outcome or the team?",
  "Could you quantify that? What metrics or results did you see?",
  "What would you do differently if you faced that situation again?",
];

/**
 * Seeded shuffle — same sessionId always produces the same order (deterministic
 * within a session, different across sessions).
 */
const seededShuffle = (arr, seed) => {
  const copy = [...arr];
  // Simple LCG using seed hash
  let s = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Cache shuffled banks per session so order is stable within a session
const sessionBanks = new Map();

const getShuffledBank = (role, sessionId) => {
  const key = `${role}:${sessionId}`;
  if (!sessionBanks.has(key)) {
    const base = QUESTION_BANK[role] || QUESTION_BANK['default'];
    sessionBanks.set(key, seededShuffle(base, sessionId || String(Date.now())));
    // Evict old entries if cache grows large
    if (sessionBanks.size > 200) {
      const firstKey = sessionBanks.keys().next().value;
      sessionBanks.delete(firstKey);
    }
  }
  return sessionBanks.get(key);
};

/**
 * Returns the next mock question based on conversation state.
 * Now uses a shuffled bank so questions don't repeat in the same order.
 *
 * @param {string} role
 * @param {number} questionIndex
 * @param {number} lastAnswerScore  0–10
 * @param {string} sessionId        used to seed the shuffle
 */
const getNextQuestion = (role, questionIndex, lastAnswerScore = 6, sessionId = '') => {
  const bank       = getShuffledBank(role, sessionId);
  const isFollowUp = lastAnswerScore < 4 && questionIndex > 0;

  if (isFollowUp) {
    const followUp = FOLLOW_UP_QUESTIONS[questionIndex % FOLLOW_UP_QUESTIONS.length];
    return {
      question:          followUp,
      intent:            'Clarification follow-up',
      difficulty:        'medium',
      isFollowUp:        true,
      answerQualityScore: lastAnswerScore,
    };
  }

  // Pick from the shuffled bank; wrap if we've used all questions
  const q = bank[questionIndex % bank.length];
  return {
    ...q,
    isFollowUp:        false,
    answerQualityScore: lastAnswerScore,
  };
};

/**
 * Simulates answer quality scoring based on text length heuristics.
 * Real implementation would use an LLM.
 */
const scoreAnswer = (answerText) => {
  const words = answerText.trim().split(/\s+/).length;
  if (words < 5) return 2;
  if (words < 15) return 4;
  if (words < 40) return 6;
  if (words < 80) return 8;
  return 9;
};

/**
 * Generates mock feedback at the end of the interview.
 */
const generateFeedback = (role, history, mode = 'practice') => {
  const candidateTurns = history.filter((h) => h.role === 'user');
  const avgWords =
    candidateTurns.reduce((sum, h) => sum + h.content.split(' ').length, 0) /
    (candidateTurns.length || 1);

  const score  = Math.min(10, Math.max(1, Math.round(avgWords / 10)));
  const vary   = (base) => Math.min(10, Math.max(1, base + Math.floor(Math.random() * 3) - 1));

  return {
    overallScore: score,
    summary: `The candidate demonstrated ${score >= 7 ? 'strong' : 'developing'} communication and technical awareness for the ${role} role. ${score >= 7 ? 'Answers were mostly relevant and clearly structured.' : 'There is room to improve answer depth and use of concrete examples.'}`,
    dimensionScores: {
      contentRelevance: vary(score),
      clarity:          vary(score),
      confidence:       vary(score),
      structure:        vary(score),
    },
    strengths: [
      'Articulate communication style',
      'Shows awareness of core concepts',
      'Engaged throughout the interview',
    ],
    weaknesses: [
      'Some answers lacked specific examples',
      'Could demonstrate deeper technical depth in advanced topics',
    ],
    suggestions: [
      'Use the STAR method (Situation, Task, Action, Result) for behavioural questions',
      'Back technical claims with real project examples',
      'Research industry best practices more deeply',
    ],
    questionBreakdown: candidateTurns.map((turn, i) => ({
      question:      history.filter((h) => h.role === 'assistant')[i]?.content || `Question ${i + 1}`,
      answerSummary: turn.content.slice(0, 80) + (turn.content.length > 80 ? '…' : ''),
      score:         scoreAnswer(turn.content),
      feedback:      scoreAnswer(turn.content) >= 6
        ? 'Good answer with relevant points. Consider adding a concrete example.'
        : 'Try to be more specific and structured. Use the STAR method.',
    })),
    readyForInterview: score >= 6,
  };
};


// ── Topics (appended) ────────────────────────────────────────
const TOPICS_DB = {
  'Frontend Developer': {
    categories: [
      { name: 'JavaScript Core', priority: 'high', topics: ['Closures', 'Prototypes', 'Event Loop', 'Promises/async-await', 'ES6+'], resources: ['javascript.info', 'You Don\'t Know JS (book)'] },
      { name: 'React', priority: 'high', topics: ['Hooks (useState, useEffect, useMemo)', 'Virtual DOM', 'State management', 'Performance optimisation', 'Component patterns'], resources: ['react.dev official docs'] },
      { name: 'CSS & Layout', priority: 'medium', topics: ['Flexbox', 'CSS Grid', 'Responsive design', 'CSS-in-JS', 'Animations'], resources: ['css-tricks.com'] },
      { name: 'Web Performance', priority: 'medium', topics: ['Lazy loading', 'Code splitting', 'Web Vitals', 'Caching strategies'], resources: ['web.dev/performance'] },
      { name: 'Testing', priority: 'medium', topics: ['Jest', 'React Testing Library', 'E2E with Cypress', 'TDD basics'], resources: ['testing-library.com'] },
      { name: 'System Design', priority: 'low', topics: ['Frontend architecture', 'Micro-frontends', 'Design systems', 'Accessibility (a11y)'], resources: ['Frontend System Design (YouTube)'] },
    ],
    estimatedPrepTime: '2-3 weeks',
    tips: ['Build 2-3 projects showcasing React skills', 'Practise explaining your code decisions out loud', 'Review common algorithm problems (arrays, strings)'],
  },
  'Backend Developer': {
    categories: [
      { name: 'Node.js & Express', priority: 'high', topics: ['Event loop', 'Streams', 'Middleware', 'REST API design', 'Error handling'], resources: ['nodejs.org docs'] },
      { name: 'Databases', priority: 'high', topics: ['SQL vs NoSQL', 'Indexing', 'Transactions', 'ORMs', 'Query optimisation'], resources: ['Use The Index, Luke (book)'] },
      { name: 'System Design', priority: 'high', topics: ['Microservices', 'Message queues', 'Load balancing', 'Caching (Redis)', 'API Gateway'], resources: ['System Design Primer (GitHub)'] },
      { name: 'Security', priority: 'medium', topics: ['JWT/OAuth2', 'SQL injection', 'Rate limiting', 'HTTPS/TLS', 'OWASP Top 10'], resources: ['owasp.org'] },
      { name: 'DevOps Basics', priority: 'low', topics: ['Docker', 'CI/CD', 'Environment config', 'Logging/monitoring'], resources: ['docker.com docs'] },
    ],
    estimatedPrepTime: '3-4 weeks',
    tips: ['Design a scalable API from scratch as practice', 'Be ready to discuss DB schema tradeoffs', 'Know CAP theorem basics'],
  },
  default: {
    categories: [
      { name: 'Communication', priority: 'high', topics: ['STAR method', 'Storytelling', 'Active listening', 'Handling objections'], resources: ['"Tell Me About Yourself" (book)'] },
      { name: 'Technical Skills', priority: 'high', topics: ['Core role competencies', 'Tools & frameworks', 'Domain knowledge'], resources: ['Role-specific documentation'] },
      { name: 'Behavioural', priority: 'high', topics: ['Conflict resolution', 'Leadership examples', 'Failure & learning', 'Teamwork'], resources: ['Glassdoor interview questions'] },
      { name: 'Company Research', priority: 'medium', topics: ['Company mission', 'Recent news', 'Products/services', 'Culture & values'], resources: ['Company website, LinkedIn, Crunchbase'] },
    ],
    estimatedPrepTime: '1-2 weeks',
    tips: ['Prepare 5-7 strong STAR stories', 'Research the company deeply before the interview', 'Practise answers out loud, not just in your head'],
  },
};

/**
 * Generates a mock per-answer hint for practice mode.
 */
const generateAnswerHint = (question, answer) => {
  const words = answer.trim().split(/\s+/).length;
  const score = scoreAnswer(answer);

  const SCORE_LABELS = { 9: 'Excellent', 8: 'Excellent', 7: 'Good', 6: 'Good', 5: 'Fair', 4: 'Fair' };
  const label = SCORE_LABELS[score] || (score >= 9 ? 'Excellent' : score <= 3 ? 'Needs Work' : 'Fair');

  const WHAT_WORKED = [
    'You addressed the core of the question clearly.',
    'Good use of a concrete example to support your answer.',
    'Your response showed self-awareness and honesty.',
    'You demonstrated relevant experience effectively.',
  ];
  const IMPROVE = [
    'Try to structure your answer using the STAR method (Situation, Task, Action, Result).',
    'Add a specific metric or outcome to make your example more impactful.',
    'Keep your answer more concise — aim for 60–90 seconds when spoken.',
    'Open with a clear one-sentence summary before diving into details.',
  ];
  const TIPS = [
    ['Lead with the outcome, then explain how you got there.', 'Use "I" statements to show personal ownership.'],
    ['Quantify your impact wherever possible (e.g. "reduced load time by 30%").', 'End with what you learned.'],
    ['Pause briefly before answering to gather your thoughts.', 'Mirror the language used in the question.'],
    ['Reference a specific project or team when giving examples.', 'Avoid vague phrases like "I always try to…"'],
  ];
  const PHRASES = [
    '"In my role at [Company], I was responsible for… and the outcome was…"',
    '"The situation was X, so I took the initiative to Y, which resulted in Z."',
    '"One concrete example of this is when I… The measurable impact was…"',
    '"To give you a specific example, during [Project] I noticed… and I addressed it by…"',
  ];

  const idx = score % WHAT_WORKED.length;
  return {
    score,
    scoreLabel: label,
    whatWorked: words < 8 ? 'You gave an answer, but more detail would help.' : WHAT_WORKED[idx],
    improve:    IMPROVE[idx],
    tips:       TIPS[idx % TIPS.length],
    examplePhrase: PHRASES[idx % PHRASES.length],
  };
};

const getTopicsForRole = (role) => {
  const data = TOPICS_DB[role] || TOPICS_DB['default'];
  return { role, ...data };
};

module.exports = { getNextQuestion, scoreAnswer, generateFeedback, getTopicsForRole, generateAnswerHint };