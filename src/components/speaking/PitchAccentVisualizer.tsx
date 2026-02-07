import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PitchAccentVisualizerProps {
  text: string;
  pitchPattern?: string | null; // e.g., "LHHL" or "0123" or "へいばん"
  pitchVisual?: string | null; // e.g., "━╲━━" or visual representation
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

// Parse pitch pattern into array of heights (0 = low, 1 = high)
function parsePitchPattern(pattern: string | null | undefined): number[] {
  if (!pattern) return [];
  
  // Handle LHHL format
  if (/^[LHlh]+$/.test(pattern)) {
    return pattern.toUpperCase().split('').map(c => c === 'H' ? 1 : 0);
  }
  
  // Handle numeric format (0123 - accent position)
  if (/^\d+$/.test(pattern)) {
    const accentPos = parseInt(pattern);
    // Japanese pitch accent: rises after first mora, drops after accent position
    // 0 = heiban (flat), 1 = atamadaka (drop after first), etc.
    if (accentPos === 0) {
      return [0, 1, 1, 1]; // Heiban: low-high-high-high
    } else if (accentPos === 1) {
      return [1, 0, 0, 0]; // Atamadaka: high-low-low-low
    } else {
      const result = [0];
      for (let i = 1; i < 4; i++) {
        result.push(i < accentPos ? 1 : 0);
      }
      return result;
    }
  }
  
  // Handle Japanese pitch type names
  const jpPatterns: Record<string, number[]> = {
    'へいばん': [0, 1, 1, 1], // Heiban
    'あたまだか': [1, 0, 0, 0], // Atamadaka
    'なかだか': [0, 1, 0, 0], // Nakadaka
    'おだか': [0, 1, 1, 0], // Odaka
  };
  
  if (jpPatterns[pattern.toLowerCase()]) {
    return jpPatterns[pattern.toLowerCase()];
  }
  
  return [];
}

function getPitchTypeName(pattern: number[]): string {
  if (pattern.length === 0) return '';
  
  // Check pattern type
  const firstHigh = pattern[0] === 1;
  const allHighAfterFirst = pattern.slice(1).every(p => p === 1);
  const dropIndex = pattern.findIndex((p, i) => i > 0 && pattern[i-1] === 1 && p === 0);
  
  if (firstHigh && dropIndex === 1) return '頭高型 (Atamadaka)';
  if (!firstHigh && allHighAfterFirst) return '平板型 (Heiban)';
  if (!firstHigh && dropIndex === pattern.length - 1) return '尾高型 (Odaka)';
  if (!firstHigh && dropIndex > 1 && dropIndex < pattern.length - 1) return '中高型 (Nakadaka)';
  
  return '';
}

export function PitchAccentVisualizer({
  text,
  pitchPattern,
  pitchVisual,
  size = 'md',
  showLabel = true
}: PitchAccentVisualizerProps) {
  const pitchHeights = parsePitchPattern(pitchPattern);
  const characters = text.split('');
  const pitchTypeName = getPitchTypeName(pitchHeights);
  
  const sizeClasses = {
    sm: { text: 'text-sm', dot: 'w-1.5 h-1.5', line: 'h-0.5', height: 'h-6' },
    md: { text: 'text-lg', dot: 'w-2 h-2', line: 'h-0.5', height: 'h-8' },
    lg: { text: 'text-2xl', dot: 'w-2.5 h-2.5', line: 'h-1', height: 'h-10' }
  };
  
  const classes = sizeClasses[size];

  if (pitchHeights.length === 0 && !pitchVisual) {
    return null;
  }

  // If we have a visual representation, show it simply
  if (pitchVisual && pitchHeights.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1">
        {showLabel && (
          <span className="text-xs text-muted-foreground">Pitch Pattern</span>
        )}
        <span className="font-mono text-lg tracking-widest text-indigo-600 dark:text-indigo-400">
          {pitchVisual}
        </span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center gap-2">
        {showLabel && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Pitch Accent</span>
            {pitchTypeName && (
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{pitchTypeName}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
        
        <div className="flex items-end gap-0.5 relative">
          {characters.slice(0, pitchHeights.length).map((char, index) => {
            const isHigh = pitchHeights[index] === 1;
            const nextIsHigh = index < pitchHeights.length - 1 ? pitchHeights[index + 1] === 1 : isHigh;
            const isRising = !isHigh && nextIsHigh;
            const isFalling = isHigh && !nextIsHigh;
            
            return (
              <div key={index} className="flex flex-col items-center relative">
                {/* Pitch dot and line */}
                <div className={`relative ${classes.height} flex items-end justify-center`}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="absolute flex flex-col items-center"
                    style={{ bottom: isHigh ? '100%' : '0%', transform: 'translateY(50%)' }}
                  >
                    <div className={`${classes.dot} rounded-full ${
                      isHigh ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                  </motion.div>
                  
                  {/* Connecting line to next pitch */}
                  {index < pitchHeights.length - 1 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: index * 0.05 + 0.02 }}
                      className={`absolute ${classes.line} bg-gray-400 dark:bg-gray-500 origin-left`}
                      style={{
                        left: '50%',
                        width: '100%',
                        bottom: isHigh ? 'calc(100% - 4px)' : '4px',
                        transform: isRising 
                          ? 'rotate(-30deg)' 
                          : isFalling 
                            ? 'rotate(30deg)' 
                            : 'rotate(0deg)',
                        transformOrigin: 'left center'
                      }}
                    />
                  )}
                </div>
                
                {/* Character */}
                <motion.span
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`${classes.text} font-jp ${
                    isHigh ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-foreground'
                  }`}
                >
                  {char}
                </motion.span>
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Low</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
