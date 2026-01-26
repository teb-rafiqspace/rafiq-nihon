import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export interface SpeakingLesson {
  id: string;
  title_ja: string;
  title_id: string;
  description: string | null;
  lesson_type: string;
  difficulty: string | null;
  track: string | null;
  category: string | null;
  estimated_minutes: number | null;
  xp_reward: number | null;
  order_index: number | null;
  is_premium: boolean | null;
}

export interface SpeakingItem {
  id: string;
  lesson_id: string | null;
  japanese_text: string;
  reading_hiragana: string | null;
  reading_romaji: string | null;
  meaning_id: string;
  meaning_en: string | null;
  audio_url: string | null;
  audio_slow_url: string | null;
  pitch_pattern: string | null;
  pitch_visual: string | null;
  context_situation: string | null;
  formality_level: string | null;
  pronunciation_tips: string | null;
  common_mistakes: string | null;
  order_index: number | null;
}

export interface ConversationScript {
  id: string;
  lesson_id: string | null;
  title_ja: string;
  title_id: string;
  scenario_description: string | null;
  location: string | null;
  participants: string[] | null;
  difficulty: string | null;
  estimated_turns: number | null;
}

export interface ConversationLine {
  id: string;
  script_id: string | null;
  speaker: string;
  speaker_role: string | null;
  japanese_text: string;
  reading_hiragana: string | null;
  meaning_id: string;
  audio_url: string | null;
  is_user_turn: boolean | null;
  acceptable_responses: string[] | null;
  response_hints: string[] | null;
  line_order: number;
}

export interface RoleplayScenario {
  id: string;
  lesson_id: string | null;
  title_ja: string;
  title_id: string;
  scenario_description_ja: string | null;
  scenario_description_id: string | null;
  user_role: string;
  ai_role: string;
  location: string | null;
  situation: string | null;
  objectives: string[] | null;
  key_phrases: string[] | null;
  difficulty: string | null;
  estimated_minutes: number | null;
}

export function useSpeakingLessons(lessonType?: string) {
  return useQuery({
    queryKey: ['speaking-lessons', lessonType],
    queryFn: async () => {
      let query = supabase
        .from('speaking_lessons')
        .select('*')
        .order('order_index');
      
      if (lessonType) {
        query = query.eq('lesson_type', lessonType);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as SpeakingLesson[];
    }
  });
}

export function useSpeakingItems(lessonId: string) {
  return useQuery({
    queryKey: ['speaking-items', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('speaking_items')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index');
      
      if (error) throw error;
      return data as SpeakingItem[];
    },
    enabled: !!lessonId
  });
}

export function useConversationScripts() {
  return useQuery({
    queryKey: ['conversation-scripts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversation_scripts')
        .select('*')
        .order('id');
      
      if (error) throw error;
      return data as ConversationScript[];
    }
  });
}

export function useConversationLines(scriptId: string) {
  return useQuery({
    queryKey: ['conversation-lines', scriptId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversation_lines')
        .select('*')
        .eq('script_id', scriptId)
        .order('line_order');
      
      if (error) throw error;
      return data as ConversationLine[];
    },
    enabled: !!scriptId
  });
}

export function useRoleplayScenarios() {
  return useQuery({
    queryKey: ['roleplay-scenarios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roleplay_scenarios')
        .select('*')
        .order('id');
      
      if (error) throw error;
      return data as RoleplayScenario[];
    }
  });
}

export function useSpeakingProgress() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['speaking-progress', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_speaking_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
}

export function useSpeakingSessions() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['speaking-sessions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('speaking_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
}

export function useSpeakingStats() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['speaking-stats', user?.id],
    queryFn: async () => {
      if (!user) return { accuracy: 0, fluency: 0, practiceMinutes: 0 };
      
      const { data: sessions, error } = await supabase
        .from('speaking_sessions')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      if (!sessions || sessions.length === 0) {
        return { accuracy: 0, fluency: 0, practiceMinutes: 0 };
      }
      
      const totalMinutes = sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / 60;
      const avgScore = sessions.reduce((acc, s) => acc + (Number(s.average_score) || 0), 0) / sessions.length;
      
      return {
        accuracy: Math.round(avgScore * 0.85),
        fluency: Math.round(avgScore * 0.75),
        practiceMinutes: Math.round(totalMinutes * 10) / 10
      };
    },
    enabled: !!user
  });
}
