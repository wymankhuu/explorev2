'use client';

import { useState, useEffect, useCallback } from 'react';

const STARRED_KEY = 'playlab-starred-apps';

function getLocalStarred(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STARRED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveLocalStarred(set: Set<string>) {
  localStorage.setItem(STARRED_KEY, JSON.stringify([...set]));
}

export function useStars(appIds: string[]) {
  const [starCounts, setStarCounts] = useState<Record<string, number>>({});
  const [starred, setStarred] = useState<Set<string>>(new Set());

  // Load local starred state + fetch counts
  useEffect(() => {
    setStarred(getLocalStarred());

    if (appIds.length === 0) return;
    const ids = appIds.slice(0, 100).join(',');
    fetch(`/api/stars?ids=${ids}`)
      .then((r) => r.json())
      .then((data) => setStarCounts(data))
      .catch(() => {});
  }, [appIds]);

  const toggleStar = useCallback(async (appId: string) => {
    const isStarred = starred.has(appId);
    const action = isStarred ? 'unstar' : 'star';

    // Optimistic update
    setStarred((prev) => {
      const next = new Set(prev);
      if (isStarred) next.delete(appId);
      else next.add(appId);
      saveLocalStarred(next);
      return next;
    });
    setStarCounts((prev) => ({
      ...prev,
      [appId]: Math.max(0, (prev[appId] || 0) + (isStarred ? -1 : 1)),
    }));

    try {
      await fetch('/api/stars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, action }),
      });
    } catch {
      // Revert on failure
      setStarred((prev) => {
        const next = new Set(prev);
        if (isStarred) next.add(appId);
        else next.delete(appId);
        saveLocalStarred(next);
        return next;
      });
    }
  }, [starred]);

  return { starCounts, starred, toggleStar };
}
