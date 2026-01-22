import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { KanaChart } from '@/components/kana/KanaChart';
import { KanaDetailModal } from '@/components/kana/KanaDetailModal';
import { KanaQuiz } from '@/components/kana/KanaQuiz';
import { KanaProgressCard } from '@/components/kana/KanaProgressCard';
import { useKanaCharacters, useKanaRows, KanaCharacter } from '@/hooks/useKana';
import { ArrowLeft, BookOpen, Brain, Grid3X3, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'overview' | 'chart' | 'lesson' | 'quiz';
type KanaType = 'hiragana' | 'katakana';

export default function KanaLearn() {
  const navigate = useNavigate();
  const [kanaType, setKanaType] = useState<KanaType>('hiragana');
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedCharacter, setSelectedCharacter] = useState<KanaCharacter | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  
  const { data: characters = [] } = useKanaCharacters(kanaType);
  const rows = useKanaRows(kanaType);
  
  // Get all characters for navigation in modal
  const allCharacters = useMemo(() => {
    return [...characters].sort((a, b) => a.order_index - b.order_index);
  }, [characters]);
  
  const currentCharIndex = selectedCharacter 
    ? allCharacters.findIndex(c => c.id === selectedCharacter.id)
    : -1;
  
  const handleCharacterClick = (char: KanaCharacter) => {
    setSelectedCharacter(char);
    setShowModal(true);
  };
  
  const handleNextCharacter = () => {
    if (currentCharIndex < allCharacters.length - 1) {
      setSelectedCharacter(allCharacters[currentCharIndex + 1]);
    }
  };
  
  const handlePreviousCharacter = () => {
    if (currentCharIndex > 0) {
      setSelectedCharacter(allCharacters[currentCharIndex - 1]);
    }
  };
  
  const handleRowLesson = (rowIndex: number) => {
    setSelectedRowIndex(rowIndex);
    setViewMode('lesson');
  };
  
  const handleQuizComplete = (score: number, total: number) => {
    setViewMode('overview');
    setSelectedRowIndex(null);
  };
  
  const handleBack = () => {
    if (viewMode === 'overview') {
      navigate('/learn');
    } else {
      setViewMode('overview');
      setSelectedRowIndex(null);
    }
  };
  
  // Get characters for current lesson/quiz
  const lessonCharacters = useMemo(() => {
    if (selectedRowIndex !== null && rows[selectedRowIndex]) {
      return rows[selectedRowIndex].characters;
    }
    return characters;
  }, [selectedRowIndex, rows, characters]);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleBack}
              className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-bold text-lg">
                {viewMode === 'overview' && 'Belajar Kana'}
                {viewMode === 'chart' && (kanaType === 'hiragana' ? 'Tabel Hiragana' : 'Tabel Katakana')}
                {viewMode === 'lesson' && `Pelajaran: ${rows[selectedRowIndex!]?.label || ''}`}
                {viewMode === 'quiz' && 'Kuis Kana'}
              </h1>
              {viewMode === 'overview' && (
                <p className="text-sm text-muted-foreground">JLPT N5 • Dasar</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-4 py-6 pb-24">
        <AnimatePresence mode="wait">
          {viewMode === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Type Selector */}
              <div className="bg-muted rounded-xl p-1.5 flex">
                {(['hiragana', 'katakana'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setKanaType(type)}
                    className={cn(
                      "flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all",
                      kanaType === type 
                        ? "bg-card shadow-sm text-foreground" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {type === 'hiragana' ? 'ひらがな' : 'カタカナ'}
                    <span className="ml-1.5 text-xs opacity-70">
                      {type === 'hiragana' ? 'Hiragana' : 'Katakana'}
                    </span>
                  </button>
                ))}
              </div>
              
              {/* Progress Card */}
              <KanaProgressCard type={kanaType} />
              
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => setViewMode('chart')}
                >
                  <Grid3X3 className="h-6 w-6 text-primary" />
                  <span>Lihat Tabel</span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => {
                    setSelectedRowIndex(null);
                    setViewMode('quiz');
                  }}
                >
                  <Brain className="h-6 w-6 text-secondary" />
                  <span>Kuis Semua</span>
                </Button>
              </div>
              
              {/* Row Lessons */}
              <div className="space-y-3">
                <h2 className="font-semibold text-lg">Pelajaran per Baris</h2>
                
                {rows.map((row, index) => (
                  <motion.button
                    key={row.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleRowLesson(index)}
                    className="w-full bg-card rounded-xl p-4 border border-border shadow-card flex items-center gap-4 hover:border-primary/50 transition-all text-left"
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center font-jp text-xl font-bold",
                      row.progress === 100 
                        ? "bg-success/20 text-success" 
                        : "bg-primary/10 text-primary"
                    )}>
                      {row.characters[0]?.character}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{row.label}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              row.progress === 100 ? "bg-success" : "bg-primary"
                            )}
                            style={{ width: `${row.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(row.progress)}%
                        </span>
                      </div>
                    </div>
                    
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
          
          {viewMode === 'chart' && (
            <motion.div
              key="chart"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <KanaChart 
                type={kanaType} 
                onCharacterClick={handleCharacterClick}
              />
            </motion.div>
          )}
          
          {viewMode === 'lesson' && selectedRowIndex !== null && (
            <motion.div
              key="lesson"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <p className="text-muted-foreground text-center">
                Ketuk karakter untuk mempelajari lebih lanjut
              </p>
              
              <div className="grid grid-cols-5 gap-3">
                {lessonCharacters.map((char, index) => (
                  <motion.button
                    key={char.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleCharacterClick(char)}
                    className="aspect-square rounded-xl bg-card border-2 border-border flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    <span className="text-3xl font-jp font-medium">{char.character}</span>
                    <span className="text-xs text-muted-foreground mt-1">{char.romaji}</span>
                  </motion.button>
                ))}
              </div>
              
              <div className="pt-4 space-y-2">
                <Button 
                  size="xl" 
                  className="w-full"
                  onClick={() => setViewMode('quiz')}
                >
                  Mulai Kuis Baris Ini
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full"
                  onClick={() => setViewMode('overview')}
                >
                  Kembali
                </Button>
              </div>
            </motion.div>
          )}
          
          {viewMode === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <KanaQuiz 
                characters={lessonCharacters}
                onComplete={handleQuizComplete}
                questionCount={selectedRowIndex !== null ? lessonCharacters.length : 10}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Character Detail Modal */}
      <KanaDetailModal
        character={selectedCharacter}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onNext={handleNextCharacter}
        onPrevious={handlePreviousCharacter}
        hasNext={currentCharIndex < allCharacters.length - 1}
        hasPrevious={currentCharIndex > 0}
      />
    </div>
  );
}
