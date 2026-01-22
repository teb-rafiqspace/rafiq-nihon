import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Building, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Floor {
  number: number;
  japanese: string;
  reading: string;
  isException: boolean;
  facility: string;
  facilityJp: string;
}

const floors: Floor[] = [
  { number: 5, japanese: '五階', reading: 'go-kai', isException: false, facility: 'Restaurant', facilityJp: 'レストラン' },
  { number: 4, japanese: '四階', reading: 'yon-kai', isException: false, facility: 'Office', facilityJp: '事務所' },
  { number: 3, japanese: '三階', reading: 'san-gai', isException: true, facility: 'Meeting Room', facilityJp: '会議室' },
  { number: 2, japanese: '二階', reading: 'ni-kai', isException: false, facility: 'Training Room', facilityJp: '研修室' },
  { number: 1, japanese: '一階', reading: 'ik-kai', isException: true, facility: 'Reception', facilityJp: '受付' },
  { number: 0, japanese: '地下一階', reading: 'chika-ik-kai', isException: true, facility: 'Parking', facilityJp: '駐車場' },
];

interface QuizQuestion {
  facilityJp: string;
  correctFloor: Floor;
}

export function FloorNavigator() {
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
  const [mode, setMode] = useState<'learn' | 'quiz'>('learn');
  const [quizQuestion, setQuizQuestion] = useState<QuizQuestion | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
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

  const handleFloorClick = (floor: Floor) => {
    setSelectedFloor(floor);
    speakJapanese(floor.japanese);
  };

  const generateQuizQuestion = () => {
    const randomFloor = floors[Math.floor(Math.random() * floors.length)];
    setQuizQuestion({
      facilityJp: randomFloor.facilityJp,
      correctFloor: randomFloor,
    });
    setQuizAnswer(null);
  };

  const handleQuizAnswer = (answer: string) => {
    if (quizAnswer) return;
    setQuizAnswer(answer);
    
    const isCorrect = answer === quizQuestion?.correctFloor.japanese;
    setQuizScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    speakJapanese(quizQuestion?.correctFloor.japanese || '');
  };

  const startQuiz = () => {
    setMode('quiz');
    setQuizScore({ correct: 0, total: 0 });
    generateQuizQuestion();
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h3 className="font-bold text-lg font-jp">ビルの階</h3>
        <p className="text-sm text-muted-foreground">Lantai gedung - Perhatikan pengecualian!</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 justify-center">
        <Button
          variant={mode === 'learn' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('learn')}
        >
          Belajar
        </Button>
        <Button
          variant={mode === 'quiz' ? 'default' : 'outline'}
          size="sm"
          onClick={startQuiz}
        >
          Quiz
        </Button>
      </div>

      {mode === 'learn' ? (
        <>
          {/* Building visualization */}
          <div className="bg-gradient-to-b from-sky-100 to-sky-50 dark:from-sky-900/20 dark:to-sky-950/20 rounded-2xl p-4 border border-border">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Building className="w-5 h-5 text-primary" />
              <span className="font-semibold">Building Navigator</span>
            </div>

            <div className="space-y-2">
              {floors.map((floor) => (
                <motion.button
                  key={floor.number}
                  onClick={() => handleFloorClick(floor)}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                    selectedFloor?.number === floor.number
                      ? "bg-primary text-primary-foreground"
                      : "bg-card hover:bg-muted"
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-background/20 flex items-center justify-center font-bold">
                    {floor.number === 0 ? 'B1' : `${floor.number}F`}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-jp font-bold">{floor.japanese}</span>
                      {floor.isException && (
                        <Badge variant="outline" className="text-xs bg-warning/20 text-warning-foreground border-warning">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          例外
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs opacity-80">{floor.reading}</div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-jp">{floor.facilityJp}</div>
                    <div className="text-xs opacity-70">{floor.facility}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Exception notes */}
          <div className="bg-warning/10 rounded-xl p-4 border border-warning/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="font-semibold text-sm">Pengecualian Penting:</span>
            </div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• <span className="font-jp">一階</span> = <strong>いっかい</strong> (ik-kai) bukan ichi-kai</li>
              <li>• <span className="font-jp">三階</span> = <strong>さんがい</strong> (san-gai) bukan san-kai</li>
              <li>• <span className="font-jp">六階</span> = <strong>ろっかい</strong> (rok-kai)</li>
              <li>• <span className="font-jp">八階</span> = <strong>はっかい</strong> (hak-kai)</li>
              <li>• <span className="font-jp">十階</span> = <strong>じゅっかい</strong> (juk-kai)</li>
            </ul>
          </div>

          {/* Selected floor info */}
          {selectedFloor && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl p-4 border border-border shadow-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-xl font-jp">{selectedFloor.japanese}</p>
                  <p className="text-sm text-muted-foreground">{selectedFloor.reading}</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => speakJapanese(selectedFloor.japanese)}>
                  <Volume2 className={cn("w-5 h-5", isPlaying && "text-primary animate-pulse")} />
                </Button>
              </div>
              <div className="mt-3 p-2 bg-muted/50 rounded-lg">
                <p className="text-sm font-jp">
                  {selectedFloor.facilityJp}は{selectedFloor.japanese}にあります。
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedFloor.facility} ada di lantai {selectedFloor.number === 0 ? 'basement 1' : selectedFloor.number}.
                </p>
              </div>
            </motion.div>
          )}
        </>
      ) : (
        /* Quiz mode */
        <div className="space-y-4">
          {quizQuestion && (
            <motion.div
              key={quizQuestion.facilityJp}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl p-6 border border-border shadow-card text-center"
            >
              <p className="text-lg font-jp mb-4">
                {quizQuestion.facilityJp}は<span className="text-primary font-bold">何階</span>ですか？
              </p>

              <div className="grid grid-cols-2 gap-2">
                {floors.map((floor) => {
                  const isCorrect = floor.japanese === quizQuestion.correctFloor.japanese;
                  const isSelected = quizAnswer === floor.japanese;

                  return (
                    <motion.button
                      key={floor.number}
                      onClick={() => handleQuizAnswer(floor.japanese)}
                      disabled={!!quizAnswer}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all",
                        quizAnswer && isCorrect && "bg-accent/20 border-accent",
                        quizAnswer && isSelected && !isCorrect && "bg-destructive/10 border-destructive",
                        !quizAnswer && "bg-card border-border hover:border-primary",
                        quizAnswer && !isSelected && !isCorrect && "opacity-40"
                      )}
                    >
                      <div className="font-bold font-jp">{floor.japanese}</div>
                      <div className="text-xs text-muted-foreground">{floor.reading}</div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Quiz feedback */}
          <AnimatePresence>
            {quizAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-4 rounded-xl flex items-center gap-3",
                  quizAnswer === quizQuestion?.correctFloor.japanese
                    ? "bg-accent/10 border border-accent"
                    : "bg-destructive/10 border border-destructive"
                )}
              >
                {quizAnswer === quizQuestion?.correctFloor.japanese ? (
                  <CheckCircle className="w-5 h-5 text-accent" />
                ) : (
                  <XCircle className="w-5 h-5 text-destructive" />
                )}
                <span>
                  {quizAnswer === quizQuestion?.correctFloor.japanese
                    ? 'Benar!'
                    : `Jawaban: ${quizQuestion?.correctFloor.japanese} (${quizQuestion?.correctFloor.reading})`}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quiz navigation */}
          {quizAnswer && (
            <Button onClick={generateQuizQuestion} className="w-full">
              Soal Berikutnya
            </Button>
          )}

          {/* Quiz score */}
          <div className="text-center text-sm text-muted-foreground">
            Skor: {quizScore.correct}/{quizScore.total}
          </div>
        </div>
      )}
    </div>
  );
}
