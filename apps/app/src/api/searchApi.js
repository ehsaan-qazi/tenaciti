import { apiFetch } from './client';

/**
 * Global Search API
 */

export async function searchGlobal(query, types = null, limit = 20) {
  if (!query || !query.trim()) {
    return { query: '', total: 0, items: [] };
  }
  let url = `/search?q=${encodeURIComponent(query.trim())}&limit=${limit}`;
  if (types) {
    url += `&types=${encodeURIComponent(types)}`;
  }
  return apiFetch(url);
}
