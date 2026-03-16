// hooks/useCharacter.ts — Karakter seçim ve kilit açma hook'u
import { useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/authStore';
import { getCharacterById, DEFAULT_CHARACTER_ID } from '../constants/characters';
import type { Character } from '../types';

export function useCharacter() {
  const activeChild = useAuthStore((s) => s.activeChild);
  const setActiveChild = useAuthStore((s) => s.setActiveChild);

  const selectCharacter = useCallback(
    async (characterId: string) => {
      if (!activeChild) return;
      await supabase
        .from('children')
        .update({ selected_character_id: characterId })
        .eq('id', activeChild.id);
      setActiveChild({ ...activeChild, selectedCharacterId: characterId });
    },
    [activeChild, setActiveChild],
  );

  const unlockCharacter = useCallback(
    async (characterId: string) => {
      if (!activeChild) return;
      await supabase.from('child_characters').insert({
        child_id: activeChild.id,
        character_id: characterId,
      });
    },
    [activeChild],
  );

  const getUnlockedCharacters = useCallback(
    async (childId: string): Promise<string[]> => {
      const { data } = await supabase
        .from('child_characters')
        .select('character_id')
        .eq('child_id', childId);
      return (data ?? []).map((row: { character_id: string }) => row.character_id);
    },
    [],
  );

  const isUnlocked = useCallback(
    (character: Character, totalStars: number, isPremiumUser: boolean): boolean => {
      if (character.isPremium && !isPremiumUser) return false;
      return totalStars >= character.starsRequired;
    },
    [],
  );

  const selectedCharacter = getCharacterById(
    activeChild?.selectedCharacterId ?? DEFAULT_CHARACTER_ID,
  );

  return {
    selectCharacter,
    unlockCharacter,
    getUnlockedCharacters,
    isUnlocked,
    selectedCharacter,
  };
}
