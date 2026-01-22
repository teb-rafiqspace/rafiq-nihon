import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Volume2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TimeException {
  japanese: string;
  reading: string;
  meaning: string;
  wrongReading?: string;
}

const hourExceptions: TimeException[] = [
  { japanese: '4時', reading: 'よじ', meaning: 'jam 4', wrongReading: 'しじ' },
  { japanese: '7時', reading: 'しちじ', meaning: 'jam 7' },
  { japanese: '9時', reading: 'くじ', meaning: 'jam 9', wrongReading: 'きゅうじ' },
];

const minuteExceptions: TimeException[] = [
  { japanese: '1分', reading: 'いっぷん', meaning: '1 menit' },
  { japanese: '3分', reading: 'さんぷん', meaning: '3 menit' },
  { japanese: '4分', reading: 'よんぷん', meaning: '4 menit' },
  { japanese: '6分', reading: 'ろっぷん', meaning: '6 menit' },
  { japanese: '8分', reading: 'はっぷん', meaning: '8 menit' },
  { japanese: '10分', reading: 'じゅっぷん', meaning: '10 menit' },
];

export function TimeExceptions() {
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    const loadVoice = () => {
      const voices = speechSynthesis.getVoices();
      const japaneseVoice = voices.find(v => v.lang.startsWith('ja'));
      if (japaneseVoice) setSelectedVoice(japaneseVoice);
    };
    
    loadVoice();
    speechSynthesis.onvoiceschanged = loadVoice;
    
    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback((text: string, id: string) => {
    if (isPlaying) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = 0.8;
    
    utterance.onstart = () => setIsPlaying(id);
    utterance.onend = () => setIsPlaying(null);
    utterance.onerror = () => setIsPlaying(null);
    
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }, [isPlaying, selectedVoice]);

  const ExceptionItem = ({ item, index, type }: { item: TimeException; index: number; type: 'hour' | 'minute' }) => (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold text-foreground">{item.japanese}</span>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-primary">{item.reading}</span>
          {item.wrongReading && (
            <span className="text-xs text-destructive line-through">
              bukan {item.wrongReading}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{item.meaning}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => speak(item.reading, `${type}-${index}`)}
          disabled={isPlaying !== null}
        >
          {isPlaying === `${type}-${index}` ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </Button>
      </div>
    </motion.div>
  );

  return (
    <Card className="bg-card border-border shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Pengecualian Penting!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hour Exceptions */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              JAM
            </Badge>
          </div>
          <div className="space-y-2">
            {hourExceptions.map((item, index) => (
              <ExceptionItem key={index} item={item} index={index} type="hour" />
            ))}
          </div>
        </div>

        {/* Minute Exceptions */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
              MENIT
            </Badge>
          </div>
          <div className="space-y-2">
            {minuteExceptions.map((item, index) => (
              <ExceptionItem key={index} item={item} index={index + hourExceptions.length} type="minute" />
            ))}
          </div>
        </div>

        {/* Memory Tip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg"
        >
          <p className="text-sm text-amber-700 dark:text-amber-400">
            💡 <strong>Tips:</strong> Pengecualian menit biasanya terjadi pada angka 1, 3, 4, 6, 8, dan 10 - 
            perhatikan perubahan bunyi ふん → ぷん dan っ (sokuon).
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
}
