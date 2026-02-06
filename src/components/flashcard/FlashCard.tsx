import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useJapaneseAudio } from '@/hooks/useJapaneseAudio';

interface FlashCardProps {
  wordJp: string;
  reading?: string;
  meaningId: string;
  exampleJp?: string;
  exampleId?: string;
  isFlipped: boolean;
  onFlip: () => void;
}

export function FlashCard({
  wordJp,
  reading,
  meaningId,
  exampleJp,
  exampleId,
  isFlipped,
  onFlip,
}: FlashCardProps) {
  const { speak, isPlaying } = useJapaneseAudio();

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    speak(wordJp);
  };

  const handleSpeakExample = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (exampleJp) {
      speak(exampleJp);
    }
  };

  return (
    <div className="perspective-1000 w-full max-w-sm mx-auto">
      <motion.div
        className="relative w-full aspect-[3/4] cursor-pointer"
        onClick={onFlip}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 25 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of card */}
        <div
          className="absolute inset-0 w-full h-full bg-card rounded-3xl shadow-elevated border border-border flex flex-col items-center justify-center p-6"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-4xl md:text-5xl font-bold font-jp text-center leading-relaxed">
              {wordJp}
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            onClick={handleSpeak}
            disabled={isPlaying}
          >
            {isPlaying ? (
              <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
            ) : (
              <Volume2 className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>
          
          <div className="mt-auto">
            <p className="text-sm text-muted-foreground">Ketuk untuk melihat jawaban</p>
          </div>
        </div>
        
        {/* Back of card */}
        <div
          className="absolute inset-0 w-full h-full bg-card rounded-3xl shadow-elevated border border-border flex flex-col items-center justify-center p-6"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 w-full">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold font-jp">{wordJp}</p>
              {reading && (
                <p className="text-lg text-muted-foreground mt-2">{reading}</p>
              )}
            </div>
            
            <div className="w-16 h-0.5 bg-border rounded-full" />
            
            <p className="text-xl font-semibold text-secondary text-center">
              {meaningId}
            </p>
            
            {exampleJp && (
              <div 
                className="bg-muted rounded-xl p-4 w-full mt-4 cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={handleSpeakExample}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Contoh:</span>
                  <Volume2 className={`h-3 w-3 text-muted-foreground ${isPlaying ? 'animate-pulse' : ''}`} />
                </div>
                <p className="text-base font-jp text-center">{exampleJp}</p>
                {exampleId && (
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    {exampleId}
                  </p>
                )}
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            onClick={handleSpeak}
            disabled={isPlaying}
          >
            {isPlaying ? (
              <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
            ) : (
              <Volume2 className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
