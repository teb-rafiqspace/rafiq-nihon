import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useFlashcardsDB, DeckWithProgress, CardWithProgress } from '@/hooks/useFlashcardsDB';
import { DeckGrid } from './DeckGrid';
import { DeckDetail } from './DeckDetail';
import { FlashcardStudy, StudyResults } from './FlashcardStudy';
import { StudyComplete } from './StudyComplete';
import { FlashcardQuiz, QuizResults } from './FlashcardQuiz';
import { QuizComplete } from './QuizComplete';
import { CardBrowser } from './CardBrowser';
import { DailyReviewDashboard } from './DailyReviewDashboard';

type ViewState = 
  | 'grid' 
  | 'detail' 
  | 'study' 
  | 'study-complete' 
  | 'quiz' 
  | 'quiz-complete' 
  | 'browse'
  | 'daily-review';

export function FlashcardSection() {
  const navigate = useNavigate();
  const { 
    decks, 
    decksLoading, 
    totalDueCards, 
    studyStats, 
    fetchDeckCards, 
    updateCardProgress, 
    saveSession 
  } = useFlashcardsDB();

  const [viewState, setViewState] = useState<ViewState>('grid');
  const [selectedDeck, setSelectedDeck] = useState<DeckWithProgress | null>(null);
  const [currentCards, setCurrentCards] = useState<CardWithProgress[]>([]);
  const [studyResults, setStudyResults] = useState<StudyResults | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);

  // Calculate totals
  const totals = useMemo(() => {
    return decks.reduce((acc, deck) => ({
      total: acc.total + (deck.card_count || 0),
      mastered: acc.mastered + deck.masteredCount,
      learning: acc.learning + deck.learningCount,
      new: acc.new + deck.newCount,
    }), { total: 0, mastered: 0, learning: 0, new: 0 });
  }, [decks]);

  const handleSelectDeck = useCallback(async (deck: DeckWithProgress) => {
    setSelectedDeck(deck);
    const cards = await fetchDeckCards(deck.id);
    setCurrentCards(cards);
    setViewState('detail');
  }, [fetchDeckCards]);

  const handleStartStudy = useCallback(() => {
    // Mix new and due cards
    const shuffled = [...currentCards].sort(() => Math.random() - 0.5).slice(0, 20);
    setCurrentCards(shuffled);
    setViewState('study');
  }, [currentCards]);

  const handleRateCard = useCallback((cardId: string, quality: number) => {
    if (selectedDeck) {
      updateCardProgress.mutate({ cardId, deckId: selectedDeck.id, quality });
    }
  }, [selectedDeck, updateCardProgress]);

  const handleStudyComplete = useCallback((results: StudyResults) => {
    setStudyResults(results);
    if (selectedDeck) {
      saveSession.mutate({
        deckId: selectedDeck.id,
        cardsStudied: results.again + results.hard + results.good + results.easy,
        cardsCorrect: results.good + results.easy,
        cardsIncorrect: results.again + results.hard,
        timeSpentSeconds: results.timeSpent,
        xpEarned: (results.good * 2) + (results.easy * 3) + results.hard,
      });
    }
    setViewState('study-complete');
  }, [selectedDeck, saveSession]);

  const handleQuizComplete = useCallback((results: QuizResults) => {
    setQuizResults(results);
    setViewState('quiz-complete');
  }, []);

  const handleStartDailyReview = useCallback(async () => {
    // Get all due cards across decks
    const allDueCards: CardWithProgress[] = [];
    for (const deck of decks.filter(d => d.dueCount > 0)) {
      const cards = await fetchDeckCards(deck.id);
      const dueCards = cards.filter(c => {
        if (!c.progress?.next_review_at) return false;
        return new Date(c.progress.next_review_at) <= new Date();
      });
      allDueCards.push(...dueCards);
    }
    setCurrentCards(allDueCards.slice(0, 20));
    setSelectedDeck(decks[0] || null);
    setViewState('study');
  }, [decks, fetchDeckCards]);

  return (
    <div className="min-h-[60vh]">
      <AnimatePresence mode="wait">
        {viewState === 'grid' && (
          <div className="space-y-6">
            <DailyReviewDashboard
              totalDueCards={totalDueCards}
              decksWithDue={decks}
              studyStats={studyStats}
              totalCards={totals.total}
              masteredCards={totals.mastered}
              learningCards={totals.learning}
              newCards={totals.new}
              onStartReview={handleStartDailyReview}
            />
            <DeckGrid 
              decks={decks} 
              onSelectDeck={handleSelectDeck} 
              isLoading={decksLoading} 
            />
          </div>
        )}

        {viewState === 'detail' && selectedDeck && (
          <DeckDetail
            deck={selectedDeck}
            onBack={() => setViewState('grid')}
            onStartStudy={handleStartStudy}
            onStartQuiz={() => setViewState('quiz')}
            onBrowse={() => setViewState('browse')}
          />
        )}

        {viewState === 'study' && selectedDeck && (
          <FlashcardStudy
            deck={selectedDeck}
            cards={currentCards}
            onBack={() => setViewState('detail')}
            onRateCard={handleRateCard}
            onComplete={handleStudyComplete}
          />
        )}

        {viewState === 'study-complete' && selectedDeck && studyResults && (
          <StudyComplete
            deck={selectedDeck}
            results={studyResults}
            onContinue={handleStartStudy}
            onBackToDeck={() => setViewState('detail')}
            onHome={() => navigate('/')}
          />
        )}

        {viewState === 'quiz' && selectedDeck && (
          <FlashcardQuiz
            deck={selectedDeck}
            cards={currentCards}
            onBack={() => setViewState('detail')}
            onComplete={handleQuizComplete}
          />
        )}

        {viewState === 'quiz-complete' && selectedDeck && quizResults && (
          <QuizComplete
            deck={selectedDeck}
            results={quizResults}
            onRetryMistakes={() => setViewState('quiz')}
            onNewQuiz={() => setViewState('quiz')}
            onBack={() => setViewState('detail')}
          />
        )}

        {viewState === 'browse' && selectedDeck && (
          <CardBrowser
            deck={selectedDeck}
            cards={currentCards}
            onBack={() => setViewState('detail')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
