import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Demonstrative {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  polite: string;
  politeReading: string;
  position: 'here' | 'there' | 'over-there' | 'where';
}

const demonstratives: Demonstrative[] = [
  { id: 'koko', word: 'ここ', reading: 'koko', meaning: 'Di sini', polite: 'こちら', politeReading: 'kochira', position: 'here' },
  { id: 'soko', word: 'そこ', reading: 'soko', meaning: 'Di situ', polite: 'そちら', politeReading: 'sochira', position: 'there' },
  { id: 'asoko', word: 'あそこ', reading: 'asoko', meaning: 'Di sana', polite: 'あちら', politeReading: 'achira', position: 'over-there' },
  { id: 'doko', word: 'どこ', reading: 'doko', meaning: 'Di mana?', polite: 'どちら', politeReading: 'dochira', position: 'where' },
];

export function DemonstrativeVisualizer() {
  const [selected, setSelected] = useState<Demonstrative | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPolite, setShowPolite] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    const loadVoice = () => {
      const voices = speechSynthesis.getVoices();
      const jpVoice = voices.find(v => v.lang.startsWith('ja')) || null;
      setSelectedVoice(jpVoice);
    };
    loadVoice();
    speechSynthesis.onvoiceschanged = loadVoice;
  }, []);

  const speakJapanese = useCallback((text: string) => {
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    speechSynthesis.speak(utterance);
  }, [isPlaying, selectedVoice]);

  const handleSelect = (demo: Demonstrative) => {
    setSelected(demo);
    speakJapanese(showPolite ? demo.polite : demo.word);
  };

  const getPositionX = (position: string): number => {
    switch (position) {
      case 'here': return 15;
      case 'there': return 45;
      case 'over-there': return 75;
      case 'where': return 90;
      default: return 50;
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h3 className="font-bold text-lg font-jp">ここ・そこ・あそこ</h3>
        <p className="text-sm text-muted-foreground">Kata tunjuk tempat berdasarkan jarak</p>
      </div>

      {/* Polite toggle */}
      <div className="flex justify-center">
        <Button
          variant={showPolite ? "default" : "outline"}
          size="sm"
          onClick={() => setShowPolite(!showPolite)}
        >
          {showPolite ? '〜ちら (Sopan)' : '〜こ (Biasa)'}
        </Button>
      </div>

      {/* Visualization */}
      <div className="bg-gradient-to-b from-sky-100 to-sky-50 dark:from-sky-900/20 dark:to-sky-950/20 rounded-2xl p-4 border border-border overflow-hidden">
        <svg viewBox="0 0 100 60" className="w-full">
          {/* Ground */}
          <rect x="0" y="45" width="100" height="15" fill="hsl(var(--muted))" />
          
          {/* Distance line */}
          <line x1="10" y1="50" x2="90" y2="50" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="2,2" />

          {/* Speaker icon */}
          <g transform="translate(5, 35)">
            <circle cx="5" cy="5" r="4" fill="hsl(var(--primary))" />
            <text x="5" y="15" textAnchor="middle" className="text-[3px] fill-foreground">👤 You</text>
          </g>

          {/* Listener icon */}
          <g transform="translate(40, 35)">
            <circle cx="5" cy="5" r="3" fill="hsl(var(--secondary))" fillOpacity="0.7" />
            <text x="5" y="15" textAnchor="middle" className="text-[3px] fill-foreground">👤 Listener</text>
          </g>

          {/* Position markers */}
          {demonstratives.filter(d => d.position !== 'where').map((demo) => (
            <g
              key={demo.id}
              onClick={() => handleSelect(demo)}
              className="cursor-pointer"
            >
              <motion.circle
                cx={getPositionX(demo.position)}
                cy="50"
                r={selected?.id === demo.id ? 4 : 3}
                fill={selected?.id === demo.id ? "hsl(var(--primary))" : "hsl(var(--accent))"}
                animate={selected?.id === demo.id ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5, repeat: selected?.id === demo.id ? Infinity : 0 }}
              />
              <text
                x={getPositionX(demo.position)}
                y="42"
                textAnchor="middle"
                className="text-[4px] font-bold font-jp fill-foreground pointer-events-none"
              >
                {showPolite ? demo.polite : demo.word}
              </text>
              <text
                x={getPositionX(demo.position)}
                y="57"
                textAnchor="middle"
                className="text-[2.5px] fill-muted-foreground pointer-events-none"
              >
                {demo.meaning}
              </text>
            </g>
          ))}

          {/* Distance arrows */}
          <defs>
            <marker id="arrowhead" markerWidth="4" markerHeight="3" refX="0" refY="1.5" orient="auto">
              <polygon points="0 0, 4 1.5, 0 3" fill="hsl(var(--muted-foreground))" />
            </marker>
          </defs>
          
          {/* Near arrow */}
          <g opacity="0.5">
            <text x="25" y="25" textAnchor="middle" className="text-[2.5px] fill-muted-foreground">近い (dekat)</text>
            <line x1="15" y1="28" x2="35" y2="28" stroke="hsl(var(--muted-foreground))" strokeWidth="0.3" markerEnd="url(#arrowhead)" />
          </g>

          {/* Far arrow */}
          <g opacity="0.5">
            <text x="75" y="25" textAnchor="middle" className="text-[2.5px] fill-muted-foreground">遠い (jauh)</text>
            <line x1="65" y1="28" x2="85" y2="28" stroke="hsl(var(--muted-foreground))" strokeWidth="0.3" markerEnd="url(#arrowhead)" />
          </g>
        </svg>
      </div>

      {/* Selection buttons */}
      <div className="grid grid-cols-4 gap-2">
        {demonstratives.map((demo) => (
          <motion.button
            key={demo.id}
            onClick={() => handleSelect(demo)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "p-3 rounded-xl border transition-all",
              selected?.id === demo.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:border-primary/50"
            )}
          >
            <div className="text-lg font-bold font-jp">{showPolite ? demo.polite : demo.word}</div>
            <div className="text-xs opacity-80">{demo.meaning}</div>
          </motion.button>
        ))}
      </div>

      {/* Selected info */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-4 border border-border shadow-card"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-bold text-2xl font-jp">{showPolite ? selected.polite : selected.word}</span>
              <span className="text-muted-foreground ml-2">({showPolite ? selected.politeReading : selected.reading})</span>
            </div>
            <Button size="icon" variant="ghost" onClick={() => speakJapanese(showPolite ? selected.polite : selected.word)}>
              <Volume2 className={cn("w-5 h-5", isPlaying && "text-primary animate-pulse")} />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{selected.meaning}</p>
          
          {selected.position !== 'where' && (
            <div className="mt-3 p-2 bg-muted/50 rounded-lg">
              <p className="text-sm font-jp">
                {selected.position === 'here' && `${showPolite ? 'こちら' : 'ここ'}はトイレです。(Di sini adalah toilet.)`}
                {selected.position === 'there' && `${showPolite ? 'そちら' : 'そこ'}に座ってください。(Silakan duduk di situ.)`}
                {selected.position === 'over-there' && `${showPolite ? 'あちら' : 'あそこ'}は食堂です。(Di sana adalah kantin.)`}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
