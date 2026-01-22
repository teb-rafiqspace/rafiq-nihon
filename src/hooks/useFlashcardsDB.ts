import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Tables } from '@/integrations/supabase/types';

type FlashcardDeck = Tables<'flashcard_decks'>;
type FlashcardCard = Tables<'flashcard_cards'>;
type UserFlashcardProgress = Tables<'user_flashcard_progress'>;

export interface DeckWithProgress extends FlashcardDeck {
  masteredCount: number;
  learningCount: number;
  newCount: number;
  dueCount: number;
  masteryPercentage: number;
}

export interface CardWithProgress extends FlashcardCard {
  progress?: UserFlashcardProgress;
}

export interface StudySession {
  deckId: string;
  cards: CardWithProgress[];
  currentIndex: number;
  isFlipped: boolean;
  results: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
  startTime: Date;
  timeSpent: number;
}

// SM-2 Algorithm implementation
const calculateNextReview = (
  quality: number, // 0-3 (Again, Hard, Good, Easy)
  currentEaseFactor: number,
  currentInterval: number,
  currentRepetitions: number
): { interval: number; easeFactor: number; repetitions: number } => {
  let newEaseFactor = currentEaseFactor;
  let newInterval = currentInterval;
  let newRepetitions = currentRepetitions;

  if (quality < 2) {
    // Again or Hard - reset
    newRepetitions = 0;
    newInterval = quality === 0 ? 1 : 6; // 1 minute or 6 minutes
  } else {
    // Good or Easy
    if (newRepetitions === 0) {
      newInterval = 1; // 1 day
    } else if (newRepetitions === 1) {
      newInterval = 6; // 6 days
    } else {
      newInterval = Math.round(currentInterval * newEaseFactor);
    }
    
    if (quality === 3) {
      // Easy - multiply interval
      newInterval = Math.round(newInterval * 1.5);
      newEaseFactor += 0.15;
    }
    
    newRepetitions += 1;
  }

  // Adjust ease factor
  if (quality === 0) newEaseFactor -= 0.20;
  else if (quality === 1) newEaseFactor -= 0.15;
  
  // Minimum ease factor
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;

  return {
    interval: newInterval,
    easeFactor: newEaseFactor,
    repetitions: newRepetitions,
  };
};

