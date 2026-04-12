// services/rag.service.js
// Lightweight RAG: Retrieval layer — fetches topic knowledge from JSON store

const knowledgeBase = require('../data/knowledgeBase.json');

/**
 * Retrieve full topic data by topic ID
 */
const getTopicData = (topicId) => {
  const topic = knowledgeBase[topicId];
  if (!topic) throw new Error(`Topic "${topicId}" not found in knowledge base.`);
  return topic;
};

/**
 * Retrieve list of all available topics (for UI grid)
 */
const getAllTopics = () => {
  return Object.values(knowledgeBase).map(({ id, title, icon }) => ({ id, title, icon }));
};

/**
 * Retrieve templates filtered by topic + difficulty
 */
const getTemplatesByDifficulty = (topicId, difficulty) => {
  const topic = getTopicData(topicId);
  if (!difficulty || difficulty === 'all') return topic.templates;
  return topic.templates.filter((t) => t.difficulty.includes(difficulty));
};

/**
 * Retrieve learning content (concepts + formulas) for a topic
 */
const getLearningContent = (topicId) => {
  const topic = getTopicData(topicId);
  return {
    title: topic.title,
    icon: topic.icon,
    concepts: topic.concepts,
    formulas: topic.formulas,
  };
};

module.exports = { getTopicData, getAllTopics, getTemplatesByDifficulty, getLearningContent };