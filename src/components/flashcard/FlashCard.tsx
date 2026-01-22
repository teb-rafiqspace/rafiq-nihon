import React from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const speakJapanese = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      
      const voices = window.speechSynthesis.getVoices();
      const japaneseVoice = voices.find(
        (v) => v.lang.startsWith('ja') && v.name.toLowerCase().includes('female')
      ) || voices.find((v) => v.lang.startsWith('ja'));
      
      if (japaneseVoice) {
        utterance.voice = japaneseVoice;
      }
      
      window.speechSynthesis.speak(utterance);
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
            onClick={(e) => {
              e.stopPropagation();
              speakJapanese(wordJp);
            }}
          >
            <Volume2 className="h-5 w-5 text-muted-foreground" />
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
              <div className="bg-muted rounded-xl p-4 w-full mt-4">
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
            onClick={(e) => {
              e.stopPropagation();
              speakJapanese(wordJp);
            }}
          >
            <Volume2 className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
