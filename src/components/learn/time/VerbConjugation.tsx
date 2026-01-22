import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Loader2, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Verb {
  dictionary: string;
  reading: string;
  masu: string;
  masuReading: string;
  masen: string;
  masenReading: string;
  meaning: string;
}

const verbs: Verb[] = [
  { dictionary: '食べる', reading: 'たべる', masu: '食べます', masuReading: 'たべます', masen: '食べません', masenReading: 'たべません', meaning: 'makan' },
  { dictionary: '飲む', reading: 'のむ', masu: '飲みます', masuReading: 'のみます', masen: '飲みません', masenReading: 'のみません', meaning: 'minum' },
  { dictionary: '行く', reading: 'いく', masu: '行きます', masuReading: 'いきます', masen: '行きません', masenReading: 'いきません', meaning: 'pergi' },
  { dictionary: '来る', reading: 'くる', masu: '来ます', masuReading: 'きます', masen: '来ません', masenReading: 'きません', meaning: 'datang' },
  { dictionary: '見る', reading: 'みる', masu: '見ます', masuReading: 'みます', masen: '見ません', masenReading: 'みません', meaning: 'melihat' },
  { dictionary: '聞く', reading: 'きく', masu: '聞きます', masuReading: 'ききます', masen: '聞きません', masenReading: 'ききません', meaning: 'mendengar' },
  { dictionary: '読む', reading: 'よむ', masu: '読みます', masuReading: 'よみます', masen: '読みません', masenReading: 'よみません', meaning: 'membaca' },
  { dictionary: '書く', reading: 'かく', masu: '書きます', masuReading: 'かきます', masen: '書きません', masenReading: 'かきません', meaning: 'menulis' },
  { dictionary: '起きる', reading: 'おきる', masu: '起きます', masuReading: 'おきます', masen: '起きません', masenReading: 'おきません', meaning: 'bangun' },
  { dictionary: '寝る', reading: 'ねる', masu: '寝ます', masuReading: 'ねます', masen: '寝ません', masenReading: 'ねません', meaning: 'tidur' },
  { dictionary: '勉強する', reading: 'べんきょうする', masu: '勉強します', masuReading: 'べんきょうします', masen: '勉強しません', masenReading: 'べんきょうしません', meaning: 'belajar' },
  { dictionary: '帰る', reading: 'かえる', masu: '帰ります', masuReading: 'かえります', masen: '帰りません', masenReading: 'かえりません', meaning: 'pulang' },
];

interface VerbConjugationProps {
  quizMode?: boolean;
  onComplete?: (correct: number, total: number) => void;
}

