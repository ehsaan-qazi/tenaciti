import { apiFetch } from './client';

/**
 * Notifications API
 */

export async function getNotifications(limit = 30) {
  return apiFetch(`/notifications?limit=${limit}`);
}

export async function getUnreadNotificationCount() {
  return apiFetch('/notifications/unread-count');
}
