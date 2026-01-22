import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useKanaCharacters, useUserKanaProgress, KanaCharacter } from '@/hooks/useKana';
import { Check, Lock } from 'lucide-react';

interface KanaChartProps {
  type: 'hiragana' | 'katakana';
  onCharacterClick: (character: KanaCharacter) => void;
}

const ROW_ORDER = ['a', 'ka', 'sa', 'ta', 'na', 'ha', 'ma', 'ya', 'ra', 'wa'];
const COLUMN_VOWELS = ['a', 'i', 'u', 'e', 'o'];

export function KanaChart({ type, onCharacterClick }: KanaChartProps) {
  const { data: characters = [], isLoading } = useKanaCharacters(type);
  const { data: progress = [] } = useUserKanaProgress();
  
  const progressMap = new Map(progress.map(p => [p.kana_id, p]));
  
  // Group characters by row
  const charactersByRow = new Map<string, KanaCharacter[]>();
  characters.forEach(char => {
    const row = char.row_name || 'other';
    if (!charactersByRow.has(row)) {
      charactersByRow.set(row, []);
    }
    charactersByRow.get(row)!.push(char);
  });
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-5 gap-2 p-4">
        {Array.from({ length: 46 }).map((_, i) => (
          <div 
            key={i}
            className="aspect-square bg-muted rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }
  
  const getCharacterStatus = (char: KanaCharacter) => {
    const prog = progressMap.get(char.id);
    return prog?.status || 'not_learned';
  };
  
  return (
    <div className="space-y-6">
      {ROW_ORDER.map((rowName, rowIndex) => {
        const rowChars = charactersByRow.get(rowName) || [];
        if (rowChars.length === 0) return null;
        
        // Sort by order_index
        rowChars.sort((a, b) => a.order_index - b.order_index);
        
        const rowLabel = type === 'hiragana' 
          ? getHiraganaRowLabel(rowName)
          : getKatakanaRowLabel(rowName);
        
        return (
          <motion.div
            key={rowName}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rowIndex * 0.05 }}
            className="space-y-2"
          >
            <h3 className="text-sm font-medium text-muted-foreground px-1">
              {rowLabel}
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {rowChars.map((char, charIndex) => {
                const status = getCharacterStatus(char);
                
                return (
                  <motion.button
                    key={char.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: rowIndex * 0.05 + charIndex * 0.02 }}
                    onClick={() => onCharacterClick(char)}
                    className={cn(
                      "aspect-square rounded-xl flex flex-col items-center justify-center",
                      "border-2 transition-all relative overflow-hidden",
                      "hover:scale-105 active:scale-95",
                      status === 'learned' && "bg-success/10 border-success",
                      status === 'learning' && "bg-primary/10 border-primary",
                      status === 'not_learned' && "bg-card border-border hover:border-primary/50"
                    )}
                  >
                    {status === 'learned' && (
                      <div className="absolute top-1 right-1">
                        <Check className="h-3 w-3 text-success" />
                      </div>
                    )}
                    <span className={cn(
                      "text-2xl font-jp font-medium",
                      status === 'learned' && "text-success",
                      status === 'learning' && "text-primary",
                    )}>
                      {char.character}
                    </span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {char.romaji}
                    </span>
                  </motion.button>
                );
              })}
              
              {/* Fill empty spaces for consistent grid */}
              {rowChars.length < 5 && rowName === 'ya' && (
                <>
                  <div className="aspect-square" />
                  <div className="aspect-square" />
                </>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function getHiraganaRowLabel(row: string): string {
  const labels: Record<string, string> = {
    'a': 'あ行 (Vokal)',
    'ka': 'か行 (K)',
    'sa': 'さ行 (S)',
    'ta': 'た行 (T)',
    'na': 'な行 (N)',
    'ha': 'は行 (H)',
    'ma': 'ま行 (M)',
    'ya': 'や行 (Y)',
    'ra': 'ら行 (R)',
    'wa': 'わ行 (W/N)',
  };
  return labels[row] || row;
}

function getKatakanaRowLabel(row: string): string {
  const labels: Record<string, string> = {
    'a': 'ア行 (Vokal)',
    'ka': 'カ行 (K)',
    'sa': 'サ行 (S)',
    'ta': 'タ行 (T)',
    'na': 'ナ行 (N)',
    'ha': 'ハ行 (H)',
    'ma': 'マ行 (M)',
    'ya': 'ヤ行 (Y)',
    'ra': 'ラ行 (R)',
    'wa': 'ワ行 (W/N)',
  };
  return labels[row] || row;
}
