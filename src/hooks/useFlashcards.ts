import React, { useState, useCallback, useMemo } from 'react';

export interface FlashcardItem {
  id: string;
  wordJp: string;
  reading?: string;
  meaningId: string;
  exampleJp?: string;
  exampleId?: string;
}

interface DeckOption {
  id: string;
  name: string;
  cards: FlashcardItem[];
}

interface UseFlashcardsReturn {
  // Deck state
  decks: DeckOption[];
  selectedDeckId: string;
  setSelectedDeckId: (id: string) => void;
  
  // Card state
  cards: FlashcardItem[];
  currentIndex: number;
  currentCard: FlashcardItem | null;
  progress: number;
  
  // Review state
  isFlipped: boolean;
  isComplete: boolean;
  knownCount: number;
  unknownCount: number;
  unknownCards: FlashcardItem[];
  
  // Actions
  flipCard: () => void;
  markKnown: () => void;
  markUnknown: () => void;
  reviewUnknown: () => void;
  resetSession: () => void;
}

// Mock data for flashcard decks
const mockDecks: DeckOption[] = [
  {
    id: 'review-today',
    name: 'Review Hari Ini',
    cards: [
      { id: '1', wordJp: 'おはようございます', reading: 'ohayou gozaimasu', meaningId: 'Selamat pagi (formal)', exampleJp: 'おはようございます、先生。', exampleId: 'Selamat pagi, Guru.' },
      { id: '2', wordJp: 'こんにちは', reading: 'konnichiwa', meaningId: 'Selamat siang / Halo', exampleJp: 'こんにちは、お元気ですか？', exampleId: 'Halo, apa kabar?' },
      { id: '3', wordJp: 'こんばんは', reading: 'konbanwa', meaningId: 'Selamat malam', exampleJp: 'こんばんは、いい天気ですね。', exampleId: 'Selamat malam, cuacanya bagus ya.' },
      { id: '4', wordJp: 'ありがとうございます', reading: 'arigatou gozaimasu', meaningId: 'Terima kasih (formal)', exampleJp: '手伝ってくれて、ありがとうございます。', exampleId: 'Terima kasih sudah membantu.' },
      { id: '5', wordJp: 'すみません', reading: 'sumimasen', meaningId: 'Permisi / Maaf', exampleJp: 'すみません、駅はどこですか？', exampleId: 'Permisi, di mana stasiunnya?' },
    ],
  },
  {
    id: 'im-japan-1',
    name: 'IM Japan Bab 1',
    cards: [
      { id: '6', wordJp: '私', reading: 'watashi', meaningId: 'Saya', exampleJp: '私は学生です。', exampleId: 'Saya adalah pelajar.' },
      { id: '7', wordJp: 'あなた', reading: 'anata', meaningId: 'Anda / Kamu', exampleJp: 'あなたの名前は何ですか？', exampleId: 'Siapa nama Anda?' },
      { id: '8', wordJp: '名前', reading: 'namae', meaningId: 'Nama', exampleJp: '名前を書いてください。', exampleId: 'Tolong tulis nama Anda.' },
      { id: '9', wordJp: '仕事', reading: 'shigoto', meaningId: 'Pekerjaan', exampleJp: '仕事は何ですか？', exampleId: 'Apa pekerjaan Anda?' },
      { id: '10', wordJp: '会社', reading: 'kaisha', meaningId: 'Perusahaan', exampleJp: '会社で働いています。', exampleId: 'Saya bekerja di perusahaan.' },
      { id: '11', wordJp: '電話番号', reading: 'denwa bangou', meaningId: 'Nomor telepon', exampleJp: '電話番号を教えてください。', exampleId: 'Tolong beritahu nomor telepon Anda.' },
      { id: '12', wordJp: '住所', reading: 'juusho', meaningId: 'Alamat', exampleJp: '住所はどこですか？', exampleId: 'Di mana alamat Anda?' },
    ],
  },
  {
    id: 'all-vocab',
    name: 'Semua Kosakata',
    cards: [
      { id: '1', wordJp: 'おはようございます', reading: 'ohayou gozaimasu', meaningId: 'Selamat pagi (formal)' },
      { id: '2', wordJp: 'こんにちは', reading: 'konnichiwa', meaningId: 'Selamat siang / Halo' },
      { id: '3', wordJp: 'こんばんは', reading: 'konbanwa', meaningId: 'Selamat malam' },
      { id: '4', wordJp: 'ありがとうございます', reading: 'arigatou gozaimasu', meaningId: 'Terima kasih (formal)' },
      { id: '5', wordJp: 'すみません', reading: 'sumimasen', meaningId: 'Permisi / Maaf' },
      { id: '6', wordJp: '私', reading: 'watashi', meaningId: 'Saya' },
      { id: '7', wordJp: 'あなた', reading: 'anata', meaningId: 'Anda / Kamu' },
      { id: '8', wordJp: '名前', reading: 'namae', meaningId: 'Nama' },
      { id: '9', wordJp: '仕事', reading: 'shigoto', meaningId: 'Pekerjaan' },
      { id: '10', wordJp: '会社', reading: 'kaisha', meaningId: 'Perusahaan' },
      { id: '11', wordJp: '電話番号', reading: 'denwa bangou', meaningId: 'Nomor telepon' },
      { id: '12', wordJp: '住所', reading: 'juusho', meaningId: 'Alamat' },
      { id: '13', wordJp: '一', reading: 'ichi', meaningId: 'Satu (1)' },
      { id: '14', wordJp: '二', reading: 'ni', meaningId: 'Dua (2)' },
      { id: '15', wordJp: '三', reading: 'san', meaningId: 'Tiga (3)' },
    ],
  },
];

