import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Loader2, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DayInfo {
  kanji: string;
  reading: string;
  romaji: string;
  meaning: string;
  memoryTip: string;
  element: string;
}

const daysOfWeek: DayInfo[] = [
  { kanji: '日', reading: 'にちようび', romaji: 'nichiyoubi', meaning: 'Minggu', memoryTip: '日 = matahari (sun)', element: 'Sun' },
  { kanji: '月', reading: 'げつようび', romaji: 'getsuyoubi', meaning: 'Senin', memoryTip: '月 = bulan (moon)', element: 'Moon' },
  { kanji: '火', reading: 'かようび', romaji: 'kayoubi', meaning: 'Selasa', memoryTip: '火 = api (fire)', element: 'Fire' },
  { kanji: '水', reading: 'すいようび', romaji: 'suiyoubi', meaning: 'Rabu', memoryTip: '水 = air (water)', element: 'Water' },
  { kanji: '木', reading: 'もくようび', romaji: 'mokuyoubi', meaning: 'Kamis', memoryTip: '木 = kayu/pohon (wood)', element: 'Wood' },
  { kanji: '金', reading: 'きんようび', romaji: 'kinyoubi', meaning: 'Jumat', memoryTip: '金 = emas (gold/metal)', element: 'Gold' },
  { kanji: '土', reading: 'どようび', romaji: 'doyoubi', meaning: 'Sabtu', memoryTip: '土 = tanah (earth)', element: 'Earth' },
];

export function DaysOfWeek() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [isPlaying, setIsPlaying] = useState<number | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const currentDay = new Date().getDay();

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

  const speak = useCallback((text: string, index: number) => {
    return new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = 0.8;
      
      utterance.onstart = () => setIsPlaying(index);
      utterance.onend = () => {
        setIsPlaying(null);
        resolve();
      };
      utterance.onerror = () => {
        setIsPlaying(null);
        resolve();
      };
      
      speechSynthesis.speak(utterance);
    });
  }, [selectedVoice]);

  const playAll = useCallback(async () => {
    if (isPlayingAll) {
      speechSynthesis.cancel();
      setIsPlayingAll(false);
      setIsPlaying(null);
      return;
    }
    
    setIsPlayingAll(true);
    speechSynthesis.cancel();
    
    for (let i = 0; i < daysOfWeek.length; i++) {
      if (!isPlayingAll && i > 0) break;
      await speak(daysOfWeek[i].reading, i);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setIsPlayingAll(false);
  }, [isPlayingAll, speak]);

  const handleDayClick = (index: number) => {
    setSelectedDay(index);
    speak(daysOfWeek[index].reading, index);
  };

  const selected = daysOfWeek[selectedDay];

  return (
    <Card className="bg-card border-border shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          📅 今週 (Minggu Ini)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Week Calendar */}
        <div className="flex justify-between">
          {daysOfWeek.map((day, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDayClick(index)}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg transition-colors min-w-[40px]",
                selectedDay === index && "bg-primary text-primary-foreground",
                currentDay === index && selectedDay !== index && "bg-accent/20 ring-2 ring-accent",
                selectedDay !== index && currentDay !== index && "hover:bg-muted"
              )}
            >
              <span className="text-lg font-bold">{day.kanji}</span>
              <motion.div
                className={cn(
                  "w-2 h-2 rounded-full mt-1",
                  selectedDay === index ? "bg-primary-foreground" : "bg-muted-foreground/30"
                )}
                animate={isPlaying === index ? { scale: [1, 1.3, 1] } : {}}
                transition={{ repeat: Infinity, duration: 0.5 }}
              />
            </motion.button>
          ))}
        </div>

        {/* Selected Day Details */}
        <motion.div
          key={selectedDay}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-muted/50 rounded-xl space-y-3"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-foreground">
                {selected.kanji}曜日
              </div>
              <div className="text-lg text-primary font-medium">
                {selected.reading}
              </div>
              <div className="text-sm text-muted-foreground">
                {selected.romaji}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-medium text-foreground">
                {selected.meaning}
              </div>
              {currentDay === selectedDay && (
                <span className="text-xs text-accent font-medium">Hari Ini</span>
              )}
            </div>
          </div>

          {/* Memory Tip */}
          <div className="p-2 bg-background/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 {selected.memoryTip}
            </p>
          </div>
        </motion.div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => speak(selected.reading, selectedDay)}
            disabled={isPlaying !== null}
            className="gap-2"
          >
            {isPlaying === selectedDay ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
            Putar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={playAll}
            className="gap-2"
          >
            <Play className="w-4 h-4" />
            {isPlayingAll ? 'Stop' : 'Putar Semua'}
          </Button>
        </div>

        {/* Element Legend */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="truncate">{day.element}</div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
