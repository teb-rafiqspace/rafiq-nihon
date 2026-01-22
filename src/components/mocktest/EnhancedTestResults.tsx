import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Trophy, Clock, CheckCircle, XCircle, RotateCcw, 
  ArrowLeft, BookOpen, Star, Target
} from 'lucide-react';
import { TestResult } from '@/hooks/useMockTest';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  name: string;
  nameJp: string;
}

interface EnhancedTestResultsProps {
  result: TestResult;
  testName: string;
  testNameJp: string;
  passingScore: number;
  xpReward: number;
  sections: Section[];
  onReview: () => void;
  onRetry: () => void;
  onBack: () => void;
  formatTime: (seconds: number) => string;
  totalTime: number;
}

export function EnhancedTestResults({
  result,
  testName,
  testNameJp,
  passingScore,
  xpReward,
  sections,
  onReview,
  onRetry,
  onBack,
  formatTime,
  totalTime
}: EnhancedTestResultsProps) {
  const percentage = Math.round((result.score / result.totalQuestions) * 100);
  
  const getSectionInfo = (sectionKey: string) => {
    const section = sections.find(s => {
      // Match section key to section id
      if (s.id === sectionKey) return true;
      // Also match by name variations
      if (sectionKey === 'kosakata' && (s.id === 'vocabulary' || s.id === 'hiragana' || s.id === 'katakana')) return true;
      if (sectionKey === 'grammar' && s.id === 'grammar') return true;
      if (sectionKey === 'membaca' && s.id === 'reading') return true;
      return false;
    });
    
    // Map section keys to display names
    const sectionMap: Record<string, { name: string; nameJp: string }> = {
      'kosakata': { name: 'Kosakata', nameJp: 'ごい' },
      'grammar': { name: 'Tata Bahasa', nameJp: 'ぶんぽう' },
      'membaca': { name: 'Pemahaman Bacaan', nameJp: 'どっかい' },
      'hiragana': { name: 'Hiragana', nameJp: 'ひらがな' },
      'katakana': { name: 'Katakana', nameJp: 'カタカナ' },
      'vocabulary': { name: 'Kosakata', nameJp: 'ごい' },
      'reading': { name: 'Pemahaman Bacaan', nameJp: 'どっかい' },
    };
    
    return section || sectionMap[sectionKey] || { name: sectionKey, nameJp: '' };
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <div className={cn(
        "pt-safe pb-12 relative overflow-hidden",
        result.passed ? "bg-gradient-success" : "bg-gradient-to-b from-destructive/30 to-background"
      )}>
        {/* Confetti effect for pass */}
        {result.passed && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][i % 5]
                }}
                initial={{ y: -20, opacity: 1 }}
                animate={{ 
                  y: 400, 
                  opacity: 0,
                  rotate: Math.random() * 360
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 2
                }}
              />
            ))}
          </div>
        )}
        
        <div className="container max-w-lg mx-auto px-4 pt-8 text-center relative z-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.2 }}
            className={cn(
              "w-28 h-28 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl",
              result.passed ? "bg-white/30" : "bg-destructive/30"
            )}
          >
            {result.passed ? (
              <Trophy className="h-14 w-14 text-success-foreground drop-shadow-lg" />
            ) : (
              <Target className="h-14 w-14 text-destructive" />
            )}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className={cn(
              "text-4xl font-bold mb-2",
              result.passed ? "text-success-foreground" : "text-foreground"
            )}>
              {result.passed ? '🎉 LULUS!' : 'Belum Lulus'}
            </h1>
            
            {result.passed && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="inline-flex items-center gap-1 bg-white/30 px-3 py-1 rounded-full text-success-foreground"
              >
                <Star className="h-4 w-4 fill-current" />
                <span className="font-bold">+{xpReward} XP</span>
              </motion.div>
            )}
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={cn(
              "text-lg mt-2",
              result.passed ? "text-success-foreground/80" : "text-muted-foreground"
            )}
          >
            {testName}
          </motion.p>
        </div>
      </div>
      
      {/* Score Card */}
      <div className="container max-w-lg mx-auto px-4 -mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl p-6 shadow-elevated border border-border"
        >
          {/* Main Score */}
          <div className="text-center mb-6">
            <motion.div 
              className="text-6xl font-bold text-primary mb-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
            >
              {result.score}/{result.totalQuestions}
            </motion.div>
            <div className="text-3xl font-bold text-muted-foreground mb-4">
              {percentage}%
            </div>
            
            {/* Animated Progress Bar */}
            <div className="relative h-4 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full",
                  result.passed ? "bg-gradient-success" : "bg-destructive"
                )}
              />
              {/* Passing line indicator */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-foreground/60 rounded-full"
                style={{ left: `${passingScore}%` }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
                  {passingScore}%
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="flex justify-between items-center py-4 border-y border-border mb-6">
            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-1 text-success mb-1">
                <CheckCircle className="h-5 w-5" />
                <span className="text-2xl font-bold">{result.score}</span>
              </div>
              <p className="text-sm text-muted-foreground">Benar</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-1 text-destructive mb-1">
                <XCircle className="h-5 w-5" />
                <span className="text-2xl font-bold">{result.totalQuestions - result.score}</span>
              </div>
              <p className="text-sm text-muted-foreground">Salah</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Clock className="h-5 w-5" />
                <span className="text-2xl font-bold">{formatTime(result.timeSpent)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                / {formatTime(totalTime)}
              </p>
            </div>
          </div>
          
          {/* Section Breakdown */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              📊 Analisis Per Bagian
            </h3>
            
            {result.sectionResults.map((section, index) => {
              const sectionPercent = Math.round((section.correct / section.total) * 100);
              const sectionPassed = sectionPercent >= passingScore;
              const sectionInfo = getSectionInfo(section.section);
              
              return (
                <motion.div
                  key={section.section}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                        sectionPassed ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                      )}>
                        {sectionPassed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <span className="font-medium">{sectionInfo.name}</span>
                        {sectionInfo.nameJp && (
                          <span className="text-xs text-muted-foreground ml-2 font-japanese">
                            {sectionInfo.nameJp}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-medium">
                      {section.correct}/{section.total} ({sectionPercent}%)
                    </span>
                  </div>
                  
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${sectionPercent}%` }}
                      transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                      className={cn(
                        "h-full rounded-full",
                        sectionPassed ? "bg-success" : "bg-destructive"
                      )}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Actions */}
          <div className="space-y-3">
            <Button
              variant="default"
              size="xl"
              className="w-full"
              onClick={onReview}
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Lihat Pembahasan
            </Button>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={onRetry}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Coba Lagi
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={onBack}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Bottom padding */}
      <div className="h-8" />
    </motion.div>
  );
}