export function useFlashcards(): UseFlashcardsReturn {
  const [selectedDeckId, setSelectedDeckId] = useState('review-today');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<string>>(new Set());
  const [unknownCards, setUnknownCards] = useState<FlashcardItem[]>([]);
  const [isReviewingUnknown, setIsReviewingUnknown] = useState(false);

  const selectedDeck = useMemo(
    () => mockDecks.find((d) => d.id === selectedDeckId) || mockDecks[0],
    [selectedDeckId]
  );

  const cards = useMemo(
    () => (isReviewingUnknown ? unknownCards : selectedDeck.cards),
    [isReviewingUnknown, unknownCards, selectedDeck]
  );

  const currentCard = useMemo(
    () => (currentIndex < cards.length ? cards[currentIndex] : null),
    [cards, currentIndex]
  );

  const isComplete = currentIndex >= cards.length && cards.length > 0;

  const progress = useMemo(
    () => (cards.length > 0 ? Math.round((currentIndex / cards.length) * 100) : 0),
    [currentIndex, cards.length]
  );

  const flipCard = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const goToNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const markKnown = useCallback(() => {
    if (currentCard) {
      setKnownCards((prev) => new Set(prev).add(currentCard.id));
    }
    goToNext();
  }, [currentCard, goToNext]);

  const markUnknown = useCallback(() => {
    if (currentCard && !isReviewingUnknown) {
      setUnknownCards((prev) => {
        // Avoid duplicates
        if (prev.some((c) => c.id === currentCard.id)) return prev;
        return [...prev, currentCard];
      });
    }
    goToNext();
  }, [currentCard, isReviewingUnknown, goToNext]);

  const reviewUnknown = useCallback(() => {
    setIsReviewingUnknown(true);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, []);

  const resetSession = useCallback(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCards(new Set());
    setUnknownCards([]);
    setIsReviewingUnknown(false);
  }, []);

  const handleSetSelectedDeckId = useCallback((id: string) => {
    setSelectedDeckId(id);
    resetSession();
  }, [resetSession]);

  return {
    decks: mockDecks,
    selectedDeckId,
    setSelectedDeckId: handleSetSelectedDeckId,
    cards,
    currentIndex,
    currentCard,
    progress,
    isFlipped,
    isComplete,
    knownCount: knownCards.size,
    unknownCount: unknownCards.length,
    unknownCards,
    flipCard,
    markKnown,
    markUnknown,
    reviewUnknown,
    resetSession,
  };
}
