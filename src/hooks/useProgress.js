import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'circuit-quest-progress';

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { completed: [], totalTime: 0, lastVisit: null };
  } catch { return { completed: [], totalTime: 0, lastVisit: null }; }
}

function saveProgress(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* storage full or unavailable */ }
}

export function useProgress(allSections) {
  const [progress, setProgress] = useState(loadProgress);

  useEffect(() => { saveProgress(progress); }, [progress]);

  const markCompleted = useCallback((sectionId) => {
    setProgress(p => {
      if (p.completed.includes(sectionId)) return p;
      return { ...p, completed: [...p.completed, sectionId], lastVisit: Date.now() };
    });
  }, []);

  const isCompleted = useCallback((sectionId) => {
    return progress.completed.includes(sectionId);
  }, [progress.completed]);

  const reset = useCallback(() => {
    setProgress({ completed: [], totalTime: 0, lastVisit: null });
  }, []);

  const completedCount = progress.completed.length;
  const totalCount = allSections.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return { progress, markCompleted, isCompleted, reset, completedCount, totalCount, percentage };
}
