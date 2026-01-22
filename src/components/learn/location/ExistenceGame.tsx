import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Volume2, CheckCircle, XCircle, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Item {
  id: string;
  emoji: string;
  word: string;
  reading: string;
  isLiving: boolean;
}

const items: Item[] = [
  { id: '1', emoji: '📚', word: '本', reading: 'hon', isLiving: false },
  { id: '2', emoji: '🐱', word: '猫', reading: 'neko', isLiving: true },
  { id: '3', emoji: '🪑', word: '椅子', reading: 'isu', isLiving: false },
  { id: '4', emoji: '👨', word: '人', reading: 'hito', isLiving: true },
  { id: '5', emoji: '📺', word: 'テレビ', reading: 'terebi', isLiving: false },
  { id: '6', emoji: '🐕', word: '犬', reading: 'inu', isLiving: true },
  { id: '7', emoji: '🌳', word: '木', reading: 'ki', isLiving: false },
  { id: '8', emoji: '🐟', word: '魚', reading: 'sakana', isLiving: true },
  { id: '9', emoji: '🚗', word: '車', reading: 'kuruma', isLiving: false },
  { id: '10', emoji: '👶', word: '赤ちゃん', reading: 'akachan', isLiving: true },
  { id: '11', emoji: '🏠', word: '家', reading: 'ie', isLiving: false },
  { id: '12', emoji: '🐦', word: '鳥', reading: 'tori', isLiving: true },
];

export function ExistenceGame() {
  const [unsortedItems, setUnsortedItems] = useState<Item[]>([]);
  const [arimasuBox, setArimasuBox] = useState<Item[]>([]);
  const [imasuBox, setImasuBox] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    resetGame();
    const loadVoice = () => {
      const voices = speechSynthesis.getVoices();
      const jpVoice = voices.find(v => v.lang.startsWith('ja')) || null;
      setSelectedVoice(jpVoice);
    };
    loadVoice();
    speechSynthesis.onvoiceschanged = loadVoice;
  }, []);

  const speakJapanese = useCallback((text: string) => {
    if (isPlaying) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    speechSynthesis.speak(utterance);
  }, [isPlaying, selectedVoice]);

  const resetGame = () => {
    const shuffled = [...items].sort(() => Math.random() - 0.5).slice(0, 6);
    setUnsortedItems(shuffled);
    setArimasuBox([]);
    setImasuBox([]);
    setSelectedItem(null);
    setShowResult(false);
    setScore({ correct: 0, total: 0 });
  };

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
    speakJapanese(item.word);
  };

  const handleDropToBox = (box: 'arimasu' | 'imasu') => {
    if (!selectedItem) return;

    const isCorrect = (box === 'arimasu' && !selectedItem.isLiving) || 
                      (box === 'imasu' && selectedItem.isLiving);

    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    setUnsortedItems(prev => prev.filter(i => i.id !== selectedItem.id));
    
    if (box === 'arimasu') {
      setArimasuBox(prev => [...prev, { ...selectedItem, isLiving: selectedItem.isLiving }]);
    } else {
      setImasuBox(prev => [...prev, { ...selectedItem, isLiving: selectedItem.isLiving }]);
    }

    const verb = selectedItem.isLiving ? 'います' : 'あります';
    speakJapanese(`${selectedItem.word}が${verb}`);

    setSelectedItem(null);

    if (unsortedItems.length === 1) {
      setTimeout(() => setShowResult(true), 1000);
    }
  };

  const getBoxItemStyle = (item: Item, boxType: 'arimasu' | 'imasu') => {
    const isCorrect = (boxType === 'arimasu' && !item.isLiving) || 
                      (boxType === 'imasu' && item.isLiving);
    return isCorrect ? 'ring-2 ring-accent' : 'ring-2 ring-destructive';
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h3 className="font-bold text-lg font-jp">あります vs います</h3>
        <p className="text-sm text-muted-foreground">Sortir benda hidup dan tidak hidup</p>
      </div>

      {/* Explanation */}
      <div className="bg-muted/50 rounded-xl p-3 text-sm">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-semibold">Tips:</span>
        </div>
        <ul className="space-y-1 text-muted-foreground">
          <li>• <span className="font-jp">あります</span> = untuk benda mati (buku, meja, dll)</li>
          <li>• <span className="font-jp">います</span> = untuk makhluk hidup (orang, hewan)</li>
        </ul>
      </div>

      {/* Sorting boxes */}
      <div className="grid grid-cols-2 gap-4">
        {/* Arimasu box */}
        <motion.div
          onClick={() => handleDropToBox('arimasu')}
          className={cn(
            "min-h-[180px] rounded-2xl border-2 border-dashed p-3 transition-all",
            selectedItem && !selectedItem.isLiving ? "border-accent bg-accent/10" : "border-border",
            selectedItem ? "cursor-pointer hover:bg-muted/50" : ""
          )}
        >
          <div className="text-center mb-2">
            <div className="font-bold font-jp text-lg">あります</div>
            <div className="text-xs text-muted-foreground">Benda Mati</div>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {arimasuBox.map((item) => (
              <motion.div
                key={item.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn("text-2xl p-1 rounded-lg bg-card", getBoxItemStyle(item, 'arimasu'))}
              >
                {item.emoji}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Imasu box */}
        <motion.div
          onClick={() => handleDropToBox('imasu')}
          className={cn(
            "min-h-[180px] rounded-2xl border-2 border-dashed p-3 transition-all",
            selectedItem && selectedItem.isLiving ? "border-accent bg-accent/10" : "border-border",
            selectedItem ? "cursor-pointer hover:bg-muted/50" : ""
          )}
        >
          <div className="text-center mb-2">
            <div className="font-bold font-jp text-lg">います</div>
            <div className="text-xs text-muted-foreground">Makhluk Hidup</div>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {imasuBox.map((item) => (
              <motion.div
                key={item.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn("text-2xl p-1 rounded-lg bg-card", getBoxItemStyle(item, 'imasu'))}
              >
                {item.emoji}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Items to sort */}
      {!showResult && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground text-center">
            {selectedItem ? `Pilih kotak untuk ${selectedItem.word}` : 'Tap item lalu pilih kotak'}
          </p>
          <div className="flex flex-wrap gap-3 justify-center p-4 bg-muted/30 rounded-xl">
            {unsortedItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => handleItemClick(item)}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "flex flex-col items-center p-2 bg-card rounded-xl border-2 transition-all min-w-[60px]",
                  selectedItem?.id === item.id ? "border-primary shadow-lg scale-110" : "border-transparent hover:border-primary/30"
                )}
              >
                <span className="text-3xl">{item.emoji}</span>
                <span className="text-xs font-jp mt-1">{item.word}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl p-6 border border-border shadow-card text-center space-y-4"
          >
            <div className="text-4xl">{score.correct === score.total ? '🎉' : '📚'}</div>
            <div>
              <p className="font-bold text-xl">
                {score.correct === score.total ? 'Sempurna!' : 'Bagus!'}
              </p>
              <p className="text-muted-foreground">
                Skor: {score.correct}/{score.total}
              </p>
            </div>
            <Button onClick={resetGame} className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Main Lagi
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
