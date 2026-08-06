import { apiFetch } from './client';

/**
 * Streak API - Dashboard streak tracking endpoints
 */

export async function getStreakSummary() {
  return apiFetch('/streaks/summary');
}

export async function getStreakHeatmap() {
  return apiFetch('/streaks/heatmap');
}

export async function logActivity(actionCount = 1) {
  return apiFetch('/streaks/log-activity', {
    method: 'POST',
    body: JSON.stringify({ action_count: actionCount }),
  });
}

export async function getUpcomingDeadlines(daysAhead = 14) {
  return apiFetch(`/streaks/deadlines?days_ahead=${daysAhead}`);
}

export async function getTopicCoverage() {
  return apiFetch('/streaks/topic-coverage');
}

export async function getWeeklyWorkload() {
  return apiFetch('/streaks/weekly-workload');
}