export function useFlashcardsDB() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all decks
  const { data: decks = [], isLoading: decksLoading } = useQuery({
    queryKey: ['flashcard-decks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flashcard_decks')
        .select('*')
        .order('order_index');
      
      if (error) throw error;
      return data as FlashcardDeck[];
    },
  });

  // Fetch user progress for all cards
  const { data: userProgress = [] } = useQuery({
    queryKey: ['user-flashcard-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as UserFlashcardProgress[];
    },
    enabled: !!user,
  });

  // Fetch flashcard sessions for stats
  const { data: sessions = [] } = useQuery({
    queryKey: ['flashcard-sessions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('flashcard_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Calculate deck progress
  const decksWithProgress: DeckWithProgress[] = useMemo(() => {
    return decks.map(deck => {
      const deckProgress = userProgress.filter(p => p.deck_id === deck.id);
      const masteredCount = deckProgress.filter(p => p.status === 'mastered').length;
      const learningCount = deckProgress.filter(p => p.status === 'learning' || p.status === 'review').length;
      const studiedCount = masteredCount + learningCount;
      const newCount = (deck.card_count || 0) - studiedCount;
      
      const now = new Date();
      const dueCount = deckProgress.filter(p => {
        if (!p.next_review_at) return false;
        return new Date(p.next_review_at) <= now;
      }).length;

      const masteryPercentage = (deck.card_count || 0) > 0 
        ? Math.round((masteredCount / (deck.card_count || 1)) * 100) 
        : 0;

      return {
        ...deck,
        masteredCount,
        learningCount,
        newCount,
        dueCount,
        masteryPercentage,
      };
    });
  }, [decks, userProgress]);

  // Calculate total due cards
  const totalDueCards = useMemo(() => {
    const now = new Date();
    return userProgress.filter(p => {
      if (!p.next_review_at) return false;
      return new Date(p.next_review_at) <= now;
    }).length;
  }, [userProgress]);

  // Calculate study statistics
  const studyStats = useMemo(() => {
    const totalCardsStudied = sessions.reduce((sum, s) => sum + (s.cards_studied || 0), 0);
    const totalTimeSeconds = sessions.reduce((sum, s) => sum + (s.time_spent_seconds || 0), 0);
    const totalCorrect = sessions.reduce((sum, s) => sum + (s.cards_correct || 0), 0);
    const totalIncorrect = sessions.reduce((sum, s) => sum + (s.cards_incorrect || 0), 0);
    const accuracy = (totalCorrect + totalIncorrect) > 0 
      ? Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100) 
      : 0;

    // Weekly data
    const weekData: number[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const dayCards = sessions
        .filter(s => s.started_at && new Date(s.started_at).toDateString() === dateStr)
        .reduce((sum, s) => sum + (s.cards_studied || 0), 0);
      weekData.push(dayCards);
    }

    return {
      totalCardsStudied,
      totalTimeHours: Math.round(totalTimeSeconds / 3600 * 10) / 10,
      accuracy,
      weekData,
    };
  }, [sessions]);

  // Fetch cards for a specific deck
  const fetchDeckCards = useCallback(async (deckId: string): Promise<CardWithProgress[]> => {
    const { data: cards, error } = await supabase
      .from('flashcard_cards')
      .select('*')
      .eq('deck_id', deckId)
      .order('order_index');
    
    if (error) throw error;

    return (cards as FlashcardCard[]).map(card => ({
      ...card,
      progress: userProgress.find(p => p.card_id === card.id),
    }));
  }, [userProgress]);

  // Get cards due for review
  const getDueCards = useCallback(async (deckId?: string): Promise<CardWithProgress[]> => {
    const now = new Date();
    let progressQuery = supabase
      .from('user_flashcard_progress')
      .select('*')
      .eq('user_id', user?.id || '')
      .lte('next_review_at', now.toISOString());
    
    if (deckId) {
      progressQuery = progressQuery.eq('deck_id', deckId);
    }

    const { data: dueProgress, error: progressError } = await progressQuery;
    if (progressError) throw progressError;

    if (!dueProgress || dueProgress.length === 0) return [];

    const cardIds = dueProgress.map(p => p.card_id).filter(Boolean);
    const { data: cards, error: cardsError } = await supabase
      .from('flashcard_cards')
      .select('*')
      .in('id', cardIds);
    
    if (cardsError) throw cardsError;

    return (cards as FlashcardCard[]).map(card => ({
      ...card,
      progress: dueProgress.find(p => p.card_id === card.id),
    }));
  }, [user?.id]);

  // Update card progress after review
  const updateCardProgress = useMutation({
    mutationFn: async ({ 
      cardId, 
      deckId, 
      quality 
    }: { 
      cardId: string; 
      deckId: string; 
      quality: number; // 0=Again, 1=Hard, 2=Good, 3=Easy
    }) => {
      if (!user) throw new Error('Not authenticated');

      const existingProgress = userProgress.find(p => p.card_id === cardId);
      
      const currentEaseFactor = existingProgress?.ease_factor ? Number(existingProgress.ease_factor) : 2.5;
      const currentInterval = existingProgress?.interval_days || 0;
      const currentRepetitions = existingProgress?.repetitions || 0;
      const currentCorrect = existingProgress?.correct_count || 0;
      const currentIncorrect = existingProgress?.incorrect_count || 0;

      const { interval, easeFactor, repetitions } = calculateNextReview(
        quality,
        currentEaseFactor,
        currentInterval,
        currentRepetitions
      );

      const nextReview = new Date();
      if (quality < 2) {
        // Minutes for Again/Hard
        nextReview.setMinutes(nextReview.getMinutes() + interval);
      } else {
        // Days for Good/Easy
        nextReview.setDate(nextReview.getDate() + interval);
      }

      // Determine status
      let status = 'learning';
      if (interval >= 21) status = 'mastered';
      else if (interval >= 1 && quality >= 2) status = 'review';

      const progressData = {
        user_id: user.id,
        card_id: cardId,
        deck_id: deckId,
        ease_factor: easeFactor,
        interval_days: interval,
        repetitions,
        status,
        last_reviewed_at: new Date().toISOString(),
        next_review_at: nextReview.toISOString(),
        correct_count: quality >= 2 ? currentCorrect + 1 : currentCorrect,
        incorrect_count: quality < 2 ? currentIncorrect + 1 : currentIncorrect,
        updated_at: new Date().toISOString(),
      };

      if (existingProgress) {
        const { error } = await supabase
          .from('user_flashcard_progress')
          .update(progressData)
          .eq('id', existingProgress.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_flashcard_progress')
          .insert(progressData);
        
        if (error) throw error;
      }

      return { quality };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-flashcard-progress'] });
    },
  });

  // Save study session
  const saveSession = useMutation({
    mutationFn: async (session: {
      deckId: string;
      cardsStudied: number;
      cardsCorrect: number;
      cardsIncorrect: number;
      timeSpentSeconds: number;
      xpEarned: number;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('flashcard_sessions')
        .insert({
          user_id: user.id,
          deck_id: session.deckId,
          cards_studied: session.cardsStudied,
          cards_correct: session.cardsCorrect,
          cards_incorrect: session.cardsIncorrect,
          time_spent_seconds: session.timeSpentSeconds,
          xp_earned: session.xpEarned,
          completed_at: new Date().toISOString(),
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-sessions'] });
    },
  });

  return {
    decks: decksWithProgress,
    decksLoading,
    totalDueCards,
    studyStats,
    userProgress,
    fetchDeckCards,
    getDueCards,
    updateCardProgress,
    saveSession,
  };
}
