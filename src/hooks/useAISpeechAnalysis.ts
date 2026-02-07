import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PronunciationProblem } from '@/components/speaking/PronunciationProblemCard';

export interface AIAnalysisResult {
  overallScore: number;
  pronunciationScore: number;
  accuracyScore: number;
  fluencyScore: number;
  pitchAccuracyScore: number;
  problems: PronunciationProblem[];
  feedback: {
    positive: string[];
    improvements: string[];
  };
  detailedAnalysis: {
    characterAccuracy: number;
    wordOrder: number;
    completeness: number;
    pitchAccuracy: number;
  };
}

export function useAISpeechAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeWithAI = useCallback(async (
    spokenText: string,
    targetText: string,
    targetReading?: string | null,
    pitchPattern?: string | null
  ): Promise<AIAnalysisResult | null> => {
    if (!spokenText || !targetText) {
      setError('Missing speech data');
      return null;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke('speech-analysis', {
        body: {
          spokenText,
          targetText,
          targetReading: targetReading || undefined,
          pitchPattern: pitchPattern || undefined
        }
      });

      if (funcError) {
        throw new Error(funcError.message);
      }

      return data as AIAnalysisResult;
    } catch (err) {
      console.error('AI speech analysis error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
      
      // Return fallback basic analysis
      return performBasicAnalysis(spokenText, targetText, targetReading);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    analyzeWithAI,
    isAnalyzing,
    error
  };
}

// Fallback basic analysis (same as in edge function)
function performBasicAnalysis(
  spoken: string,
  target: string,
  reading?: string | null
): AIAnalysisResult {
  const normalizedSpoken = normalizeJapanese(spoken);
  const normalizedTarget = normalizeJapanese(reading || target);
  
  const similarity = calculateSimilarity(normalizedSpoken, normalizedTarget);
  const completeness = Math.min(1, normalizedSpoken.length / Math.max(normalizedTarget.length, 1));
  
  const problems: PronunciationProblem[] = [];
  const targetChars = normalizedTarget.split('');
  
  targetChars.forEach((char, index) => {
    if (!normalizedSpoken.includes(char)) {
      problems.push({
        type: 'missing',
        character: char,
        position: index,
        expected: char,
        suggestion: `Practice the "${char}" sound`,
        severity: 'moderate'
      });
    }
  });

  const overallScore = Math.round(similarity * 100);
  
  return {
    overallScore,
    pronunciationScore: Math.round(similarity * 95),
    accuracyScore: Math.round(similarity * 100),
    fluencyScore: Math.round(completeness * 90),
    pitchAccuracyScore: 70,
    problems,
    feedback: {
      positive: overallScore >= 70 ? ["Good attempt!"] : ["Keep practicing!"],
      improvements: overallScore < 80 ? ["Focus on pronunciation clarity"] : []
    },
    detailedAnalysis: {
      characterAccuracy: Math.round(similarity * 100),
      wordOrder: Math.round(similarity * 100),
      completeness: Math.round(completeness * 100),
      pitchAccuracy: 70
    }
  };
}

function normalizeJapanese(text: string): string {
  return text
    .replace(/[\s、。！？・「」『』（）\[\]]/g, '')
    .replace(/[\u30a1-\u30f6]/g, (match) => String.fromCharCode(match.charCodeAt(0) - 0x60))
    .replace(/ー/g, '')
    .toLowerCase();
}

function calculateSimilarity(str1: string, str2: string): number {
  if (str1.length === 0 && str2.length === 0) return 1;
  if (str1.length === 0 || str2.length === 0) return 0;
  
  const distance = levenshteinDistance(str1, str2);
  return Math.max(0, 1 - distance / Math.max(str1.length, str2.length));
}

function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j - 1] + 1, dp[i - 1][j] + 1, dp[i][j - 1] + 1);
      }
    }
  }
  
  return dp[m][n];
}
