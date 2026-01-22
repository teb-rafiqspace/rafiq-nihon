import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, BookOpen, Eye, Calendar, Layers, Type, Briefcase, Hash, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DeckWithProgress } from '@/hooks/useFlashcardsDB';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'Type': Type,
  'Layers': Layers,
  'BookOpen': BookOpen,
  'Briefcase': Briefcase,
  'Hash': Hash,
  'Sun': Sun,
};

interface DeckDetailProps {
  deck: DeckWithProgress;
  onBack: () => void;
  onStartStudy: () => void;
  onStartQuiz: () => void;
  onBrowse: () => void;
}

export function DeckDetail({ deck, onBack, onStartStudy, onStartQuiz, onBrowse }: DeckDetailProps) {
  const IconComponent = iconMap[deck.icon_name || 'Layers'] || Layers;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="text-muted-foreground">Back</span>
      </div>

      {/* Deck Info */}
      <div className="text-center space-y-2">
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-white mb-4"
          style={{ backgroundColor: deck.color || '#3B82F6' }}
        >
          <IconComponent className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold font-jp">{deck.title_jp}</h1>
        <p className="text-lg text-muted-foreground">{deck.title_id}</p>
        <p className="text-sm text-muted-foreground">{deck.description}</p>
      </div>

      {/* Progress Section */}
      <div className="bg-card rounded-xl p-4 border border-border space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">📊 Progress</span>
        </div>
        
        <div className="space-y-2">
          <Progress value={deck.masteryPercentage} className="h-3" />
          <p className="text-sm text-muted-foreground text-center">
            {deck.masteryPercentage}% mastered
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">🆕</p>
            <p className="text-lg font-bold">{deck.newCount}</p>
            <p className="text-xs text-muted-foreground">New</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">📖</p>
            <p className="text-lg font-bold">{deck.learningCount}</p>
            <p className="text-xs text-muted-foreground">Learning</p>
          </div>
          <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">✅</p>
            <p className="text-lg font-bold">{deck.masteredCount}</p>
            <p className="text-xs text-muted-foreground">Mastered</p>
          </div>
        </div>
      </div>

      {/* Due for Review */}
      {deck.dueCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-600" />
            <span className="font-medium">Due for Review: {deck.dueCount} cards</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button 
          size="lg" 
          className="w-full"
          onClick={onStartStudy}
        >
          <Play className="h-5 w-5 mr-2" />
          Start Study Session
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            size="lg"
            onClick={onStartQuiz}
          >
            <BookOpen className="h-5 w-5 mr-2" />
            Quiz Mode
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={onBrowse}
          >
            <Eye className="h-5 w-5 mr-2" />
            Browse All
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
