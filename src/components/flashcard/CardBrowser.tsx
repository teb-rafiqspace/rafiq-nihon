import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Volume2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardWithProgress, DeckWithProgress } from '@/hooks/useFlashcardsDB';

interface CardBrowserProps {
  deck: DeckWithProgress;
  cards: CardWithProgress[];
  onBack: () => void;
}

export function CardBrowser({ deck, cards, onBack }: CardBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const filteredCards = cards.filter(card => 
    card.front_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.back_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (card.back_reading && card.back_reading.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const speakJapanese = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'mastered':
        return <span className="text-xs px-2 py-0.5 bg-success/10 text-success rounded-full">Mastered</span>;
      case 'review':
        return <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded-full">Review</span>;
      case 'learning':
        return <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded-full">Learning</span>;
      default:
        return <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">New</span>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-bold">Browse: {deck.title_id}</h1>
          <p className="text-sm text-muted-foreground">{cards.length} cards</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search cards..."
          className="pl-10"
        />
      </div>

      {/* Card List */}
      <div className="flex-1 overflow-auto space-y-2">
        {filteredCards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02 }}
            className="bg-card rounded-xl border border-border overflow-hidden"
          >
            <button
              className="w-full p-4 text-left flex items-center gap-4"
              onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)}
            >
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-xl font-jp font-bold">{card.front_text}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{card.back_text}</span>
                  {getStatusBadge(card.progress?.status)}
                </div>
                {card.back_reading && (
                  <p className="text-sm text-muted-foreground truncate">{card.back_reading}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  speakJapanese(card.front_text);
                }}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </button>

            {/* Expanded Details */}
            {expandedCard === card.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-border bg-muted/30 p-4"
              >
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Front</p>
                    <p className="font-jp text-lg">{card.front_text}</p>
                    {card.front_subtext && (
                      <p className="text-muted-foreground">{card.front_subtext}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Back</p>
                    <p className="font-medium">{card.back_text}</p>
                    {card.back_subtext && (
                      <p className="text-muted-foreground">{card.back_subtext}</p>
                    )}
                  </div>
                </div>
                
                {card.back_example && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-muted-foreground text-sm mb-1">Example</p>
                    <p className="font-jp text-sm">{card.back_example}</p>
                  </div>
                )}

                {card.progress && (
                  <div className="mt-3 pt-3 border-t border-border grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Correct</p>
                      <p className="font-medium text-success">{card.progress.correct_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Incorrect</p>
                      <p className="font-medium text-destructive">{card.progress.incorrect_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Next Review</p>
                      <p className="font-medium">
                        {card.progress.next_review_at 
                          ? new Date(card.progress.next_review_at).toLocaleDateString()
                          : '-'}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        ))}

        {filteredCards.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No cards found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}
