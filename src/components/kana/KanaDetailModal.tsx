import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { KanaCharacter, useUpdateKanaProgress, useUserKanaProgress } from '@/hooks/useKana';
import { Volume2, Check, BookOpen, Lightbulb, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KanaDetailModalProps {
  character: KanaCharacter | null;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export function KanaDetailModal({ 
  character, 
  isOpen, 
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}: KanaDetailModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { data: progress = [] } = useUserKanaProgress();
  const updateProgress = useUpdateKanaProgress();
  
  const currentProgress = character 
    ? progress.find(p => p.kana_id === character.id)
    : null;
  
  const isLearned = currentProgress?.status === 'learned';
  
  const speakCharacter = () => {
    if (!character || isPlaying) return;
    
    setIsPlaying(true);
    
    // Use Web Speech API
    const utterance = new SpeechSynthesisUtterance(character.character);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.8;
    utterance.pitch = 1.1;
    
    // Try to find a Japanese voice
    const voices = speechSynthesis.getVoices();
    const japaneseVoice = voices.find(v => v.lang.startsWith('ja'));
    if (japaneseVoice) {
      utterance.voice = japaneseVoice;
    }
    
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };
  
  const handleMarkLearned = async () => {
    if (!character) return;
    
    await updateProgress.mutateAsync({
      kanaId: character.id,
      status: isLearned ? 'learning' : 'learned',
    });
  };
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'ArrowRight' && hasNext && onNext) {
        onNext();
      } else if (e.key === 'ArrowLeft' && hasPrevious && onPrevious) {
        onPrevious();
      } else if (e.key === ' ') {
        e.preventDefault();
        speakCharacter();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasNext, hasPrevious, onNext, onPrevious, character]);
  
  if (!character) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-primary p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={onPrevious}
              disabled={!hasPrevious}
              className={cn(
                "p-2 rounded-full transition-opacity",
                hasPrevious ? "hover:bg-white/20" : "opacity-30"
              )}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            <motion.div
              key={character.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <span className="text-7xl font-jp font-bold drop-shadow-lg">
                {character.character}
              </span>
              <p className="text-2xl font-medium mt-2 opacity-90">
                /{character.romaji}/
              </p>
            </motion.div>
            
            <button 
              onClick={onNext}
              disabled={!hasNext}
              className={cn(
                "p-2 rounded-full transition-opacity",
                hasNext ? "hover:bg-white/20" : "opacity-30"
              )}
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
          
          <Button
            variant="secondary"
            size="lg"
            className="w-full gap-2 bg-white/20 hover:bg-white/30 text-white border-0"
            onClick={speakCharacter}
            disabled={isPlaying}
          >
            <Volume2 className={cn("h-5 w-5", isPlaying && "animate-pulse")} />
            {isPlaying ? 'Memutar...' : 'Dengarkan Pengucapan'}
          </Button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Memory Tip */}
          {character.memory_tip_id && (
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200 text-sm">
                    Tips Mengingat
                  </p>
                  <p className="text-amber-700 dark:text-amber-300 mt-1">
                    {character.memory_tip_id}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Example Words */}
          {character.example_words && character.example_words.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm font-medium">Contoh Kata</span>
              </div>
              <div className="space-y-2">
                {character.example_words.map((example, idx) => (
                  <div 
                    key={idx}
                    className="bg-muted/50 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-jp text-lg font-medium">{example.word}</span>
                      <span className="text-muted-foreground text-sm ml-2">
                        ({example.romaji})
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      = {example.meaning}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Mark as Learned Button */}
          <Button
            variant={isLearned ? "outline" : "default"}
            size="xl"
            className={cn(
              "w-full gap-2",
              isLearned && "border-success text-success hover:bg-success/10"
            )}
            onClick={handleMarkLearned}
            disabled={updateProgress.isPending}
          >
            <Check className="h-5 w-5" />
            {isLearned ? 'Sudah Dipelajari ✓' : 'Tandai Sudah Dipelajari'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
