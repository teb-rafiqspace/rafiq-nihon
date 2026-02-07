import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

interface KanjiCharacter {
  id: string;
  character: string;
  jlpt_level: string;
  stroke_count: number;
  meanings_id: string;
  meanings_en: string | null;
  kun_readings: string[];
  on_readings: string[];
  example_words: {
    word: string;
    reading: string;
    meaning: string;
  }[];
  stroke_order_svg: string | null;
  radicals: string[];
  mnemonic_id: string | null;
  mnemonic_en: string | null;
  order_index: number;
}

interface UserKanjiProgress {
  id: string;
  kanji_id: string;
  status: string;
  correct_count: number;
  incorrect_count: number;
  last_reviewed_at: string | null;
}

export function useKanji(level: string = 'N5') {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: kanjiList, isLoading: kanjiLoading } = useQuery({
    queryKey: ['kanji', level],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kanji_characters')
        .select('*')
        .eq('jlpt_level', level)
        .order('order_index');
      
      if (error) throw error;
      return (data || []) as unknown as KanjiCharacter[];
    }
  });

  const { data: userProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['kanji-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_kanji_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return (data || []) as UserKanjiProgress[];
    },
    enabled: !!user
  });

  const updateProgress = useMutation({
    mutationFn: async ({ kanjiId, correct }: { kanjiId: string; correct: boolean }) => {
      if (!user) throw new Error('Not authenticated');

      const existing = userProgress?.find(p => p.kanji_id === kanjiId);
      
      if (existing) {
        const { error } = await supabase
          .from('user_kanji_progress')
          .update({
            correct_count: correct ? existing.correct_count + 1 : existing.correct_count,
            incorrect_count: correct ? existing.incorrect_count : existing.incorrect_count + 1,
            status: correct && existing.correct_count >= 2 ? 'learned' : 'learning',
            last_reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_kanji_progress')
          .insert({
            user_id: user.id,
            kanji_id: kanjiId,
            correct_count: correct ? 1 : 0,
            incorrect_count: correct ? 0 : 1,
            status: 'learning',
            last_reviewed_at: new Date().toISOString()
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanji-progress'] });
    }
  });

  const getKanjiStatus = (kanjiId: string) => {
    const progress = userProgress?.find(p => p.kanji_id === kanjiId);
    return progress?.status || 'not_learned';
  };

  const stats = {
    total: kanjiList?.length || 0,
    learned: userProgress?.filter(p => p.status === 'learned').length || 0,
    learning: userProgress?.filter(p => p.status === 'learning').length || 0,
    notLearned: (kanjiList?.length || 0) - (userProgress?.length || 0)
  };

  return {
    kanjiList: kanjiList || [],
    userProgress: userProgress || [],
    isLoading: kanjiLoading || progressLoading,
    updateProgress: updateProgress.mutate,
    getKanjiStatus,
    stats
  };
}
