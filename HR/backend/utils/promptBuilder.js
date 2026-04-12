/**
 * utils/promptBuilder.js
 * All LLM prompt templates in one place.
 */

const systemPrompt = (role) => `
You are an expert HR interviewer conducting a professional job interview for the role of "${role}".
Behaviour:
- Ask one question at a time, clearly and concisely.
- Adapt difficulty based on the candidate's previous answers.
- If weak/vague → ask a targeted follow-up.
- If strong → progress to a more advanced question.
- Stay professional, encouraging, and neutral.

ALWAYS respond with valid JSON only — no markdown, no explanation outside JSON:
{
  "question": "Your interview question here",
  "intent": "What skill/trait this evaluates",
  "difficulty": "easy | medium | hard",
  "isFollowUp": true | false,
  "answerQualityScore": null
}`.trim();

const openingQuestionPrompt = (role) =>
  `Start the interview for "${role}". Ask a warm opening question (intro/background). Return only valid JSON.`;

const nextQuestionPrompt = (history, latestAnswer) => {
  const historyText = history
    .map((h) => `${h.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${h.content}`)
    .join('\n');
  return `
Conversation so far:
${historyText}

Candidate's latest answer: "${latestAnswer}"

Evaluate answer quality (score 0-10) as "answerQualityScore".
- Score < 4 → ask targeted follow-up, set isFollowUp: true
- Score >= 4 → next logical question, set isFollowUp: false

Return only valid JSON.`.trim();
};

const feedbackPrompt = (role, history, mode = 'practice') => {
  const transcript = history
    .map((h) => `${h.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${h.content}`)
    .join('\n');

  return `
You are an expert HR evaluator. You just ${mode === 'test' ? 'administered a formal interview test' : 'ran a practice interview'} for the role of "${role}".

Full transcript:
${transcript}

Evaluate the candidate rigorously across FOUR dimensions:
1. CONTENT RELEVANCE   — Did answers directly address the question with role-specific knowledge?
2. CLARITY             — Were answers structured, concise, and easy to follow?
3. CONFIDENCE & TONE   — Did the candidate sound assured, professional, and engaged?
4. STRUCTURE           — Did answers follow a logical flow (e.g. STAR method for behavioural)?

Return comprehensive feedback as valid JSON only — no markdown, no preamble:
{
  "overallScore": 7.5,
  "summary": "2-3 sentence honest performance summary",
  "dimensionScores": {
    "contentRelevance": 8,
    "clarity": 7,
    "confidence": 6,
    "structure": 7
  },
  "strengths":   ["specific strength 1", "specific strength 2"],
  "weaknesses":  ["specific weakness 1", "specific weakness 2"],
  "suggestions": ["actionable suggestion 1", "actionable suggestion 2", "actionable suggestion 3"],
  "questionBreakdown": [
    {
      "question":      "The question asked",
      "answerSummary": "Brief paraphrase of what the candidate said",
      "score":         8,
      "feedback":      "Specific, constructive sentence about this answer"
    }
  ],
  "readyForInterview": true
}

Be honest — do not inflate scores. A score of 10 should be exceptional.`.trim();
};

const topicsPrompt = (role) => `
List the most important topics and skills a candidate must prepare for a "${role}" interview.

Return only this JSON structure:
{
  "role": "${role}",
  "categories": [
    {
      "name": "Category Name",
      "priority": "high | medium | low",
      "topics": ["topic 1", "topic 2", "topic 3"],
      "resources": ["resource suggestion 1"]
    }
  ],
  "estimatedPrepTime": "2-3 weeks",
  "tips": ["tip 1", "tip 2"]
}`.trim();

/**
 * Per-answer hint — shown in practice mode after each user response.
 * Gives 2-3 concrete coaching tips without spoiling the next question.
 */
const answerHintPrompt = (question, answer, role) => `
You are a friendly interview coach helping a "${role}" candidate improve.

The interviewer asked: "${question}"
The candidate answered: "${answer}"

Give brief, constructive coaching in JSON only:
{
  "score": 7,
  "scoreLabel": "Good",
  "whatWorked": "One sentence on what was strong",
  "improve": "One sentence on the single most important thing to improve",
  "tips": ["Specific tip 1", "Specific tip 2"],
  "examplePhrase": "A short example of how to phrase one part better"
}

scoreLabel must be: "Excellent" (9-10), "Good" (7-8), "Fair" (5-6), "Needs Work" (1-4).
Keep all text concise and actionable. Return only valid JSON.`.trim();

module.exports = { systemPrompt, nextQuestionPrompt, openingQuestionPrompt, feedbackPrompt, topicsPrompt, answerHintPrompt };