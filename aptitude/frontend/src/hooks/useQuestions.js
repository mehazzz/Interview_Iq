// src/hooks/useQuestions.js
import { useState, useCallback } from 'react';
import api from '../utils/api';

export function useQuestions() {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const fetchNext = useCallback(async (topicId, difficulty = 'medium') => {
    setLoading(true);
    setError(null);
    setSelectedOption(null);
    setShowExplanation(false);
    try {
      const res = await api.getQuestions(topicId, difficulty, 1);
      if (res.success && res.data?.length > 0) {
        setQuestion(res.data[0]);
      } else {
        setError('No questions available');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectOption = useCallback((idx) => {
    if (selectedOption !== null) return; // already answered
    setSelectedOption(idx);
    setShowExplanation(true);
  }, [selectedOption]);

  const reset = useCallback(() => {
    setQuestion(null);
    setSelectedOption(null);
    setShowExplanation(false);
    setError(null);
  }, []);

  const isCorrect = question && selectedOption !== null
    ? question.options[selectedOption] === question.correctAnswer
    : null;

  return {
    question, loading, error,
    selectedOption, showExplanation, isCorrect,
    fetchNext, selectOption, reset,
  };
}