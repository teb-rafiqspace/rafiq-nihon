import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PenTool, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWritingPractice, WritingPrompt } from '@/hooks/useWritingPractice';
import { WritingPromptCard } from '@/components/writing/WritingPromptCard';
import { WritingEditor } from '@/components/writing/WritingEditor';
import { WritingFeedback } from '@/components/writing/WritingFeedback';
import { useSubscription, isPremiumActive } from '@/hooks/useSubscription';
import { PremiumUpgradeModal } from '@/components/subscription/PremiumUpgradeModal';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

type ViewState =
  | { type: 'list' }
  | { type: 'writing'; prompt: WritingPrompt }
  | { type: 'feedback'; prompt: WritingPrompt; text: string; wordCount: number; timeSpent: number };

export default function WritingPractice() {
  const navigate = useNavigate();
  const [activeTrack, setActiveTrack] = useState<'ielts' | 'toefl'>('ielts');
  const [viewState, setViewState] = useState<ViewState>({ type: 'list' });
  const [essayText, setEssayText] = useState('');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  const { prompts, isLoading, submitWriting, isSubmitting, getSubmissionsForPrompt, getTaskTypeLabel } = useWritingPractice(activeTrack);
  const { data: subscription } = useSubscription();
  const isPremium = isPremiumActive(subscription);

  const handlePromptClick = (prompt: WritingPrompt) => {
    if (prompt.is_premium && !isPremium) {
      setShowPremiumModal(true);
      return;
    }
    setEssayText('');
    startTimeRef.current = Date.now();
    setViewState({ type: 'writing', prompt });
  };

  const handleSubmit = () => {
    if (viewState.type !== 'writing') return;

    const wordCount = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);

    if (wordCount < 10) {
      toast.error('Please write at least 10 words before submitting.');
      return;
    }

    submitWriting({
      promptId: viewState.prompt.id,
      text: essayText,
      wordCount,
      timeSpent,
    }, {
      onSuccess: () => {
        toast.success('Essay submitted!');
        setViewState({
          type: 'feedback',
          prompt: viewState.prompt,
          text: essayText,
          wordCount,
          timeSpent,
        });
      },
      onError: () => {
        toast.error('Failed to submit. Please try again.');
      },
    });
  };

  const handleBack = () => {
    if (viewState.type === 'list') {
      navigate(-1);
    } else {
      setViewState({ type: 'list' });
    }
  };

  // Writing view
  if (viewState.type === 'writing') {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
          <div className="px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-bold truncate">{viewState.prompt.title}</h1>
              <p className="text-xs text-muted-foreground">
                {getTaskTypeLabel(viewState.prompt.task_type)}
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="gap-1"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-4 max-w-lg mx-auto">
          {/* Prompt */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-sm mb-2 text-blue-700 dark:text-blue-400">Prompt</h3>
            <p className="text-sm text-foreground whitespace-pre-wrap">{viewState.prompt.prompt_text}</p>
            {viewState.prompt.instructions && (
              <p className="text-xs text-muted-foreground mt-2 italic">{viewState.prompt.instructions}</p>
            )}
          </div>

          {/* Editor */}
          <WritingEditor
            value={essayText}
            onChange={setEssayText}
            wordLimitMin={viewState.prompt.word_limit_min}
            wordLimitMax={viewState.prompt.word_limit_max}
            timeLimitMinutes={viewState.prompt.time_limit_minutes}
            onTimeUp={handleSubmit}
          />
        </div>
      </div>
    );
  }

  // Feedback view
  if (viewState.type === 'feedback') {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
          <div className="px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-bold">Submission Complete</h1>
              <p className="text-xs text-muted-foreground">
                {viewState.prompt.title}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 max-w-lg mx-auto">
          <WritingFeedback
            modelAnswer={viewState.prompt.model_answer}
            userText={viewState.text}
            wordCount={viewState.wordCount}
            timeSpent={viewState.timeSpent}
            wordLimitMin={viewState.prompt.word_limit_min}
            wordLimitMax={viewState.prompt.word_limit_max}
          />

          <div className="mt-6 space-y-3">
            <Button
              className="w-full"
              onClick={() => {
                setEssayText('');
                startTimeRef.current = Date.now();
                setViewState({ type: 'writing', prompt: viewState.prompt });
              }}
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleBack}
            >
              Back to Prompts
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <AppLayout>
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600">
          <div className="container max-w-lg mx-auto px-4 pt-6 pb-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
                <PenTool className="h-6 w-6" />
                Writing Practice
              </h1>
              <p className="text-white/80 text-sm">Latihan menulis esai</p>
            </motion.div>
          </div>
        </div>

        <div className="container max-w-lg mx-auto px-4 -mt-4 space-y-4">
          {/* Track Tabs */}
          <div className="bg-card rounded-2xl shadow-elevated p-1.5 flex gap-1">
            <button
              className={cn(
                "flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all text-center",
                activeTrack === 'ielts'
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              )}
              onClick={() => setActiveTrack('ielts')}
            >
              IELTS
            </button>
            <button
              className={cn(
                "flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all text-center",
                activeTrack === 'toefl'
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              )}
              onClick={() => setActiveTrack('toefl')}
            >
              TOEFL
            </button>
          </div>

          {/* Prompts List */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTrack}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
                ))
              ) : prompts.length === 0 ? (
                <div className="bg-card rounded-xl border border-border p-8 text-center">
                  <PenTool className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">Belum Ada Prompt</h3>
                  <p className="text-sm text-muted-foreground">
                    Konten writing untuk {activeTrack.toUpperCase()} akan segera hadir
                  </p>
                </div>
              ) : (
                prompts.map((prompt, index) => (
                  <WritingPromptCard
                    key={prompt.id}
                    title={prompt.title}
                    taskType={prompt.task_type}
                    taskTypeLabel={getTaskTypeLabel(prompt.task_type)}
                    wordLimitMin={prompt.word_limit_min}
                    wordLimitMax={prompt.word_limit_max}
                    timeLimitMinutes={prompt.time_limit_minutes}
                    difficulty={prompt.difficulty}
                    isPremium={prompt.is_premium}
                    isLocked={prompt.is_premium && !isPremium}
                    submissionCount={getSubmissionsForPrompt(prompt.id).length}
                    onClick={() => handlePromptClick(prompt)}
                    delay={index * 0.05}
                  />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </AppLayout>
  );
}
