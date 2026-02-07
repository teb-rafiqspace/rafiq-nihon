/**
 * Japanese Text Scoring Utility
 * Compares spoken text with target text and calculates pronunciation scores
 */

// Hiragana to Katakana conversion
const hiraganaToKatakana = (str: string): string => {
  return str.replace(/[\u3041-\u3096]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) + 0x60);
  });
};

// Katakana to Hiragana conversion
const katakanaToHiragana = (str: string): string => {
  return str.replace(/[\u30a1-\u30f6]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) - 0x60);
  });
};

// Normalize Japanese text for comparison
const normalizeJapanese = (text: string): string => {
  return text
    // Convert to hiragana for consistent comparison
    .split('')
    .map(char => {
      // Katakana to Hiragana
      if (char.charCodeAt(0) >= 0x30a1 && char.charCodeAt(0) <= 0x30f6) {
        return String.fromCharCode(char.charCodeAt(0) - 0x60);
      }
      return char;
    })
    .join('')
    // Remove spaces and punctuation
    .replace(/[\s、。！？・「」『』（）\[\]]/g, '')
    // Normalize long vowels
    .replace(/ー/g, '')
    // Convert small kana to normal
    .replace(/ぁ/g, 'あ')
    .replace(/ぃ/g, 'い')
    .replace(/ぅ/g, 'う')
    .replace(/ぇ/g, 'え')
    .replace(/ぉ/g, 'お')
    .replace(/っ/g, 'つ')
    .replace(/ゃ/g, 'や')
    .replace(/ゅ/g, 'ゆ')
    .replace(/ょ/g, 'よ')
    .toLowerCase();
};

// Calculate Levenshtein distance between two strings
const levenshteinDistance = (str1: string, str2: string): number => {
  const m = str1.length;
  const n = str2.length;
  
  if (m === 0) return n;
  if (n === 0) return m;
  
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1, // substitution
          dp[i - 1][j] + 1,     // deletion
          dp[i][j - 1] + 1      // insertion
        );
      }
    }
  }
  
  return dp[m][n];
};

// Calculate similarity ratio (0-1)
const calculateSimilarity = (str1: string, str2: string): number => {
  if (str1.length === 0 && str2.length === 0) return 1;
  if (str1.length === 0 || str2.length === 0) return 0;
  
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  return Math.max(0, 1 - distance / maxLength);
};

// Find matching characters and their positions
const findMatchingCharacters = (spoken: string, target: string): {
  matched: boolean[];
  matchedChars: number;
  totalChars: number;
} => {
  const normalizedSpoken = normalizeJapanese(spoken);
  const normalizedTarget = normalizeJapanese(target);
  
  const targetChars = normalizedTarget.split('');
  const spokenChars = normalizedSpoken.split('');
  
  const matched = targetChars.map((char, index) => {
    return spokenChars.includes(char);
  });
  
  const matchedChars = matched.filter(Boolean).length;
  
  return {
    matched,
    matchedChars,
    totalChars: targetChars.length
  };
};

export interface ScoringResult {
  overallScore: number;
  pronunciationScore: number;
  accuracyScore: number;
  fluencyScore: number;
  matchedText: string;
  targetText: string;
  feedback: {
    positive: string[];
    improvements: string[];
  };
  detailedAnalysis: {
    characterAccuracy: number;
    wordOrder: number;
    completeness: number;
  };
}

