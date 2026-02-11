import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { EnglishVocabularyCard } from '@/components/learn/EnglishVocabularyCard';
import { EnglishGrammarCard } from '@/components/learn/EnglishGrammarCard';
import { EnglishLessonContent } from '@/components/learn/EnglishLessonContent';
import { ExerciseSection, Exercise } from '@/components/learn/ExerciseSection';
import { LessonCompletionCard } from '@/components/learn/LessonCompletionCard';
import { LessonQuiz } from '@/components/learn/LessonQuiz';
import { useAuth } from '@/lib/auth';
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  BookOpen,
  Brain,
  Target,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type LessonPhase = 'content' | 'vocabulary' | 'grammar' | 'exercises' | 'pre-quiz' | 'quiz' | 'complete';

interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

interface EnglishGrammarPattern {
  pattern: string;
  title: string;
  explanation: string;
  formula?: string;
  examples: { en: string; id: string; isPositive?: boolean }[];
  tip?: string;
}

export default function EnglishLessonView() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [currentPhase, setCurrentPhase] = useState<LessonPhase>('content');
  const [contentIndex, setContentIndex] = useState(0);
  const [vocabIndex, setVocabIndex] = useState(0);
  const [grammarIndex, setGrammarIndex] = useState(0);
  const [exerciseScore, setExerciseScore] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [direction, setDirection] = useState(0);

  // Fetch lesson details
  const { data: lesson, isLoading: lessonLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*, chapters(*)')
        .eq('id', lessonId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!lessonId,
  });

  // Fetch vocabulary for this lesson
  const { data: vocabulary = [] } = useQuery({
    queryKey: ['vocabulary', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vocabulary')
        .select('*')
        .eq('lesson_id', lessonId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!lessonId,
  });

  // Fetch quiz questions for this lesson
  const { data: quizQuestions = [] } = useQuery({
    queryKey: ['quiz-questions', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('lesson_id', lessonId);

      if (error) throw error;

      return (data || []).map(q => ({
        id: q.id,
        questionText: q.question_text,
        options: (q.options as string[]) || [],
        correctAnswer: q.correct_answer,
        explanation: q.explanation,
      })) as QuizQuestion[];
    },
    enabled: !!lessonId,
  });

  // Parse lesson content sections
  const contentSections = useMemo(() => {
    if (!lesson?.content) return [];
    const content = lesson.content as any;
    return content.sections || [];
  }, [lesson]);

  const keyPoints = useMemo(() => {
    if (!lesson?.content) return [];
    const content = lesson.content as any;
    return content.key_points || [];
  }, [lesson]);

  // Parse grammar patterns from lesson content
  const grammarPatterns: EnglishGrammarPattern[] = useMemo(() => {
    if (!lesson?.content) return [];
    const content = lesson.content as any;
    return content.grammar_patterns || [];
  }, [lesson]);

  // Generate exercises from vocabulary
  const exercises: Exercise[] = useMemo(() => {
    if (vocabulary.length === 0) return [];

    const exerciseList: Exercise[] = [];

    // Generate fill-blank exercises from vocabulary
    // For English: word_jp stores English word, meaning_id stores Indonesian meaning
    vocabulary.slice(0, 3).forEach((vocab, idx) => {
      if (vocab.example_jp && vocab.example_id) {
        exerciseList.push({
          id: `fill-${idx}`,
          type: 'fill-blank',
          data: {
            sentence: vocab.example_jp.replace(vocab.word_jp, '___'),
            hint: vocab.meaning_id,
            options: [
              vocab.word_jp,
              vocabulary[(idx + 1) % vocabulary.length]?.word_jp || 'the',
              vocabulary[(idx + 2) % vocabulary.length]?.word_jp || 'is',
              vocabulary[(idx + 3) % vocabulary.length]?.word_jp || 'a',
            ].sort(() => Math.random() - 0.5),
            correctAnswer: vocab.word_jp,
            translation: vocab.example_id,
          },
        });
      }
    });

    // Generate listening exercise
    if (vocabulary.length > 0) {
      const randomVocab = vocabulary[Math.floor(Math.random() * vocabulary.length)];
      exerciseList.push({
        id: 'listening-1',
        type: 'listening',
        data: {
          audioText: randomVocab.word_jp,
          options: vocabulary.slice(0, 4).map(v => ({
            label: v.meaning_id,
            value: v.meaning_id,
          })),
          correctAnswer: randomVocab.meaning_id,
        },
      });
    }

    return exerciseList;
  }, [vocabulary]);

  const totalContent = contentSections.length;
  const totalVocab = vocabulary.length;
  const totalGrammar = grammarPatterns.length;
  const hasExercises = exercises.length > 0;
  const hasQuiz = quizQuestions.length > 0;

  // Calculate overall progress
  const getOverallProgress = () => {
    const phases = [totalContent > 0, totalVocab > 0, totalGrammar > 0, hasExercises, hasQuiz].filter(Boolean).length;
    const phaseWeight = phases > 0 ? 90 / phases : 90;
    let progress = 0;
    let phaseIdx = 0;

    if (totalContent > 0) {
      if (currentPhase === 'content') return phaseIdx * phaseWeight + ((contentIndex + 1) / totalContent) * phaseWeight;
      phaseIdx++;
    }
    if (totalVocab > 0) {
      if (currentPhase === 'vocabulary') return phaseIdx * phaseWeight + ((vocabIndex + 1) / totalVocab) * phaseWeight;
      phaseIdx++;
    }
    if (totalGrammar > 0) {
      if (currentPhase === 'grammar') return phaseIdx * phaseWeight + ((grammarIndex + 1) / totalGrammar) * phaseWeight;
      phaseIdx++;
    }
    if (hasExercises) {
      if (currentPhase === 'exercises') return phaseIdx * phaseWeight + phaseWeight * 0.5;
      phaseIdx++;
    }
    if (currentPhase === 'pre-quiz') return 80;
    if (currentPhase === 'quiz') return 90;
    if (currentPhase === 'complete') return 100;
    return progress;
  };

  // Save progress mutation
  const saveProgressMutation = useMutation({
    mutationFn: async ({ completed, xpEarned }: { completed: boolean; xpEarned: number }) => {
      if (!user?.id || !lessonId || !lesson?.chapter_id) return;

      const { data: existing } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('user_progress')
          .update({
            completed,
            progress_percent: completed ? 100 : Math.round(getOverallProgress()),
            xp_earned: xpEarned,
            completed_at: completed ? new Date().toISOString() : null,
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
            chapter_id: lesson.chapter_id,
            completed,
            progress_percent: completed ? 100 : Math.round(getOverallProgress()),
            xp_earned: xpEarned,
            completed_at: completed ? new Date().toISOString() : null,
          });
      }

      if (completed && xpEarned > 0) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('total_xp, lessons_completed')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({
              total_xp: (profile.total_xp || 0) + xpEarned,
              lessons_completed: (profile.lessons_completed || 0) + 1,
            })
            .eq('user_id', user.id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const handleComplete = useCallback(async (xp: number) => {
    setEarnedXP(xp);
    setCurrentPhase('complete');

    try {
      await saveProgressMutation.mutateAsync({ completed: true, xpEarned: xp });
      toast.success(`Well done! You earned ${xp} XP!`);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [saveProgressMutation]);

  // Navigation handlers
  const handleNextContent = useCallback(() => {
    setDirection(1);
    if (contentIndex < totalContent - 1) {
      setContentIndex(prev => prev + 1);
    } else if (totalVocab > 0) {
      setCurrentPhase('vocabulary');
      setVocabIndex(0);
    } else if (totalGrammar > 0) {
      setCurrentPhase('grammar');
      setGrammarIndex(0);
    } else if (hasExercises) {
      setCurrentPhase('exercises');
    } else if (hasQuiz) {
      setCurrentPhase('pre-quiz');
    } else {
      handleComplete(lesson?.xp_reward || 10);
    }
  }, [contentIndex, totalContent, totalVocab, totalGrammar, hasExercises, hasQuiz, lesson?.xp_reward, handleComplete]);

  const handlePrevContent = useCallback(() => {
    setDirection(-1);
    if (contentIndex > 0) {
      setContentIndex(prev => prev - 1);
    }
  }, [contentIndex]);

  const handleNextVocab = useCallback(() => {
    setDirection(1);
    if (vocabIndex < totalVocab - 1) {
      setVocabIndex(prev => prev + 1);
    } else if (totalGrammar > 0) {
      setCurrentPhase('grammar');
      setGrammarIndex(0);
    } else if (hasExercises) {
      setCurrentPhase('exercises');
    } else if (hasQuiz) {
      setCurrentPhase('pre-quiz');
    } else {
      handleComplete(lesson?.xp_reward || 10);
    }
  }, [vocabIndex, totalVocab, totalGrammar, hasExercises, hasQuiz, lesson?.xp_reward, handleComplete]);

  const handlePrevVocab = useCallback(() => {
    setDirection(-1);
    if (vocabIndex > 0) {
      setVocabIndex(prev => prev - 1);
    } else if (totalContent > 0) {
      setCurrentPhase('content');
      setContentIndex(totalContent - 1);
    }
  }, [vocabIndex, totalContent]);

  const handleNextGrammar = useCallback(() => {
    setDirection(1);
    if (grammarIndex < totalGrammar - 1) {
      setGrammarIndex(prev => prev + 1);
    } else if (hasExercises) {
      setCurrentPhase('exercises');
    } else if (hasQuiz) {
      setCurrentPhase('pre-quiz');
    } else {
      handleComplete(lesson?.xp_reward || 10);
    }
  }, [grammarIndex, totalGrammar, hasExercises, hasQuiz, lesson?.xp_reward, handleComplete]);

  const handlePrevGrammar = useCallback(() => {
    setDirection(-1);
    if (grammarIndex > 0) {
      setGrammarIndex(prev => prev - 1);
    } else if (totalVocab > 0) {
      setCurrentPhase('vocabulary');
      setVocabIndex(totalVocab - 1);
    }
  }, [grammarIndex, totalVocab]);

  const handleExerciseComplete = useCallback((correct: number, total: number) => {
    const score = total > 0 ? Math.round((correct / total) * 100) : 100;
    setExerciseScore(score);

    if (hasQuiz) {
      setCurrentPhase('pre-quiz');
    } else {
      handleComplete(lesson?.xp_reward || 10);
    }
  }, [hasQuiz, lesson?.xp_reward, handleComplete]);

  const handleQuizComplete = useCallback((score: number, total: number) => {
    const percentage = total > 0 ? (score / total) : 0;
    const xp = Math.round(percentage * (lesson?.xp_reward || 10));

    if (percentage >= 0.6) {
      handleComplete(xp);
    } else {
      setCurrentPhase('vocabulary');
      setVocabIndex(0);
      setGrammarIndex(0);
      toast.error('Try again! You need at least 60% to pass.');
    }
  }, [lesson?.xp_reward, handleComplete]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentPhase === 'content') {
        if (e.key === 'ArrowRight') handleNextContent();
        if (e.key === 'ArrowLeft') handlePrevContent();
      }
      if (currentPhase === 'vocabulary') {
        if (e.key === 'ArrowRight') handleNextVocab();
        if (e.key === 'ArrowLeft') handlePrevVocab();
      }
      if (currentPhase === 'grammar') {
        if (e.key === 'ArrowRight') handleNextGrammar();
        if (e.key === 'ArrowLeft') handlePrevGrammar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPhase, handleNextContent, handlePrevContent, handleNextVocab, handlePrevVocab, handleNextGrammar, handlePrevGrammar]);

  // Determine initial phase
  useEffect(() => {
    if (totalContent > 0) {
      setCurrentPhase('content');
    } else if (totalVocab > 0) {
      setCurrentPhase('vocabulary');
    } else if (totalGrammar > 0) {
      setCurrentPhase('grammar');
    } else if (hasExercises) {
      setCurrentPhase('exercises');
    } else if (hasQuiz) {
      setCurrentPhase('quiz');
    }
  }, [totalContent, totalVocab, totalGrammar, hasExercises, hasQuiz]);

  if (lessonLoading) {
    return (
      <AppLayout hideNav>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 300 : -300, opacity: 0, scale: 0.95 }),
  };

  return (
    <AppLayout hideNav>
      <div className="pt-safe pb-8 min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
        {/* Header */}
        <div className="bg-card/80 backdrop-blur-lg border-b border-border sticky top-0 z-10">
          <div className="container max-w-lg mx-auto px-4 py-4">
            <div className="flex items-center gap-3 mb-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/chapter/${lesson?.chapter_id}`)}
                className="shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold truncate">{lesson?.title_jp}</h1>
                <p className="text-sm text-muted-foreground truncate">{lesson?.title_id}</p>
              </div>
            </div>

            {/* Phase Indicators */}
            <div className="flex items-center gap-2 mb-3">
              {totalContent > 0 && (
                <div className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors",
                  currentPhase === 'content' ? "bg-emerald-600/10 text-emerald-600" : "bg-muted text-muted-foreground"
                )}>
                  <BookOpen className="h-3 w-3" />
                  <span>Lesson</span>
                </div>
              )}
              {totalVocab > 0 && (
                <div className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors",
                  currentPhase === 'vocabulary' ? "bg-blue-600/10 text-blue-600" : "bg-muted text-muted-foreground"
                )}>
                  <BookOpen className="h-3 w-3" />
                  <span>Vocab</span>
                </div>
              )}
              {totalGrammar > 0 && (
                <div className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors",
                  currentPhase === 'grammar' ? "bg-indigo-600/10 text-indigo-600" : "bg-muted text-muted-foreground"
                )}>
                  <Brain className="h-3 w-3" />
                  <span>Grammar</span>
                </div>
              )}
              {hasExercises && (
                <div className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors",
                  currentPhase === 'exercises' ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                )}>
                  <Target className="h-3 w-3" />
                  <span>Practice</span>
                </div>
              )}
              {hasQuiz && (
                <div className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors",
                  ['pre-quiz', 'quiz'].includes(currentPhase) ? "bg-amber-500/10 text-amber-600" : "bg-muted text-muted-foreground"
                )}>
                  <Zap className="h-3 w-3" />
                  <span>Quiz</span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-success rounded-full"
                animate={{ width: `${getOverallProgress()}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 container max-w-lg mx-auto px-4 py-6 flex flex-col">
          <AnimatePresence mode="wait" custom={direction}>
            {/* Content Phase */}
            {currentPhase === 'content' && contentSections.length > 0 && (
              <motion.div
                key={`content-${contentIndex}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex-1"
              >
                <EnglishLessonContent
                  lessonTitle={lesson?.title_jp || ''}
                  lessonTitleId={lesson?.title_id || ''}
                  sections={contentSections}
                  keyPoints={keyPoints}
                  currentSection={contentIndex}
                  totalSections={totalContent}
                />
              </motion.div>
            )}

            {/* Vocabulary Phase */}
            {currentPhase === 'vocabulary' && vocabulary.length > 0 && (
              <motion.div
                key={`vocab-${vocabIndex}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex-1"
              >
                <EnglishVocabularyCard
                  word={vocabulary[vocabIndex].word_jp}
                  ipa={vocabulary[vocabIndex].reading || undefined}
                  partOfSpeech={(vocabulary[vocabIndex] as any).part_of_speech || undefined}
                  meaningId={vocabulary[vocabIndex].meaning_id}
                  exampleEn={vocabulary[vocabIndex].example_jp || undefined}
                  exampleId={vocabulary[vocabIndex].example_id || undefined}
                  currentIndex={vocabIndex}
                  totalCount={totalVocab}
                  category={vocabulary[vocabIndex].category || undefined}
                />

                {/* Dot Indicators */}
                <div className="flex justify-center gap-2 mt-6 flex-wrap">
                  {vocabulary.slice(0, 15).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setDirection(index > vocabIndex ? 1 : -1);
                        setVocabIndex(index);
                      }}
                      className={cn(
                        "transition-all duration-300 rounded-full",
                        index === vocabIndex
                          ? "w-6 h-2 bg-blue-600"
                          : index < vocabIndex
                          ? "w-2 h-2 bg-blue-600/50"
                          : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      )}
                    />
                  ))}
                  {vocabulary.length > 15 && (
                    <span className="text-xs text-muted-foreground">+{vocabulary.length - 15}</span>
                  )}
                </div>
              </motion.div>
            )}

            {/* Grammar Phase */}
            {currentPhase === 'grammar' && grammarPatterns.length > 0 && (
              <motion.div
                key={`grammar-${grammarIndex}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex-1"
              >
                <EnglishGrammarCard
                  patterns={grammarPatterns}
                  currentIndex={grammarIndex}
                  totalCount={totalGrammar}
                  onNext={handleNextGrammar}
                  onPrev={handlePrevGrammar}
                />
              </motion.div>
            )}

            {/* Exercises Phase */}
            {currentPhase === 'exercises' && (
              <motion.div
                key="exercises"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1"
              >
                <ExerciseSection
                  exercises={exercises}
                  onComplete={handleExerciseComplete}
                />
              </motion.div>
            )}

            {/* Pre-Quiz Phase */}
            {currentPhase === 'pre-quiz' && (
              <motion.div
                key="pre-quiz"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1"
              >
                <LessonCompletionCard
                  lessonTitle={lesson?.title_id || ''}
                  vocabCount={totalVocab}
                  grammarCount={totalGrammar}
                  exerciseScore={exerciseScore}
                  xpEarned={lesson?.xp_reward || 10}
                  hasQuiz={hasQuiz}
                  onTakeQuiz={() => setCurrentPhase('quiz')}
                  onReview={() => {
                    setCurrentPhase('vocabulary');
                    setVocabIndex(0);
                    setGrammarIndex(0);
                  }}
                />
              </motion.div>
            )}

            {/* Quiz Phase */}
            {currentPhase === 'quiz' && quizQuestions.length > 0 && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1"
              >
                <LessonQuiz
                  questions={quizQuestions}
                  xpReward={lesson?.xp_reward || 10}
                  onComplete={handleQuizComplete}
                />
              </motion.div>
            )}

            {/* Complete Phase */}
            {currentPhase === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center py-8"
              >
                <LessonCompletionCard
                  lessonTitle={lesson?.title_id || ''}
                  vocabCount={totalVocab}
                  grammarCount={totalGrammar}
                  exerciseScore={exerciseScore}
                  xpEarned={earnedXP}
                  hasQuiz={false}
                  onTakeQuiz={() => navigate(`/chapter/${lesson?.chapter_id}`)}
                  onReview={() => navigate('/home')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        {(currentPhase === 'content' || currentPhase === 'vocabulary' || currentPhase === 'grammar') && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="bg-card/80 backdrop-blur-lg border-t border-border"
          >
            <div className="container max-w-lg mx-auto px-4 py-4">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={
                    currentPhase === 'content' ? handlePrevContent
                    : currentPhase === 'vocabulary' ? handlePrevVocab
                    : handlePrevGrammar
                  }
                  disabled={
                    (currentPhase === 'content' && contentIndex === 0) ||
                    (currentPhase === 'vocabulary' && vocabIndex === 0 && totalContent === 0) ||
                    (currentPhase === 'grammar' && grammarIndex === 0 && totalVocab === 0 && totalContent === 0)
                  }
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Previous
                </Button>
                <Button
                  size="lg"
                  className={cn(
                    "flex-1 transition-all",
                    ((currentPhase === 'content' && contentIndex === totalContent - 1 && totalVocab === 0 && totalGrammar === 0) ||
                     (currentPhase === 'vocabulary' && vocabIndex === totalVocab - 1 && totalGrammar === 0) ||
                     (currentPhase === 'grammar' && grammarIndex === totalGrammar - 1)) &&
                    "bg-gradient-to-r from-blue-600 to-success hover:opacity-90"
                  )}
                  onClick={
                    currentPhase === 'content' ? handleNextContent
                    : currentPhase === 'vocabulary' ? handleNextVocab
                    : handleNextGrammar
                  }
                >
                  {currentPhase === 'content' && contentIndex === totalContent - 1
                    ? totalVocab > 0 ? 'Vocab \u2192' : totalGrammar > 0 ? 'Grammar \u2192' : hasExercises ? 'Practice \u2192' : 'Complete \u2728'
                    : currentPhase === 'vocabulary' && vocabIndex === totalVocab - 1
                    ? totalGrammar > 0 ? 'Grammar \u2192' : hasExercises ? 'Practice \u2192' : 'Complete \u2728'
                    : currentPhase === 'grammar' && grammarIndex === totalGrammar - 1
                    ? hasExercises ? 'Practice \u2192' : hasQuiz ? 'Quiz \u2192' : 'Complete \u2728'
                    : 'Next'
                  }
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Floating Chat Button */}
        {['content', 'vocabulary', 'grammar'].includes(currentPhase) && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => navigate('/chat?lang=english')}
            className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform"
          >
            <Bot className="h-6 w-6" />
          </motion.button>
        )}
      </div>
    </AppLayout>
  );
}
