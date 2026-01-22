import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Shuffle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InteractiveClockProps {
  onTimeChange?: (hour: number, minute: number) => void;
  practiceMode?: boolean;
  onAnswer?: (isCorrect: boolean) => void;
}

// Time reading exceptions
const hourReadings: Record<number, { reading: string; isException?: boolean; note?: string }> = {
  1: { reading: 'いちじ' },
  2: { reading: 'にじ' },
  3: { reading: 'さんじ' },
  4: { reading: 'よじ', isException: true, note: 'bukan しじ' },
  5: { reading: 'ごじ' },
  6: { reading: 'ろくじ' },
  7: { reading: 'しちじ', isException: true },
  8: { reading: 'はちじ' },
  9: { reading: 'くじ', isException: true, note: 'bukan きゅうじ' },
  10: { reading: 'じゅうじ' },
  11: { reading: 'じゅういちじ' },
  12: { reading: 'じゅうにじ' },
};

const minuteReadings: Record<number, { reading: string; isException?: boolean }> = {
  0: { reading: '' },
  1: { reading: 'いっぷん', isException: true },
  2: { reading: 'にふん' },
  3: { reading: 'さんぷん', isException: true },
  4: { reading: 'よんぷん', isException: true },
  5: { reading: 'ごふん' },
  6: { reading: 'ろっぷん', isException: true },
  7: { reading: 'ななふん' },
  8: { reading: 'はっぷん', isException: true },
  9: { reading: 'きゅうふん' },
  10: { reading: 'じゅっぷん', isException: true },
  15: { reading: 'じゅうごふん' },
  20: { reading: 'にじゅっぷん', isException: true },
  25: { reading: 'にじゅうごふん' },
  30: { reading: 'さんじゅっぷん', isException: true },
  35: { reading: 'さんじゅうごふん' },
  40: { reading: 'よんじゅっぷん', isException: true },
  45: { reading: 'よんじゅうごふん' },
  50: { reading: 'ごじゅっぷん', isException: true },
  55: { reading: 'ごじゅうごふん' },
};

// Helper to get minute reading for any minute
const getMinuteReading = (minute: number): string => {
  if (minute === 0) return '';
  if (minuteReadings[minute]) return minuteReadings[minute].reading;
  
  const tens = Math.floor(minute / 10);
  const ones = minute % 10;
  
  const tensReading = tens > 0 ? ['', 'じゅう', 'にじゅう', 'さんじゅう', 'よんじゅう', 'ごじゅう'][tens] : '';
  const onesReading = ones > 0 ? minuteReadings[ones]?.reading || '' : '';
  
  return tensReading + onesReading;
};

