export const MOCK_HISTORY = [
  { id: 1, date: 'Apr 9, 2026',  module: 'Aptitude', topic: 'Number Series',        score: 82, time: '18 min' },
  { id: 2, date: 'Apr 8, 2026',  module: 'HR',       topic: 'Behavioral Questions', score: 74, time: '24 min' },
  { id: 3, date: 'Apr 7, 2026',  module: 'Coding',   topic: 'Arrays & Strings',     score: 61, time: '35 min' },
  { id: 4, date: 'Apr 6, 2026',  module: 'Aptitude', topic: 'Data Interpretation',  score: 88, time: '20 min' },
  { id: 5, date: 'Apr 5, 2026',  module: 'Coding',   topic: 'Linked Lists',         score: 70, time: '40 min' },
  { id: 6, date: 'Apr 4, 2026',  module: 'HR',       topic: 'Salary Negotiation',   score: 79, time: '15 min' },
];

export const MODULE_TOPICS = {
  Aptitude: [
    { name: 'Number Series',        count: '42 questions' },
    { name: 'Data Interpretation',  count: '38 questions' },
    { name: 'Percentage & Ratio',   count: '30 questions' },
    { name: 'Time & Work',          count: '28 questions' },
    { name: 'Logical Reasoning',    count: '50 questions' },
    { name: 'Profit & Loss',        count: '22 questions' },
  ],
  HR: [
    { name: 'Tell Me About Yourself', count: '15 prompts' },
    { name: 'Behavioral (STAR)',       count: '40 prompts' },
    { name: 'Strengths & Weaknesses',  count: '20 prompts' },
    { name: 'Leadership & Teamwork',   count: '18 prompts' },
    { name: 'Salary Negotiation',      count: '10 prompts' },
    { name: 'Career Goals',            count: '12 prompts' },
  ],
  Coding: [
    { name: 'Arrays & Strings',    count: '60 problems' },
    { name: 'Linked Lists',        count: '35 problems' },
    { name: 'Trees & Graphs',      count: '45 problems' },
    { name: 'DP & Recursion',      count: '50 problems' },
    { name: 'Sorting & Searching', count: '30 problems' },
    { name: 'System Design',       count: '20 scenarios' },
  ],
};

export const DASH_STATS = [
  { num: '12', label: 'SESSIONS DONE' },
  { num: '74%', label: 'AVG SCORE' },
  { num: '4',  label: 'DAY STREAK' },
  { num: '3',  label: 'MODULES ACTIVE' },
];

export const MODULES_CONFIG = [
  { key: 'Aptitude', icon: '🧮', desc: 'Number series, ratios, DI, logical reasoning.', progress: 68 },
  { key: 'HR',       icon: '🤝', desc: 'STAR method, behavioral patterns, negotiations.', progress: 45 },
  { key: 'Coding',   icon: '💻', desc: 'DSA, algorithms, live code editor, AI feedback.', progress: 52 },
];
