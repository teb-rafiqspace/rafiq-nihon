import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Volume2, Loader2, Play, GripVertical, Edit2, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ScheduleItem {
  id: string;
  time: string;
  activity: string;
  reading: string;
  meaning: string;
}

const defaultSchedule: ScheduleItem[] = [
  { id: '1', time: '6:00', activity: '起きます', reading: 'おきます', meaning: 'bangun' },
  { id: '2', time: '7:00', activity: '朝ごはんを食べます', reading: 'あさごはんをたべます', meaning: 'makan sarapan' },
  { id: '3', time: '8:00', activity: '会社に行きます', reading: 'かいしゃにいきます', meaning: 'pergi ke kantor' },
  { id: '4', time: '12:00', activity: '昼ごはんを食べます', reading: 'ひるごはんをたべます', meaning: 'makan siang' },
  { id: '5', time: '17:00', activity: '家に帰ります', reading: 'いえにかえります', meaning: 'pulang ke rumah' },
  { id: '6', time: '19:00', activity: '晩ごはんを食べます', reading: 'ばんごはんをたべます', meaning: 'makan malam' },
  { id: '7', time: '21:00', activity: 'テレビを見ます', reading: 'テレビをみます', meaning: 'menonton TV' },
  { id: '8', time: '22:00', activity: '日本語を勉強します', reading: 'にほんごをべんきょうします', meaning: 'belajar bahasa Jepang' },
  { id: '9', time: '23:00', activity: '寝ます', reading: 'ねます', meaning: 'tidur' },
];

export function ScheduleBuilder() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>(defaultSchedule);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTime, setEditingTime] = useState('');
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

  const getTimeReading = useCallback((time: string): string => {
    const [hour, minute] = time.split(':').map(Number);
    
    const hourReadings: Record<number, string> = {
      1: 'いちじ', 2: 'にじ', 3: 'さんじ', 4: 'よじ', 5: 'ごじ', 6: 'ろくじ',
      7: 'しちじ', 8: 'はちじ', 9: 'くじ', 10: 'じゅうじ', 11: 'じゅういちじ',
      12: 'じゅうにじ', 13: 'じゅうさんじ', 14: 'じゅうよじ', 15: 'じゅうごじ',
      16: 'じゅうろくじ', 17: 'じゅうしちじ', 18: 'じゅうはちじ', 19: 'じゅうくじ',
      20: 'にじゅうじ', 21: 'にじゅういちじ', 22: 'にじゅうにじ', 23: 'にじゅうさんじ',
      0: 'れいじ', 24: 'にじゅうよじ'
    };
    
    let result = hourReadings[hour] || '';
    
    if (minute > 0) {
      // Simplified minute reading
      result += `${minute}ふん`;
    }
    
    return result;
  }, []);

  const speak = useCallback((item: ScheduleItem): Promise<void> => {
    return new Promise((resolve) => {
      const timeReading = getTimeReading(item.time);
      const text = `${timeReading}に${item.reading}`;
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = 0.8;
      
      utterance.onstart = () => setIsPlaying(item.id);
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
  }, [getTimeReading, selectedVoice]);

  const playAll = useCallback(async () => {
    if (isPlayingAll) {
      speechSynthesis.cancel();
      setIsPlayingAll(false);
      setIsPlaying(null);
      return;
    }
    
    setIsPlayingAll(true);
    speechSynthesis.cancel();
    
    for (const item of schedule) {
      if (!isPlayingAll) break;
      await speak(item);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsPlayingAll(false);
  }, [isPlayingAll, schedule, speak]);

  const startEditing = (item: ScheduleItem) => {
    setEditingId(item.id);
    setEditingTime(item.time);
  };

  const saveEditing = () => {
    if (editingId && editingTime) {
      setSchedule(prev => prev.map(item => 
        item.id === editingId ? { ...item, time: editingTime } : item
      ));
    }
    setEditingId(null);
    setEditingTime('');
  };

  return (
    <Card className="bg-card border-border shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            📋 Jadwal Harian Saya
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={playAll}
            className="gap-2"
          >
            <Play className="w-4 h-4" />
            {isPlayingAll ? 'Stop' : 'Putar Semua'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted-foreground mb-3">
          Seret untuk mengatur ulang jadwal. Ketuk 🔊 untuk mendengar.
        </p>
        
        <Reorder.Group
          axis="y"
          values={schedule}
          onReorder={setSchedule}
          className="space-y-2"
        >
          <AnimatePresence>
            {schedule.map((item) => (
              <Reorder.Item
                key={item.id}
                value={item}
                className={cn(
                  "flex items-center gap-3 p-3 bg-muted/50 rounded-lg cursor-grab active:cursor-grabbing",
                  isPlaying === item.id && "ring-2 ring-primary"
                )}
              >
                <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                
                {/* Time */}
                <div className="w-16 flex-shrink-0">
                  {editingId === item.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="time"
                        value={editingTime}
                        onChange={(e) => setEditingTime(e.target.value)}
                        className="h-7 text-xs px-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={saveEditing}
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-primary">{item.time}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 opacity-0 group-hover:opacity-100"
                        onClick={() => startEditing(item)}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Activity */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {item.activity}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {item.meaning}
                  </div>
                </div>
                
                {/* Play Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(item);
                  }}
                  disabled={isPlaying !== null}
                >
                  {isPlaying === item.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>

        {/* Sentence Pattern Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 p-3 bg-primary/5 border border-primary/10 rounded-lg"
        >
          <p className="text-sm text-muted-foreground">
            💡 <strong>Pola kalimat:</strong> [時間]に[活動]します
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Contoh: 6時に起きます (Saya bangun jam 6)
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
}
