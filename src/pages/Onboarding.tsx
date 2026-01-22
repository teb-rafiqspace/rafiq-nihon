import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useUpdateProfile } from '@/hooks/useProfile';
import { ArrowRight, ArrowLeft, Target, GraduationCap, Clock, Sparkles } from 'lucide-react';

type OnboardingStep = 'welcome' | 'goal' | 'level' | 'time' | 'complete';

const goals = [
  { id: 'kemnaker', label: 'Kemnaker / IM Japan', description: 'Persiapan magang Jepang', icon: '🏭' },
  { id: 'jlpt', label: 'JLPT N5', description: 'Sertifikasi bahasa Jepang', icon: '📜' },
  { id: 'general', label: 'Umum', description: 'Belajar untuk hobi/wisata', icon: '✈️' },
];

const levels = [
  { id: 'beginner', label: 'Pemula', description: 'Belum pernah belajar sama sekali', icon: '🌱' },
  { id: 'some_knowledge', label: 'Sedikit Tahu', description: 'Tahu beberapa kosakata dasar', icon: '🌿' },
  { id: 'intermediate', label: 'Menengah', description: 'Bisa percakapan sederhana', icon: '🌳' },
];

const dailyGoals = [
  { minutes: 10, label: '10 menit', description: 'Santai', icon: '☕' },
  { minutes: 15, label: '15 menit', description: 'Konsisten', icon: '⚡' },
  { minutes: 20, label: '20 menit', description: 'Serius', icon: '🔥' },
  { minutes: 30, label: '30 menit', description: 'Intensif', icon: '🚀' },
];

export default function Onboarding() {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [goal, setGoal] = useState<string>('');
  const [level, setLevel] = useState<string>('');
  const [dailyMinutes, setDailyMinutes] = useState<number>(15);
  
  const navigate = useNavigate();
  const updateProfile = useUpdateProfile();
  
  const handleNext = () => {
    const steps: OnboardingStep[] = ['welcome', 'goal', 'level', 'time', 'complete'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };
  
  const handleBack = () => {
    const steps: OnboardingStep[] = ['welcome', 'goal', 'level', 'time', 'complete'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };
  
  const handleComplete = async () => {
    await updateProfile.mutateAsync({
      learning_goal: goal as 'kemnaker' | 'jlpt' | 'general',
      skill_level: level as 'beginner' | 'some_knowledge' | 'intermediate',
      daily_goal_minutes: dailyMinutes,
      onboarding_completed: true,
    });
    navigate('/home');
  };
  
  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0 }),
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress */}
      <div className="pt-safe px-4 pt-4">
        <div className="container max-w-lg mx-auto">
          <div className="flex gap-1">
            {['welcome', 'goal', 'level', 'time', 'complete'].map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  ['welcome', 'goal', 'level', 'time', 'complete'].indexOf(step) >= i
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 container max-w-lg mx-auto px-4 py-8 flex flex-col">
        <AnimatePresence mode="wait" custom={1}>
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={1}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-32 h-32 bg-gradient-primary rounded-3xl flex items-center justify-center mb-8 shadow-button"
              >
                <span className="text-6xl">🇯🇵</span>
              </motion.div>
              <h1 className="text-3xl font-bold mb-4">Selamat Datang!</h1>
              <p className="text-muted-foreground text-lg mb-8">
                Ayo mulai perjalanan belajar bahasa Jepangmu bersama Rafiq Nihon
              </p>
              <div className="w-full max-w-xs">
                <Button size="xl" className="w-full" onClick={handleNext}>
                  Mulai <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}
          
          {step === 'goal' && (
            <motion.div
              key="goal"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={1}
              className="flex-1 flex flex-col"
            >
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Apa tujuanmu?</h2>
                </div>
                <p className="text-muted-foreground">Pilih fokus belajarmu</p>
              </div>
              
              <div className="flex-1 space-y-3">
                {goals.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGoal(g.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      goal === g.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{g.icon}</span>
                      <div>
                        <p className="font-semibold">{g.label}</p>
                        <p className="text-sm text-muted-foreground">{g.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button variant="ghost" size="lg" onClick={handleBack}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Button size="lg" className="flex-1" onClick={handleNext} disabled={!goal}>
                  Lanjut <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}
          
          {step === 'level' && (
            <motion.div
              key="level"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={1}
              className="flex-1 flex flex-col"
            >
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <GraduationCap className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Level kamu?</h2>
                </div>
                <p className="text-muted-foreground">Kami akan menyesuaikan materinya</p>
              </div>
              
              <div className="flex-1 space-y-3">
                {levels.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLevel(l.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      level === l.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{l.icon}</span>
                      <div>
                        <p className="font-semibold">{l.label}</p>
                        <p className="text-sm text-muted-foreground">{l.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button variant="ghost" size="lg" onClick={handleBack}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Button size="lg" className="flex-1" onClick={handleNext} disabled={!level}>
                  Lanjut <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}
          
          {step === 'time' && (
            <motion.div
              key="time"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={1}
              className="flex-1 flex flex-col"
            >
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Target harian?</h2>
                </div>
                <p className="text-muted-foreground">Berapa lama belajar per hari?</p>
              </div>
              
              <div className="flex-1 grid grid-cols-2 gap-3">
                {dailyGoals.map((d) => (
                  <button
                    key={d.minutes}
                    onClick={() => setDailyMinutes(d.minutes)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      dailyMinutes === d.minutes
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="text-3xl block mb-2">{d.icon}</span>
                    <p className="font-bold text-lg">{d.label}</p>
                    <p className="text-sm text-muted-foreground">{d.description}</p>
                  </button>
                ))}
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button variant="ghost" size="lg" onClick={handleBack}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Button size="lg" className="flex-1" onClick={handleNext}>
                  Lanjut <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}
          
          {step === 'complete' && (
            <motion.div
              key="complete"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={1}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-24 h-24 bg-gradient-success rounded-full flex items-center justify-center mb-6"
              >
                <Sparkles className="h-12 w-12 text-success-foreground" />
              </motion.div>
              <h1 className="text-3xl font-bold mb-4">Kamu siap!</h1>
              <p className="text-muted-foreground text-lg mb-8">
                Perjalanan belajar bahasa Jepangmu dimulai sekarang. Ganbatte! 頑張って！
              </p>
              <div className="w-full max-w-xs">
                <Button 
                  size="xl" 
                  className="w-full" 
                  onClick={handleComplete}
                  disabled={updateProfile.isPending}
                >
                  Mulai Belajar <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
