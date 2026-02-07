import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { ArrowLeft, Volume2, SkipForward, Lightbulb, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CardWithProgress, DeckWithProgress } from '@/hooks/useFlashcardsDB';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface FlashcardStudyProps {
  deck: DeckWithProgress;
  cards: CardWithProgress[];
  onBack: () => void;
  onRateCard: (cardId: string, quality: number) => void;
  onComplete: (results: StudyResults) => void;
}

export interface StudyResults {
  again: number;
  hard: number;
  good: number;
  easy: number;
  timeSpent: number;
}

export function FlashcardStudy({ deck, cards, onBack, onRateCard, onComplete }: FlashcardStudyProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [results, setResults] = useState<StudyResults>({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
    timeSpent: 0,
  });
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const haptic = useHapticFeedback();

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex) / cards.length) * 100;

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Swipe handling
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const handleRate = useCallback((quality: number) => {
    if (!currentCard) return;

    onRateCard(currentCard.id, quality);

    // Haptic feedback based on rating
    if (quality >= 2) {
      haptic.success();
    } else if (quality === 1) {
      haptic.warning();
    } else {
      haptic.light();
    }

    const resultKey = ['again', 'hard', 'good', 'easy'][quality] as keyof StudyResults;
    setResults(prev => ({
      ...prev,
      [resultKey]: (prev[resultKey] as number) + 1,
    }));

    // Move to next card
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
      setShowHint(false);
    } else {
      // Complete session
      onComplete({
        ...results,
        [resultKey]: results[resultKey] + 1,
        timeSpent: Math.floor((Date.now() - startTime) / 1000),
      });
    }
  }, [currentCard, currentIndex, cards.length, onRateCard, onComplete, results, startTime, haptic]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    if (!isFlipped) return;

    const threshold = 100;
    
    if (info.offset.x > threshold) {
      handleRate(2); // Good
    } else if (info.offset.x < -threshold) {
      handleRate(0); // Again
    } else if (info.offset.y < -threshold) {
      handleRate(3); // Easy
    } else if (info.offset.y > threshold) {
      // Skip
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsFlipped(false);
        setShowHint(false);
      }
    }
  }, [isFlipped, handleRate, currentIndex, cards.length]);

  const speakJapanese = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!currentCard) {
    return <div>No cards available</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="font-jp font-medium">{deck.title_jp}</span>
        <span className="text-sm text-muted-foreground">⏱️ {formatTime(elapsedTime)}</span>
      </div>

      {/* Progress */}
      <div className="space-y-1 mb-4">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Card {currentIndex + 1}/{cards.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard */}
      <div className="flex-1 flex items-center justify-center perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            drag={isFlipped}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.8}
            onDragEnd={handleDragEnd}
            style={{ x, y, rotate, opacity }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm cursor-pointer touch-none"
            onClick={() => {
              if (!isFlipped) {
                haptic.light();
                setIsFlipped(true);
              }
            }}
          >
            <div 
              className="relative w-full aspect-[3/4]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 25 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="w-full h-full"
              >
                {/* Front */}
                <div 
                  className="absolute inset-0 bg-card rounded-3xl shadow-elevated border border-border flex flex-col items-center justify-center p-6"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <p className="text-5xl md:text-6xl font-bold font-jp text-center leading-relaxed">
                      {currentCard.front_text}
                    </p>
                    {currentCard.front_subtext && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {currentCard.front_subtext}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakJapanese(currentCard.front_text);
                    }}
                  >
                    <Volume2 className="h-5 w-5 text-muted-foreground" />
                  </Button>

                  <p className="text-sm text-muted-foreground mt-4">
                    Tap to flip
                  </p>
                </div>

                {/* Back */}
                <div 
                  className="absolute inset-0 bg-card rounded-3xl shadow-elevated border border-border flex flex-col p-6"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakJapanese(currentCard.front_text);
                    }}
                  >
                    <Volume2 className="h-5 w-5 text-muted-foreground" />
                  </Button>

                  <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <p className="text-3xl font-bold font-jp">{currentCard.front_text}</p>
                    <p className="text-xl">↓</p>
                    <p className="text-2xl font-bold text-primary">{currentCard.back_text}</p>
                    
                    {currentCard.back_subtext && (
                      <p className="text-sm text-muted-foreground">{currentCard.back_subtext}</p>
                    )}

                    {currentCard.back_reading && (
                      <p className="text-sm text-muted-foreground">
                        Pronunciation: {currentCard.back_reading}
                      </p>
                    )}

                    {currentCard.back_example && (
                      <div className="bg-muted rounded-xl p-4 w-full mt-4">
                        <p className="text-sm font-medium mb-1">📝 Example:</p>
                        <p className="text-sm font-jp">{currentCard.back_example}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Actions */}
      {!isFlipped ? (
        <div className="flex justify-center gap-3 mt-4 pb-4">
          <Button 
            variant="outline" 
            onClick={() => {
              if (currentIndex < cards.length - 1) {
                setCurrentIndex(prev => prev + 1);
              }
            }}
          >
            <SkipForward className="h-4 w-4 mr-2" />
            Skip
          </Button>
          <Button variant="outline" onClick={() => setShowHint(!showHint)}>
            <Lightbulb className="h-4 w-4 mr-2" />
            Hint
          </Button>
        </div>
      ) : (
        <div className="space-y-3 mt-4 pb-4">
          <p className="text-center text-sm text-muted-foreground">
            How well did you know this?
          </p>
          <div className="grid grid-cols-4 gap-2">
            <Button 
              variant="outline" 
              className="flex-col h-auto py-3 border-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => handleRate(0)}
            >
              <span className="text-xl mb-1">😰</span>
              <span className="text-xs font-medium">Again</span>
              <span className="text-xs text-muted-foreground">&lt;1m</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex-col h-auto py-3 border-amber-500 hover:bg-amber-500 hover:text-white"
              onClick={() => handleRate(1)}
            >
              <span className="text-xl mb-1">😕</span>
              <span className="text-xs font-medium">Hard</span>
              <span className="text-xs text-muted-foreground">6m</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex-col h-auto py-3 border-success hover:bg-success hover:text-success-foreground"
              onClick={() => handleRate(2)}
            >
              <span className="text-xl mb-1">🙂</span>
              <span className="text-xs font-medium">Good</span>
              <span className="text-xs text-muted-foreground">1d</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex-col h-auto py-3 border-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => handleRate(3)}
            >
              <span className="text-xl mb-1">😄</span>
              <span className="text-xs font-medium">Easy</span>
              <span className="text-xs text-muted-foreground">4d</span>
            </Button>
          </div>
        </div>
      )}

      {/* Hint Display */}
      {showHint && !isFlipped && currentCard.back_reading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-32 left-4 right-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl p-4"
        >
          <p className="text-sm">💡 Hint: {currentCard.back_reading}</p>
        </motion.div>
      )}
    </div>
  );
}
