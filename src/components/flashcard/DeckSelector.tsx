import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Layers } from 'lucide-react';

interface Deck {
  id: string;
  name: string;
  cards: { id: string }[];
}

interface DeckSelectorProps {
  decks: Deck[];
  selectedDeckId: string;
  onSelectDeck: (id: string) => void;
}

export function DeckSelector({ decks, selectedDeckId, onSelectDeck }: DeckSelectorProps) {
  const selectedDeck = decks.find((d) => d.id === selectedDeckId);
  
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Layers className="h-4 w-4" />
        Pilih Deck
      </label>
      <Select value={selectedDeckId} onValueChange={onSelectDeck}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Pilih deck..." />
        </SelectTrigger>
        <SelectContent>
          {decks.map((deck) => (
            <SelectItem key={deck.id} value={deck.id}>
              <div className="flex items-center justify-between w-full gap-4">
                <span>{deck.name}</span>
                <span className="text-xs text-muted-foreground">
                  {deck.cards.length} kartu
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedDeck && (
        <p className="text-xs text-muted-foreground">
          {selectedDeck.cards.length} kartu dalam deck ini
        </p>
      )}
    </div>
  );
}
