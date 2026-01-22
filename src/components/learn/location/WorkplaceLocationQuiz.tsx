import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, CheckCircle, XCircle, Lightbulb, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface QuizQuestion {
  id: string;
  type: 'ask' | 'answer' | 'direction';
  scenario: string;
  prompt: string;
  acceptableAnswers: string[];
  hint: string;
  points: number;
}

const questions: QuizQuestion[] = [
  {
    id: '1',
    type: 'ask',
    scenario: 'Kamu baru di pabrik dan perlu ke toilet.',
    prompt: 'Tanyakan "Toilet di mana?"',
    acceptableAnswers: ['トイレはどこですか', 'トイレはどこですか。', 'トイレは どこですか', 'すみません、トイレはどこですか'],
    hint: 'Gunakan pola: [Tempat]はどこですか',
    points: 10,
  },
  {
    id: '2',
    type: 'answer',
    scenario: 'Seseorang bertanya di mana kantin.',
    prompt: 'Jawab "Kantin ada di sebelah kiri"',
    acceptableAnswers: ['食堂は左にあります', '食堂は左にあります。', '左に食堂があります', '食堂は左です'],
    hint: 'Gunakan pola: [Tempat]は[Posisi]にあります',
    points: 10,
  },
  {
    id: '3',
    type: 'direction',
    scenario: 'Teman baru bertanya cara ke kantor.',
    prompt: 'Beri petunjuk: "Jalan lurus, lalu belok kanan"',
    acceptableAnswers: ['まっすぐ行って、右に曲がってください', 'まっすぐ行って右に曲がってください', 'まっすぐ行ってください。右に曲がってください', 'まっすぐ、それから右に曲がってください'],
    hint: 'Gunakan: まっすぐ行って + 方向に曲がってください',
    points: 15,
  },
  {
    id: '4',
    type: 'ask',
    scenario: 'Kamu perlu tahu di lantai berapa ruang rapat.',
    prompt: 'Tanyakan "Ruang rapat ada di lantai berapa?"',
    acceptableAnswers: ['会議室は何階ですか', '会議室は何階ですか。', '会議室は何階にありますか'],
    hint: 'Gunakan pola: [Tempat]は何階ですか',
    points: 10,
  },
  {
    id: '5',
    type: 'answer',
    scenario: 'Seseorang bertanya tentang lokasi ruang ganti.',
    prompt: 'Jawab "Ruang ganti ada di lantai 1"',
    acceptableAnswers: ['更衣室は一階にあります', '更衣室は一階にあります。', '一階に更衣室があります', '更衣室は一階です'],
    hint: 'Ingat: 一階 = いっかい (pengecualian)',
    points: 10,
  },
  {
    id: '6',
    type: 'direction',
    scenario: 'Supervisor bertanya bagaimana ke stasiun dari pabrik.',
    prompt: 'Beri petunjuk: "Keluar dari pintu masuk, lalu jalan lurus"',
    acceptableAnswers: ['入口を出て、まっすぐ行ってください', '入口から出て、まっすぐ行ってください', '入口を出てください。まっすぐ行ってください', '入口から出てまっすぐ行ってください'],
    hint: 'Gunakan: [Tempat]を出て + まっすぐ行ってください',
    points: 15,
  },
];

