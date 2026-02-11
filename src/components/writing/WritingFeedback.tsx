import { motion } from 'framer-motion';
import { Eye, EyeOff, CheckCircle, FileText } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface WritingFeedbackProps {
  modelAnswer: string | null;
  userText: string;
  wordCount: number;
  timeSpent: number;
  wordLimitMin: number;
  wordLimitMax: number;
}

export function WritingFeedback({
  modelAnswer,
  userText,
  wordCount,
  timeSpent,
  wordLimitMin,
  wordLimitMax,
}: WritingFeedbackProps) {
  const [showModel, setShowModel] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const withinRange = wordCount >= wordLimitMin && wordCount <= wordLimitMax;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-muted/50 rounded-xl p-3 text-center">
          <FileText className="h-5 w-5 mx-auto mb-1 text-blue-600" />
          <div className="text-xl font-bold">{wordCount}</div>
          <div className="text-xs text-muted-foreground">Words</div>
        </div>
        <div className="bg-muted/50 rounded-xl p-3 text-center">
          <CheckCircle className={`h-5 w-5 mx-auto mb-1 ${withinRange ? 'text-success' : 'text-amber-500'}`} />
          <div className="text-xl font-bold">{withinRange ? 'Yes' : 'No'}</div>
          <div className="text-xs text-muted-foreground">In Range</div>
        </div>
        <div className="bg-muted/50 rounded-xl p-3 text-center">
          <FileText className="h-5 w-5 mx-auto mb-1 text-purple-500" />
          <div className="text-xl font-bold">{formatTime(timeSpent)}</div>
          <div className="text-xs text-muted-foreground">Time</div>
        </div>
      </div>

      {/* Your Submission */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h4 className="font-semibold text-sm mb-2">Your Essay</h4>
        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
          {userText}
        </p>
      </div>

      {/* Model Answer */}
      {modelAnswer && (
        <div>
          <Button
            variant="outline"
            className="w-full gap-2 mb-3"
            onClick={() => setShowModel(!showModel)}
          >
            {showModel ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showModel ? 'Hide Model Answer' : 'Show Model Answer'}
          </Button>

          {showModel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4"
            >
              <h4 className="font-semibold text-sm mb-2 text-blue-700 dark:text-blue-400">
                Model Answer
              </h4>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {modelAnswer}
              </p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
