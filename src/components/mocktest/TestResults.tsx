import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, CheckCircle, XCircle, RotateCcw, ArrowLeft, BookOpen } from 'lucide-react';
import { TestResult } from '@/hooks/useMockTest';
import { cn } from '@/lib/utils';

interface TestResultsProps {
  result: TestResult;
  testName: string;
  passingScore: number;
  onReview: () => void;
  onRetry: () => void;
  onBack: () => void;
  formatTime: (seconds: number) => string;
}

export function TestResults({
  result,
  testName,
  passingScore,
  onReview,
  onRetry,
  onBack,
  formatTime
}: TestResultsProps) {
  const percentage = Math.round((result.score / result.totalQuestions) * 100);
  
  const getSectionLabel = (section: string) => {
    switch (section) {
      case 'kosakata': return 'Kosakata';
      case 'grammar': return 'Grammar';
      case 'membaca': return 'Membaca';
      default: return section;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <div className={cn(
        "pt-safe pb-8",
        result.passed ? "bg-gradient-success" : "bg-gradient-to-b from-destructive/20 to-background"
      )}>
        <div className="container max-w-lg mx-auto px-4 pt-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4",
              result.passed ? "bg-white/20" : "bg-destructive/20"
            )}
          >
            {result.passed ? (
              <Trophy className="h-12 w-12 text-success-foreground" />
            ) : (
              <XCircle className="h-12 w-12 text-destructive" />
            )}
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={cn(
              "text-3xl font-bold mb-2",
              result.passed ? "text-success-foreground" : "text-foreground"
            )}
          >
            {result.passed ? '🎉 LULUS!' : '😢 Belum Lulus'}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={cn(
              "text-lg",
              result.passed ? "text-success-foreground/80" : "text-muted-foreground"
            )}
          >
            {testName}
          </motion.p>
        </div>
      </div>
      
      {/* Score Card */}
      <div className="container max-w-lg mx-auto px-4 -mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl p-6 shadow-elevated border border-border"
        >
          {/* Main Score */}
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-primary mb-2">
              {result.score}/{result.totalQuestions}
            </div>
            <div className="text-2xl font-semibold mb-2">({percentage}%)</div>
            
            {/* Progress Bar */}
            <div className="relative h-3 bg-muted rounded-full overflow-hidden mt-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className={cn(
                  "h-full rounded-full",
                  result.passed ? "bg-gradient-success" : "bg-destructive"
                )}
              />
              {/* Passing line */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-foreground/50"
                style={{ left: `${passingScore}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Passing Score: {passingScore}%
            </p>
          </div>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 mb-6 py-4 border-y border-border">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-success">
                <CheckCircle className="h-5 w-5" />
                <span className="text-2xl font-bold">{result.score}</span>
              </div>
              <p className="text-sm text-muted-foreground">Benar</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-destructive">
                <XCircle className="h-5 w-5" />
                <span className="text-2xl font-bold">{result.totalQuestions - result.score}</span>
              </div>
              <p className="text-sm text-muted-foreground">Salah</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Clock className="h-5 w-5" />
                <span className="text-2xl font-bold">{formatTime(result.timeSpent)}</span>
              </div>
              <p className="text-sm text-muted-foreground">Waktu</p>
            </div>
          </div>
          
          {/* Section Analysis */}
          <div className="space-y-3 mb-6">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Analisis Per Bagian
            </h3>
            {result.sectionResults.map((section, index) => {
              const sectionPercent = Math.round((section.correct / section.total) * 100);
              const sectionPassed = sectionPercent >= passingScore;
              
              return (
                <div key={section.section} className="flex items-center gap-3">
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
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{getSectionLabel(section.section)}</span>
                      <span className="text-sm">
                        {section.correct}/{section.total} ({sectionPercent}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${sectionPercent}%` }}
                        transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                        className={cn(
                          "h-full rounded-full",
                          sectionPassed ? "bg-success" : "bg-destructive"
                        )}
                      />
                    </div>
                  </div>
                </div>
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
    </motion.div>
  );
}
