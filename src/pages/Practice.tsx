import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Layers, Target, FileText, ChevronRight, Play, Flame, Clock, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { MockTestCard } from '@/components/mocktest/MockTestCard';
import { TestHistory } from '@/components/mocktest/TestHistory';
import { TestAttempt } from '@/hooks/useMockTest';

type PracticeTab = 'flashcard' | 'quiz' | 'test';

const flashcardDecks = [
  { id: 'review-today', name: 'Review Hari Ini', count: 15, icon: '📚', progress: 0 },
  { id: 'im-japan-1', name: 'IM Japan Bab 1', count: 7, icon: '🏭', progress: 45 },
  { id: 'all-vocab', name: 'Semua Kosakata', count: 15, icon: '🔢', progress: 80 },
  { id: 'hiragana', name: 'Hiragana', count: 46, icon: 'あ', progress: 0 },
];

const quizzes = [
  { id: 1, name: 'Tantangan Harian', questions: 10, xp: 50, icon: '🔥', type: 'daily' },
  { id: 2, name: 'Bab 1: Perkenalan', questions: 15, xp: 30, icon: '📝', type: 'chapter' },
  { id: 3, name: 'Bab 2: Percakapan', questions: 20, xp: 40, icon: '📝', type: 'chapter', locked: true },
];

const mockTests = [
  { id: 'kakunin', name: 'IM Japan Kakunin', duration: 30, questions: 30, icon: '🏭', description: 'Simulasi tes bahasa Kemnaker', isPremium: false },
  { id: 'jlpt_n5', name: 'JLPT N5 Mini Test', duration: 20, questions: 20, icon: '📜', description: 'Latihan format JLPT', isPremium: true },
];

export default function Practice() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<PracticeTab>('flashcard');
  
  // Fetch test history
  const { data: testHistory = [] } = useQuery({
    queryKey: ['test-history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('test_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as TestAttempt[];
    },
    enabled: !!user
  });
  
  // Calculate best scores per test type
  const getBestScore = (testType: string) => {
    const attempts = testHistory.filter(a => a.test_type === testType);
    if (attempts.length === 0) return undefined;
    const best = Math.max(...attempts.map(a => Math.round((a.score / a.total_questions) * 100)));
    return best;
  };
  
  return (
    <AppLayout>
      <div className="pt-safe">
        {/* Header */}
        <div className="bg-gradient-success">
          <div className="container max-w-lg mx-auto px-4 pt-6 pb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-2xl font-bold text-success-foreground mb-2">
                Latihan
              </h1>
              <p className="text-success-foreground/80 text-sm">
                Asah kemampuan dengan berbagai latihan
              </p>
            </motion.div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="container max-w-lg mx-auto px-4 -mt-4">
          <div className="bg-card rounded-2xl shadow-elevated p-1.5 flex gap-1">
            <Button
              variant="tab"
              data-active={activeTab === 'flashcard'}
              className="flex-1"
              onClick={() => setActiveTab('flashcard')}
            >
              <Layers className="h-4 w-4 mr-1" />
              Flashcard
            </Button>
            <Button
              variant="tab"
              data-active={activeTab === 'quiz'}
              className="flex-1"
              onClick={() => setActiveTab('quiz')}
            >
              <Target className="h-4 w-4 mr-1" />
              Kuis
            </Button>
            <Button
              variant="tab"
              data-active={activeTab === 'test'}
              className="flex-1"
              onClick={() => setActiveTab('test')}
            >
              <FileText className="h-4 w-4 mr-1" />
              Tes
            </Button>
          </div>
        </div>
        
        {/* Content */}
        <div className="container max-w-lg mx-auto px-4 py-6">
          {activeTab === 'flashcard' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="font-semibold text-lg mb-2">Pilih Deck</h2>
              {flashcardDecks.map((deck, index) => (
                <motion.button
                  key={deck.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => navigate('/flashcard')}
                  className="w-full bg-card rounded-xl p-4 text-left shadow-card hover:shadow-elevated transition-all border border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center text-xl">
                      {deck.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{deck.name}</h3>
                      <p className="text-sm text-muted-foreground">{deck.count} kartu</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-secondary rounded-full"
                            style={{ width: `${deck.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{deck.progress}%</span>
                      </div>
                    </div>
                    <Play className="h-5 w-5 text-muted-foreground" />
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
          
          {activeTab === 'quiz' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {quizzes.map((quiz, index) => (
                <motion.button
                  key={quiz.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  disabled={quiz.locked}
                  className={`w-full bg-card rounded-xl p-4 text-left shadow-card hover:shadow-elevated transition-all border border-border ${
                    quiz.locked ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                      quiz.type === 'daily' ? 'bg-gradient-streak' : 'bg-gradient-success'
                    }`}>
                      {quiz.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{quiz.name}</h3>
                        {quiz.type === 'daily' && (
                          <Flame className="h-4 w-4 text-streak" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {quiz.questions} soal • +{quiz.xp} XP
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
          
          {activeTab === 'test' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                  💡 Tes simulasi ini dirancang seperti ujian asli. Pastikan kamu punya waktu yang cukup sebelum memulai.
                </p>
              </div>
              
              {/* Test Cards */}
              <div className="space-y-4">
                {mockTests.map((test, index) => (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <MockTestCard
                      id={test.id}
                      title={test.name}
                      description={test.description}
                      questionCount={test.questions}
                      timeMinutes={test.duration}
                      icon={test.icon}
                      isPremium={test.isPremium}
                      isLocked={test.isPremium} // For now, lock premium tests
                      bestScore={getBestScore(test.id)}
                      onStart={() => navigate(`/mock-test?type=${test.id}`)}
                    />
                  </motion.div>
                ))}
              </div>
              
              {/* Test History */}
              {testHistory.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    Riwayat Tes
                  </h3>
                  <TestHistory attempts={testHistory} />
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