export function VerbConjugation({ quizMode = false, onComplete }: VerbConjugationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeForm, setActiveForm] = useState<'masu' | 'masen'>('masu');
  const [isPlaying, setIsPlaying] = useState<'masu' | 'masen' | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  // Quiz state
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizResults, setQuizResults] = useState<boolean[]>([]);
  const [showResult, setShowResult] = useState(false);

  const currentVerb = verbs[currentIndex];

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

  const speak = useCallback((text: string, form: 'masu' | 'masen') => {
    if (isPlaying) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = 0.8;
    
    utterance.onstart = () => setIsPlaying(form);
    utterance.onend = () => setIsPlaying(null);
    utterance.onerror = () => setIsPlaying(null);
    
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }, [isPlaying, selectedVoice]);

  const handleNext = () => {
    if (currentIndex < verbs.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setQuizAnswer(null);
      setShowResult(false);
    } else if (quizMode && onComplete) {
      onComplete(quizResults.filter(r => r).length, quizResults.length);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setQuizAnswer(null);
      setShowResult(false);
    }
  };

  const handleQuizAnswer = (answer: string) => {
    if (showResult) return;
    
    const isCorrect = answer === currentVerb.masen;
    setQuizAnswer(answer);
    setShowResult(true);
    setQuizResults(prev => [...prev, isCorrect]);
  };

  // Generate quiz options
  const quizOptions = quizMode ? [
    currentVerb.masen,
    verbs[(currentIndex + 1) % verbs.length].masen,
    verbs[(currentIndex + 2) % verbs.length].masen,
    verbs[(currentIndex + 3) % verbs.length].masen,
  ].sort(() => Math.random() - 0.5) : [];

  return (
    <Card className="bg-card border-border shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          動詞 (Kata Kerja)
          <span className="text-sm text-muted-foreground font-normal">
            {currentIndex + 1}/{verbs.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Verb Display */}
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <div className="text-3xl font-bold text-foreground mb-1">
                {currentVerb.masu}
              </div>
              <div className="text-lg text-primary font-medium">
                {currentVerb.masuReading}
              </div>
              <div className="text-sm text-muted-foreground">
                "{currentVerb.meaning}" (sopan)
              </div>
            </div>

            {!quizMode ? (
              <>
                {/* Form Toggle */}
                <div className="flex justify-center gap-2">
                  <Button
                    variant={activeForm === 'masu' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setActiveForm('masu');
                      speak(currentVerb.masuReading, 'masu');
                    }}
                    className="gap-2"
                  >
                    {isPlaying === 'masu' && <Loader2 className="w-4 h-4 animate-spin" />}
                    ます (positif)
                  </Button>
                  <Button
                    variant={activeForm === 'masen' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setActiveForm('masen');
                      speak(currentVerb.masenReading, 'masen');
                    }}
                    className="gap-2"
                  >
                    {isPlaying === 'masen' && <Loader2 className="w-4 h-4 animate-spin" />}
                    ません (negatif)
                  </Button>
                </div>

                {/* Conjugation Display */}
                <motion.div
                  key={activeForm}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-4 rounded-xl text-center",
                    activeForm === 'masu' ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"
                  )}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {activeForm === 'masu' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-sm font-medium">
                      {activeForm === 'masu' ? 'Bentuk Positif' : 'Bentuk Negatif'}
                    </span>
                  </div>
                  <div className="text-2xl font-bold">
                    {activeForm === 'masu' ? currentVerb.masu : currentVerb.masen}
                  </div>
                  <div className="text-primary">
                    {activeForm === 'masu' ? currentVerb.masuReading : currentVerb.masenReading}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    "{activeForm === 'masu' ? currentVerb.meaning : `tidak ${currentVerb.meaning}`}"
                  </div>
                </motion.div>

                {/* Transformation Arrow */}
                <div className="text-center text-sm text-muted-foreground">
                  <span className="text-foreground font-medium">{currentVerb.masu}</span>
                  {' → '}
                  <span className="text-foreground font-medium">{currentVerb.masen}</span>
                </div>
              </>
            ) : (
              /* Quiz Mode */
              <div className="space-y-3">
                <p className="text-center text-sm text-muted-foreground">
                  Pilih bentuk negatif yang benar:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {quizOptions.map((option, index) => (
                    <Button
                      key={index}
                      variant={quizAnswer === option ? 
                        (option === currentVerb.masen ? 'success' : 'destructive') : 
                        'outline'
                      }
                      onClick={() => handleQuizAnswer(option)}
                      disabled={showResult}
                      className="h-auto py-3"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
                
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-3 rounded-lg text-center",
                      quizAnswer === currentVerb.masen 
                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                        : "bg-red-500/10 text-red-700 dark:text-red-400"
                    )}
                  >
                    {quizAnswer === currentVerb.masen ? (
                      <p>✓ Benar! {currentVerb.masu} → {currentVerb.masen}</p>
                    ) : (
                      <p>✗ Salah. Jawaban yang benar: {currentVerb.masen}</p>
                    )}
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            className="gap-1"
          >
            {currentIndex === verbs.length - 1 ? 'Selesai' : 'Selanjutnya'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
