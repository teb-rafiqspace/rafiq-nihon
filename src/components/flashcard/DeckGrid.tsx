import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Layers, Type, BookOpen, Briefcase, Hash, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DeckWithProgress } from '@/hooks/useFlashcardsDB';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'Type': Type,
  'Layers': Layers,
  'BookOpen': BookOpen,
  'Briefcase': Briefcase,
  'Hash': Hash,
  'Sun': Sun,
};

interface DeckGridProps {
  decks: DeckWithProgress[];
  onSelectDeck: (deck: DeckWithProgress) => void;
  isLoading?: boolean;
}

export function DeckGrid({ decks, onSelectDeck, isLoading }: DeckGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card rounded-xl p-4 animate-pulse border border-border">
            <div className="w-10 h-10 bg-muted rounded-lg mb-3" />
            <div className="h-4 bg-muted rounded w-2/3 mb-2" />
            <div className="h-3 bg-muted rounded w-1/2 mb-3" />
            <div className="h-2 bg-muted rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          📚 Flashcard Decks
        </h2>
        <Button variant="ghost" size="sm" className="text-primary">
          <Plus className="h-4 w-4 mr-1" />
          Custom
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {decks.map((deck, index) => {
          const IconComponent = iconMap[deck.icon_name || 'Layers'] || Layers;
          
          return (
            <motion.button
              key={deck.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectDeck(deck)}
              className="bg-card rounded-xl p-4 text-left shadow-card hover:shadow-elevated transition-all border border-border group"
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-white"
                style={{ backgroundColor: deck.color || '#3B82F6' }}
              >
                <IconComponent className="h-5 w-5" />
              </div>
              
              <h3 className="font-bold text-lg font-jp leading-tight">
                {deck.title_jp}
              </h3>
              <p className="text-sm text-muted-foreground mb-1">
                {deck.title_id}
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                {deck.card_count} cards
              </p>
              
              <div className="space-y-1">
                <Progress 
                  value={deck.masteryPercentage} 
                  className="h-1.5"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {deck.masteryPercentage}%
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
