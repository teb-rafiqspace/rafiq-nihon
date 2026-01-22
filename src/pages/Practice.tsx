import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Layers, Target, FileText, ChevronRight, Play, Flame } from 'lucide-react';

type PracticeTab = 'flashcard' | 'quiz' | 'test';

const flashcardDecks = [
  { id: 1, name: 'Angka 1-100', count: 100, icon: '🔢', progress: 45 },
  { id: 2, name: 'Salam & Sapaan', count: 20, icon: '👋', progress: 80 },
  { id: 3, name: 'Kata Kerja Dasar', count: 50, icon: '🏃', progress: 10 },
  { id: 4, name: 'Hiragana', count: 46, icon: 'あ', progress: 0 },
];

const quizzes = [
  { id: 1, name: 'Tantangan Harian', questions: 10, xp: 50, icon: '🔥', type: 'daily' },
  { id: 2, name: 'Bab 1: Perkenalan', questions: 15, xp: 30, icon: '📝', type: 'chapter' },
  { id: 3, name: 'Bab 2: Percakapan', questions: 20, xp: 40, icon: '📝', type: 'chapter', locked: true },
];

const mockTests = [
  { id: 1, name: 'Tes Kakunin', duration: 30, questions: 50, icon: '🏭', description: 'Simulasi tes Kemnaker' },
  { id: 2, name: 'JLPT N5 Mock', duration: 45, questions: 70, icon: '📜', description: 'Simulasi ujian JLPT N5' },
];

export default function Practice() {
  const [activeTab, setActiveTab] = useState<PracticeTab>('flashcard');
  
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
              className="space-y-4"
            >
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-amber-800">
                  💡 Tes simulasi ini dirancang seperti ujian asli. Pastikan kamu punya waktu yang cukup sebelum memulai.
                </p>
              </div>
              
              {mockTests.map((test, index) => (
                <motion.button
                  key={test.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="w-full bg-card rounded-xl p-5 text-left shadow-card hover:shadow-elevated transition-all border border-border"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center text-2xl">
                      {test.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{test.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{test.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>⏱️ {test.duration} menit</span>
                        <span>📝 {test.questions} soal</span>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full mt-4">
                    Mulai Tes
                  </Button>
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
