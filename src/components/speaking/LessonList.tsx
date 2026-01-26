import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpeakingLessons, SpeakingLesson } from '@/hooks/useSpeaking';

interface LessonListProps {
  lessonType: string;
  title: string;
  icon: string;
  color: string;
  onSelectLesson: (lesson: SpeakingLesson) => void;
  onBack: () => void;
}

export function LessonList({
  lessonType,
  title,
  icon,
  color,
  onSelectLesson,
  onBack
}: LessonListProps) {
  const { data: lessons = [], isLoading } = useSpeakingLessons(lessonType);

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-amber-100 text-amber-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className={`bg-gradient-to-r ${color} text-white`}>
        <div className="container max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                {icon} {title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-lg mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No lessons available yet
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, index) => (
              <motion.button
                key={lesson.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelectLesson(lesson)}
                className="w-full bg-card rounded-xl p-4 shadow-card hover:shadow-elevated transition-all text-left flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-xl flex-shrink-0">
                  {icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base truncate">
                    {lesson.title_id}
                  </h3>
                  <p className="text-sm text-muted-foreground font-jp truncate">
                    {lesson.title_ja}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(lesson.difficulty)}`}>
                      {lesson.difficulty}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {lesson.estimated_minutes} min
                    </span>
                  </div>
                </div>
                
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
