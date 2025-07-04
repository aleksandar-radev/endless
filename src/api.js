import { crypt } from './functions.js';

// Set your actual API URL here
const apiUrl = import.meta.env.VITE_API_URL;
const gameName = import.meta.env.VITE_GAME_NAME;

/**
 * Flexible API fetch wrapper for all HTTP methods.
 * @param {string} path - API endpoint path (relative or absolute).
 * @param {object} options - fetch options (method, headers, body, etc).
 * @returns {Promise<Response>} fetch response
 *
 * Usage examples:
 *   apiFetch('/foo', { method: 'GET' })
 *   apiFetch('/bar', { method: 'GET', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin' })
 */
export function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${apiUrl}${path}`;
  return fetch(url, { ...options, credentials: 'include' });
}

// Cloud Save: Save game data to the server
export async function saveGameData(userId, data) {
  // data: { hero, skillTree, ... }
  const payload = {
    data_json: crypt.encrypt(JSON.stringify(data.data_json)),
    game_name: data.game_name,
  };
  const response = await apiFetch(`/game-data/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error('Failed to save game data');
  }
  return await response.json();
}

// Cloud Load: Load game data from the server
export async function loadGameData(userId, premium = 'no') {
  const response = await apiFetch(`/game-data/${userId}?premium=${premium}&gameName=${gameName}`);
  if (!response.ok) {
    throw new Error('Failed to load game data');
  }

  const result = await response.json();

  return {
    data: result.data_json ?? null,
    updated_at: result.updated_at || 0,
  };
}

export async function getLeaderboard() {
  const response = await apiFetch('/game-data/leaderboard?gameName=' + gameName);
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }
  return await response.json();
}