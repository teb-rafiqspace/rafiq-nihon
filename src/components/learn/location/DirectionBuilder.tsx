import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Play, ChevronRight, MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DirectionStep {
  id: string;
  japanese: string;
  reading: string;
  indonesian: string;
  icon: string;
}

interface Route {
  id: string;
  start: string;
  startJp: string;
  end: string;
  endJp: string;
  endEmoji: string;
  steps: DirectionStep[];
}

const routes: Route[] = [
  {
    id: 'bank',
    start: 'Stasiun',
    startJp: '駅',
    end: 'Bank',
    endJp: '銀行',
    endEmoji: '🏦',
    steps: [
      { id: '1', japanese: 'まっすぐ行ってください。', reading: 'Massugu itte kudasai.', indonesian: 'Tolong jalan lurus.', icon: '⬆️' },
      { id: '2', japanese: '信号を右に曲がってください。', reading: 'Shingou wo migi ni magatte kudasai.', indonesian: 'Tolong belok kanan di lampu lalu lintas.', icon: '➡️' },
      { id: '3', japanese: '銀行は左にあります。', reading: 'Ginkou wa hidari ni arimasu.', indonesian: 'Bank ada di sebelah kiri.', icon: '🏦' },
    ]
  },
  {
    id: 'post',
    start: 'Stasiun',
    startJp: '駅',
    end: 'Kantor Pos',
    endJp: '郵便局',
    endEmoji: '🏤',
    steps: [
      { id: '1', japanese: 'まっすぐ行ってください。', reading: 'Massugu itte kudasai.', indonesian: 'Tolong jalan lurus.', icon: '⬆️' },
      { id: '2', japanese: '二つ目の角を左に曲がってください。', reading: 'Futatsu-me no kado wo hidari ni magatte kudasai.', indonesian: 'Tolong belok kiri di sudut kedua.', icon: '⬅️' },
      { id: '3', japanese: '郵便局は右にあります。', reading: 'Yuubinkyoku wa migi ni arimasu.', indonesian: 'Kantor pos ada di sebelah kanan.', icon: '🏤' },
    ]
  },
  {
    id: 'hospital',
    start: 'Stasiun',
    startJp: '駅',
    end: 'Rumah Sakit',
    endJp: '病院',
    endEmoji: '🏥',
    steps: [
      { id: '1', japanese: '北口から出てください。', reading: 'Kita-guchi kara dete kudasai.', indonesian: 'Tolong keluar dari pintu utara.', icon: '🚪' },
      { id: '2', japanese: '橋を渡ってください。', reading: 'Hashi wo watatte kudasai.', indonesian: 'Tolong seberangi jembatan.', icon: '🌉' },
      { id: '3', japanese: 'まっすぐ五分歩いてください。', reading: 'Massugu go-fun aruite kudasai.', indonesian: 'Tolong jalan lurus 5 menit.', icon: '🚶' },
      { id: '4', japanese: '病院は道の右側にあります。', reading: 'Byouin wa michi no migi-gawa ni arimasu.', indonesian: 'Rumah sakit ada di sisi kanan jalan.', icon: '🏥' },
    ]
  },
];

const commonPhrases = [
  { jp: 'まっすぐ行ってください', id: 'Jalan lurus' },
  { jp: '右に曲がってください', id: 'Belok kanan' },
  { jp: '左に曲がってください', id: 'Belok kiri' },
  { jp: '〜を渡ってください', id: 'Seberangi ~' },
  { jp: '〜の前にあります', id: 'Ada di depan ~' },
  { jp: '〜の隣にあります', id: 'Ada di sebelah ~' },
];

export function DirectionBuilder() {
  const [selectedRoute, setSelectedRoute] = useState<Route>(routes[0]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
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

  const speakJapanese = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => {
        setIsPlaying(false);
        resolve();
      };
      speechSynthesis.speak(utterance);
    });
  }, [selectedVoice]);

  const handlePlayStep = (step: DirectionStep, index: number) => {
    setCurrentStep(index);
    speakJapanese(step.japanese);
  };

  const handlePlayAll = async () => {
    if (isPlayingAll) {
      speechSynthesis.cancel();
      setIsPlayingAll(false);
      setCurrentStep(-1);
      return;
    }

    setIsPlayingAll(true);
    for (let i = 0; i < selectedRoute.steps.length; i++) {
      setCurrentStep(i);
      await speakJapanese(selectedRoute.steps[i].japanese);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    setIsPlayingAll(false);
    setCurrentStep(-1);
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h3 className="font-bold text-lg font-jp">道案内</h3>
        <p className="text-sm text-muted-foreground">Belajar memberi petunjuk arah</p>
      </div>

      {/* Route selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {routes.map((route) => (
          <Button
            key={route.id}
            variant={selectedRoute.id === route.id ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setSelectedRoute(route);
              setCurrentStep(-1);
            }}
            className="shrink-0"
          >
            {route.endEmoji} {route.end}
          </Button>
        ))}
      </div>

      {/* Route visualization */}
      <div className="bg-card rounded-2xl p-4 border border-border shadow-card">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="font-jp">{selectedRoute.startJp}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="font-jp">{selectedRoute.endJp}</span>
            <span>{selectedRoute.endEmoji}</span>
          </div>
          <Button size="sm" variant="outline" onClick={handlePlayAll}>
            <Play className={cn("w-4 h-4 mr-1", isPlayingAll && "text-primary animate-pulse")} />
            {isPlayingAll ? 'Stop' : 'Play All'}
          </Button>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {selectedRoute.steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer",
                currentStep === index ? "bg-primary/10 border border-primary" : "bg-muted/30 hover:bg-muted/50"
              )}
              onClick={() => handlePlayStep(step, index)}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl">{step.icon}</span>
                {index < selectedRoute.steps.length - 1 && (
                  <div className="w-0.5 h-6 bg-border" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-jp font-medium">{step.japanese}</p>
                <p className="text-xs text-muted-foreground">{step.reading}</p>
                <p className="text-sm text-muted-foreground mt-1">{step.indonesian}</p>
              </div>
              <Button size="icon" variant="ghost" className="shrink-0">
                <Volume2 className={cn("w-4 h-4", currentStep === index && isPlaying && "text-primary animate-pulse")} />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Common phrases */}
      <div className="space-y-2">
        <h4 className="font-semibold text-sm">Frasa Umum:</h4>
        <div className="grid grid-cols-2 gap-2">
          {commonPhrases.map((phrase, index) => (
            <motion.button
              key={index}
              whileTap={{ scale: 0.98 }}
              onClick={() => speakJapanese(phrase.jp)}
              className="p-2 bg-muted/50 rounded-lg text-left hover:bg-muted transition-colors"
            >
              <p className="font-jp text-sm">{phrase.jp}</p>
              <p className="text-xs text-muted-foreground">{phrase.id}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
