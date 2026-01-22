import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Navigation, Building, BookOpen, MessageSquare, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FactoryMap } from '@/components/learn/location/FactoryMap';
import { DemonstrativeVisualizer } from '@/components/learn/location/DemonstrativeVisualizer';
import { PositionWordsDrill } from '@/components/learn/location/PositionWordsDrill';
import { DirectionBuilder } from '@/components/learn/location/DirectionBuilder';
import { ExistenceGame } from '@/components/learn/location/ExistenceGame';
import { LocationParticlePractice } from '@/components/learn/location/LocationParticlePractice';
import { FloorNavigator } from '@/components/learn/location/FloorNavigator';
import { WorkplaceLocationQuiz } from '@/components/learn/location/WorkplaceLocationQuiz';
import { LessonCompletionCard } from '@/components/learn/LessonCompletionCard';
import { cn } from '@/lib/utils';

type LessonPhase = 'map' | 'demonstrative' | 'position' | 'direction' | 'existence' | 'particle' | 'floor' | 'quiz' | 'complete';

const phases: { id: LessonPhase; label: string; icon: React.ElementType }[] = [
  { id: 'map', label: 'Peta', icon: MapPin },
  { id: 'demonstrative', label: 'ここ・そこ', icon: Navigation },
  { id: 'position', label: 'Posisi', icon: BookOpen },
  { id: 'direction', label: 'Arah', icon: Navigation },
  { id: 'existence', label: 'あります', icon: BookOpen },
  { id: 'particle', label: 'Partikel', icon: BookOpen },
  { id: 'floor', label: '階', icon: Building },
  { id: 'quiz', label: 'Quiz', icon: BookOpen },
];

export default function LocationLesson() {
  const navigate = useNavigate();
  const [currentPhase, setCurrentPhase] = useState<LessonPhase>('map');
  const [completedPhases, setCompletedPhases] = useState<LessonPhase[]>([]);

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

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 mx-4">
            <h1 className="text-sm font-medium text-center">Lokasi & Arah</h1>
            <p className="text-xs text-muted-foreground text-center">Pelajaran 3 - JLPT N5</p>
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
          {currentPhase === 'map' && (
            <motion.div key="map" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <FactoryMap />
            </motion.div>
          )}
          {currentPhase === 'demonstrative' && (
            <motion.div key="demonstrative" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <DemonstrativeVisualizer />
            </motion.div>
          )}
          {currentPhase === 'position' && (
            <motion.div key="position" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <PositionWordsDrill />
            </motion.div>
          )}
          {currentPhase === 'direction' && (
            <motion.div key="direction" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <DirectionBuilder />
            </motion.div>
          )}
          {currentPhase === 'existence' && (
            <motion.div key="existence" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <ExistenceGame />
            </motion.div>
          )}
          {currentPhase === 'particle' && (
            <motion.div key="particle" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <LocationParticlePractice />
            </motion.div>
          )}
          {currentPhase === 'floor' && (
            <motion.div key="floor" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <FloorNavigator />
            </motion.div>
          )}
          {currentPhase === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <WorkplaceLocationQuiz />
            </motion.div>
          )}
          {currentPhase === 'complete' && (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <LessonCompletionCard
                lessonTitle="Lokasi & Arah"
                vocabCount={70}
                grammarCount={4}
                exerciseScore={85}
                xpEarned={40}
                hasQuiz={false}
                onTakeQuiz={() => navigate('/learn')}
                onReview={() => setCurrentPhase('map')}
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