export function calculateSpeechScore(
  spokenText: string,
  targetText: string,
  targetReading: string | null,
  confidence: number
): ScoringResult {
  // Normalize texts
  const normalizedSpoken = normalizeJapanese(spokenText);
  const normalizedTarget = normalizeJapanese(targetText);
  const normalizedReading = targetReading ? normalizeJapanese(targetReading) : normalizedTarget;
  
  // Calculate similarity with target text and reading
  const targetSimilarity = calculateSimilarity(normalizedSpoken, normalizedTarget);
  const readingSimilarity = calculateSimilarity(normalizedSpoken, normalizedReading);
  
  // Use the better match (kanji text vs hiragana reading)
  const textSimilarity = Math.max(targetSimilarity, readingSimilarity);
  
  // Character matching analysis
  const matchAnalysis = findMatchingCharacters(spokenText, targetReading || targetText);
  const characterAccuracy = matchAnalysis.totalChars > 0 
    ? matchAnalysis.matchedChars / matchAnalysis.totalChars 
    : 0;
  
  // Completeness check (how much of the target was spoken)
  const completeness = normalizedSpoken.length / Math.max(normalizedTarget.length, 1);
  const completenessScore = Math.min(1, completeness) * 0.8 + (completeness >= 0.9 ? 0.2 : 0);
  
  // Combine scores with weights
  const pronunciationScore = Math.round(
    (textSimilarity * 0.5 + characterAccuracy * 0.3 + (confidence || 0.7) * 0.2) * 100
  );
  
  const accuracyScore = Math.round(
    (textSimilarity * 0.6 + characterAccuracy * 0.4) * 100
  );
  
  const fluencyScore = Math.round(
    (completenessScore * 0.5 + (confidence || 0.7) * 0.5) * 100
  );
  
  // Overall score (weighted average)
  const overallScore = Math.round(
    pronunciationScore * 0.4 + accuracyScore * 0.35 + fluencyScore * 0.25
  );
  
  // Generate feedback
  const feedback = generateFeedback(
    overallScore,
    pronunciationScore,
    accuracyScore,
    fluencyScore,
    textSimilarity,
    completeness,
    normalizedSpoken,
    normalizedTarget
  );
  
  return {
    overallScore: Math.max(0, Math.min(100, overallScore)),
    pronunciationScore: Math.max(0, Math.min(100, pronunciationScore)),
    accuracyScore: Math.max(0, Math.min(100, accuracyScore)),
    fluencyScore: Math.max(0, Math.min(100, fluencyScore)),
    matchedText: spokenText,
    targetText: targetText,
    feedback,
    detailedAnalysis: {
      characterAccuracy: Math.round(characterAccuracy * 100),
      wordOrder: Math.round(textSimilarity * 100),
      completeness: Math.round(completenessScore * 100)
    }
  };
}

function generateFeedback(
  overall: number,
  pronunciation: number,
  accuracy: number,
  fluency: number,
  similarity: number,
  completeness: number,
  spoken: string,
  target: string
): { positive: string[]; improvements: string[] } {
  const positive: string[] = [];
  const improvements: string[] = [];
  
  // Positive feedback
  if (overall >= 90) {
    positive.push('Excellent pronunciation! Almost perfect! 🎉');
  } else if (overall >= 80) {
    positive.push('Great job! Very good pronunciation');
  } else if (overall >= 70) {
    positive.push('Good effort! Keep practicing');
  }
  
  if (similarity >= 0.9) {
    positive.push('Very accurate text recognition');
  } else if (similarity >= 0.7) {
    positive.push('Good word recognition');
  }
  
  if (fluency >= 80) {
    positive.push('Natural speech flow');
  }
  
  if (completeness >= 0.95) {
    positive.push('Complete sentence spoken');
  }
  
  // Improvement suggestions
  if (overall < 70) {
    improvements.push('Try speaking more slowly and clearly');
  }
  
  if (accuracy < 70) {
    improvements.push('Focus on pronouncing each syllable distinctly');
  }
  
  if (fluency < 70) {
    improvements.push('Try to speak the complete phrase without pausing');
  }
  
  if (completeness < 0.7) {
    improvements.push('Try to complete the entire phrase');
  }
  
  if (spoken.length < target.length * 0.5) {
    improvements.push('More of the phrase was expected');
  }
  
  // Check for common Japanese pronunciation issues
  if (target.includes('つ') || target.includes('ツ')) {
    if (!spoken.includes('つ') && !spoken.includes('ツ')) {
      improvements.push('Pay attention to the "tsu" sound');
    }
  }
  
  if (target.includes('ふ') || target.includes('フ')) {
    if (!spoken.includes('ふ') && !spoken.includes('フ')) {
      improvements.push('Remember "fu" is a soft sound between "f" and "h"');
    }
  }
  
  // Ensure at least one feedback item
  if (positive.length === 0) {
    positive.push('Keep trying, you\'re improving!');
  }
  
  if (improvements.length === 0 && overall < 95) {
    improvements.push('Practice makes perfect!');
  }
  
  return { positive, improvements };
}

// Export helper for getting score color
export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-500';
  if (score >= 75) return 'text-blue-500';
  if (score >= 60) return 'text-yellow-500';
  return 'text-red-500';
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Great';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Keep Practicing';
}
