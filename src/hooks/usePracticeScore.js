const PREFIX = 'cq:v4:';

export function loadPractice(key, fallback = {}) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

export function savePractice(key, data) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(data)); } catch { /* ignore */ }
}