export function InteractiveClock({ onTimeChange, practiceMode = false, onAnswer }: InteractiveClockProps) {
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isDragging, setIsDragging] = useState<'hour' | 'minute' | null>(null);

  // Get Japanese voice
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

  const getTimeReading = useCallback(() => {
    const hourReading = hourReadings[hour]?.reading || '';
    const minuteReading = getMinuteReading(minute);
    return minuteReading ? `${hourReading} ${minuteReading}` : hourReading;
  }, [hour, minute]);

  const getTimeJapanese = useCallback(() => {
    const hourStr = `${hour}時`;
    const minuteStr = minute > 0 ? `${minute}分` : '';
    return hourStr + minuteStr;
  }, [hour, minute]);

  const speakTime = useCallback(() => {
    if (isPlaying) return;
    
    const reading = getTimeReading();
    const utterance = new SpeechSynthesisUtterance(reading);
    utterance.lang = 'ja-JP';
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = 0.8;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }, [isPlaying, getTimeReading, selectedVoice]);

  const randomizeTime = useCallback(() => {
    const newHour = Math.floor(Math.random() * 12) + 1;
    const newMinute = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55][Math.floor(Math.random() * 12)];
    setHour(newHour);
    setMinute(newMinute);
    onTimeChange?.(newHour, newMinute);
  }, [onTimeChange]);

  // Clock hand angles
  const hourAngle = (hour % 12) * 30 + (minute / 60) * 30;
  const minuteAngle = minute * 6;

  // Handle clock face clicks to set time
  const handleClockClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;
    
    let angle = Math.atan2(x, -y) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    
    if (isDragging === 'hour') {
      const newHour = Math.round(angle / 30) || 12;
      setHour(newHour);
    } else if (isDragging === 'minute') {
      const newMinute = Math.round(angle / 6) % 60;
      setMinute(newMinute);
    }
  };

  return (
    <Card className="bg-card border-border shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          🕐 Jam Interaktif
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Clock Face */}
        <div className="flex justify-center">
          <motion.svg
            viewBox="0 0 200 200"
            className="w-48 h-48 cursor-pointer"
            onClick={handleClockClick}
            onMouseDown={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const centerX = rect.width / 2;
              const centerY = rect.height / 2;
              const x = e.clientX - rect.left - centerX;
              const y = e.clientY - rect.top - centerY;
              const dist = Math.sqrt(x * x + y * y);
              setIsDragging(dist < 40 ? 'hour' : 'minute');
            }}
            onMouseUp={() => setIsDragging(null)}
            onMouseLeave={() => setIsDragging(null)}
          >
            {/* Clock face */}
            <circle
              cx="100"
              cy="100"
              r="95"
              className="fill-background stroke-primary"
              strokeWidth="3"
            />
            
            {/* Hour markers */}
            {Array.from({ length: 12 }, (_, i) => {
              const angle = (i * 30 - 90) * (Math.PI / 180);
              const x1 = 100 + 80 * Math.cos(angle);
              const y1 = 100 + 80 * Math.sin(angle);
              const x2 = 100 + 90 * Math.cos(angle);
              const y2 = 100 + 90 * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  className="stroke-foreground"
                  strokeWidth="2"
                />
              );
            })}
            
            {/* Hour numbers */}
            {Array.from({ length: 12 }, (_, i) => {
              const num = i === 0 ? 12 : i;
              const angle = (i * 30 - 90) * (Math.PI / 180);
              const x = 100 + 68 * Math.cos(angle);
              const y = 100 + 68 * Math.sin(angle);
              return (
                <text
                  key={i}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-foreground text-sm font-medium"
                >
                  {num}
                </text>
              );
            })}
            
            {/* Hour hand */}
            <motion.line
              x1="100"
              y1="100"
              x2="100"
              y2="55"
              className="stroke-primary"
              strokeWidth="4"
              strokeLinecap="round"
              animate={{ rotate: hourAngle }}
              style={{ transformOrigin: '100px 100px' }}
              transition={{ type: 'spring', stiffness: 100 }}
            />
            
            {/* Minute hand */}
            <motion.line
              x1="100"
              y1="100"
              x2="100"
              y2="30"
              className="stroke-accent"
              strokeWidth="3"
              strokeLinecap="round"
              animate={{ rotate: minuteAngle }}
              style={{ transformOrigin: '100px 100px' }}
              transition={{ type: 'spring', stiffness: 100 }}
            />
            
            {/* Center dot */}
            <circle cx="100" cy="100" r="5" className="fill-primary" />
          </motion.svg>
        </div>

        {/* Time Display */}
        <div className="text-center space-y-1">
          <div className="text-3xl font-bold text-foreground">
            {getTimeJapanese()}
          </div>
          <div className="text-lg text-primary font-medium">
            {getTimeReading()}
          </div>
          <div className="text-sm text-muted-foreground">
            {hour}:{minute.toString().padStart(2, '0')}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={speakTime}
            disabled={isPlaying}
            className="gap-2"
          >
            {isPlaying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
            Putar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={randomizeTime}
            className="gap-2"
          >
            <Shuffle className="w-4 h-4" />
            Acak
          </Button>
        </div>

        {/* Time adjustment buttons */}
        <div className="flex justify-center gap-4">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Jam</div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setHour(h => h === 1 ? 12 : h - 1)}
              >
                -
              </Button>
              <span className="w-8 text-center leading-8">{hour}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setHour(h => h === 12 ? 1 : h + 1)}
              >
                +
              </Button>
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Menit</div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setMinute(m => m === 0 ? 55 : m - 5)}
              >
                -
              </Button>
              <span className="w-8 text-center leading-8">{minute.toString().padStart(2, '0')}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setMinute(m => m === 55 ? 0 : m + 5)}
              >
                +
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
