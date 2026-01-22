import { motion } from 'framer-motion';

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

const suggestedPrompts = [
  'Apa arti おはようございます?',
  'Jelaskan partikel は dan が',
  'Cara menghitung 1-10',
  'Bagaimana memperkenalkan diri?',
];

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-background border-t border-border py-3"
    >
      <div className="container max-w-lg mx-auto px-4">
        <p className="text-xs text-muted-foreground mb-2">Coba tanyakan:</p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {suggestedPrompts.map((prompt, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onSelect(prompt)}
              className="flex-shrink-0 bg-muted hover:bg-muted/80 text-foreground text-sm px-3 py-2 rounded-full transition-colors"
            >
              {prompt}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
