import { motion } from 'framer-motion';
import { BookOpen, Lightbulb, Bot, CheckCircle, XCircle, Volume2, Loader2 } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface GrammarExample {
  jp: string;
  reading?: string;
  id: string;
  isPositive?: boolean;
}

interface GrammarPattern {
  pattern: string;
  title: string;
  explanation: string;
  formula?: string;
  examples: GrammarExample[];
  tip?: string;
}

interface GrammarCardProps {
  patterns: GrammarPattern[];
  currentIndex: number;
  totalCount: number;
  onNext: () => void;
  onPrev: () => void;
}

export function GrammarCard({
  patterns,
  currentIndex,
  totalCount,
  onNext,
  onPrev,
}: GrammarCardProps) {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  const pattern = patterns[currentIndex];
  
  useEffect(() => {
    const findBestVoice = () => {
      const voices = speechSynthesis.getVoices();
      const japaneseVoices = voices.filter(voice => voice.lang.startsWith('ja'));
      
      if (japaneseVoices.length === 0) return;
      
      const femaleVoiceKeywords = ['haruka', 'nanami', 'ayumi', 'kyoko', 'mizuki', 'female'];
      
      let bestVoice = japaneseVoices.find(voice => {
        const nameLower = voice.name.toLowerCase();
        return femaleVoiceKeywords.some(keyword => nameLower.includes(keyword));
      });
      
      if (!bestVoice) {
        bestVoice = japaneseVoices.find(v => v.name.includes('Google')) || japaneseVoices[0];
      }
      
      setSelectedVoice(bestVoice);
    };
    
    findBestVoice();
    speechSynthesis.onvoiceschanged = findBestVoice;
    
    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);
  
  const speakJapanese = useCallback((text: string) => {
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    speechSynthesis.speak(utterance);
  }, [isPlaying, selectedVoice]);
  
  if (!pattern) return null;
  
  return (
    <motion.div
      key={currentIndex}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-card rounded-2xl shadow-card border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary/10 to-secondary/5 px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-secondary" />
            <span className="text-sm font-medium">Grammar Point</span>
          </div>
          <Badge variant="secondary">{currentIndex + 1}/{totalCount}</Badge>
        </div>
        <h2 className="font-jp text-2xl font-bold text-secondary">
          {pattern.pattern}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{pattern.title}</p>
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Explanation */}
        <div>
          <p className="text-foreground leading-relaxed">{pattern.explanation}</p>
        </div>
        
        {/* Formula */}
        {pattern.formula && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-muted/50 rounded-xl p-4 border border-border"
          >
            <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">
              Formula:
            </p>
            <p className="font-mono text-lg text-foreground font-semibold">
              {pattern.formula}
            </p>
          </motion.div>
        )}
        
        {/* Examples */}
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Contoh:
          </p>
          {pattern.examples.map((example, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl"
            >
              <div className={`mt-1 ${example.isPositive !== false ? 'text-success' : 'text-destructive'}`}>
                {example.isPositive !== false ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-jp text-lg">{example.jp}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => speakJapanese(example.jp)}
                  >
                    {isPlaying ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Volume2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                {example.reading && (
                  <p className="text-sm text-muted-foreground">{example.reading}</p>
                )}
                <p className="text-sm text-primary mt-1">= {example.id}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Tip */}
        {pattern.tip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">
                  TIP:
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-300">
                  {pattern.tip}
                </p>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Ask Rafiq Button */}
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => navigate('/chat')}
        >
          <Bot className="h-5 w-5" />
          Tanya Rafiq
        </Button>
      </div>
    </motion.div>
  );
}
