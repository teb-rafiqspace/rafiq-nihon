import { useState } from 'react';
import { Mic, MicOff, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useAISpeechAnalysis, AIAnalysisResult } from '@/hooks/useAISpeechAnalysis';
import { cn } from '@/lib/utils';

interface PronunciationCheckButtonProps {
  targetText: string;
  targetReading?: string;
  pitchPattern?: string;
  size?: 'sm' | 'md';
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
  if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-red-600 bg-red-50 border-red-200';
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Sempurna!';
  if (score >= 80) return 'Bagus!';
  if (score >= 60) return 'Cukup';
  return 'Coba lagi';
}

export function PronunciationCheckButton({
  targetText,
  targetReading,
  pitchPattern,
  size = 'sm',
}: PronunciationCheckButtonProps) {
  const { isListening, isSupported, transcript, interimTranscript, startListening, stopListening, resetTranscript } = useSpeechRecognition('ja-JP');
  const { analyzeWithAI, isAnalyzing } = useAISpeechAnalysis();
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  if (!isSupported) return null;

  const handleClick = async () => {
    if (isListening) {
      stopListening();
      // Wait a brief moment for final transcript
      setTimeout(async () => {
        const spokenText = transcript || interimTranscript;
        if (spokenText) {
          const analysis = await analyzeWithAI(spokenText, targetText, targetReading, pitchPattern);
          if (analysis) {
            setResult(analysis);
            setShowResult(true);
          }
        }
      }, 300);
    } else {
      setResult(null);
      setShowResult(false);
      resetTranscript();
      startListening();
    }
  };

  const handleDismiss = () => {
    setShowResult(false);
    setResult(null);
  };

  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const btnSize = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';

  return (
    <div className="inline-flex items-center gap-1.5">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        disabled={isAnalyzing}
        className={cn(
          btnSize, 'rounded-full',
          isListening && 'bg-red-100 hover:bg-red-200 animate-pulse',
          !isListening && !isAnalyzing && 'bg-blue-50 hover:bg-blue-100'
        )}
        title={isListening ? 'Berhenti merekam' : 'Cek pengucapan'}
      >
        {isAnalyzing ? (
          <Loader2 className={cn(iconSize, 'animate-spin text-blue-500')} />
        ) : isListening ? (
          <MicOff className={cn(iconSize, 'text-red-500')} />
        ) : (
          <Mic className={cn(iconSize, 'text-blue-500')} />
        )}
      </Button>

      {/* Live transcript while recording */}
      {isListening && (interimTranscript || transcript) && (
        <span className="text-xs text-muted-foreground italic max-w-[120px] truncate">
          {transcript || interimTranscript}
        </span>
      )}

      {/* Score badge */}
      {showResult && result && (
        <div className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium', getScoreColor(result.overallScore))}>
          <span>{result.overallScore}%</span>
          <span className="hidden sm:inline">{getScoreLabel(result.overallScore)}</span>
          <button onClick={handleDismiss} className="ml-0.5 opacity-60 hover:opacity-100">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
