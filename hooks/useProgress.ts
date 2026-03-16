// hooks/useProgress.ts — İlerleme okuma/yazma
import { useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../services/supabase';
import type { Progress } from '../types';

export function useProgress() {
  const activeChild = useAuthStore((s) => s.activeChild);

  const loadProgress = useCallback(async (): Promise<Progress[]> => {
    if (!activeChild) return [];

    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('child_id', activeChild.id);

    if (error || !data) return [];

    return data.map((p) => ({
      id: p.id,
      childId: p.child_id,
      moduleId: p.module_id,
      score: p.score,
      bestScore: p.best_score,
      attempts: p.attempts,
      completed: p.completed,
      timeSpentSec: p.time_spent_sec,
      lastPlayedAt: p.last_played_at,
    }));
  }, [activeChild]);

  const saveProgress = useCallback(
    async (
      moduleId: string,
      score: number,
      timeSpentSec: number,
      completed: boolean,
    ) => {
      if (!activeChild) return;

      await supabase.from('progress').upsert(
        {
          child_id: activeChild.id,
          module_id: moduleId,
          score,
          best_score: score,
          attempts: 1,
          completed,
          time_spent_sec: timeSpentSec,
          last_played_at: new Date().toISOString(),
        },
        { onConflict: 'child_id,module_id' },
      );

      // Yıldızları güncelle
      if (completed) {
        await supabase.rpc('increment_stars', {
          p_child_id: activeChild.id,
          p_stars: score,
        });
      }
    },
    [activeChild],
  );

  const getWeeklySummary = useCallback(async () => {
    if (!activeChild) return null;

    const { data } = await supabase.rpc('get_weekly_summary', {
      p_child_id: activeChild.id,
    });

    return data;
  }, [activeChild]);

  return { loadProgress, saveProgress, getWeeklySummary };
}
