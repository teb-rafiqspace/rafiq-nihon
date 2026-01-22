import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Target, Clock, FileText, Star, AlertTriangle, 
  CheckCircle, BookOpen, Languages, MessageSquare, FileSearch
} from 'lucide-react';

interface TestSection {
  id: string;
  name: string;
  nameJp: string;
  questions: number;
  icon: React.ReactNode;
}

interface TestStartScreenProps {
  testName: string;
  testNameJp: string;
  totalQuestions: number;
  timeMinutes: number;
  passingScore: number;
  xpReward: number;
  sections: TestSection[];
  onStart: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function TestStartScreen({
  testName,
  testNameJp,
  totalQuestions,
  timeMinutes,
  passingScore,
  xpReward,
  sections,
  onStart,
  onBack,
  isLoading = false
}: TestStartScreenProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary pt-safe pb-8">
        <div className="container max-w-lg mx-auto px-4 pt-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Target className="h-10 w-10 text-primary-foreground" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-primary-foreground mb-1"
          >
            {testName}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-primary-foreground/80 font-japanese"
          >
            {testNameJp}
          </motion.p>
        </div>
      </div>
      
      {/* Content */}
      <div className="container max-w-lg mx-auto px-4 -mt-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl shadow-elevated border border-border overflow-hidden"
        >
          {/* Test Information */}
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
              📊 Informasi Tes
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Soal</p>
                  <p className="font-bold text-lg">{totalQuestions}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <div className="w-10 h-10 bg-secondary/50 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Waktu</p>
                  <p className="font-bold text-lg">{timeMinutes} menit</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lulus</p>
                  <p className="font-bold text-lg">{passingScore}%</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                  <Star className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">XP</p>
                  <p className="font-bold text-lg">+{xpReward}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sections */}
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
              📋 Bagian Tes
            </h2>
            
            <div className="space-y-3">
              {sections.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                    {section.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{section.name}</p>
                    <p className="text-xs text-muted-foreground font-japanese">{section.nameJp}</p>
                  </div>
                  <div className="text-sm text-muted-foreground shrink-0">
                    {section.questions} soal
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Warning */}
          <div className="p-5">
            <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200 text-sm">
                  Perhatian!
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Setelah tes dimulai, timer tidak dapat dihentikan. Pastikan Anda siap sebelum memulai.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6 space-y-3"
        >
          <Button
            variant="default"
            size="xl"
            className="w-full text-lg"
            onClick={onStart}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                Memuat...
              </>
            ) : (
              <>
                🚀 Mulai Tes
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={onBack}
          >
            Kembali
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

// Default sections for JLPT N5
export const JLPT_N5_SECTIONS: TestSection[] = [
  { id: 'hiragana', name: 'Hiragana', nameJp: 'ひらがな', questions: 10, icon: <Languages className="h-4 w-4" /> },
  { id: 'katakana', name: 'Katakana', nameJp: 'カタカナ', questions: 10, icon: <Languages className="h-4 w-4" /> },
  { id: 'vocabulary', name: 'Kosakata', nameJp: 'ごい', questions: 15, icon: <BookOpen className="h-4 w-4" /> },
  { id: 'grammar', name: 'Tata Bahasa', nameJp: 'ぶんぽう', questions: 15, icon: <MessageSquare className="h-4 w-4" /> },
  { id: 'reading', name: 'Pemahaman Bacaan', nameJp: 'どっかい', questions: 5, icon: <FileSearch className="h-4 w-4" /> },
];