export function WorkplaceLocationQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const question = questions[currentQuestion];
  const isComplete = currentQuestion >= questions.length;

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

  const normalizeAnswer = (text: string): string => {
    return text
      .replace(/\s+/g, '')
      .replace(/。/g, '')
      .replace(/、/g, '')
      .toLowerCase();
  };

  const checkAnswer = () => {
    const normalized = normalizeAnswer(userAnswer);
    const correct = question.acceptableAnswers.some(
      answer => normalizeAnswer(answer) === normalized
    );
    
    setIsCorrect(correct);
    setIsChecked(true);
    
    if (correct) {
      setTotalPoints(prev => prev + question.points);
    }

    // Speak the correct answer
    speakJapanese(question.acceptableAnswers[0]);
  };

  const handleNext = () => {
    setCurrentQuestion(prev => prev + 1);
    setUserAnswer('');
    setIsChecked(false);
    setIsCorrect(false);
    setShowHint(false);
  };

  if (isComplete) {
    const maxPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = Math.round((totalPoints / maxPoints) * 100);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl p-6 border border-border shadow-card text-center space-y-4"
      >
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Award className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-xl">Quiz Selesai! 🎉</h3>
          <p className="text-muted-foreground">Kamu sudah menguasai lokasi tempat kerja!</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-4">
          <div className="text-3xl font-bold text-primary">{totalPoints}</div>
          <div className="text-sm text-muted-foreground">dari {maxPoints} poin ({percentage}%)</div>
        </div>
        <Button onClick={() => {
          setCurrentQuestion(0);
          setTotalPoints(0);
        }} className="w-full">
          Ulangi Quiz
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h3 className="font-bold text-lg font-jp">職場ロケーションクイズ</h3>
        <p className="text-sm text-muted-foreground">Praktik lokasi tempat kerja</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${(currentQuestion / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-sm text-muted-foreground">{currentQuestion + 1}/{questions.length}</span>
      </div>

      {/* Question card */}
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl p-4 border border-border shadow-card space-y-4"
      >
        {/* Scenario */}
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-sm">📍 <strong>Situasi:</strong> {question.scenario}</p>
        </div>

        {/* Prompt */}
        <div className="text-center">
          <p className="font-medium">{question.prompt}</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              question.type === 'ask' && "bg-secondary/20 text-secondary",
              question.type === 'answer' && "bg-accent/20 text-accent",
              question.type === 'direction' && "bg-primary/20 text-primary"
            )}>
              {question.type === 'ask' && '質問 (Bertanya)'}
              {question.type === 'answer' && '答え (Menjawab)'}
              {question.type === 'direction' && '道案内 (Petunjuk Arah)'}
            </span>
            <span className="text-xs text-muted-foreground">+{question.points} poin</span>
          </div>
        </div>

        {/* Answer input */}
        <Textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Tulis jawaban dalam bahasa Jepang..."
          className="font-jp text-lg min-h-[80px]"
          disabled={isChecked}
        />

        {/* Hint */}
        {!isChecked && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHint(!showHint)}
          >
            <Lightbulb className="w-4 h-4 mr-1" />
            {showHint ? 'Sembunyikan' : 'Petunjuk'}
          </Button>
        )}

        <AnimatePresence>
          {showHint && !isChecked && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 bg-muted/50 rounded-lg text-sm"
            >
              💡 {question.hint}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Check button */}
        {!isChecked ? (
          <Button 
            onClick={checkAnswer} 
            disabled={!userAnswer.trim()}
            className="w-full"
          >
            Periksa Jawaban
          </Button>
        ) : (
          <Button onClick={handleNext} className="w-full">
            {currentQuestion < questions.length - 1 ? 'Lanjut' : 'Lihat Hasil'}
          </Button>
        )}
      </motion.div>

      {/* Feedback */}
      <AnimatePresence>
        {isChecked && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-4 rounded-xl",
              isCorrect ? "bg-accent/10 border border-accent" : "bg-destructive/10 border border-destructive"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <>
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span className="font-semibold">Benar! +{question.points} poin</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-destructive" />
                  <span className="font-semibold">Kurang tepat</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-jp flex-1">{question.acceptableAnswers[0]}</p>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => speakJapanese(question.acceptableAnswers[0])}
              >
                <Volume2 className={cn("w-4 h-4", isPlaying && "text-primary animate-pulse")} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Score */}
      <div className="text-center text-sm text-muted-foreground">
        Total Poin: <span className="font-bold text-primary">{totalPoints}</span>
      </div>
    </div>
  );
}
