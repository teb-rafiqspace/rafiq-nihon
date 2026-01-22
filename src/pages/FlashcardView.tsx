import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFlashcards } from '@/hooks/useFlashcards';
import { DeckSelector } from '@/components/flashcard/DeckSelector';
import { FlashcardProgress } from '@/components/flashcard/FlashcardProgress';
import { SwipeableCard } from '@/components/flashcard/SwipeableCard';
import { FlashcardComplete } from '@/components/flashcard/FlashcardComplete';

export default function FlashcardView() {
  const navigate = useNavigate();
  const {
    decks,
    selectedDeckId,
    setSelectedDeckId,
    cards,
    currentIndex,
    currentCard,
    progress,
    isFlipped,
    isComplete,
    knownCount,
    unknownCount,
    unknownCards,
    flipCard,
    markKnown,
    markUnknown,
    reviewUnknown,
    resetSession,
  } = useFlashcards();

  const handleFinish = () => {
    navigate('/practice');
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      resetSession();
    } else {
      navigate('/practice');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-gradient-secondary text-secondary-foreground">
        <div className="container max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="text-secondary-foreground hover:bg-secondary-foreground/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Flashcard</h1>
              <p className="text-xs text-secondary-foreground/80">
                Swipe kanan jika tahu, kiri jika tidak
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container max-w-lg mx-auto px-4 py-6 flex flex-col">
        {/* Deck Selector (only show at start) */}
        {currentIndex === 0 && !isComplete && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <DeckSelector
              decks={decks}
              selectedDeckId={selectedDeckId}
              onSelectDeck={setSelectedDeckId}
            />
          </motion.div>
        )}

        {/* Progress */}
        {!isComplete && cards.length > 0 && (
          <div className="mb-6">
            <FlashcardProgress
              current={currentIndex + 1}
              total={cards.length}
              progress={progress}
            />
          </div>
        )}

        {/* Card Area */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {isComplete ? (
              <FlashcardComplete
                key="complete"
                knownCount={knownCount}
                unknownCount={unknownCount}
                onReviewUnknown={reviewUnknown}
                onFinish={handleFinish}
                hasUnknownCards={unknownCards.length > 0}
              />
            ) : currentCard ? (
              <motion.div
                key={currentCard.id + currentIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full"
              >
                <SwipeableCard
                  wordJp={currentCard.wordJp}
                  reading={currentCard.reading}
                  meaningId={currentCard.meaningId}
                  exampleJp={currentCard.exampleJp}
                  exampleId={currentCard.exampleId}
                  isFlipped={isFlipped}
                  onFlip={flipCard}
                  onSwipeLeft={markUnknown}
                  onSwipeRight={markKnown}
                />
              </motion.div>
            ) : (
              <div className="text-center text-muted-foreground">
                <p>Tidak ada kartu dalam deck ini</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        {!isComplete && currentCard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex gap-4 justify-center pb-safe"
          >
            <Button
              variant="outline"
              size="lg"
              onClick={markUnknown}
              className="flex-1 max-w-[140px] border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-5 w-5 mr-2" />
              Tidak Tahu
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={markKnown}
              className="flex-1 max-w-[140px] border-success text-success hover:bg-success hover:text-success-foreground"
            >
              <Check className="h-5 w-5 mr-2" />
              Tahu
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
