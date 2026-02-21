import { motion } from 'framer-motion';
import { Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useJapaneseAudio } from '@/hooks/useJapaneseAudio';
import { BookmarkButton } from '@/components/learn/BookmarkButton';
import { PronunciationCheckButton } from '@/components/shared/PronunciationCheckButton';

interface VocabularyCardProps {
  id?: string;
  wordJp: string;
  reading?: string;
  meaningId: string;
  exampleJp?: string;
  exampleId?: string;
  audioUrl?: string;
  showBookmark?: boolean;
}

export function VocabularyCard({
  id,
  wordJp,
  reading,
  meaningId,
  exampleJp,
  exampleId,
  audioUrl,
  showBookmark = true,
}: VocabularyCardProps) {
  const { speak, playAudioUrl, isPlaying, hasJapaneseVoice } = useJapaneseAudio();
  
  const playAudio = () => {
    if (audioUrl) {
      playAudioUrl(audioUrl, wordJp);
    } else {
      speak(wordJp);
    }
  };
  
  const playExample = () => {
    if (exampleJp) {
      speak(exampleJp);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 shadow-card border border-border relative"
    >
      {/* Bookmark Button */}
      {showBookmark && id && (
        <div className="absolute top-4 right-4">
          <BookmarkButton contentType="vocabulary" contentId={id} />
        </div>
      )}
      {/* Japanese Word */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <h2 className="font-jp text-4xl font-bold text-foreground">
            {wordJp}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={playAudio}
            disabled={isPlaying}
            className="rounded-full h-10 w-10 bg-primary/10 hover:bg-primary/20"
          >
            {isPlaying ? (
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            ) : (
              <Volume2 className="h-5 w-5 text-primary" />
            )}
          </Button>
        </div>
        {reading && (
          <div className="flex items-center justify-center gap-2">
            <p className="text-lg text-muted-foreground font-medium">
              {reading}
            </p>
            <PronunciationCheckButton targetText={wordJp} targetReading={reading} />
          </div>
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
      
      {/* Main Audio Button */}
      <div className="flex justify-center mb-4">
        <Button
          variant="outline"
          size="lg"
          onClick={playAudio}
          disabled={isPlaying}
          className="gap-2 min-w-[200px]"
        >
          {isPlaying ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Memutar...
            </>
          ) : (
            <>
              <Volume2 className="h-5 w-5" />
              Dengarkan Pengucapan
            </>
          )}
        </Button>
      </div>
      
      {!hasJapaneseVoice && (
        <p className="text-xs text-center text-muted-foreground mb-4">
          💡 Untuk audio terbaik, gunakan Chrome atau Edge
        </p>
      )}
      
      {/* Example Sentence */}
      {exampleJp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-muted/50 rounded-xl p-4 mt-4"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium">Contoh:</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={playExample}
              disabled={isPlaying}
              className="h-7 px-2 gap-1 text-xs"
            >
              <Volume2 className="h-3 w-3" />
              Putar
            </Button>
          </div>
          <p className="font-jp text-lg mb-1">「{exampleJp}」</p>
          {exampleId && (
            <p className="text-sm text-muted-foreground">"{exampleId}"</p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
