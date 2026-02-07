import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Volume2, BookOpen, CheckCircle2, Circle } from 'lucide-react';
import { useJapaneseAudio } from '@/hooks/useJapaneseAudio';
import { cn } from '@/lib/utils';

interface KanjiCardProps {
  kanji: {
    id: string;
    character: string;
    meanings_id: string;
    meanings_en: string | null;
    kun_readings: string[];
    on_readings: string[];
    stroke_count: number;
    example_words: {
      word: string;
      reading: string;
      meaning: string;
    }[];
    mnemonic_id: string | null;
  };
  status: string;
  onSelect?: () => void;
}

export function KanjiCard({ kanji, status, onSelect }: KanjiCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { speak, isPlaying } = useJapaneseAudio();

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    speak(kanji.character);
  };

  const statusIcon = {
    learned: <CheckCircle2 className="h-4 w-4 text-accent" />,
    learning: <Circle className="h-4 w-4 text-warning fill-warning/20" />,
    not_learned: <Circle className="h-4 w-4 text-muted-foreground" />
  }[status] || <Circle className="h-4 w-4 text-muted-foreground" />;

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        status === 'learned' && "ring-2 ring-accent/30",
        status === 'learning' && "ring-2 ring-warning/30"
      )}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <CardContent className="p-4">
        {!isFlipped ? (
          // Front - Kanji character
          <div className="text-center">
            <div className="flex items-center justify-between mb-2">
              {statusIcon}
              <Badge variant="outline" className="text-xs">
                {kanji.stroke_count}画
              </Badge>
            </div>
            
            <div className="text-6xl font-jp mb-3 text-foreground">
              {kanji.character}
            </div>
            
            <div className="flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handlePlayAudio}
                disabled={isPlaying}
                className="h-8 w-8 p-0"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
              
              {onSelect && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect();
                  }}
                  className="h-8 w-8 p-0"
                >
                  <BookOpen className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          // Back - Meanings and readings
          <div className="text-center space-y-3">
            <div className="text-3xl font-jp mb-2">{kanji.character}</div>
            
            <div className="text-sm font-medium text-foreground">
              {kanji.meanings_id}
            </div>
            
            {kanji.kun_readings.length > 0 && (
              <div className="text-xs">
                <span className="text-muted-foreground">訓読み: </span>
                <span className="font-jp">{kanji.kun_readings.join('、')}</span>
              </div>
            )}
            
            {kanji.on_readings.length > 0 && (
              <div className="text-xs">
                <span className="text-muted-foreground">音読み: </span>
                <span className="font-jp">{kanji.on_readings.join('、')}</span>
              </div>
            )}
            
            {kanji.example_words.length > 0 && (
              <div className="text-xs text-muted-foreground">
                例: <span className="font-jp">{kanji.example_words[0].word}</span>
                <span className="ml-1">({kanji.example_words[0].meaning})</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
