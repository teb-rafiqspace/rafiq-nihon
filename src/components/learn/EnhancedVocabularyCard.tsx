import { motion } from 'framer-motion';
import { Volume2, Loader2, Star, BookOpen, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useJapaneseAudio } from '@/hooks/useJapaneseAudio';

interface EnhancedVocabularyCardProps {
  wordJp: string;
  reading?: string;
  meaningId: string;
  exampleJp?: string;
  exampleId?: string;
  audioUrl?: string;
  jlptLevel?: string;
  category?: string;
  currentIndex: number;
  totalCount: number;
  showFurigana: boolean;
  showRomaji: boolean;
  onToggleFurigana: () => void;
  onToggleRomaji: () => void;
  onAddToFlashcard?: () => void;
  isFavorite?: boolean;
}

export function EnhancedVocabularyCard({
  wordJp,
  reading,
  meaningId,
  exampleJp,
  exampleId,
  audioUrl,
  jlptLevel = 'N5',
  category,
  currentIndex,
  totalCount,
  showFurigana,
  showRomaji,
  onToggleFurigana,
  onToggleRomaji,
  onAddToFlashcard,
  isFavorite = false,
}: EnhancedVocabularyCardProps) {
  const [favorite, setFavorite] = useState(isFavorite);
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
  
  const handleFavorite = () => {
    setFavorite(!favorite);
    onAddToFlashcard?.();
  };
  
  // Extract kanji and reading for furigana display
  const hasKanji = /[\u4e00-\u9faf]/.test(wordJp);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl shadow-card border border-border overflow-hidden"
    >
      {/* Progress Header */}
      <div className="bg-muted/50 px-6 py-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Kosakata {currentIndex + 1}/{totalCount}</span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {jlptLevel}
            </Badge>
            {category && (
              <Badge variant="outline" className="text-xs capitalize">
                {category}
              </Badge>
            )}
          </div>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / totalCount) * 100}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="p-6">
        {/* Japanese Word */}
        <div className="text-center mb-6">
          {/* Furigana + Kanji */}
          <div className="mb-2">
            {hasKanji && showFurigana && reading && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-muted-foreground font-medium mb-1"
              >
                {reading.split(' ')[0]}
              </motion.p>
            )}
            <h2 className="font-jp text-5xl font-bold text-foreground leading-tight">
              {wordJp}
            </h2>
          </div>
          
          {/* Reading (Hiragana) */}
          {reading && (
            <p className="text-lg text-muted-foreground font-medium font-jp">
              {reading.split(' ')[0] || reading}
            </p>
          )}
          
          {/* Romaji */}
          {showRomaji && reading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground/70 mt-1"
            >
              {reading}
            </motion.p>
          )}
        </div>
        
        {/* Meaning */}
        <div className="text-center mb-6">
          <p className="text-xl font-semibold text-primary flex items-center justify-center gap-2">
            <BookOpen className="h-5 w-5" />
            {meaningId}
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-center gap-3 mb-6">
          <Button
            variant="outline"
            size="lg"
            onClick={playAudio}
            className="gap-2 min-w-[140px]"
          >
            {isPlaying ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Memutar...
              </>
            ) : (
              <>
                <Volume2 className="h-5 w-5" />
                Audio
              </>
            )}
          </Button>
          
          <Button
            variant={favorite ? "default" : "outline"}
            size="icon"
            onClick={handleFavorite}
            className={cn(
              "h-11 w-11 transition-colors",
              favorite && "bg-amber-500 hover:bg-amber-600 text-white"
            )}
          >
            <Star className={cn("h-5 w-5", favorite && "fill-current")} />
          </Button>
        </div>
        
        {/* Toggle Buttons */}
        <div className="flex justify-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFurigana}
            className="text-xs gap-1"
          >
            {showFurigana ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            Furigana
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleRomaji}
            className="text-xs gap-1"
          >
            {showRomaji ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            Romaji
          </Button>
        </div>
        
        {!hasJapaneseVoice && (
          <p className="text-xs text-center text-muted-foreground mb-4">
            💡 Untuk audio terbaik, gunakan Chrome atau Edge
          </p>
        )}
        
        {/* Divider */}
        <div className="h-px bg-border my-4" />
        
        {/* Example Sentence */}
        {exampleJp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-muted/50 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                Contoh:
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={playExample}
                className="h-7 px-2 gap-1 text-xs"
              >
                <Volume2 className="h-3 w-3" />
                Putar
              </Button>
            </div>
            <p className="font-jp text-lg mb-2 text-foreground">「{exampleJp}」</p>
            {exampleId && (
              <p className="text-sm text-muted-foreground italic">"{exampleId}"</p>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
