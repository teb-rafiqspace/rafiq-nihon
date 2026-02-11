import { motion } from 'framer-motion';
import { Volume2, Loader2, Star, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useEnglishAudio } from '@/hooks/useEnglishAudio';

interface EnglishVocabularyCardProps {
  word: string;
  ipa?: string;
  partOfSpeech?: string;
  meaningId: string;
  exampleEn?: string;
  exampleId?: string;
  currentIndex: number;
  totalCount: number;
  category?: string;
}

export function EnglishVocabularyCard({
  word,
  ipa,
  partOfSpeech,
  meaningId,
  exampleEn,
  exampleId,
  currentIndex,
  totalCount,
  category,
}: EnglishVocabularyCardProps) {
  const [favorite, setFavorite] = useState(false);
  const { speak, isPlaying } = useEnglishAudio();

  const playAudio = () => {
    speak(word);
  };

  const playExample = () => {
    if (exampleEn) {
      speak(exampleEn);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl shadow-card border border-border overflow-hidden"
    >
      {/* Progress Header */}
      <div className="bg-muted/50 px-6 py-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Vocabulary {currentIndex + 1}/{totalCount}</span>
          <div className="flex items-center gap-2">
            {partOfSpeech && (
              <Badge variant="secondary" className="text-xs capitalize">
                {partOfSpeech}
              </Badge>
            )}
            {category && (
              <Badge variant="outline" className="text-xs capitalize">
                {category}
              </Badge>
            )}
          </div>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / totalCount) * 100}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* English Word */}
        <div className="text-center mb-6">
          <h2 className="text-5xl font-bold text-foreground leading-tight mb-2">
            {word}
          </h2>

          {/* IPA */}
          {ipa && (
            <p className="text-lg text-muted-foreground font-medium">
              /{ipa}/
            </p>
          )}
        </div>

        {/* Meaning (Indonesian) */}
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
                Playing...
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
            onClick={() => setFavorite(!favorite)}
            className={cn(
              "h-11 w-11 transition-colors",
              favorite && "bg-amber-500 hover:bg-amber-600 text-white"
            )}
          >
            <Star className={cn("h-5 w-5", favorite && "fill-current")} />
          </Button>
        </div>

        {/* Divider */}
        <div className="h-px bg-border my-4" />

        {/* Example Sentence */}
        {exampleEn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-muted/50 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                Example:
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={playExample}
                className="h-7 px-2 gap-1 text-xs"
              >
                <Volume2 className="h-3 w-3" />
                Play
              </Button>
            </div>
            <p className="text-lg mb-2 text-foreground">"{exampleEn}"</p>
            {exampleId && (
              <p className="text-sm text-muted-foreground italic">"{exampleId}"</p>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
