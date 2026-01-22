import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Layers, Target, FileText, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { MockTestCard } from '@/components/mocktest/MockTestCard';
import { TestHistory } from '@/components/mocktest/TestHistory';
import { TestAttempt } from '@/hooks/useMockTest';
import { useSubscription, isPremiumActive } from '@/hooks/useSubscription';
import { PremiumUpgradeModal } from '@/components/subscription/PremiumUpgradeModal';
import { FlashcardSection } from '@/components/flashcard/FlashcardSection';
import { QuizPracticeSection } from '@/components/quiz/QuizPracticeSection';

type PracticeTab = 'flashcard' | 'quiz' | 'test';

const mockTests = [
  { id: 'kakunin', name: 'IM Japan Kakunin', duration: 30, questions: 30, icon: '🏭', description: 'Simulasi tes bahasa Kemnaker', isPremium: false },
  { id: 'jlpt_n5', name: 'JLPT N5 Mock Test', duration: 60, questions: 55, icon: '📜', description: 'Latihan format JLPT N5', isPremium: false },
];

export default function Practice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const initialTab = (searchParams.get('tab') as PracticeTab) || 'flashcard';
  const [activeTab, setActiveTab] = useState<PracticeTab>(initialTab);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  
  const { data: subscription } = useSubscription();
  const isPremium = isPremiumActive(subscription);
  
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
  
  const canTakeTest = (testType: string) => {
    if (isPremium) return true;
    const today = new Date().toDateString();
    const todayAttempts = testHistory.filter(
      a => a.test_type === testType && new Date(a.completed_at).toDateString() === today
    );
    return todayAttempts.length === 0;
  };
  
  const getBestScore = (testType: string) => {
    const attempts = testHistory.filter(a => a.test_type === testType);
    if (attempts.length === 0) return undefined;
    return Math.max(...attempts.map(a => Math.round((a.score / a.total_questions) * 100)));
  };
  
  const handleStartTest = (testId: string, testIsPremium: boolean) => {
    if (testIsPremium && !isPremium) {
      setShowPremiumModal(true);
      return;
    }
    if (!canTakeTest(testId)) {
      setShowPremiumModal(true);
      return;
    }
    navigate(`/mock-test?type=${testId}`);
  };
  
  return (
    <AppLayout>
      <div className="pt-safe">
        <div className="bg-gradient-success">
          <div className="container max-w-lg mx-auto px-4 pt-6 pb-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-2xl font-bold text-success-foreground mb-2">Latihan</h1>
              <p className="text-success-foreground/80 text-sm">Asah kemampuan dengan berbagai latihan</p>
            </motion.div>
          </div>
        </div>
        
        <div className="container max-w-lg mx-auto px-4 -mt-4">
          <div className="bg-card rounded-2xl shadow-elevated p-1.5 flex gap-1">
            <Button variant="tab" data-active={activeTab === 'flashcard'} className="flex-1" onClick={() => setActiveTab('flashcard')}>
              <Layers className="h-4 w-4 mr-1" />Flashcard
            </Button>
            <Button variant="tab" data-active={activeTab === 'quiz'} className="flex-1" onClick={() => setActiveTab('quiz')}>
              <Target className="h-4 w-4 mr-1" />Kuis
            </Button>
            <Button variant="tab" data-active={activeTab === 'test'} className="flex-1" onClick={() => setActiveTab('test')}>
              <FileText className="h-4 w-4 mr-1" />Tes
            </Button>
          </div>
        </div>
        
        <div className="container max-w-lg mx-auto px-4 py-6">
          {activeTab === 'flashcard' && <FlashcardSection />}
          
          {activeTab === 'quiz' && <QuizPracticeSection />}
          
          {activeTab === 'test' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">💡 Tes simulasi ini dirancang seperti ujian asli. Pastikan kamu punya waktu yang cukup sebelum memulai.</p>
              </div>
              <div className="space-y-4">
                {mockTests.map((test, index) => {
                  const isLocked = test.isPremium && !isPremium;
                  const canStart = canTakeTest(test.id);
                  return (
                    <motion.div key={test.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                      <MockTestCard id={test.id} title={test.name} description={test.description} questionCount={test.questions} timeMinutes={test.duration} icon={test.icon}
                        isPremium={test.isPremium} isLocked={isLocked || (!isPremium && !canStart)} bestScore={getBestScore(test.id)} onStart={() => handleStartTest(test.id, test.isPremium)} />
                      {!isPremium && !canStart && !isLocked && <p className="text-xs text-muted-foreground mt-1 text-center">⏰ Upgrade ke Premium untuk unlimited test hari ini</p>}
                    </motion.div>
                  );
                })}
              </div>
              {testHistory.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-500" />Riwayat Tes</h3>
                  <TestHistory attempts={testHistory} />
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
      <PremiumUpgradeModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
    </AppLayout>
  );
}
