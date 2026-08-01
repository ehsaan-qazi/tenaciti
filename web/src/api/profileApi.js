import { apiFetch } from './client';

export const getProfileSummary = async () => {
  return await apiFetch('/profile/summary');
};

export const getPlanningAccuracy = async () => {
  return await apiFetch('/profile/planning-accuracy');
};

export const getConfidenceTrends = async (courseId, days) => {
  let url = '/profile/confidence-trends?';
  const params = new URLSearchParams();
  if (courseId) params.append('course_id', courseId);
  if (days) params.append('days', days);
  return await apiFetch(url + params.toString());
};

export const getTopicCoverageTrends = async (courseId, days) => {
  let url = '/profile/topic-coverage-trends?';
  const params = new URLSearchParams();
  if (courseId) params.append('course_id', courseId);
  if (days) params.append('days', days);
  return await apiFetch(url + params.toString());
};

export const getNoteDensityCorrelation = async () => {
  return await apiFetch('/profile/note-density-correlation');
};

export const getProcrastinationFingerprint = async () => {
  return await apiFetch('/profile/procrastination-fingerprint');
};

export const getRetrospectiveReport = async (timeframe, courseId) => {
  let url = '/profile/retrospective?';
  const params = new URLSearchParams();
  if (timeframe) params.append('timeframe', timeframe);
  if (courseId) params.append('course_id', courseId);
  return await apiFetch(url + params.toString());
};

export const generateRetrospectiveReport = async (timeframe, courseId) => {
  let url = '/profile/retrospective?';
  const params = new URLSearchParams();
  if (timeframe) params.append('timeframe', timeframe);
  if (courseId) params.append('course_id', courseId);
  return await apiFetch(url + params.toString(), {
    method: 'POST'
  });
};
