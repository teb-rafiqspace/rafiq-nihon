import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export interface KanaCharacter {
  id: string;
  type: 'hiragana' | 'katakana';
  character: string;
  romaji: string;
  row_name: string | null;
  audio_url: string | null;
  stroke_order_svg: string | null;
  memory_tip_id: string | null;
  example_words: { word: string; romaji: string; meaning: string }[];
  order_index: number;
  is_basic: boolean;
}

export interface UserKanaProgress {
  id: string;
  user_id: string;
  kana_id: string;
  status: 'not_learned' | 'learning' | 'learned';
  correct_count: number;
  incorrect_count: number;
  last_reviewed_at: string | null;
  next_review_at: string | null;
}

export interface KanaRow {
  name: string;
  label: string;
  characters: KanaCharacter[];
  progress: number;
}

const ROW_LABELS: Record<string, string> = {
  'a': 'Vokal (あいうえお)',
  'ka': 'Ka-row (かきくけこ)',
  'sa': 'Sa-row (さしすせそ)',
  'ta': 'Ta-row (たちつてと)',
  'na': 'Na-row (なにぬねの)',
  'ha': 'Ha-row (はひふへほ)',
  'ma': 'Ma-row (まみむめも)',
  'ya': 'Ya-row (やゆよ)',
  'ra': 'Ra-row (らりるれろ)',
  'wa': 'Wa-row & N (わをん)',
};

const KATAKANA_ROW_LABELS: Record<string, string> = {
  'a': 'Vokal (アイウエオ)',
  'ka': 'Ka-row (カキクケコ)',
  'sa': 'Sa-row (サシスセソ)',
  'ta': 'Ta-row (タチツテト)',
  'na': 'Na-row (ナニヌネノ)',
  'ha': 'Ha-row (ハヒフヘホ)',
  'ma': 'Ma-row (マミムメモ)',
  'ya': 'Ya-row (ヤユヨ)',
  'ra': 'Ra-row (ラリルレロ)',
  'wa': 'Wa-row & N (ワヲン)',
};

export function useKanaCharacters(type: 'hiragana' | 'katakana') {
  return useQuery({
    queryKey: ['kana-characters', type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kana_characters')
        .select('*')
        .eq('type', type)
        .eq('is_basic', true)
        .order('order_index');
      
      if (error) throw error;
      
      return (data || []).map(char => ({
        ...char,
        example_words: Array.isArray(char.example_words) 
          ? char.example_words as { word: string; romaji: string; meaning: string }[]
          : []
      })) as KanaCharacter[];
    },
  });
}

export function useUserKanaProgress() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-kana-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_kana_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as UserKanaProgress[];
    },
    enabled: !!user,
  });
}

export function useKanaRows(type: 'hiragana' | 'katakana') {
  const { data: characters = [] } = useKanaCharacters(type);
  const { data: progress = [] } = useUserKanaProgress();
  
  const progressMap = new Map(progress.map(p => [p.kana_id, p]));
  const labels = type === 'hiragana' ? ROW_LABELS : KATAKANA_ROW_LABELS;
  
  const rowOrder = ['a', 'ka', 'sa', 'ta', 'na', 'ha', 'ma', 'ya', 'ra', 'wa'];
  
  const rows: KanaRow[] = rowOrder.map(rowName => {
    const rowChars = characters.filter(c => c.row_name === rowName);
    const learnedCount = rowChars.filter(c => 
      progressMap.get(c.id)?.status === 'learned'
    ).length;
    
    return {
      name: rowName,
      label: labels[rowName] || rowName,
      characters: rowChars,
      progress: rowChars.length > 0 ? (learnedCount / rowChars.length) * 100 : 0,
    };
  }).filter(row => row.characters.length > 0);
  
  return rows;
}

export function useUpdateKanaProgress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      kanaId, 
      status, 
      isCorrect 
    }: { 
      kanaId: string; 
      status?: 'not_learned' | 'learning' | 'learned';
      isCorrect?: boolean;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      // Check if progress exists
      const { data: existing } = await supabase
        .from('user_kana_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('kana_id', kanaId)
        .single();
      
      const now = new Date().toISOString();
      
      if (existing) {
        const updates: Partial<UserKanaProgress> = {
          last_reviewed_at: now,
        };
        
        if (status) updates.status = status;
        if (isCorrect !== undefined) {
          if (isCorrect) {
            updates.correct_count = (existing.correct_count || 0) + 1;
          } else {
            updates.incorrect_count = (existing.incorrect_count || 0) + 1;
          }
        }
        
        const { error } = await supabase
          .from('user_kana_progress')
          .update(updates)
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_kana_progress')
          .insert({
            user_id: user.id,
            kana_id: kanaId,
            status: status || 'learning',
            correct_count: isCorrect ? 1 : 0,
            incorrect_count: isCorrect === false ? 1 : 0,
            last_reviewed_at: now,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-kana-progress'] });
    },
  });
}

export function useKanaStats(type: 'hiragana' | 'katakana') {
  const { data: characters = [] } = useKanaCharacters(type);
  const { data: progress = [] } = useUserKanaProgress();
  
  const characterIds = new Set(characters.map(c => c.id));
  const relevantProgress = progress.filter(p => characterIds.has(p.kana_id));
  
  const learned = relevantProgress.filter(p => p.status === 'learned').length;
  const learning = relevantProgress.filter(p => p.status === 'learning').length;
  const total = characters.length;
  
  return {
    learned,
    learning,
    notLearned: total - learned - learning,
    total,
    percentage: total > 0 ? Math.round((learned / total) * 100) : 0,
  };
}
