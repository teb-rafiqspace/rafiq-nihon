import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface VocabularyCardProps {
  wordJp: string;
  reading?: string;
  meaningId: string;
  exampleJp?: string;
  exampleId?: string;
  audioUrl?: string;
}

export function VocabularyCard({
  wordJp,
  reading,
  meaningId,
  exampleJp,
  exampleId,
  audioUrl,
}: VocabularyCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const playAudio = () => {
    if (!audioUrl) return;
    
    setIsPlaying(true);
    const audio = new Audio(audioUrl);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    audio.play().catch(() => setIsPlaying(false));
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 shadow-card border border-border"
    >
      {/* Japanese Word */}
      <div className="text-center mb-4">
        <h2 className="font-jp text-4xl font-bold text-foreground mb-2">
          {wordJp}
        </h2>
        {reading && (
          <p className="text-lg text-muted-foreground font-medium">
            {reading}
          </p>
        )}
      </div>
      
      {/* Divider */}
      <div className="h-px bg-border my-4" />
      
      {/* Indonesian Meaning */}
      <div className="text-center mb-4">
        <p className="text-xl font-semibold text-primary">
          {meaningId}
        </p>
      </div>
      
      {/* Audio Button */}
      <div className="flex justify-center mb-4">
        <Button
          variant="outline"
          size="lg"
          onClick={playAudio}
          disabled={!audioUrl || isPlaying}
          className="gap-2"
        >
          {isPlaying ? (
            <VolumeX className="h-5 w-5 animate-pulse" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
          {audioUrl ? 'Putar Audio' : 'Audio tidak tersedia'}
        </Button>
      </div>
      
      {/* Example Sentence */}
      {exampleJp && (
        <div className="bg-muted/50 rounded-xl p-4 mt-4">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Contoh:</p>
          <p className="font-jp text-lg mb-1">「{exampleJp}」</p>
          {exampleId && (
            <p className="text-sm text-muted-foreground">"{exampleId}"</p>
          )}
        </div>
      )}
    </motion.div>
  );
}
