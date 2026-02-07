import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Target, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PronunciationProblem {
  type: 'missing' | 'wrong' | 'extra' | 'timing' | 'pitch';
  character: string;
  position: number;
  expected?: string;
  actual?: string;
  suggestion: string;
  severity: 'minor' | 'moderate' | 'major';
}

interface PronunciationProblemCardProps {
  problems: PronunciationProblem[];
  targetText: string;
  spokenText: string;
  className?: string;
}

const problemTypeLabels: Record<PronunciationProblem['type'], { label: string; icon: string; color: string }> = {
  missing: { label: 'Missing Sound', icon: '⚠️', color: 'text-yellow-600 dark:text-yellow-400' },
  wrong: { label: 'Wrong Sound', icon: '❌', color: 'text-red-600 dark:text-red-400' },
  extra: { label: 'Extra Sound', icon: '➕', color: 'text-orange-600 dark:text-orange-400' },
  timing: { label: 'Timing Issue', icon: '⏱️', color: 'text-blue-600 dark:text-blue-400' },
  pitch: { label: 'Pitch Issue', icon: '🎵', color: 'text-purple-600 dark:text-purple-400' }
};

const severityStyles: Record<PronunciationProblem['severity'], string> = {
  minor: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800',
  moderate: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800',
  major: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
};

export function PronunciationProblemCard({
  problems,
  targetText,
  spokenText,
  className
}: PronunciationProblemCardProps) {
  if (problems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4",
          className
        )}
      >
        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Excellent pronunciation!</span>
        </div>
        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
          No major pronunciation issues detected. Keep up the great work!
        </p>
      </motion.div>
    );
  }

  // Group problems by type
  const groupedProblems = problems.reduce((acc, problem) => {
    if (!acc[problem.type]) acc[problem.type] = [];
    acc[problem.type].push(problem);
    return acc;
  }, {} as Record<string, PronunciationProblem[]>);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("space-y-3", className)}
    >
      <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
        <Target className="w-4 h-4" />
        PRONUNCIATION ANALYSIS
      </h4>

      {/* Text Comparison */}
      <div className="bg-muted/50 rounded-lg p-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Target</p>
            <p className="font-jp text-base">{targetText}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">You said</p>
            <p className="font-jp text-base">{spokenText || '(no speech detected)'}</p>
          </div>
        </div>
      </div>

      {/* Problem List */}
      <div className="space-y-2">
        {Object.entries(groupedProblems).map(([type, typeProblems]) => {
          const typeInfo = problemTypeLabels[type as PronunciationProblem['type']];
          
          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "border rounded-lg p-3",
                severityStyles[typeProblems[0].severity]
              )}
            >
              <div className={cn("flex items-center gap-2 font-medium mb-2", typeInfo.color)}>
                <span>{typeInfo.icon}</span>
                <span>{typeInfo.label}</span>
                <span className="ml-auto text-xs bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full">
                  {typeProblems.length} issue{typeProblems.length > 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="space-y-2">
                {typeProblems.map((problem, index) => (
                  <div key={index} className="text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-jp text-lg font-semibold">
                        {problem.character}
                      </span>
                      {problem.expected && problem.actual && (
                        <span className="text-muted-foreground">
                          "{problem.actual}" → "{problem.expected}"
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground flex items-start gap-1 mt-1">
                      <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {problem.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-muted/30 rounded-lg p-3 text-sm">
        <p className="font-medium mb-1">📊 Summary</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-red-500">
              {problems.filter(p => p.severity === 'major').length}
            </p>
            <p className="text-xs text-muted-foreground">Major</p>
          </div>
          <div>
            <p className="text-lg font-bold text-orange-500">
              {problems.filter(p => p.severity === 'moderate').length}
            </p>
            <p className="text-xs text-muted-foreground">Moderate</p>
          </div>
          <div>
            <p className="text-lg font-bold text-yellow-500">
              {problems.filter(p => p.severity === 'minor').length}
            </p>
            <p className="text-xs text-muted-foreground">Minor</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Utility function to detect pronunciation problems
export function detectPronunciationProblems(
  spoken: string,
  target: string,
  targetReading: string | null
): PronunciationProblem[] {
  const problems: PronunciationProblem[] = [];
  const normalizedSpoken = normalizeForComparison(spoken);
  const normalizedTarget = normalizeForComparison(targetReading || target);
  
  const targetChars = normalizedTarget.split('');
  const spokenChars = normalizedSpoken.split('');
  
  // Check for missing characters
  targetChars.forEach((char, index) => {
    if (!spokenChars.includes(char)) {
      problems.push({
        type: 'missing',
        character: char,
        position: index,
        expected: char,
        suggestion: getSuggestionForChar(char),
        severity: isKeySound(char) ? 'major' : 'moderate'
      });
    }
  });
  
  // Check for extra characters
  spokenChars.forEach((char, index) => {
    if (!targetChars.includes(char) && char.match(/[\u3040-\u309f\u30a0-\u30ff]/)) {
      problems.push({
        type: 'extra',
        character: char,
        position: index,
        actual: char,
        suggestion: `The sound "${char}" was not expected in this phrase.`,
        severity: 'minor'
      });
    }
  });
  
  // Check for commonly confused sounds
  const confusedPairs = [
    { wrong: 'し', right: 'す' },
    { wrong: 'つ', right: 'ちゅ' },
    { wrong: 'ふ', right: 'hu' },
    { wrong: 'ら', right: 'la' },
  ];
  
  confusedPairs.forEach(pair => {
    if (normalizedTarget.includes(pair.right) && normalizedSpoken.includes(pair.wrong)) {
      problems.push({
        type: 'wrong',
        character: pair.wrong,
        position: normalizedSpoken.indexOf(pair.wrong),
        expected: pair.right,
        actual: pair.wrong,
        suggestion: `Try to pronounce "${pair.right}" more distinctly`,
        severity: 'moderate'
      });
    }
  });
  
  return problems;
}

function normalizeForComparison(text: string): string {
  return text
    .replace(/[\s、。！？・「」『』（）\[\]]/g, '')
    .replace(/[\u30a1-\u30f6]/g, (match) => String.fromCharCode(match.charCodeAt(0) - 0x60))
    .toLowerCase();
}

function isKeySound(char: string): boolean {
  // Key sounds that are essential for understanding
  const keyChars = ['は', 'が', 'を', 'に', 'で', 'へ', 'と', 'の', 'か', 'も'];
  return keyChars.includes(char);
}

function getSuggestionForChar(char: string): string {
  const suggestions: Record<string, string> = {
    'つ': 'Place tongue behind teeth and release with a strong "ts" sound',
    'ふ': 'Blow gently through rounded lips, softer than English "f"',
    'ら': 'Quick tap of tongue on roof of mouth, between "l" and "r"',
    'り': 'Similar to "ra" but with "ee" sound, tongue taps lightly',
    'る': 'Tongue tap with "oo" sound, keep it quick',
    'れ': 'Tongue tap with "eh" sound',
    'ろ': 'Tongue tap with "oh" sound',
    'ん': 'Nasal sound, changes based on following consonant',
    'っ': 'Small pause before the next consonant (double consonant)',
    'を': 'Pronounced as "o" in modern Japanese',
  };
  
  return suggestions[char] || `Practice the "${char}" sound slowly, then speed up`;
}
