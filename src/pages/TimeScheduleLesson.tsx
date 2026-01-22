import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, BookOpen, MessageSquare, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InteractiveClock } from '@/components/learn/time/InteractiveClock';
import { TimeExceptions } from '@/components/learn/time/TimeExceptions';
import { DaysOfWeek } from '@/components/learn/time/DaysOfWeek';
import { VerbConjugation } from '@/components/learn/time/VerbConjugation';
import { ParticlePractice } from '@/components/learn/time/ParticlePractice';
import { ScheduleBuilder } from '@/components/learn/time/ScheduleBuilder';
import { LessonCompletionCard } from '@/components/learn/LessonCompletionCard';
import { cn } from '@/lib/utils';

type LessonPhase = 'clock' | 'exceptions' | 'days' | 'verbs' | 'particles' | 'schedule' | 'complete';

const phases: { id: LessonPhase; label: string; icon: React.ElementType }[] = [
  { id: 'clock', label: 'Jam', icon: Clock },
  { id: 'exceptions', label: 'Pengecualian', icon: BookOpen },
  { id: 'days', label: 'Hari', icon: Calendar },
  { id: 'verbs', label: 'Kata Kerja', icon: BookOpen },
  { id: 'particles', label: 'Partikel', icon: BookOpen },
  { id: 'schedule', label: 'Jadwal', icon: Calendar },
];

export default function TimeScheduleLesson() {
  const navigate = useNavigate();
  
  const [currentPhase, setCurrentPhase] = useState<LessonPhase>('clock');
  const [completedPhases, setCompletedPhases] = useState<LessonPhase[]>([]);
  const [exerciseScore, setExerciseScore] = useState({ correct: 0, total: 0 });

  const phaseIndex = phases.findIndex(p => p.id === currentPhase);

  const handleNextPhase = () => {
    if (!completedPhases.includes(currentPhase)) {
      setCompletedPhases(prev => [...prev, currentPhase]);
    }
    
    if (phaseIndex < phases.length - 1) {
      setCurrentPhase(phases[phaseIndex + 1].id);
    } else {
      setCurrentPhase('complete');
    }
  };

  const handlePrevPhase = () => {
    if (phaseIndex > 0) {
      setCurrentPhase(phases[phaseIndex - 1].id);
    }
  };

  const handleParticleComplete = (correct: number, total: number) => {
    setExerciseScore({ correct, total });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 mx-4">
            <h1 className="text-sm font-medium text-center">Waktu & Jadwal</h1>
            <p className="text-xs text-muted-foreground text-center">Pelajaran 2 - JLPT N5</p>
          </div>
          <div className="w-10" />
        </div>

        {currentPhase !== 'complete' && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-1 mb-2">
              {phases.map((phase) => (
                <motion.div
                  key={phase.id}
                  className={cn(
                    "flex-1 h-1.5 rounded-full transition-colors",
                    completedPhases.includes(phase.id) || currentPhase === phase.id ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{phases[phaseIndex]?.label}</span>
              <span>{phaseIndex + 1}/{phases.length}</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <AnimatePresence mode="wait">
          {currentPhase === 'clock' && (
            <motion.div key="clock" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <InteractiveClock />
            </motion.div>
          )}
          {currentPhase === 'exceptions' && (
            <motion.div key="exceptions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <TimeExceptions />
            </motion.div>
          )}
          {currentPhase === 'days' && (
            <motion.div key="days" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <DaysOfWeek />
            </motion.div>
          )}
          {currentPhase === 'verbs' && (
            <motion.div key="verbs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <VerbConjugation />
            </motion.div>
          )}
          {currentPhase === 'particles' && (
            <motion.div key="particles" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <ParticlePractice onComplete={handleParticleComplete} />
            </motion.div>
          )}
          {currentPhase === 'schedule' && (
            <motion.div key="schedule" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <ScheduleBuilder />
            </motion.div>
          )}
          {currentPhase === 'complete' && (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <LessonCompletionCard
                lessonTitle="Waktu & Jadwal"
                vocabCount={6}
                grammarCount={3}
                exerciseScore={exerciseScore.total > 0 ? Math.round((exerciseScore.correct / exerciseScore.total) * 100) : 85}
                xpEarned={30}
                hasQuiz={false}
                onTakeQuiz={() => navigate('/learn')}
                onReview={() => setCurrentPhase('clock')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      {currentPhase !== 'complete' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border">
          <div className="flex gap-3">
            <Button variant="outline" onClick={handlePrevPhase} disabled={phaseIndex === 0} className="flex-1">
              <ChevronLeft className="w-4 h-4 mr-1" />Sebelumnya
            </Button>
            <Button onClick={handleNextPhase} className="flex-1">
              {phaseIndex === phases.length - 1 ? 'Selesai' : 'Lanjut'}<ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <Button size="icon" className="fixed bottom-20 right-4 h-12 w-12 rounded-full shadow-lg z-40" onClick={() => navigate('/chat')}>
        <MessageSquare className="w-5 h-5" />
      </Button>
    </div>
  );
}
